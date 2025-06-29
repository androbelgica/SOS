<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Recipe;
use App\Models\Product;
use App\Enums\ProductCategory;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class RecipeController extends Controller
{
    /**
     * Get all approved recipes with filtering and pagination
     */
    public function index(Request $request): JsonResponse
    {
        $query = Recipe::approved()
            ->with(['reviews.user', 'products', 'creator'])
            ->withAvg('reviews', 'rating');

        // Search by title or description
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Filter by category
        if ($category = $request->input('category')) {
            $query->where('category', $category);
        }

        // Filter by difficulty
        if ($difficulty = $request->input('difficulty')) {
            $query->where('difficulty_level', $difficulty);
        }

        // Filter by product category (recipes that use products from specific category)
        if ($productCategory = $request->input('product_category')) {
            $query->whereHas('products', function ($q) use ($productCategory) {
                $q->where('category', $productCategory);
            });
        }

        // Sort recipes
        switch ($request->input('sort', 'newest')) {
            case 'rating':
                $query->orderByDesc('reviews_avg_rating');
                break;
            case 'newest':
                $query->orderByDesc('created_at');
                break;
            case 'oldest':
                $query->orderBy('created_at');
                break;
            case 'cooking_time':
                $query->orderBy('cooking_time');
                break;
            default:
                $query->orderByDesc('created_at');
        }

        $recipes = $query->paginate($request->input('per_page', 12));

        // Transform recipes to include additional metadata
        $recipes->getCollection()->transform(function ($recipe) {
            return [
                'id' => $recipe->id,
                'title' => $recipe->title,
                'description' => $recipe->description,
                'ingredients' => $recipe->ingredients,
                'instructions' => $recipe->instructions,
                'cooking_time' => $recipe->cooking_time,
                'difficulty_level' => $recipe->difficulty_level,
                'image_url' => $recipe->image_url,
                'video_url' => $recipe->video_url,
                'category' => $recipe->category,
                'status' => $recipe->status,
                'average_rating' => round($recipe->reviews_avg_rating ?? 0, 1),
                'reviews_count' => $recipe->reviews->count(),
                'creator' => [
                    'id' => $recipe->creator->id,
                    'name' => $recipe->creator->name,
                ],
                'products' => $recipe->products->map(function ($product) {
                    return [
                        'id' => $product->id,
                        'name' => $product->name,
                        'category' => $product->category,
                        'category_display_name' => $product->getCategoryDisplayName(),
                        'category_icon' => $product->getCategoryIcon(),
                        'image_url' => $product->image_url,
                        'pivot' => [
                            'quantity' => $product->pivot->quantity ?? 1,
                            'unit' => $product->pivot->unit ?? 'piece',
                        ],
                    ];
                }),
                'product_categories' => $recipe->products->pluck('category')->unique()->values(),
                'created_at' => $recipe->created_at,
                'updated_at' => $recipe->updated_at,
            ];
        });

        return response()->json($recipes);
    }

    /**
     * Get a specific recipe
     */
    public function show(Recipe $recipe): JsonResponse
    {
        // Only show approved recipes via API
        if ($recipe->status !== 'approved') {
            return response()->json(['message' => 'Recipe not found'], 404);
        }

        $recipe->load(['reviews.user', 'products', 'creator']);
        $recipe->loadAvg('reviews', 'rating');

        return response()->json([
            'id' => $recipe->id,
            'title' => $recipe->title,
            'description' => $recipe->description,
            'ingredients' => $recipe->ingredients,
            'instructions' => $recipe->instructions,
            'cooking_time' => $recipe->cooking_time,
            'difficulty_level' => $recipe->difficulty_level,
            'image_url' => $recipe->image_url,
            'video_url' => $recipe->video_url,
            'category' => $recipe->category,
            'status' => $recipe->status,
            'average_rating' => round($recipe->reviews_avg_rating ?? 0, 1),
            'reviews_count' => $recipe->reviews->count(),
            'creator' => [
                'id' => $recipe->creator->id,
                'name' => $recipe->creator->name,
            ],
            'products' => $recipe->products->map(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'description' => $product->description,
                    'price' => $product->price,
                    'category' => $product->category,
                    'category_display_name' => $product->getCategoryDisplayName(),
                    'category_icon' => $product->getCategoryIcon(),
                    'category_color' => $product->getCategoryColor(),
                    'image_url' => $product->image_url,
                    'unit_type' => $product->unit_type,
                    'is_available' => $product->is_available,
                    'pivot' => [
                        'quantity' => $product->pivot->quantity ?? 1,
                        'unit' => $product->pivot->unit ?? 'piece',
                    ],
                ];
            }),
            'product_categories' => $recipe->products->pluck('category')->unique()->values(),
            'reviews' => $recipe->reviews->map(function ($review) {
                return [
                    'id' => $review->id,
                    'rating' => $review->rating,
                    'comment' => $review->comment,
                    'user' => [
                        'id' => $review->user->id,
                        'name' => $review->user->name,
                    ],
                    'created_at' => $review->created_at,
                ];
            }),
            'created_at' => $recipe->created_at,
            'updated_at' => $recipe->updated_at,
        ]);
    }

    /**
     * Search recipes
     */
    public function search(Request $request, string $query): JsonResponse
    {
        $recipes = Recipe::approved()
            ->where(function ($q) use ($query) {
                $q->where('title', 'like', "%{$query}%")
                    ->orWhere('description', 'like', "%{$query}%");
            })
            ->with(['creator', 'products'])
            ->withAvg('reviews', 'rating')
            ->limit($request->input('limit', 20))
            ->get();

        // Transform recipes
        $transformedRecipes = $recipes->map(function ($recipe) {
            return [
                'id' => $recipe->id,
                'title' => $recipe->title,
                'description' => $recipe->description,
                'cooking_time' => $recipe->cooking_time,
                'difficulty_level' => $recipe->difficulty_level,
                'image_url' => $recipe->image_url,
                'category' => $recipe->category,
                'average_rating' => round($recipe->reviews_avg_rating ?? 0, 1),
                'creator' => [
                    'name' => $recipe->creator->name,
                ],
                'product_categories' => $recipe->products->pluck('category')->unique()->values(),
            ];
        });

        return response()->json($transformedRecipes);
    }

    /**
     * Get recipe categories (both recipe categories and product categories used in recipes)
     */
    public function categories(): JsonResponse
    {
        // Get recipe categories from database
        $recipeCategories = Recipe::approved()
            ->distinct()
            ->pluck('category')
            ->filter()
            ->map(function ($category) {
                return [
                    'type' => 'recipe',
                    'value' => $category,
                    'label' => ucfirst($category),
                    'icon' => '🍽️',
                ];
            });

        // Get product categories used in recipes
        $productCategories = Product::whereHas('recipes', function ($query) {
            $query->where('status', 'approved');
        })
            ->distinct()
            ->pluck('category')
            ->filter()
            ->map(function ($category) {
                $categoryEnum = ProductCategory::tryFrom($category);
                return [
                    'type' => 'product',
                    'value' => $category,
                    'label' => $categoryEnum ? $categoryEnum->getDisplayName() : ucfirst($category),
                    'icon' => $categoryEnum ? $categoryEnum->getIcon() : '📦',
                    'color' => $categoryEnum ? $categoryEnum->getColor() : 'gray',
                ];
            });

        return response()->json([
            'recipe_categories' => $recipeCategories->values(),
            'product_categories' => $productCategories->values(),
        ]);
    }

    /**
     * Store a newly created recipe.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'ingredients' => 'required|array',
            'instructions' => 'required|array',
            'cooking_time' => 'required|integer|min:1',
            'difficulty_level' => 'required|string',
            'image_url' => 'nullable|string',
            'video_url' => 'nullable|string',
            'category' => 'required|string',
        ]);
        $recipe = Recipe::create($validated);
        // Optionally attach products if provided
        if ($request->has('product_ids')) {
            $recipe->products()->sync($request->input('product_ids'));
        }
        return response()->json($recipe, 201);
    }

    /**
     * Update the specified recipe.
     */
    public function update(Request $request, Recipe $recipe): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'ingredients' => 'sometimes|required|array',
            'instructions' => 'sometimes|required|array',
            'cooking_time' => 'sometimes|required|integer|min:1',
            'difficulty_level' => 'sometimes|required|string',
            'image_url' => 'nullable|string',
            'video_url' => 'nullable|string',
            'category' => 'sometimes|required|string',
        ]);
        $recipe->update($validated);
        // Optionally update attached products
        if ($request->has('product_ids')) {
            $recipe->products()->sync($request->input('product_ids'));
        }
        return response()->json($recipe);
    }

    /**
     * Remove the specified recipe.
     */
    public function destroy(Recipe $recipe): JsonResponse
    {
        $recipe->delete();
        return response()->json(['message' => 'Recipe deleted successfully']);
    }

    /**
     * Approve a recipe
     */
    public function approve(Recipe $recipe): JsonResponse
    {
        $recipe->status = 'approved';
        $recipe->approved_at = now();
        $recipe->save();
        return response()->json(['message' => 'Recipe approved']);
    }

    /**
     * Reject a recipe
     */
    public function reject(Request $request, Recipe $recipe): JsonResponse
    {
        $recipe->status = 'rejected';
        $recipe->rejection_reason = $request->input('reason', '');
        $recipe->save();
        return response()->json(['message' => 'Recipe rejected']);
    }

    /**
     * Set a recipe to under review
     */
    public function setUnderReview(Recipe $recipe): JsonResponse
    {
        $recipe->status = 'under_review';
        $recipe->save();
        return response()->json(['message' => 'Recipe set to under review']);
    }
}
