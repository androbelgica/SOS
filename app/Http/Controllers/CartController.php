<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CartController extends Controller
{
    public function index()
    {
        $cart = session()->get('cart', []);
        $cartItems = [];
        $total = 0;

        if (!empty($cart)) {
            $products = Product::whereIn('id', array_keys($cart))->get();

            foreach ($products as $product) {
                $quantity = $cart[$product->id];

                // If product is sold by kg but quantity is in grams, convert for price calculation
                if ($product->unit_type === 'kg') {
                    // Convert grams to kg for price calculation (divide by 1000)
                    $subtotal = $product->price * ($quantity / 1000);
                } else {
                    $subtotal = $product->price * $quantity;
                }

                $total += $subtotal;

                $cartItems[] = [
                    'id' => $product->id,
                    'name' => $product->name,
                    'price' => $product->price,
                    'quantity' => $quantity,
                    'subtotal' => $subtotal,
                    'image_url' => $product->image_url,
                    'stock_quantity' => $product->stock_quantity,
                    'unit_type' => $product->unit_type
                ];
            }
        }

        return Inertia::render('Cart/Index', [
            'cartItems' => $cartItems,
            'total' => $total
        ]);
    }

    public function add(Request $request, Product $product)
    {
        // Make sure stock_quantity is not null before using it in validation
        $maxQuantity = $product->stock_quantity ?? 0;

        // If product is sold by kg, convert stock from kg to grams for validation
        if ($product->unit_type === 'kg') {
            $maxQuantity = $maxQuantity * 1000; // Convert kg to grams
        }

        // Validate the requested quantity
        try {
            $request->validate([
                'quantity' => 'required|integer|min:1|max:' . $maxQuantity
            ], [
                'quantity.max' => "Sorry, we only have " . ($product->unit_type === 'kg' ?
                    $maxQuantity . "g (" . number_format($maxQuantity / 1000, 2) . "kg)" :
                    $maxQuantity . " pieces") . " of this product in stock."
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return redirect()->back()->withErrors($e->validator)->withInput();
        }

        $cart = session()->get('cart', []);
        $quantity = $request->input('quantity', 1);
        $totalQuantity = $quantity;

        // If product already in cart, add to existing quantity
        if (isset($cart[$product->id])) {
            $totalQuantity = $cart[$product->id] + $quantity;

            // Check if the total quantity exceeds available stock
            if ($totalQuantity > $maxQuantity) {
                return redirect()->back()->with(
                    'error',
                    "Cannot add " . $quantity . ($product->unit_type === 'kg' ? 'g' : ' pieces') .
                        " more to your cart. You already have " . $cart[$product->id] .
                        ($product->unit_type === 'kg' ? 'g' : ' pieces') . " in your cart, and we only have " .
                        $maxQuantity . ($product->unit_type === 'kg' ? 'g' : ' pieces') . " in stock."
                );
            }

            $cart[$product->id] = $totalQuantity;
        } else {
            $cart[$product->id] = $quantity;
        }

        session()->put('cart', $cart);

        // Redirect to cart page with success message
        return redirect()->route('cart.index')->with('success', 'Product added to cart successfully.');
    }

    public function update(Request $request, Product $product)
    {
        // Log the request data for debugging
        \Log::info('Cart Update Request', [
            'product_id' => $product->id,
            'request_data' => $request->all(),
            'request_method' => $request->method(),
            'request_quantity' => $request->input('quantity'),
            'request_content_type' => $request->header('Content-Type'),
            'cart_before' => session()->get('cart', [])
        ]);

        try {
            // Make sure stock_quantity is not null before using it in validation
            $maxQuantity = $product->stock_quantity ?? 0;

            // If product is sold by kg, convert stock from kg to grams for validation
            if ($product->unit_type === 'kg') {
                $maxQuantity = $maxQuantity * 1000; // Convert kg to grams
            }

            // Check if quantity is present in the request
            if (!$request->has('quantity')) {
                \Log::error('Quantity parameter missing', [
                    'product_id' => $product->id,
                    'all_parameters' => $request->all(),
                    'files' => $request->allFiles(),
                    'content' => $request->getContent()
                ]);

                if ($request->expectsJson()) {
                    return response()->json([
                        'success' => false,
                        'message' => 'The quantity field is required.',
                        'errors' => ['quantity' => 'The quantity field is required.']
                    ], 422);
                }

                return back()->withErrors(['quantity' => 'The quantity field is required.']);
            }

            // Get the quantity from the request
            $requestQuantity = $request->input('quantity');

            // Log the received quantity for debugging
            \Log::info('Received quantity', [
                'product_id' => $product->id,
                'request_quantity' => $requestQuantity,
                'parsed_quantity' => (int) $requestQuantity
            ]);

            // Validate the requested quantity with custom error messages
            $validated = $request->validate([
                'quantity' => 'required|integer|min:1|max:' . $maxQuantity
            ], [
                'quantity.max' => "Sorry, we only have " . ($product->unit_type === 'kg' ?
                    $maxQuantity . "g (" . number_format($maxQuantity / 1000, 2) . "kg)" :
                    $maxQuantity . " pieces") . " of this product in stock."
            ]);

            $cart = session()->get('cart', []);
            $quantity = (int) $validated['quantity'];

            // For weight-based products, ensure the quantity is in multiples of 250g
            if ($product->unit_type === 'kg' && $quantity < 1000) {
                // Round to nearest 250g
                $quantity = round($quantity / 250) * 250;
                // Ensure minimum of 250g
                $quantity = max(250, $quantity);
            }

            // Update or add the product to the cart
            $cart[$product->id] = $quantity;

            // Make sure to save the updated cart to the session
            session()->put('cart', $cart);

            // Force the session to be saved immediately
            session()->save();

            \Log::info('Cart Updated', [
                'product_id' => $product->id,
                'new_quantity' => $quantity,
                'cart_after' => $cart
            ]);

            if ($request->expectsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Cart updated successfully',
                    'cart' => $cart
                ]);
            }

            // Check if we should redirect to checkout
            if ($request->has('redirect_to_checkout') && $request->input('redirect_to_checkout')) {
                return redirect()->route('checkout.index');
            }

            return back()->with('success', 'Cart updated successfully');
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Cart Update Validation Error', [
                'product_id' => $product->id,
                'errors' => $e->errors(),
                'request_data' => $request->all(),
                'request_method' => $request->method(),
            ]);

            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => $e->getMessage(),
                    'errors' => $e->errors()
                ], 422);
            }

            return back()->withErrors($e->validator)->withInput();
        } catch (\Exception $e) {
            \Log::error('Cart Update Error', [
                'product_id' => $product->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all(),
                'request_method' => $request->method(),
            ]);

            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to update cart: ' . $e->getMessage()
                ], 500);
            }

            return back()->with('error', 'Failed to update cart: ' . $e->getMessage());
        }
    }

    public function remove(Product $product)
    {
        $cart = session()->get('cart', []);

        if (isset($cart[$product->id])) {
            unset($cart[$product->id]);
            session()->put('cart', $cart);
        }

        return back();
    }

    public function clear()
    {
        session()->forget('cart');
        return back();
    }

    public function syncCart(Request $request)
    {
        try {
            // Log the request data for debugging
            \Log::info('Cart Sync Request', [
                'request_data' => $request->all(),
                'request_method' => $request->method(),
                'request_content_type' => $request->header('Content-Type'),
                'cart_before' => session()->get('cart', [])
            ]);

            // Validate the cart data
            $request->validate([
                'cartData' => 'required|array',
            ]);

            // Get the cart data directly from the request
            $cartData = $request->input('cartData');

            // Update the session with the provided cart data
            session()->put('cart', $cartData);

            // Force the session to be saved immediately
            session()->save();

            // Log the synchronized cart data
            \Log::info('Cart Synchronized', [
                'cart' => $cartData,
                'session_id' => session()->getId()
            ]);

            // Return an Inertia redirect response
            return redirect()->route('checkout.index', ['t' => time()]);
        } catch (\Exception $e) {
            \Log::error('Cart Sync Error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);

            // Return validation error for Inertia to handle
            return back()->withErrors([
                'cart' => 'Failed to synchronize cart: ' . $e->getMessage()
            ]);
        }
    }

    public function reorder(Request $request)
    {
        $request->validate([
            'items' => 'required|array',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1'
        ]);

        $cart = session()->get('cart', []);
        $products = Product::whereIn('id', collect($request->items)->pluck('product_id'))->get();
        $insufficientStockProducts = [];

        // Check stock availability for all products
        foreach ($request->items as $item) {
            $product = $products->firstWhere('id', $item['product_id']);

            if (!$product) {
                continue;
            }

            $maxQuantity = $product->stock_quantity ?? 0;

            // If product is sold by kg, convert stock from kg to grams for validation
            if ($product->unit_type === 'kg') {
                $maxQuantity = $maxQuantity * 1000; // Convert kg to grams
            }

            if ($item['quantity'] > $maxQuantity) {
                $insufficientStockProducts[] = $product->name;
            }
        }

        // If any product has insufficient stock, return error
        if (!empty($insufficientStockProducts)) {
            return response()->json([
                'success' => false,
                'message' => "Not enough stock for: " . implode(", ", $insufficientStockProducts)
            ], 422);
        }

        // Add all items to cart
        foreach ($request->items as $item) {
            $cart[$item['product_id']] = $item['quantity'];
        }

        session()->put('cart', $cart);

        return response()->json([
            'success' => true,
            'message' => 'Items added to cart successfully',
            'redirect' => route('cart.index')
        ]);
    }

    public function showCheckout()
    {
        // Get the cart data from the session
        $cart = session()->get('cart', []);

        if (empty($cart)) {
            return redirect()->route('cart.index')->with('error', 'Your cart is empty');
        }

        $cartItems = [];
        $total = 0;

        try {
            // Get the latest product data from the database
            $products = Product::whereIn('id', array_keys($cart))->get();

            // Check if any products are missing (might have been deleted)
            $foundProductIds = $products->pluck('id')->toArray();
            foreach (array_keys($cart) as $cartProductId) {
                if (!in_array($cartProductId, $foundProductIds)) {
                    // Remove missing products from cart
                    unset($cart[$cartProductId]);
                }
            }

            // Update the cart in session
            session()->put('cart', $cart);

            // Force the session to be saved immediately
            session()->save();

            // Log the cart data for debugging
            \Log::info('Checkout Cart Data', [
                'cart' => $cart,
                'session_id' => session()->getId()
            ]);

            foreach ($products as $product) {
                // Make sure the product exists in the cart
                if (!isset($cart[$product->id])) {
                    continue;
                }

                $quantity = $cart[$product->id];

                // If product is sold by kg but quantity is in grams, convert for price calculation
                if ($product->unit_type === 'kg') {
                    // Convert grams to kg for price calculation (divide by 1000)
                    $subtotal = $product->price * ($quantity / 1000);
                } else {
                    $subtotal = $product->price * $quantity;
                }

                $total += $subtotal;

                $cartItems[] = [
                    'id' => $product->id,
                    'name' => $product->name,
                    'price' => $product->price,
                    'quantity' => $quantity,
                    'subtotal' => $subtotal,
                    'image_url' => $product->image_url,
                    'stock_quantity' => $product->stock_quantity,
                    'unit_type' => $product->unit_type
                ];
            }

            // If cart is empty after removing invalid products, redirect back
            if (empty($cartItems)) {
                return redirect()->route('cart.index')->with('error', 'Your cart is empty');
            }

            return Inertia::render('Checkout/Index', [
                'cartItems' => $cartItems,
                'total' => $total,
                'user' => auth()->user(),
                'timestamp' => now()->timestamp // Add timestamp to force refresh
            ]);
        } catch (\Exception $e) {
            \Log::error('Error in showCheckout', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->route('cart.index')->with('error', 'An error occurred while processing your checkout. Please try again.');
        }
    }

    public function checkout()
    {
        $cart = session()->get('cart', []);

        if (empty($cart)) {
            return back()->with('error', 'Your cart is empty');
        }

        try {
            // Use a database transaction to ensure all operations succeed or fail together
            $order = \DB::transaction(function () use ($cart) {
                $products = Product::whereIn('id', array_keys($cart))->lockForUpdate()->get();
                $total = 0;
                $insufficientStockProducts = [];

                // First, validate all products have sufficient stock
                foreach ($products as $product) {
                    $cartQuantity = $cart[$product->id];

                    // For kg products, convert grams to kg for stock comparison
                    if ($product->unit_type === 'kg') {
                        $stockNeeded = $cartQuantity / 1000; // Convert grams to kg
                        if ($product->stock_quantity < $stockNeeded) {
                            $insufficientStockProducts[] = $product->name;
                        }
                    } else {
                        if ($product->stock_quantity < $cartQuantity) {
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
                    $cartQuantity = $cart[$product->id];

                    // For kg products
                    if ($product->unit_type === 'kg') {
                        // Calculate price based on kg (price per kg * quantity in kg)
                        $subtotal = $product->price * ($cartQuantity / 1000);
                        $total += $subtotal;

                        // Create order item
                        $orderItems[] = [
                            'product_id' => $product->id,
                            'quantity' => $cartQuantity,
                            'price' => $product->price
                        ];

                        // Update stock in kg (only at checkout time)
                        $stockToDecrement = $cartQuantity / 1000; // Convert grams to kg
                        $product->decrement('stock_quantity', $stockToDecrement);
                    } else {
                        // For piece products
                        $subtotal = $product->price * $cartQuantity;
                        $total += $subtotal;

                        // Create order item
                        $orderItems[] = [
                            'product_id' => $product->id,
                            'quantity' => $cartQuantity,
                            'price' => $product->price
                        ];

                        // Update stock (only at checkout time)
                        $product->decrement('stock_quantity', $cartQuantity);
                    }
                }

                // Generate a unique order number
                $orderNumber = \App\Models\Order::generateOrderNumber();

                // Create the order
                $order = auth()->user()->orders()->create([
                    'order_number' => $orderNumber,
                    'total_amount' => $total,
                    'status' => 'pending',
                    'shipping_address' => auth()->user()->address ?? 'No address provided',
                    'billing_address' => auth()->user()->address ?? 'No address provided',
                    'payment_status' => 'pending'
                ]);

                // Attach products to order
                foreach ($products as $index => $product) {
                    $cartQuantity = $cart[$product->id];
                    $order->products()->attach($product->id, [
                        'quantity' => $cartQuantity,
                        'price' => $product->price
                    ]);
                }

                return $order;
            });

            // Clear the cart after successful order creation
            session()->forget('cart');

            return redirect()->route('orders.show', $order)
                ->with('success', 'Order placed successfully! Your order is being processed.');
        } catch (\Exception $e) {
            \Log::error('Checkout Error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()->with('error', $e->getMessage());
        }
    }
}
