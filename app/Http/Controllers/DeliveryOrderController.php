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

        // Fetch latest notifications for the delivery staff
        $notifications = collect(); // Initialize empty collection for notifications

        return Inertia::render('Delivery/Dashboard', [
            'orders' => $orders,
            'notifications' => $notifications,
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
            $order->status = 'out_for_delivery';
            $order->assigned_to = Auth::id();
            $order->save();
            // Notify customer
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
                'out_for_delivery',
                $items,
                $order->total_amount
            );
            // Notify all admins
            $admins = \App\Models\User::where('role', 'admin')->get();
            foreach ($admins as $admin) {
                \App\Models\Notification::createOrderStatusChanged(
                    $admin->id,
                    $order->id,
                    $order->order_number,
                    'out_for_delivery',
                    $items,
                    $order->total_amount
                );
            }
        }
        return redirect()->route('delivery.orders.index')->with('success', 'Order accepted for delivery.');
    }

    // Mark as delivered (only if payment is confirmed)
    public function markDelivered(Order $order)
    {
        $this->authorize('update', $order);
        if ($order->delivery_status === 'out_for_delivery' && $order->payment_status === 'paid') {
            $order->delivery_status = 'delivered';
            $order->status = 'delivered';
            $order->delivered_at = now();
            $order->save();
            // Notify customer
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
                'delivered',
                $items,
                $order->total_amount
            );
            // Notify all admins
            $admins = \App\Models\User::where('role', 'admin')->get();
            foreach ($admins as $admin) {
                \App\Models\Notification::createOrderStatusChanged(
                    $admin->id,
                    $order->id,
                    $order->order_number,
                    'delivered',
                    $items,
                    $order->total_amount
                );
            }
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
            $order->status = 'cancelled';
            $order->payment_status = 'cancelled';
            $order->delivery_cancel_reason = $request->reason;
            $order->cancelled_at = now();
            $order->save();
            // Notify customer
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
                'cancelled',
                $items,
                $order->total_amount
            );
            \App\Models\Notification::createOrderPaymentStatusChanged(
                $order->user_id,
                $order->id,
                $order->order_number,
                'cancelled',
                $items,
                $order->total_amount
            );
            // Notify all admins
            $admins = \App\Models\User::where('role', 'admin')->get();
            foreach ($admins as $admin) {
                \App\Models\Notification::createOrderStatusChanged(
                    $admin->id,
                    $order->id,
                    $order->order_number,
                    'cancelled',
                    $items,
                    $order->total_amount
                );
                \App\Models\Notification::createOrderPaymentStatusChanged(
                    $admin->id,
                    $order->id,
                    $order->order_number,
                    'cancelled',
                    $items,
                    $order->total_amount
                );
            }
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

    // Settle payment for COD orders and mark as delivered
    public function settlePayment(Order $order)
    {
        $this->authorize('update', $order);
        if ($order->payment_method === 'cod' && $order->payment_status !== 'paid' && $order->assigned_to === Auth::id()) {
            $order->payment_status = 'paid';
            $order->delivery_status = 'delivered';
            $order->status = 'delivered';
            $order->delivered_at = now();
            $order->save();

            // Notify customer
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
                'paid',
                $items,
                $order->total_amount
            );
            \App\Models\Notification::createOrderStatusChanged(
                $order->user_id,
                $order->id,
                $order->order_number,
                'delivered',
                $items,
                $order->total_amount
            );
            // Notify all admins
            $admins = \App\Models\User::where('role', 'admin')->get();
            foreach ($admins as $admin) {
                \App\Models\Notification::createOrderStatusChanged(
                    $admin->id,
                    $order->id,
                    $order->order_number,
                    'delivered',
                    $items,
                    $order->total_amount
                );
            }
            return redirect()->back()->with('success', 'Payment accepted and order marked as delivered.');
        }
        return redirect()->back()->with('error', 'Unable to settle payment for this order.');
    }
}
