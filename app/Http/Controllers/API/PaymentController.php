<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class PaymentController extends Controller
{
    use AuthorizesRequests;

    public function pay(Request $request, $orderId)
    {
        // Initiate payment (stub)
        return response()->json(['message' => 'Payment initiated']);
    }

    public function status($orderId)
    {
        // Return payment status (stub)
        return response()->json(['status' => 'pending']);
    }
}
