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

        Log::info('AI Product Generation Request', [
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

    /**
     * Generate recipe description using AI
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function generateRecipeDescription(Request $request)
    {
        $request->validate([
            'recipe_title' => 'required|string|min:2|max:255',
        ]);

        $recipeTitle = $request->input('recipe_title');

        Log::info('AI Recipe Description Generation Request', [
            'recipe_title' => $recipeTitle
        ]);

        $result = $this->openAIService->generateRecipeDescription($recipeTitle);

        if ($result['success']) {
            return response()->json([
                'success' => true,
                'description' => $result['description']
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => $result['message'] ?? 'Failed to generate recipe description'
        ], 500);
    }

    /**
     * Generate recipe ingredients using AI
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function generateRecipeIngredients(Request $request)
    {
        $request->validate([
            'recipe_title' => 'required|string|min:2|max:255',
        ]);

        $recipeTitle = $request->input('recipe_title');

        Log::info('AI Recipe Ingredients Generation Request', [
            'recipe_title' => $recipeTitle
        ]);

        $result = $this->openAIService->generateRecipeIngredients($recipeTitle);

        if ($result['success']) {
            return response()->json([
                'success' => true,
                'ingredients' => $result['ingredients']
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => $result['message'] ?? 'Failed to generate recipe ingredients'
        ], 500);
    }

    /**
     * Generate recipe instructions using AI
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function generateRecipeInstructions(Request $request)
    {
        $request->validate([
            'recipe_title' => 'required|string|min:2|max:255',
        ]);

        $recipeTitle = $request->input('recipe_title');

        Log::info('AI Recipe Instructions Generation Request', [
            'recipe_title' => $recipeTitle
        ]);

        $result = $this->openAIService->generateRecipeInstructions($recipeTitle);

        if ($result['success']) {
            return response()->json([
                'success' => true,
                'instructions' => $result['instructions']
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => $result['message'] ?? 'Failed to generate recipe instructions'
        ], 500);
    }
}
