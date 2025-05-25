<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Recipe;
use App\Models\RecipeReview;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class RecipeController extends Controller
{
    /**
     * Display a listing of recipes
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $query = Recipe::with('reviews')
            ->withAvg('reviews', 'rating');
        
        // Filter by difficulty level
        if ($request->has('difficulty')) {
            $query->where('difficulty_level', $request->difficulty);
        }
        
        // Filter by cooking time
        if ($request->has('max_time')) {
            $query->where('cooking_time', '<=', $request->max_time);
        }
        
        // Sort by rating
        if ($request->has('sort_rating') && $request->sort_rating) {
            $query->orderByDesc('reviews_avg_rating');
        } else {
            // Default sort by newest
            $query->latest();
        }
        
        // Paginate results
        $perPage = $request->per_page ?? 10;
        $recipes = $query->paginate($perPage);
        
        return response()->json([
            'success' => true,
            'data' => $recipes
        ]);
    }
    
    /**
     * Display the specified recipe
     *
     * @param Recipe $recipe
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Recipe $recipe)
    {
        // Load related products and reviews
        $recipe->load(['products', 'reviews.user']);
        
        // Calculate average rating
        $recipe->average_rating = $recipe->reviews()->avg('rating') ?? 0;
        $recipe->reviews_count = $recipe->reviews()->count();
        
        return response()->json([
            'success' => true,
            'data' => $recipe
        ]);
    }
    
    /**
     * Search for recipes
     *
     * @param Request $request
     * @param string|null $query
     * @return \Illuminate\Http\JsonResponse
     */
    public function search(Request $request, $query = null)
    {
        // Use query parameter if not in route
        $searchQuery = $query ?? $request->query('q');
        
        if (!$searchQuery) {
            return response()->json([
                'success' => false,
                'message' => 'Search query is required'
            ], 400);
        }
        
        $recipes = Recipe::where('title', 'like', "%{$searchQuery}%")
            ->orWhere('description', 'like', "%{$searchQuery}%")
            ->with('reviews')
            ->withAvg('reviews', 'rating')
            ->paginate(10);
        
        return response()->json([
            'success' => true,
            'data' => $recipes
        ]);
    }
    
    /**
     * Get recipe categories (difficulty levels)
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function categories()
    {
        $difficulties = Recipe::select('difficulty_level')
            ->distinct()
            ->pluck('difficulty_level')
            ->filter()
            ->values();
        
        return response()->json([
            'success' => true,
            'data' => $difficulties
        ]);
    }
    
    /**
     * Add a review to a recipe
     *
     * @param Request $request
     * @param Recipe $recipe
     * @return \Illuminate\Http\JsonResponse
     */
    public function addReview(Request $request, Recipe $recipe)
    {
        $validator = Validator::make($request->all(), [
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:500',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }
        
        $user = $request->user();
        
        // Check if user already reviewed this recipe
        $existingReview = RecipeReview::where('user_id', $user->id)
            ->where('recipe_id', $recipe->id)
            ->first();
        
        if ($existingReview) {
            return response()->json([
                'success' => false,
                'message' => 'You have already reviewed this recipe',
                'review' => $existingReview
            ], 400);
        }
        
        // Create new review
        $review = RecipeReview::create([
            'user_id' => $user->id,
            'recipe_id' => $recipe->id,
            'rating' => $request->rating,
            'comment' => $request->comment,
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'Review added successfully',
            'data' => $review
        ], 201);
    }
    
    /**
     * Update a review
     *
     * @param Request $request
     * @param RecipeReview $review
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateReview(Request $request, RecipeReview $review)
    {
        // Check if user owns the review
        if ($review->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }
        
        $validator = Validator::make($request->all(), [
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:500',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }
        
        $review->update([
            'rating' => $request->rating,
            'comment' => $request->comment,
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'Review updated successfully',
            'data' => $review
        ]);
    }
    
    /**
     * Delete a review
     *
     * @param Request $request
     * @param RecipeReview $review
     * @return \Illuminate\Http\JsonResponse
     */
    public function deleteReview(Request $request, RecipeReview $review)
    {
        // Check if user owns the review
        if ($review->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }
        
        $review->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Review deleted successfully'
        ]);
    }
    
    /**
     * Get user's favorite recipes
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getFavorites(Request $request)
    {
        $user = $request->user();
        
        // Check if favorites relationship exists
        if (!method_exists($user, 'favoriteRecipes')) {
            return response()->json([
                'success' => false,
                'message' => 'Favorites functionality not implemented'
            ], 501);
        }
        
        $favorites = $user->favoriteRecipes()
            ->with('reviews')
            ->withAvg('reviews', 'rating')
            ->paginate(10);
        
        return response()->json([
            'success' => true,
            'data' => $favorites
        ]);
    }
    
    /**
     * Add recipe to favorites
     *
     * @param Request $request
     * @param Recipe $recipe
     * @return \Illuminate\Http\JsonResponse
     */
    public function addToFavorites(Request $request, Recipe $recipe)
    {
        $user = $request->user();
        
        // Check if favorites relationship exists
        if (!method_exists($user, 'favoriteRecipes')) {
            return response()->json([
                'success' => false,
                'message' => 'Favorites functionality not implemented'
            ], 501);
        }
        
        // Check if already in favorites
        if ($user->favoriteRecipes()->where('recipe_id', $recipe->id)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Recipe already in favorites'
            ], 400);
        }
        
        $user->favoriteRecipes()->attach($recipe->id);
        
        return response()->json([
            'success' => true,
            'message' => 'Recipe added to favorites'
        ]);
    }
    
    /**
     * Remove recipe from favorites
     *
     * @param Request $request
     * @param Recipe $recipe
     * @return \Illuminate\Http\JsonResponse
     */
    public function removeFromFavorites(Request $request, Recipe $recipe)
    {
        $user = $request->user();
        
        // Check if favorites relationship exists
        if (!method_exists($user, 'favoriteRecipes')) {
            return response()->json([
                'success' => false,
                'message' => 'Favorites functionality not implemented'
            ], 501);
        }
        
        $user->favoriteRecipes()->detach($recipe->id);
        
        return response()->json([
            'success' => true,
            'message' => 'Recipe removed from favorites'
        ]);
    }
}
