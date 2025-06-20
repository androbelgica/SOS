<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Notifications\OrderStatusChanged;
use App\Notifications\OrderPaymentStatusChanged;
use App\Services\LabelGenerationService;

class OrderController extends Controller
{
    protected $labelService;

    public function __construct(LabelGenerationService $labelService)
    {
        $this->labelService = $labelService;
    }
    public function index()
    {
        $orders = Order::with(['items.product'])
            ->where('user_id', Auth::id())
            ->latest()
            ->get();

        return Inertia::render('Orders/Index', [
            'orders' => $orders
        ]);
    }

    public function show(Order $order)
    {
        if ($order->user_id !== Auth::id()) {
            abort(403);
        }

        $order->load(['items.product']);

        return Inertia::render('Orders/Show', [
            'order' => $order
        ]);
    }

    public function scanner(Order $order)
    {
        if ($order->user_id !== Auth::id()) {
            abort(403);
        }

        // Only allow scanning for delivered orders
        if ($order->status !== 'delivered') {
            return redirect()->route('orders.show', $order)
                ->with('error', 'QR scanning is only available for delivered orders.');
        }

        $order->load(['items.product']);

        return Inertia::render('Orders/Scanner', [
            'order' => $order
        ]);
    }

    public function store(Request $request)
    {
        $cart = session()->get('cart', []);

        if (empty($cart)) {
            return redirect()->back()->with('error', 'Your cart is empty.');
        }

        try {
            // Validate the request
            $request->validate([
                'shipping_address' => 'required|string',
                'shipping_city' => 'required|string',
                'shipping_state' => 'required|string',
                'shipping_postal_code' => 'required|string',
                'shipping_country' => 'required|string',
                'shipping_phone' => 'required|string',
                'billing_address' => 'required|string',
                'billing_city' => 'required|string',
                'billing_state' => 'required|string',
                'billing_postal_code' => 'required|string',
                'billing_country' => 'required|string',
                'billing_phone' => 'required|string',
            ]);

            // Format shipping and billing addresses
            $shippingAddress = "{$request->shipping_address}\n{$request->shipping_city}, {$request->shipping_state} {$request->shipping_postal_code}\n{$request->shipping_country}\nPhone: {$request->shipping_phone}";
            $billingAddress = "{$request->billing_address}\n{$request->billing_city}, {$request->billing_state} {$request->billing_postal_code}\n{$request->billing_country}\nPhone: {$request->billing_phone}";

            // Save address to user profile if requested
            if ($request->input('save_address', false)) {
                $user = User::find(Auth::id());
                $user->update([
                    'address' => $request->shipping_address,
                    'city' => $request->shipping_city,
                    'state' => $request->shipping_state,
                    'postal_code' => $request->shipping_postal_code,
                    'country' => $request->shipping_country,
                    'phone' => $request->shipping_phone,
                ]);
            }

            // Use a database transaction to ensure all operations succeed or fail together
            $order = DB::transaction(function () use ($cart, $shippingAddress, $billingAddress) {
                $total = 0;
                $items = [];
                $products = Product::whereIn('id', array_keys($cart))->lockForUpdate()->get();
                $insufficientStockProducts = [];

                // First, validate all products have sufficient stock
                foreach ($products as $product) {
                    $quantity = $cart[$product->id];

                    // For kg products, convert grams to kg for stock comparison
                    if ($product->unit_type === 'kg') {
                        $stockNeeded = $quantity / 1000; // Convert grams to kg
                        if ($stockNeeded > $product->stock_quantity) {
                            $insufficientStockProducts[] = $product->name;
                        }
                    } else {
                        // For piece products
                        if ($quantity > $product->stock_quantity) {
                            $insufficientStockProducts[] = $product->name;
                        }
                    }
                }

                // If any product has insufficient stock, throw an exception
                if (!empty($insufficientStockProducts)) {
                    throw new \Exception("Not enough stock for: " . implode(", ", $insufficientStockProducts));
                }

                // Process the order since all stock is available
                foreach ($products as $product) {
                    $quantity = $cart[$product->id];

                    // For kg products
                    if ($product->unit_type === 'kg') {
                        // Calculate price based on kg (price per kg * quantity in kg)
                        $subtotal = $product->price * ($quantity / 1000);
                        $total += $subtotal;

                        $items[] = [
                            'product_id' => $product->id,
                            'quantity' => $quantity, // Store the original quantity in grams
                            'price' => $product->price // Store the price per kg
                        ];

                        // Update stock in kg
                        $product->stock_quantity -= ($quantity / 1000);
                        $product->save();
                    } else {
                        // For piece products
                        $subtotal = $product->price * $quantity;
                        $total += $subtotal;

                        $items[] = [
                            'product_id' => $product->id,
                            'quantity' => $quantity,
                            'price' => $product->price
                        ];

                        // Update stock
                        $product->stock_quantity -= $quantity;
                        $product->save();
                    }
                }

                // Generate a unique order number
                $orderNumber = Order::generateOrderNumber();

                // Create the order
                $order = Order::create([
                    'user_id' => Auth::id(),
                    'order_number' => $orderNumber,
                    'total_amount' => $total,
                    'status' => 'pending',
                    'shipping_address' => $shippingAddress,
                    'billing_address' => $billingAddress,
                    'payment_status' => 'pending'
                ]);

                // Create order items
                $order->items()->createMany($items);

                return $order;
            });

            // Clear the cart after successful order creation
            session()->forget('cart');

            return redirect()->route('orders.show', $order)
                ->with('success', 'Order placed successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    // Admin methods
    public function adminIndex()
    {
        $orders = Order::with(['user', 'items.product'])
            ->latest()
            ->get();

        return Inertia::render('Admin/Orders/Index', [
            'orders' => $orders
        ]);
    }

    public function adminShow(Order $order)
    {
        $order->load(['user', 'items.product']);

        return Inertia::render('Admin/Orders/Show', [
            'order' => $order
        ]);
    }

    public function updateStatus(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,processing,delivered,cancelled'
        ]);

        // Backend enforcement: Prevent delivered if payment is not paid
        if ($validated['status'] === 'delivered' && $order->payment_status !== 'paid') {
            return redirect()->back()->withErrors(['status' => 'Cannot mark as delivered unless payment is paid.']);
        }

        $oldStatus = $order->status;
        $order->update([
            'status' => $validated['status']
        ]);

        // Send notification if status has changed
        if ($oldStatus !== $validated['status']) {
            // Use custom notification model
            $items = $order->items->map(function ($item) {
                return [
                    'product' => $item->product->name,
                    'quantity' => $item->quantity,
                    'price' => $item->price
                ];
            })->toArray();
            \App\Models\Notification::createOrderStatusChanged(
                $order->user_id,
                $order->id,
                $order->order_number,
                $order->status,
                $items,
                $order->total_amount
            );

            // Generate labels if status is changed to processing
            if ($validated['status'] === 'processing') {
                $this->labelService->generateLabelsForOrder($order);
                return redirect()->back()->with('success', 'Order status updated successfully. Product labels have been generated.');
            }
        }

        return redirect()->back()->with('success', 'Order status updated successfully.');
    }

    public function updatePaymentStatus(Request $request, Order $order)
    {
        $validated = $request->validate([
            'payment_status' => 'required|in:pending,paid,failed'
        ]);

        $oldPaymentStatus = $order->payment_status;
        $order->update([
            'payment_status' => $validated['payment_status']
        ]);

        // Send notification if payment status has changed
        if ($oldPaymentStatus !== $validated['payment_status']) {
            // Use custom notification model
            $items = $order->items->map(function ($item) {
                return [
                    'product' => $item->product->name,
                    'quantity' => $item->quantity,
                    'price' => $item->price
                ];
            })->toArray();
            \App\Models\Notification::createOrderPaymentStatusChanged(
                $order->user_id,
                $order->id,
                $order->order_number,
                $order->payment_status,
                $items,
                $order->total_amount
            );
        }

        return redirect()->back()->with('success', 'Payment status updated successfully.');
    }

    /**
     * Cancel an order
     *
     * Customers can cancel their orders if:
     * 1. The order is in 'pending' status
     * 2. The order was placed less than 30 minutes ago
     *
     * @param Order $order
     * @return \Illuminate\Http\RedirectResponse
     */
    public function cancel(Order $order)
    {
        // Check if the order belongs to the authenticated user
        if ($order->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }

        // Check if the order is cancellable
        if (!$order->isCancellable()) {
            return redirect()->back()->with('error', 'This order cannot be cancelled. Orders can only be cancelled within 30 minutes of placing them and if they are still in pending status.');
        }

        // Use a database transaction to ensure all operations succeed or fail together
        DB::transaction(function () use ($order) {
            // Restore product stock quantities
            foreach ($order->items as $item) {
                $product = $item->product;

                // For kg products, convert grams back to kg for stock update
                if ($product->unit_type === 'kg') {
                    $stockToRestore = $item->quantity / 1000; // Convert grams to kg
                    $product->increment('stock_quantity', $stockToRestore);
                } else {
                    // For piece products
                    $product->increment('stock_quantity', $item->quantity);
                }
            }

            // Update order status to cancelled
            $order->update([
                'status' => 'cancelled'
            ]);

            // Send notification about order cancellation
            $order->user->notify(new OrderStatusChanged($order));
        });

        return redirect()->back()->with('success', 'Order has been cancelled successfully.');
    }

    public function export(Request $request)
    {
        // Validate request
        $request->validate([
            'status' => 'nullable|in:pending,processing,delivered,cancelled',
            'payment_status' => 'nullable|in:pending,paid,failed',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date',
        ]);

        // Build query with filters
        $query = Order::with(['user', 'items.product']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('payment_status')) {
            $query->where('payment_status', $request->payment_status);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Get orders
        $orders = $query->latest()->get();

        // Create CSV content
        $csvContent = "Order ID,Order Number,Customer,Email,Total Amount,Status,Payment Status,Order Date,Items\n";

        foreach ($orders as $order) {
            $items = [];
            foreach ($order->items as $item) {
                $items[] = "{$item->product->name} (x{$item->quantity})";
            }

            $csvContent .= implode(',', [
                $order->id,
                '"' . str_replace('"', '""', $order->order_number ?? '') . '"',
                '"' . str_replace('"', '""', $order->user->name) . '"',
                '"' . str_replace('"', '""', $order->user->email) . '"',
                number_format($order->total_amount, 2),
                $order->status,
                $order->payment_status,
                $order->created_at->format('Y-m-d H:i:s'),
                '"' . str_replace('"', '""', implode('; ', $items)) . '"'
            ]) . "\n";
        }

        // Generate response with CSV file
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="orders-export-' . now()->format('Y-m-d') . '.csv"',
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0'
        ];

        return response($csvContent, 200, $headers);
    }
}
