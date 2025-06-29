<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class UserController extends Controller
{
    public function update(Request $request): JsonResponse
    {
        $user = $request->user();
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|max:255|unique:users,email,' . $user->id,
            'avatar' => 'nullable|string',
            'address' => 'nullable|string',
            'phone' => 'nullable|string',
            'city' => 'nullable|string',
            'state' => 'nullable|string',
            'postal_code' => 'nullable|string',
            'country' => 'nullable|string',
        ]);
        $user->update($validated);
        return response()->json($user);
    }

    public function destroy(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->delete();
        return response()->json(['message' => 'User deleted successfully']);
    }
}
