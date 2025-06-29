<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class DeliveryOrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $orders = Order::where('assigned_to', $request->user()->id)
            ->whereIn('delivery_status', ['for_delivery', 'out_for_delivery'])
            ->with(['user', 'items.product'])
            ->latest()
            ->get();
        return response()->json($orders);
    }

    public function show(Order $order): JsonResponse
    {
        return response()->json($order->load(['user', 'items.product']));
    }

    public function accept(Order $order): JsonResponse
    {
        $order->delivery_status = 'out_for_delivery';
        $order->save();
        return response()->json(['message' => 'Order accepted for delivery']);
    }

    public function markDelivered(Order $order): JsonResponse
    {
        $order->delivery_status = 'delivered';
        $order->save();
        return response()->json(['message' => 'Order marked as delivered']);
    }

    public function markCancelled(Order $order): JsonResponse
    {
        $order->delivery_status = 'cancelled';
        $order->save();
        return response()->json(['message' => 'Order marked as cancelled']);
    }

    public function lookupByQr(Request $request): JsonResponse
    {
        $order = Order::where('qr_code', $request->input('qr_code'))->first();
        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }
        return response()->json($order);
    }

    public function settlePayment(Order $order): JsonResponse
    {
        $order->payment_status = 'paid';
        $order->save();
        return response()->json(['message' => 'Order payment settled']);
    }
}
