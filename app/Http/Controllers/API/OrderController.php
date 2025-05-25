<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    /**
     * Display a listing of user's orders
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $query = Order::where('user_id', $user->id)
            ->with('products');

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Sort by date
        $query->latest();

        // Paginate results
        $perPage = $request->per_page ?? 10;
        $orders = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $orders
        ]);
    }

    /**
     * Display the specified order
     *
     * @param Request $request
     * @param Order $order
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Request $request, Order $order)
    {
        $user = $request->user();

        // Check if order belongs to user
        if ($order->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        // Load order items
        $order->load('products');

        return response()->json([
            'success' => true,
            'data' => $order
        ]);
    }

    /**
     * Create a new order
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        // Log the incoming request for debugging
        Log::info('Order creation request received', [
            'user_id' => $request->user()->id,
            'request_data' => $request->all()
        ]);

        $validator = Validator::make($request->all(), [
            'shipping_address' => 'required|string',
            'billing_address' => 'nullable|string',
            'payment_method' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'nullable|numeric|min:0',
            'total_amount' => 'nullable|numeric|min:0',
            'subtotal' => 'nullable|numeric|min:0',
            'delivery_fee' => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            Log::error('Order validation failed', [
                'errors' => $validator->errors(),
                'request_data' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();
        $items = $request->items;

        // Start transaction
        DB::beginTransaction();

        try {
            // Calculate total amount
            $totalAmount = 0;
            $orderItems = [];

            foreach ($items as $item) {
                $product = Product::findOrFail($item['product_id']);

                // Check if product is available
                if (!$product->is_available) {
                    throw new \Exception("Product '{$product->name}' is not available");
                }

                // Check if enough stock
                if ($product->stock_quantity < $item['quantity']) {
                    throw new \Exception("Not enough stock for '{$product->name}'");
                }

                // Calculate item total
                $itemTotal = $product->price * $item['quantity'];
                $totalAmount += $itemTotal;

                // Prepare order item
                $orderItems[$item['product_id']] = [
                    'quantity' => $item['quantity'],
                    'price' => $product->price
                ];

                // Reduce stock
                $product->stock_quantity -= $item['quantity'];
                $product->save();
            }

            // Generate unique order number (SOS-YYYYMMDD-XXXX)
            $orderNumber = 'SOS-' . date('Ymd') . '-' . strtoupper(Str::random(4));

            // Create order
            $order = Order::create([
                'user_id' => $user->id,
                'order_number' => $orderNumber,
                'total_amount' => $totalAmount,
                'status' => 'pending',
                'shipping_address' => $request->shipping_address,
                'billing_address' => $request->billing_address ?? $request->shipping_address,
                'payment_status' => 'pending'
            ]);

            // Attach products to order
            $order->products()->attach($orderItems);

            // Clear cart if cart relationship exists
            if (method_exists($user, 'cart')) {
                $user->cart()->detach();
            }

            DB::commit();

            Log::info('Order created successfully', [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'user_id' => $user->id,
                'total_amount' => $order->total_amount
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Order created successfully',
                'data' => $order->load('products')
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Order creation failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Cancel an order
     *
     * @param Request $request
     * @param Order $order
     * @return \Illuminate\Http\JsonResponse
     */
    public function cancel(Request $request, Order $order)
    {
        $user = $request->user();

        // Check if order belongs to user
        if ($order->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        // Check if order can be cancelled
        if (!in_array($order->status, ['pending', 'processing'])) {
            return response()->json([
                'success' => false,
                'message' => 'Order cannot be cancelled'
            ], 400);
        }

        // Start transaction
        DB::beginTransaction();

        try {
            // Update order status
            $order->status = 'cancelled';
            $order->save();

            // Restore stock
            foreach ($order->products as $product) {
                $product->stock_quantity += $product->pivot->quantity;
                $product->save();
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Order cancelled successfully',
                'data' => $order
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Verify a product from an order (public)
     *
     * @param Order $order
     * @param Product $product
     * @return \Illuminate\Http\JsonResponse
     */
    public function verify(Order $order, Product $product)
    {
        // Check if product is in order
        $orderItem = $order->products()
            ->where('product_id', $product->id)
            ->first();

        if (!$orderItem) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found in this order'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'order' => [
                    'order_number' => $order->order_number,
                    'status' => $order->status,
                    'created_at' => $order->created_at
                ],
                'product' => [
                    'name' => $product->name,
                    'quantity' => $orderItem->pivot->quantity,
                    'price' => $orderItem->pivot->price
                ]
            ]
        ]);
    }

    /**
     * Get user's cart
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getCart(Request $request)
    {
        $user = $request->user();

        // Check if cart relationship exists
        if (!method_exists($user, 'cart')) {
            return response()->json([
                'success' => false,
                'message' => 'Cart functionality not implemented'
            ], 501);
        }

        $cart = $user->cart()->get();

        // Calculate total
        $total = 0;
        foreach ($cart as $item) {
            $total += $item->price * $item->pivot->quantity;
        }

        return response()->json([
            'success' => true,
            'data' => [
                'items' => $cart,
                'total' => $total
            ]
        ]);
    }

    /**
     * Add product to cart
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function addToCart(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();

        // Check if cart relationship exists
        if (!method_exists($user, 'cart')) {
            return response()->json([
                'success' => false,
                'message' => 'Cart functionality not implemented'
            ], 501);
        }

        $productId = $request->product_id;
        $quantity = $request->quantity;

        // Check if product is available
        $product = Product::findOrFail($productId);
        if (!$product->is_available) {
            return response()->json([
                'success' => false,
                'message' => 'Product is not available'
            ], 400);
        }

        // Check if product is already in cart
        $existingItem = $user->cart()->where('product_id', $productId)->first();

        if ($existingItem) {
            // Update quantity
            $newQuantity = $existingItem->pivot->quantity + $quantity;

            // Check stock
            if ($newQuantity > $product->stock_quantity) {
                return response()->json([
                    'success' => false,
                    'message' => 'Not enough stock available'
                ], 400);
            }

            $user->cart()->updateExistingPivot($productId, [
                'quantity' => $newQuantity
            ]);

            $message = 'Product quantity updated in cart';
        } else {
            // Check stock
            if ($quantity > $product->stock_quantity) {
                return response()->json([
                    'success' => false,
                    'message' => 'Not enough stock available'
                ], 400);
            }

            // Add to cart
            $user->cart()->attach($productId, [
                'quantity' => $quantity
            ]);

            $message = 'Product added to cart';
        }

        return response()->json([
            'success' => true,
            'message' => $message
        ]);
    }

    /**
     * Update cart item
     *
     * @param Request $request
     * @param int $productId
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateCartItem(Request $request, $productId)
    {
        $validator = Validator::make($request->all(), [
            'quantity' => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();

        // Check if cart relationship exists
        if (!method_exists($user, 'cart')) {
            return response()->json([
                'success' => false,
                'message' => 'Cart functionality not implemented'
            ], 501);
        }

        $quantity = $request->quantity;

        // Check if product is in cart
        $existingItem = $user->cart()->where('product_id', $productId)->first();

        if (!$existingItem) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found in cart'
            ], 404);
        }

        // Check stock
        $product = Product::findOrFail($productId);
        if ($quantity > $product->stock_quantity) {
            return response()->json([
                'success' => false,
                'message' => 'Not enough stock available'
            ], 400);
        }

        // Update quantity
        $user->cart()->updateExistingPivot($productId, [
            'quantity' => $quantity
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Cart item updated'
        ]);
    }

    /**
     * Remove product from cart
     *
     * @param Request $request
     * @param int $productId
     * @return \Illuminate\Http\JsonResponse
     */
    public function removeFromCart(Request $request, $productId)
    {
        $user = $request->user();

        // Check if cart relationship exists
        if (!method_exists($user, 'cart')) {
            return response()->json([
                'success' => false,
                'message' => 'Cart functionality not implemented'
            ], 501);
        }

        $user->cart()->detach($productId);

        return response()->json([
            'success' => true,
            'message' => 'Product removed from cart'
        ]);
    }

    /**
     * Clear cart
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function clearCart(Request $request)
    {
        $user = $request->user();

        // Check if cart relationship exists
        if (!method_exists($user, 'cart')) {
            return response()->json([
                'success' => false,
                'message' => 'Cart functionality not implemented'
            ], 501);
        }

        $user->cart()->detach();

        return response()->json([
            'success' => true,
            'message' => 'Cart cleared'
        ]);
    }
}
