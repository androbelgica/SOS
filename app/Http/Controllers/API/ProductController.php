<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Enums\ProductCategory;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ProductController extends Controller
{
    /**
     * Get all products with filtering and pagination
     */
    public function index(Request $request): JsonResponse
    {
        $query = Product::query()->with('recipes');

        // Search by name or description
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('category', 'like', "%{$search}%");
            });
        }

        // Filter by category
        if ($category = $request->input('category')) {
            $query->where('category', $category);
        }

        // Filter by availability
        if ($request->has('available')) {
            $query->where('is_available', $request->boolean('available'));
        }

        // Filter by price range
        if ($minPrice = $request->input('min_price')) {
            $query->where('price', '>=', $minPrice);
        }
        if ($maxPrice = $request->input('max_price')) {
            $query->where('price', '<=', $maxPrice);
        }

        // Sort products
        $sortField = $request->input('sort', 'name');
        $sortDirection = $request->input('direction', 'asc');
        $query->orderBy($sortField, $sortDirection);

        $products = $query->paginate($request->input('per_page', 12));

        // Transform products to include category metadata
        $products->getCollection()->transform(function ($product) {
            return [
                'id' => $product->id,
                'name' => $product->name,
                'description' => $product->description,
                'nutritional_facts' => $product->nutritional_facts,
                'price' => $product->price,
                'stock_quantity' => $product->stock_quantity,
                'image_url' => $product->image_url,
                'category' => $product->category,
                'category_display_name' => $product->getCategoryDisplayName(),
                'category_icon' => $product->getCategoryIcon(),
                'category_color' => $product->getCategoryColor(),
                'unit_type' => $product->unit_type,
                'is_available' => $product->is_available,
                'recipes_count' => $product->recipes->count(),
                'created_at' => $product->created_at,
                'updated_at' => $product->updated_at,
            ];
        });

        return response()->json($products);
    }

    /**
     * Get a specific product
     */
    public function show(Product $product): JsonResponse
    {
        $product->load('recipes');

        return response()->json([
            'id' => $product->id,
            'name' => $product->name,
            'description' => $product->description,
            'nutritional_facts' => $product->nutritional_facts,
            'price' => $product->price,
            'stock_quantity' => $product->stock_quantity,
            'image_url' => $product->image_url,
            'category' => $product->category,
            'category_display_name' => $product->getCategoryDisplayName(),
            'category_icon' => $product->getCategoryIcon(),
            'category_color' => $product->getCategoryColor(),
            'unit_type' => $product->unit_type,
            'is_available' => $product->is_available,
            'recipes' => $product->recipes,
            'created_at' => $product->created_at,
            'updated_at' => $product->updated_at,
        ]);
    }

    /**
     * Search products
     */
    public function search(Request $request, string $query): JsonResponse
    {
        $products = Product::where('name', 'like', "%{$query}%")
            ->orWhere('description', 'like', "%{$query}%")
            ->orWhere('category', 'like', "%{$query}%")
            ->with('recipes')
            ->limit($request->input('limit', 20))
            ->get();

        // Transform products
        $transformedProducts = $products->map(function ($product) {
            return [
                'id' => $product->id,
                'name' => $product->name,
                'description' => $product->description,
                'price' => $product->price,
                'image_url' => $product->image_url,
                'category' => $product->category,
                'category_display_name' => $product->getCategoryDisplayName(),
                'category_icon' => $product->getCategoryIcon(),
                'category_color' => $product->getCategoryColor(),
                'unit_type' => $product->unit_type,
                'is_available' => $product->is_available,
            ];
        });

        return response()->json($transformedProducts);
    }

    /**
     * Get all product categories
     */
    public function categories(): JsonResponse
    {
        // Get categories from enum with metadata
        $enumCategories = collect(ProductCategory::cases())->map(function ($category) {
            return [
                'value' => $category->value,
                'label' => $category->getDisplayName(),
                'icon' => $category->getIcon(),
                'color' => $category->getColor(),
            ];
        });

        // Get actual categories from database (for existing data)
        $dbCategories = Product::distinct()
            ->pluck('category')
            ->filter()
            ->map(function ($category) {
                $categoryEnum = ProductCategory::tryFrom($category);
                return [
                    'value' => $category,
                    'label' => $categoryEnum ? $categoryEnum->getDisplayName() : ucfirst($category),
                    'icon' => $categoryEnum ? $categoryEnum->getIcon() : '📦',
                    'color' => $categoryEnum ? $categoryEnum->getColor() : 'gray',
                ];
            });

        // Merge and deduplicate
        $allCategories = $enumCategories->merge($dbCategories)
            ->unique('value')
            ->values();

        return response()->json($allCategories);
    }

    /**
     * Get products by category with counts
     */
    public function byCategory(): JsonResponse
    {
        $categoryCounts = Product::selectRaw('category, COUNT(*) as count')
            ->groupBy('category')
            ->get()
            ->map(function ($item) {
                $categoryEnum = ProductCategory::tryFrom($item->category);
                return [
                    'category' => $item->category,
                    'label' => $categoryEnum ? $categoryEnum->getDisplayName() : ucfirst($item->category),
                    'icon' => $categoryEnum ? $categoryEnum->getIcon() : '📦',
                    'color' => $categoryEnum ? $categoryEnum->getColor() : 'gray',
                    'count' => $item->count,
                ];
            });

        return response()->json($categoryCounts);
    }
}
