<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class OrderController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request): JsonResponse
    {
        $orders = Order::where('user_id', $request->user()->id)->latest()->get();
        return response()->json($orders);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'order_number' => 'required|string',
            'total_amount' => 'required|numeric',
            'status' => 'required|string',
            'shipping_address' => 'required|string',
            'billing_address' => 'required|string',
            'payment_status' => 'required|string',
            'payment_method' => 'required|string',
        ]);
        $validated['user_id'] = $request->user()->id;
        $order = Order::create($validated);
        return response()->json($order, 201);
    }

    public function show(Order $order): JsonResponse
    {
        $this->authorize('view', $order);
        return response()->json($order);
    }

    public function update(Request $request, Order $order): JsonResponse
    {
        $this->authorize('update', $order);
        $validated = $request->validate([
            'status' => 'sometimes|required|string',
            'payment_status' => 'sometimes|required|string',
        ]);
        $order->update($validated);
        return response()->json($order);
    }

    public function destroy(Order $order): JsonResponse
    {
        $this->authorize('delete', $order);
        $order->delete();
        return response()->json(['message' => 'Order deleted successfully']);
    }
}
