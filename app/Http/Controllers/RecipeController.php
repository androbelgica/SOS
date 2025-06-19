<?php

namespace App\Http\Controllers;

use App\Models\Recipe;
use App\Models\Product;
use App\Models\RecipeReview;
use App\Models\Notification;
use App\Models\User;
use App\Services\FileUploadService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Inertia\Inertia;

class RecipeController extends Controller
{
    use AuthorizesRequests;

    protected $fileUploadService;

    public function __construct(FileUploadService $fileUploadService)
    {
        $this->fileUploadService = $fileUploadService;
    }
    public function index()
    {
        $recipes = Recipe::approved()
            ->with(['reviews.user', 'products', 'creator'])
            ->withAvg('reviews', 'rating')
            ->when(request('search'), function ($query, $search) {
                $query->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            })
            ->when(request('category'), function ($query, $category) {
                $query->where('category', $category);
            })
            ->when(request('difficulty'), function ($query, $difficulty) {
                $query->where('difficulty_level', $difficulty);
            })
            ->when(request('sort'), function ($query, $sort) {
                switch ($sort) {
                    case 'rating':
                        $query->orderByDesc('reviews_avg_rating');
                        break;
                    case 'newest':
                        $query->orderByDesc('created_at');
                        break;
                    case 'oldest':
                        $query->orderBy('created_at');
                        break;
                    default:
                        $query->orderByDesc('created_at');
                }
            })
            ->paginate(9)
            ->withQueryString();

        return Inertia::render('Recipes/Index', [
            'recipes' => $recipes,
            'filters' => request()->only(['search', 'category', 'difficulty', 'sort']),
            'categories' => $this->getEnhancedCategories()
        ]);
    }

    public function show(Recipe $recipe)
    {
        // Only show approved recipes to public, unless user is the creator or admin
        if (
            !$recipe->isApproved() &&
            (!Auth::check() || (Auth::id() !== $recipe->created_by && !Auth::user()->isAdmin()))
        ) {
            abort(404);
        }

        $recipe->load(['reviews.user', 'products', 'reactions', 'creator']);
        $recipe->loadAvg('reviews', 'rating');

        // Get reaction counts and user's reaction if authenticated
        $reactionCounts = $recipe->reaction_counts;
        $userReaction = null;

        if (Auth::check()) {
            $userReactionModel = $recipe->getUserReaction(Auth::id());
            $userReaction = $userReactionModel ? $userReactionModel->reaction_type : null;
        }

        return Inertia::render('Recipes/Show', [
            'recipe' => array_merge($recipe->toArray(), [
                'reaction_counts' => $reactionCounts,
                'user_reaction' => $userReaction
            ]),
            'relatedRecipes' => Recipe::approved()
                ->where('id', '!=', $recipe->id)
                ->withAvg('reviews', 'rating')
                ->inRandomOrder()
                ->limit(3)
                ->get()
        ]);
    }
    public function addReview(Request $request, Recipe $recipe)
    {
        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|string|min:3|max:1000',
        ]);

        $review = new RecipeReview($validated);
        $review->user_id = Auth::id();
        $recipe->reviews()->save($review);

        return back();
    }

    public function deleteReview(Recipe $recipe, RecipeReview $review)
    {
        $this->authorize('delete', $review);
        $review->delete();

        return back();
    }

    // Admin CRUD Methods
    public function adminIndex()
    {
        // Add a timestamp to force fresh data
        $timestamp = time();

        $status = request('status', 'all');

        // Get recipes with a query
        $recipesQuery = Recipe::query()
            ->with(['products', 'creator', 'approver'])
            ->withCount('reviews')
            ->withAvg('reviews', 'rating')
            ->select('id', 'title', 'description', 'cooking_time', 'difficulty_level', 'image_url', 'created_at', 'updated_at', 'status', 'created_by', 'approved_by', 'approved_at', 'category')
            ->when(request('search'), function ($query, $search) {
                $query->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            })
            ->when($status !== 'all', function ($query) use ($status) {
                if ($status === 'pending') {
                    $query->whereIn('status', ['submitted', 'under_review']);
                } else {
                    $query->where('status', $status);
                }
            })
            ->when(request('sort'), function ($query, $sort) {
                $query->orderBy($sort, request('direction', 'asc'));
            });

        // Get the paginated results
        $recipes = $recipesQuery->paginate(10)->withQueryString();

        // Add timestamps to image URLs to prevent caching
        $recipes->getCollection()->transform(function ($recipe) use ($timestamp) {
            if ($recipe->image_url) {
                // Check if the image URL already has a query parameter
                if (strpos($recipe->image_url, '?') !== false) {
                    $recipe->image_url = $recipe->image_url . '&t=' . $timestamp;
                } else {
                    $recipe->image_url = $recipe->image_url . '?t=' . $timestamp;
                }
            }
            return $recipe;
        });

        return Inertia::render('Admin/Recipes/Index', [
            'recipes' => $recipes,
            'filters' => request()->only(['search', 'sort', 'direction', 'status']),
            'stats' => [
                'total' => Recipe::count(),
                'approved' => Recipe::where('status', 'approved')->count(),
                'pending' => Recipe::whereIn('status', ['submitted', 'under_review'])->count(),
                'rejected' => Recipe::where('status', 'rejected')->count(),
                'drafts' => Recipe::where('status', 'draft')->count(),
                'highRated' => Recipe::approved()->whereHas('reviews', function ($query) {
                    $query->select('recipe_id')
                        ->groupBy('recipe_id')
                        ->havingRaw('AVG(rating) >= ?', [4]);
                })->count(),
            ],
            'timestamp' => $timestamp, // Pass timestamp to the view for cache busting
        ]);
    }

    public function adminShow(Recipe $recipe)
    {
        $recipe->load(['creator', 'reviews.user', 'products']);
        $recipe->loadAvg('reviews', 'rating');

        return Inertia::render('Admin/Recipes/Show', [
            'recipe' => array_merge($recipe->toArray(), [
                'image_path' => $recipe->image_url,
                'reviews' => $recipe->reviews->map(function ($review) {
                    return [
                        'id' => $review->id,
                        'rating' => $review->rating,
                        'comment' => $review->comment,
                        'created_at' => $review->created_at,
                        'user' => $review->user ? [
                            'id' => $review->user->id,
                            'name' => $review->user->name,
                        ] : null,
                    ];
                }),
            ]),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Recipes/Create', [
            'products' => Product::all()
        ]);
    }

    public function store(Request $request)
    {
        Log::info('Recipe Create Request', [
            'has_file' => $request->hasFile('image'),
            'all_data' => $request->except(['image']),
            'files' => $request->hasFile('image') ? $request->file('image')->getClientOriginalName() : 'none'
        ]);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'ingredients' => 'required|array',
            'instructions' => 'required|array',
            'cooking_time' => 'required|integer|min:1',
            'difficulty_level' => 'required|string|in:easy,medium,hard',
            'image' => 'nullable|image|max:2048',
            'image_url' => 'nullable|string', // For existing images selected from browser
            'video' => 'nullable|mimetypes:video/mp4,video/quicktime,video/x-msvideo,video/x-flv,video/x-ms-wmv|max:20480',
            'youtube_url' => 'nullable|string|url',
            'product_ids' => 'nullable|array',
            'product_ids.*' => 'exists:products,id'
        ]);

        // Remove image and video from validated data as they're not columns in the database
        if (isset($validated['image'])) {
            unset($validated['image']);
        }

        if (isset($validated['video'])) {
            unset($validated['video']);
        }

        // Remove image_url from validated data and store it separately
        $existingImageUrl = null;
        if (isset($validated['image_url'])) {
            $existingImageUrl = $validated['image_url'];
            unset($validated['image_url']);
        }

        // Remove product_ids from validated data as it's not a column in the database
        $productIds = $validated['product_ids'] ?? [];
        unset($validated['product_ids']);

        $recipe = new Recipe($validated);

        // Set admin-created recipes as approved by default
        $recipe->created_by = Auth::id();
        $recipe->status = 'approved';
        $recipe->approved_by = Auth::id();
        $recipe->approved_at = now();

        // Handle image upload or reuse existing image
        if ($request->hasFile('image')) {
            try {
                $file = $request->file('image');
                Log::info('Image File', [
                    'original_name' => $file->getClientOriginalName(),
                    'mime_type' => $file->getMimeType(),
                    'size' => $file->getSize()
                ]);

                $recipe->image_url = $this->fileUploadService->uploadImage($file, 'recipes', $recipe->title);
                Log::info('Image URL', ['url' => $recipe->image_url, 'recipe_title' => $recipe->title]);
            } catch (\Exception $e) {
                Log::error('Image Upload Error', [
                    'message' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
                return back()->withErrors(['image' => 'Failed to upload image: ' . $e->getMessage()]);
            }
        } elseif ($existingImageUrl) {
            // Use the existing image URL
            $recipe->image_url = $existingImageUrl;
            Log::info('Using existing image', ['url' => $existingImageUrl]);
        }

        // Handle video upload
        if ($request->hasFile('video')) {
            try {
                $file = $request->file('video');
                Log::info('Video File', [
                    'original_name' => $file->getClientOriginalName(),
                    'mime_type' => $file->getMimeType(),
                    'size' => $file->getSize()
                ]);

                $recipe->video_url = $this->fileUploadService->uploadVideo($file, 'recipes/videos', $recipe->title);
                Log::info('Video URL', ['url' => $recipe->video_url, 'recipe_title' => $recipe->title]);
            } catch (\Exception $e) {
                Log::error('Video Upload Error', [
                    'message' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
                return back()->withErrors(['video' => 'Failed to upload video: ' . $e->getMessage()]);
            }
        }

        // Handle YouTube URL
        if ($request->filled('youtube_url')) {
            $recipe->video_url = $request->youtube_url;
            Log::info('YouTube URL', ['url' => $recipe->video_url]);
        }

        $recipe->save();

        // Attach products if any
        if (!empty($productIds)) {
            $recipe->products()->attach($productIds);
        }

        return redirect()->route('admin.recipes.index')->with('success', 'Recipe created successfully.');
    }

    public function edit(Recipe $recipe)
    {
        // Add a timestamp to force fresh data
        $timestamp = time();

        // Load the recipe with its products
        $recipe = $recipe->load('products');

        // Add timestamp to image URL to prevent caching
        if ($recipe->image_url) {
            // Check if the image URL already has a query parameter
            if (strpos($recipe->image_url, '?') !== false) {
                $recipe->image_url = $recipe->image_url . '&t=' . $timestamp;
            } else {
                $recipe->image_url = $recipe->image_url . '?t=' . $timestamp;
            }
        }

        return Inertia::render('Admin/Recipes/Edit', [
            'recipe' => $recipe,
            'products' => Product::all(),
            'timestamp' => $timestamp
        ]);
    }

    public function update(Request $request, Recipe $recipe)
    {
        // Log the request data for debugging
        Log::info('Recipe Update Request', [
            'has_file' => $request->hasFile('image'),
            'all_data' => $request->except(['image']), // Don't log the entire image data
            'files' => $request->hasFile('image') ? $request->file('image')->getClientOriginalName() : 'none'
        ]);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'ingredients' => 'required|array',
            'instructions' => 'required|array',
            'cooking_time' => 'required|integer|min:1',
            'difficulty_level' => 'required|string|in:easy,medium,hard',
            'image' => 'nullable|image|max:2048',
            'image_url' => 'nullable|string', // For existing images selected from browser
            'video' => 'nullable|mimetypes:video/mp4,video/quicktime,video/x-msvideo,video/x-flv,video/x-ms-wmv|max:20480',
            'youtube_url' => 'nullable|string|url',
            'product_ids' => 'nullable|array',
            'product_ids.*' => 'exists:products,id'
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
                // Instead, we just update the recipe's image_url

                // Upload the image and get the URL
                $imageUrl = $this->fileUploadService->uploadImage($file, 'recipes', $validated['title']);

                // Ensure the URL is properly formatted
                $validated['image_url'] = $imageUrl;

                Log::info('Image URL', [
                    'url' => $validated['image_url'],
                    'recipe_id' => $recipe->id,
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
                'recipe_id' => $recipe->id
            ]);
        }

        // Handle video upload
        if ($request->hasFile('video')) {
            try {
                $file = $request->file('video');
                Log::info('Video File', [
                    'original_name' => $file->getClientOriginalName(),
                    'mime_type' => $file->getMimeType(),
                    'size' => $file->getSize()
                ]);

                // Delete old video if exists and it's not a YouTube URL
                if ($recipe->video_url && !str_contains($recipe->video_url, 'youtube.com') && !str_contains($recipe->video_url, 'youtu.be')) {
                    $this->fileUploadService->deleteVideo($recipe->video_url);
                }

                // Upload the video and get the URL
                $videoUrl = $this->fileUploadService->uploadVideo($file, 'recipes/videos', $validated['title']);

                // Ensure the URL is properly formatted
                $validated['video_url'] = $videoUrl;

                Log::info('Video URL', [
                    'url' => $validated['video_url'],
                    'recipe_id' => $recipe->id,
                    'timestamp' => time()
                ]);
            } catch (\Exception $e) {
                Log::error('Video Upload Error', [
                    'message' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
                return back()->withErrors(['video' => 'Failed to upload video: ' . $e->getMessage()]);
            }
        }

        // Handle YouTube URL
        if ($request->filled('youtube_url')) {
            // If there was a previous uploaded video (not YouTube), delete it
            if ($recipe->video_url && !str_contains($recipe->video_url, 'youtube.com') && !str_contains($recipe->video_url, 'youtu.be')) {
                $this->fileUploadService->deleteVideo($recipe->video_url);
            }

            $validated['video_url'] = $request->youtube_url;
            Log::info('YouTube URL', [
                'url' => $validated['video_url'],
                'recipe_id' => $recipe->id,
                'timestamp' => time()
            ]);
        }

        // Remove image, video, and product_ids from validated data
        unset($validated['image']);
        unset($validated['video']);
        $productIds = $validated['product_ids'] ?? [];
        unset($validated['product_ids']);

        // Update the recipe
        $recipe->update($validated);

        // Sync products
        $recipe->products()->sync($productIds);

        return redirect()->route('admin.recipes.index')->with('success', 'Recipe updated successfully.');
    }

    public function destroy(Recipe $recipe)
    {
        // Note: We intentionally do not delete the image file to allow for image reusability
        // if the same recipe is created again in the future

        // Delete the video if it exists and it's not a YouTube URL
        // We still delete videos as they are typically larger files and less likely to be reused
        if ($recipe->video_url && !str_contains($recipe->video_url, 'youtube.com') && !str_contains($recipe->video_url, 'youtu.be')) {
            $this->fileUploadService->deleteVideo($recipe->video_url);
        }

        // Store recipe information before deletion
        $recipeOwnerId = $recipe->created_by;
        $recipeTitle = $recipe->title;

        // Delete the recipe
        $recipe->delete();

        // Send notification to recipe owner
        try {
            Notification::createRecipeDeleted(
                $recipeOwnerId,
                $recipeTitle,
                Auth::user()->name
            );
        } catch (\Exception $e) {
            Log::error('Failed to create deletion notification: ' . $e->getMessage());
        }

        return redirect()->route('admin.recipes.index')->with('success', 'Recipe deleted successfully. (Note: Recipe image has been preserved for future reuse)');
    }

    /**
     * Approve a recipe
     */
    public function approve(Recipe $recipe)
    {
        $this->authorize('approve', $recipe);

        $recipe->approve(Auth::user());

        // Send notification to recipe creator
        try {
            Notification::createRecipeApproved(
                $recipe->created_by,
                $recipe->id,
                $recipe->title
            );
        } catch (\Exception $e) {
            Log::error('Failed to create approval notification: ' . $e->getMessage());
        }

        return back()->with('success', 'Recipe approved successfully!');
    }

    /**
     * Reject a recipe
     */
    public function reject(Request $request, Recipe $recipe)
    {
        $this->authorize('reject', $recipe);

        $validated = $request->validate([
            'rejection_reason' => 'required|string|max:1000'
        ]);

        $recipe->reject(Auth::user(), $validated['rejection_reason']);

        // Send notification to recipe creator
        try {
            Notification::createRecipeRejected(
                $recipe->created_by,
                $recipe->id,
                $recipe->title,
                $validated['rejection_reason']
            );
        } catch (\Exception $e) {
            Log::error('Failed to create rejection notification: ' . $e->getMessage());
        }

        return back()->with('success', 'Recipe rejected successfully!');
    }

    /**
     * Set recipe status to under review
     */
    public function setUnderReview(Recipe $recipe)
    {
        $this->authorize('approve', $recipe);

        $recipe->update(['status' => 'under_review']);

        // Send notification to recipe creator
        try {
            Notification::createRecipeUnderReview(
                $recipe->created_by,
                $recipe->id,
                $recipe->title
            );
        } catch (\Exception $e) {
            Log::error('Failed to create under review notification: ' . $e->getMessage());
        }

        return back()->with('success', 'Recipe marked as under review!');
    }

    /**
     * Get enhanced categories including both recipe and product categories
     */
    private function getEnhancedCategories(): array
    {
        // Get recipe categories from database
        $recipeCategories = Recipe::approved()
            ->distinct()
            ->pluck('category')
            ->filter()
            ->mapWithKeys(function ($category) {
                return [$category => ucfirst($category)];
            })
            ->toArray();

        // Get product categories used in recipes
        $productCategories = Product::whereHas('recipes', function ($query) {
            $query->where('status', 'approved');
        })
            ->distinct()
            ->pluck('category')
            ->filter()
            ->mapWithKeys(function ($category) {
                $categoryEnum = \App\Enums\ProductCategory::tryFrom($category);
                return [$category => $categoryEnum ? $categoryEnum->getDisplayName() : ucfirst($category)];
            })
            ->toArray();

        // Merge categories with recipe categories taking precedence
        return array_merge($productCategories, $recipeCategories);
    }

    /**
     * Get available seafood categories (legacy method for backward compatibility)
     */
    private function getSeafoodCategories(): array
    {
        return [
            'fish' => 'Fish',
            'shellfish' => 'Shellfish',
            'crustaceans' => 'Crustaceans',
            'mollusks' => 'Mollusks',
            'cephalopods' => 'Cephalopods',
            'mixed_seafood' => 'Mixed Seafood',
            'other' => 'Other'
        ];
    }
}
