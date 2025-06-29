<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\ProductRecognition;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class ProductRecognitionController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request): JsonResponse
    {
        $recognitions = ProductRecognition::where('user_id', $request->user()->id)->latest()->get();
        return response()->json($recognitions);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'image_path' => 'required|string',
            'detected_labels' => 'nullable|array',
            'detected_objects' => 'nullable|array',
            'detected_text' => 'nullable|array',
            'seafood_detected' => 'boolean',
            'suggested_products' => 'nullable|array',
            'confidence_score' => 'nullable|numeric',
            'is_mock_data' => 'boolean',
            'notes' => 'nullable|string',
        ]);
        $validated['user_id'] = $request->user()->id;
        $recognition = ProductRecognition::create($validated);
        return response()->json($recognition, 201);
    }

    public function show(ProductRecognition $productRecognition): JsonResponse
    {
        $this->authorize('view', $productRecognition);
        return response()->json($productRecognition);
    }
}
