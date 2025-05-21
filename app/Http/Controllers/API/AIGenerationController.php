<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\OpenAIService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AIGenerationController extends Controller
{
    protected $openAIService;

    public function __construct(OpenAIService $openAIService)
    {
        $this->openAIService = $openAIService;
    }

    /**
     * Generate product information using AI
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function generateProductInfo(Request $request)
    {
        $request->validate([
            'product_name' => 'required|string|min:2|max:255',
        ]);

        $productName = $request->input('product_name');
        
        Log::info('AI Generation Request', [
            'product_name' => $productName
        ]);

        $result = $this->openAIService->generateProductInfo($productName);

        if ($result['success']) {
            return response()->json([
                'success' => true,
                'description' => $result['description'],
                'nutritional_facts' => $result['nutritional_facts']
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => $result['message'] ?? 'Failed to generate product information'
        ], 500);
    }
}
