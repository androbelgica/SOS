<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class AddressController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request)
    {
        // Return list of addresses for authenticated user
        return response()->json(['addresses' => []]);
    }

    public function store(Request $request)
    {
        // Validate and create new address
        return response()->json(['message' => 'Address created'], 201);
    }

    public function update(Request $request, $id)
    {
        // Validate and update address
        return response()->json(['message' => 'Address updated']);
    }

    public function destroy($id)
    {
        // Delete address
        return response()->json(['message' => 'Address deleted']);
    }
}
