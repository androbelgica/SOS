<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Recipe;
use App\Models\User;
use App\Notifications\LowStockAlert;
use App\Services\FileUploadService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ProductController extends Controller
{
    protected $fileUploadService;

    public function __construct(FileUploadService $fileUploadService)
    {
        $this->fileUploadService = $fileUploadService;
    }

    public function index(Request $request)
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

        $products = $query->paginate(12)->withQueryString();

        return Inertia::render('Products/Index', [
            'products' => $products,
            'filters' => $request->only(['search', 'category', 'available', 'min_price', 'max_price', 'sort', 'direction']),
            'categories' => Product::distinct()->pluck('category')
        ]);
    }

    public function adminIndex()
    {
        // Add a timestamp to force fresh data
        $timestamp = time();

        // Get products with a query
        $productsQuery = Product::query()
            ->with('recipes')
            ->withCount('recipes')
            ->select('id', 'name', 'description', 'price', 'stock_quantity', 'category', 'unit_type', 'image_url', 'is_available', 'created_at', 'updated_at') // Explicitly select all needed fields
            ->when(request('search'), function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            })
            ->when(request('sort'), function ($query, $sort) {
                $query->orderBy($sort, request('direction', 'asc'));
            });

        // Get the paginated results
        $products = $productsQuery->paginate(10)->withQueryString();

        // Add a random query parameter to each image URL to prevent caching
        // Use relative paths for local storage images
        $products->getCollection()->transform(function ($product) use ($timestamp) {
            if ($product->image_url) {
                // Only process URLs that aren't already external
                if (!str_starts_with($product->image_url, 'http')) {
                    // Ensure the path starts with /storage
                    if (!str_starts_with($product->image_url, '/storage')) {
                        $product->image_url = '/storage/' . $product->image_url;
                    }

                    // Remove any existing timestamp parameters
                    $product->image_url = preg_replace('/[?&]t=\d+/', '', $product->image_url);

                    // Add a new timestamp parameter
                    $product->image_url .= (strpos($product->image_url, '?') !== false ? '&' : '?') . 't=' . $timestamp;
                } else {
                    // For external URLs, just add the timestamp
                    // Remove any existing timestamp parameters first
                    $product->image_url = preg_replace('/[?&]t=\d+/', '', $product->image_url);

                    // Add a new timestamp parameter
                    $product->image_url .= (strpos($product->image_url, '?') !== false ? '&' : '?') . 't=' . $timestamp;
                }

                Log::info('Product image URL prepared', [
                    'product_id' => $product->id,
                    'image_url' => $product->image_url
                ]);
            }
            return $product;
        });

        return Inertia::render('Admin/Products/Index', [
            'products' => $products,
            'filters' => request()->only(['search', 'sort', 'direction']),
            'stats' => [
                'total' => Product::count(),
                'lowStock' => Product::where('stock_quantity', '<=', 10)->count(),
                'outOfStock' => Product::where('stock_quantity', 0)->count(),
            ],
            'timestamp' => $timestamp, // Pass timestamp to the view for cache busting
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Products/Create', [
            'recipes' => Recipe::all()
        ]);
    }

    public function show(Product $product)
    {
        // Add a timestamp to force fresh data
        $timestamp = time();

        // Load the product with its recipes
        $product->load('recipes');
        $relatedRecipes = $product->recipes()->withAvg('reviews', 'rating')->get();

        // Add a timestamp to the image URL to prevent caching
        if ($product->image_url) {
            // Only process URLs that aren't already external
            if (!str_starts_with($product->image_url, 'http')) {
                // Ensure the path starts with /storage
                if (!str_starts_with($product->image_url, '/storage')) {
                    $product->image_url = '/storage/' . $product->image_url;
                }

                // Remove any existing timestamp parameters
                $product->image_url = preg_replace('/[?&]t=\d+/', '', $product->image_url);

                // Add a new timestamp parameter
                $product->image_url .= (strpos($product->image_url, '?') !== false ? '&' : '?') . 't=' . $timestamp;
            } else {
                // For external URLs, just add the timestamp
                // Remove any existing timestamp parameters first
                $product->image_url = preg_replace('/[?&]t=\d+/', '', $product->image_url);

                // Add a new timestamp parameter
                $product->image_url .= (strpos($product->image_url, '?') !== false ? '&' : '?') . 't=' . $timestamp;
            }

            // Log the image URL for debugging
            Log::info('Show Product Image URL', [
                'product_id' => $product->id,
                'image_url' => $product->image_url,
                'timestamp' => $timestamp
            ]);
        }

        // Add timestamps to recipe image URLs as well
        foreach ($relatedRecipes as $recipe) {
            if ($recipe->image_url) {
                // Check if the image URL already has a query parameter
                if (strpos($recipe->image_url, '?') !== false) {
                    $recipe->image_url = $recipe->image_url . '&t=' . $timestamp;
                } else {
                    $recipe->image_url = $recipe->image_url . '?t=' . $timestamp;
                }
            }
        }

        return Inertia::render('Products/Show', [
            'product' => $product,
            'relatedRecipes' => $relatedRecipes,
            'timestamp' => $timestamp // Pass timestamp to the view for cache busting
        ]);
    }

    public function edit(Product $product)
    {
        // Add a timestamp to force fresh data
        $timestamp = time();

        // Load the product with its recipes
        $product = $product->load('recipes');

        // Add a timestamp to the image URL to prevent caching
        if ($product->image_url) {
            // Only process URLs that aren't already external
            if (!str_starts_with($product->image_url, 'http')) {
                // Ensure the path starts with /storage
                if (!str_starts_with($product->image_url, '/storage')) {
                    $product->image_url = '/storage/' . $product->image_url;
                }

                // Remove any existing timestamp parameters
                $product->image_url = preg_replace('/[?&]t=\d+/', '', $product->image_url);

                // Add a new timestamp parameter
                $product->image_url .= (strpos($product->image_url, '?') !== false ? '&' : '?') . 't=' . $timestamp;
            } else {
                // For external URLs, just add the timestamp
                // Remove any existing timestamp parameters first
                $product->image_url = preg_replace('/[?&]t=\d+/', '', $product->image_url);

                // Add a new timestamp parameter
                $product->image_url .= (strpos($product->image_url, '?') !== false ? '&' : '?') . 't=' . $timestamp;
            }

            // Log the image URL for debugging
            Log::info('Edit Product Image URL', [
                'product_id' => $product->id,
                'image_url' => $product->image_url,
                'timestamp' => $timestamp
            ]);
        }

        return Inertia::render('Admin/Products/Edit', [
            'product' => $product,
            'recipes' => Recipe::all(),
            'timestamp' => $timestamp // Pass timestamp to the view for cache busting
        ]);
    }

    public function store(Request $request)
    {
        Log::info('Product Create Request', [
            'has_file' => $request->hasFile('image'),
            'all_data' => $request->except(['image']),
            'files' => $request->hasFile('image') ? $request->file('image')->getClientOriginalName() : 'none'
        ]);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'nutritional_facts' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock_quantity' => 'required|integer|min:0',
            'category' => 'required|string|max:255',
            'unit_type' => 'required|string|in:kg,piece',
            'image' => 'nullable|image|max:2048',
            'image_url' => 'nullable|string' // For existing images selected from browser
        ]);

        // Remove image from validated data as it's not a column in the database
        if (isset($validated['image'])) {
            unset($validated['image']);
        }

        // Remove image_url from validated data and store it separately
        $existingImageUrl = null;
        if (isset($validated['image_url'])) {
            $existingImageUrl = $validated['image_url'];
            unset($validated['image_url']);
        }

        $product = new Product($validated);

        // Handle image upload or reuse existing image
        if ($request->hasFile('image')) {
            try {
                $file = $request->file('image');
                Log::info('Image File', [
                    'original_name' => $file->getClientOriginalName(),
                    'mime_type' => $file->getMimeType(),
                    'size' => $file->getSize()
                ]);

                $product->image_url = $this->fileUploadService->uploadImage($file, 'products', $product->name);
                Log::info('Image URL', ['url' => $product->image_url, 'product_name' => $product->name]);
            } catch (\Exception $e) {
                Log::error('Image Upload Error', [
                    'message' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
                return back()->withErrors(['image' => 'Failed to upload image: ' . $e->getMessage()]);
            }
        } elseif ($existingImageUrl) {
            // Use the existing image URL
            $product->image_url = $existingImageUrl;
            Log::info('Using existing image', ['url' => $existingImageUrl]);
        }

        try {
            $product->save();
            Log::info('Product Created', ['product_id' => $product->id]);

            if ($request->has('recipe_ids')) {
                $product->recipes()->attach($request->recipe_ids);
                Log::info('Recipes Attached', ['recipe_ids' => $request->recipe_ids]);
            }

            return redirect()->route('admin.products.index')
                ->with('success', 'Product created successfully.');
        } catch (\Exception $e) {
            Log::error('Product Create Error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return back()->withErrors(['general' => 'Failed to create product: ' . $e->getMessage()]);
        }
    }

    public function update(Request $request, Product $product)
    {
        // Log the request data for debugging
        Log::info('Product Update Request', [
            'has_file' => $request->hasFile('image'),
            'all_data' => $request->except(['image']), // Don't log the entire image data
            'files' => $request->hasFile('image') ? $request->file('image')->getClientOriginalName() : 'none'
        ]);

        // Remove _method from validation
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'nutritional_facts' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock_quantity' => 'required|integer|min:0',
            'category' => 'required|string|max:255',
            'unit_type' => 'required|string|in:kg,piece',
            'image' => 'nullable|image|max:2048',
            'image_url' => 'nullable|string' // For existing images selected from browser
        ]);

        // Log validated data
        Log::info('Validated Data', array_diff_key($validated, ['image' => '', 'image_url' => '']));

        // Remove image_url from validated data and store it separately
        $existingImageUrl = null;
        if (isset($validated['image_url'])) {
            $existingImageUrl = $validated['image_url'];
            unset($validated['image_url']);
        }

        // Handle image upload
        if ($request->hasFile('image')) {
            try {
                $file = $request->file('image');
                Log::info('Image File', [
                    'original_name' => $file->getClientOriginalName(),
                    'mime_type' => $file->getMimeType(),
                    'size' => $file->getSize()
                ]);

                // Note: We don't delete the old image anymore to allow for image reusability
                // Instead, we just update the product's image_url

                // Upload the image and get the URL
                $imageUrl = $this->fileUploadService->uploadImage($file, 'products', $validated['name']);

                // Ensure the URL is properly formatted
                $validated['image_url'] = $imageUrl;

                Log::info('Image URL', [
                    'url' => $validated['image_url'],
                    'product_id' => $product->id,
                    'timestamp' => time()
                ]);
            } catch (\Exception $e) {
                Log::error('Image Upload Error', [
                    'message' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
                return back()->withErrors(['image' => 'Failed to upload image: ' . $e->getMessage()]);
            }
        } elseif ($existingImageUrl) {
            // Use the existing image URL
            $validated['image_url'] = $existingImageUrl;
            Log::info('Using existing image', [
                'url' => $existingImageUrl,
                'product_id' => $product->id
            ]);
        }

        // Remove image from validated data as it's not a column in the database
        if (isset($validated['image'])) {
            unset($validated['image']);
        }

        try {
            $product->update($validated);
            Log::info('Product Updated', ['product_id' => $product->id]);

            if ($request->has('recipe_ids')) {
                $product->recipes()->sync($request->recipe_ids);
                Log::info('Recipes Synced', ['recipe_ids' => $request->recipe_ids]);
            }

            // Redirect to the admin products index page with a success message
            return redirect()->route('admin.products.index')
                ->with('success', 'Product updated successfully.');
        } catch (\Exception $e) {
            Log::error('Product Update Error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return back()->withErrors(['general' => 'Failed to update product: ' . $e->getMessage()]);
        }
    }

    public function updateStock(Request $request, Product $product)
    {
        $validated = $request->validate([
            'stock_quantity' => 'required|integer|min:0'
        ]);

        $oldStock = $product->stock_quantity;
        $product->update($validated);

        // Notify admin if stock is low
        if ($product->stock_quantity <= 10 && $oldStock > 10) {
            $admin = User::where('role', 'admin')->first();
            $admin->notify(new LowStockAlert($product));
        }

        return back()->with('success', 'Stock updated successfully.');
    }

    public function batchUpdateStock(Request $request)
    {
        $validated = $request->validate([
            'updates' => 'required|array',
            'updates.*.id' => 'required|exists:products,id',
            'updates.*.stock_quantity' => 'required|integer|min:0'
        ]);

        foreach ($validated['updates'] as $update) {
            $product = Product::find($update['id']);
            $oldStock = $product->stock_quantity;
            $product->stock_quantity = $update['stock_quantity'];
            $product->save();

            // Notify admin if stock is low
            if ($product->stock_quantity <= 10 && $oldStock > 10) {
                $admin = User::where('role', 'admin')->first();
                $admin->notify(new LowStockAlert($product));
            }
        }

        return back()->with('success', 'Stock levels updated successfully.');
    }

    public function destroy(Product $product)
    {
        // Note: We intentionally do not delete the image file to allow for image reusability
        // if the same product is created again in the future

        $product->delete();
        return redirect()->route('admin.products.index')
            ->with('success', 'Product deleted successfully. (Note: Product image has been preserved for future reuse)');
    }
}
