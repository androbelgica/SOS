<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    /**
     * Display a listing of products
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $query = Product::query();
        
        // Filter by category
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }
        
        // Filter by availability
        if ($request->has('available') && $request->available) {
            $query->where('is_available', true);
        }
        
        // Sort by price
        if ($request->has('sort_price')) {
            $direction = $request->sort_price === 'asc' ? 'asc' : 'desc';
            $query->orderBy('price', $direction);
        } else {
            // Default sort by newest
            $query->latest();
        }
        
        // Paginate results
        $perPage = $request->per_page ?? 10;
        $products = $query->paginate($perPage);
        
        return response()->json([
            'success' => true,
            'data' => $products
        ]);
    }
    
    /**
     * Display the specified product
     *
     * @param Product $product
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Product $product)
    {
        // Load related recipes
        $product->load('recipes');
        
        return response()->json([
            'success' => true,
            'data' => $product
        ]);
    }
    
    /**
     * Search for products
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
        
        $products = Product::where('name', 'like', "%{$searchQuery}%")
            ->orWhere('description', 'like', "%{$searchQuery}%")
            ->orWhere('category', 'like', "%{$searchQuery}%")
            ->paginate(10);
        
        return response()->json([
            'success' => true,
            'data' => $products
        ]);
    }
    
    /**
     * Get product categories
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function categories()
    {
        $categories = Product::select('category')
            ->distinct()
            ->pluck('category')
            ->filter()
            ->values();
        
        return response()->json([
            'success' => true,
            'data' => $categories
        ]);
    }
    
    /**
     * Get user's wishlist
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getWishlist(Request $request)
    {
        $user = $request->user();
        
        // Check if wishlist relationship exists
        if (!method_exists($user, 'wishlist')) {
            return response()->json([
                'success' => false,
                'message' => 'Wishlist functionality not implemented'
            ], 501);
        }
        
        $wishlist = $user->wishlist()->paginate(10);
        
        return response()->json([
            'success' => true,
            'data' => $wishlist
        ]);
    }
    
    /**
     * Add product to wishlist
     *
     * @param Request $request
     * @param int $productId
     * @return \Illuminate\Http\JsonResponse
     */
    public function addToWishlist(Request $request, $productId)
    {
        $user = $request->user();
        
        // Check if wishlist relationship exists
        if (!method_exists($user, 'wishlist')) {
            return response()->json([
                'success' => false,
                'message' => 'Wishlist functionality not implemented'
            ], 501);
        }
        
        $product = Product::findOrFail($productId);
        
        // Check if already in wishlist
        if ($user->wishlist()->where('product_id', $productId)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Product already in wishlist'
            ], 400);
        }
        
        $user->wishlist()->attach($productId);
        
        return response()->json([
            'success' => true,
            'message' => 'Product added to wishlist'
        ]);
    }
    
    /**
     * Remove product from wishlist
     *
     * @param Request $request
     * @param int $productId
     * @return \Illuminate\Http\JsonResponse
     */
    public function removeFromWishlist(Request $request, $productId)
    {
        $user = $request->user();
        
        // Check if wishlist relationship exists
        if (!method_exists($user, 'wishlist')) {
            return response()->json([
                'success' => false,
                'message' => 'Wishlist functionality not implemented'
            ], 501);
        }
        
        $user->wishlist()->detach($productId);
        
        return response()->json([
            'success' => true,
            'message' => 'Product removed from wishlist'
        ]);
    }
}
