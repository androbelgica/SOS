<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class CourierLocationController extends Controller
{
    use AuthorizesRequests;

    public function update(Request $request)
    {
        // Update courier's current location
        return response()->json(['message' => 'Location updated']);
    }

    public function show($orderId)
    {
        // Return courier location for given order
        return response()->json(['lat' => null, 'lng' => null]);
    }
}
