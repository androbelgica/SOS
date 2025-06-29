<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class ProofOfDeliveryController extends Controller
{
    use AuthorizesRequests;

    public function store(Request $request, $orderId)
    {
        // Handle upload of proof (photo/signature)
        return response()->json(['message' => 'Proof uploaded']);
    }

    public function show($orderId)
    {
        // Return proof of delivery (photo/signature)
        return response()->json(['proof' => null]);
    }
}
