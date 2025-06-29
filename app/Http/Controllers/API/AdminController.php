<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\JsonResponse;

class AdminController extends Controller
{
    public function dashboardStats(): JsonResponse
    {
        $pendingOrders = Order::where('status', 'pending')->count();
        $processingOrders = Order::where('status', 'processing')->count();
        $deliveredOrders = Order::where('status', 'delivered')->count();
        $cancelledOrders = Order::where('status', 'cancelled')->count();
        $todayRevenue = Order::whereDate('created_at', today())->sum('total_amount');
        $yesterdayRevenue = Order::whereDate('created_at', today()->subDay())->sum('total_amount');
        $thisWeekRevenue = Order::whereBetween('created_at', [now()->startOfWeek(), now()])->sum('total_amount');
        $thisMonthRevenue = Order::whereMonth('created_at', now()->month)->sum('total_amount');
        $pendingPayments = Order::where('payment_status', 'pending')->count();
        $paidOrders = Order::where('payment_status', 'paid')->count();
        $failedPayments = Order::where('payment_status', 'failed')->count();
        $lowStockCount = Product::where('stock_quantity', '<=', 10)->count();
        $totalProducts = Product::count();
        $recentOrders = Order::with(['user', 'items.product'])->latest()->take(5)->get();
        return response()->json([
            'orders' => [
                'pending' => $pendingOrders,
                'processing' => $processingOrders,
                'delivered' => $deliveredOrders,
                'cancelled' => $cancelledOrders,
                'total' => $pendingOrders + $processingOrders + $deliveredOrders + $cancelledOrders
            ],
            'revenue' => [
                'today' => $todayRevenue,
                'yesterday' => $yesterdayRevenue,
                'thisWeek' => $thisWeekRevenue,
                'thisMonth' => $thisMonthRevenue
            ],
            'payments' => [
                'pending' => $pendingPayments,
                'paid' => $paidOrders,
                'failed' => $failedPayments
            ],
            'inventory' => [
                'lowStock' => $lowStockCount,
                'totalProducts' => $totalProducts
            ],
            'recentOrders' => $recentOrders
        ]);
    }
}
