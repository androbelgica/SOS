<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class RatingController extends Controller
{
    use AuthorizesRequests;

    public function store(Request $request, $orderId)
    {
        // Store rating for order/delivery
        return response()->json(['message' => 'Rating submitted']);
    }

    public function show($orderId)
    {
        // Return rating for order/delivery
        return response()->json(['rating' => null]);
    }
}
