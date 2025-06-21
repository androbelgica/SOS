<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class DeliveryOrderController extends Controller
{
    use AuthorizesRequests;

    // List orders assigned to the delivery staff (for_delivery, out_for_delivery)
    public function index(Request $request)
    {
        $orders = Order::where('assigned_to', Auth::id())
            ->whereIn('delivery_status', ['for_delivery', 'out_for_delivery'])
            ->with(['user', 'items.product'])
            ->latest()
            ->get();

        return Inertia::render('Delivery/Dashboard', [
            'orders' => $orders
        ]);
    }

    // Show details for a specific order
    public function show(Order $order)
    {
        $this->authorize('view', $order);
        $order->load(['user', 'items.product']);
        return Inertia::render('Delivery/OrderDetails', [
            'order' => $order
        ]);
    }

    // Accept an order (set to out_for_delivery)
    public function accept(Order $order)
    {
        $this->authorize('update', $order);
        if ($order->delivery_status === 'for_delivery') {
            $order->delivery_status = 'out_for_delivery';
            $order->assigned_to = Auth::id();
            $order->save();
        }
        return redirect()->route('delivery.orders.index')->with('success', 'Order accepted for delivery.');
    }

    // Mark as delivered (only if payment is confirmed)
    public function markDelivered(Order $order)
    {
        $this->authorize('update', $order);
        if ($order->delivery_status === 'out_for_delivery' && $order->payment_status === 'paid') {
            $order->delivery_status = 'delivered';
            $order->delivered_at = now();
            $order->save();
            return redirect()->route('delivery.orders.index')->with('success', 'Order marked as delivered.');
        }
        return redirect()->route('delivery.orders.index')->with('error', 'Order cannot be marked as delivered.');
    }

    // Mark as cancelled (requires reason)
    public function markCancelled(Request $request, Order $order)
    {
        $this->authorize('update', $order);
        $request->validate(['reason' => 'required|string|max:255']);
        if (in_array($order->delivery_status, ['for_delivery', 'out_for_delivery'])) {
            $order->delivery_status = 'cancelled';
            $order->delivery_cancel_reason = $request->reason;
            $order->cancelled_at = now();
            $order->save();
            return redirect()->route('delivery.orders.index')->with('success', 'Order marked as cancelled.');
        }
        return redirect()->route('delivery.orders.index')->with('error', 'Order cannot be cancelled.');
    }

    // Lookup order by QR code (order number or unique code)
    public function lookupByQr(Request $request)
    {
        $request->validate(['code' => 'required|string']);
        $order = Order::where('order_number', $request->code)->first();
        if ($order && ($order->assigned_to === Auth::id() || is_null($order->assigned_to))) {
            return redirect()->route('delivery.orders.index');
        }
        return redirect()->route('delivery.orders.index')->with('error', 'Order not found or not assigned to you.');
    }
}
