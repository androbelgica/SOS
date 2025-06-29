<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class ChatController extends Controller
{
    use AuthorizesRequests;

    public function index($orderId)
    {
        // Return chat history for order
        return response()->json(['messages' => []]);
    }

    public function store(Request $request, $orderId)
    {
        // Store new chat message
        return response()->json(['message' => 'Message sent']);
    }
}
