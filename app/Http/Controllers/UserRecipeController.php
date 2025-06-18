<?php

namespace App\Http\Controllers;

use App\Models\Recipe;
use App\Models\Product;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Inertia\Inertia;

class UserRecipeController extends Controller
{
    use AuthorizesRequests;

    /**
     * Display user's recipes dashboard
     */
    public function index()
    {
        $user = Auth::user();
        
        $recipes = $user->recipes()
            ->with(['products', 'reviews'])
            ->withCount(['comments', 'reactions'])
            ->orderBy('created_at', 'desc')
            ->paginate(12);

        $stats = [
            'total' => $user->recipes()->count(),
            'approved' => $user->recipes()->where('status', 'approved')->count(),
            'pending' => $user->recipes()->whereIn('status', ['submitted', 'under_review'])->count(),
            'drafts' => $user->recipes()->where('status', 'draft')->count(),
            'rejected' => $user->recipes()->where('status', 'rejected')->count(),
        ];

        return Inertia::render('User/Recipes/Index', [
            'recipes' => $recipes,
            'stats' => $stats
        ]);
    }

    /**
     * Show the form for creating a new recipe
     */
    public function create()
    {
        $this->authorize('create', Recipe::class);
        
        return Inertia::render('User/Recipes/Create', [
            'products' => Product::where('is_available', true)->get(),
            'categories' => $this->getSeafoodCategories()
        ]);
    }

    /**
     * Store a newly created recipe
     */
    public function store(Request $request)
    {
        $this->authorize('create', Recipe::class);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'ingredients' => 'required|array|min:1',
            'instructions' => 'required|array|min:1',
            'cooking_time' => 'required|integer|min:1',
            'difficulty_level' => 'required|string|in:easy,medium,hard',
            'category' => 'required|string',
            'image' => 'nullable|image|max:2048',
            'video' => 'nullable|mimetypes:video/mp4,video/quicktime,video/x-msvideo,video/x-flv,video/x-ms-wmv|max:20480',
            'youtube_url' => 'nullable|string|url',
            'product_ids' => 'nullable|array',
            'product_ids.*' => 'exists:products,id',
            'action' => 'required|string|in:save_draft,submit_for_review'
        ]);

        // Handle image upload
        $imageUrl = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('recipes', 'public');
            $imageUrl = Storage::url($imagePath);
        }

        // Handle video upload
        $videoUrl = null;
        if ($request->hasFile('video')) {
            $videoPath = $request->file('video')->store('recipe-videos', 'public');
            $videoUrl = Storage::url($videoPath);
        } elseif ($request->filled('youtube_url')) {
            $videoUrl = $request->youtube_url;
        }

        // Determine status based on action
        $status = $validated['action'] === 'submit_for_review' ? 'submitted' : 'draft';

        $recipe = Recipe::create([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'ingredients' => array_filter($validated['ingredients']),
            'instructions' => array_filter($validated['instructions']),
            'cooking_time' => $validated['cooking_time'],
            'difficulty_level' => $validated['difficulty_level'],
            'category' => $validated['category'],
            'image_url' => $imageUrl,
            'video_url' => $videoUrl,
            'created_by' => Auth::id(),
            'status' => $status
        ]);

        // Attach products if any
        if (!empty($validated['product_ids'])) {
            $recipe->products()->attach($validated['product_ids']);
        }

        // Send notification to admins if recipe is submitted for review
        if ($status === 'submitted') {
            try {
                $admins = User::where('role', 'admin')->get();
                foreach ($admins as $admin) {
                    Notification::createRecipeSubmitted(
                        $admin->id,
                        $recipe->id,
                        $recipe->title,
                        Auth::user()->name
                    );
                }
            } catch (\Exception $e) {
                // Log the error but don't fail the recipe submission
                \Log::error('Failed to create notification: ' . $e->getMessage());
            }
        }

        $message = $status === 'submitted'
            ? 'Recipe submitted for admin review successfully!'
            : 'Recipe saved as draft successfully!';

        return redirect()->route('user.recipes.index')->with('success', $message);
    }

    /**
     * Display the specified recipe
     */
    public function show(Recipe $recipe)
    {
        $this->authorize('view', $recipe);
        
        // Users can only view their own recipes unless it's approved
        if ($recipe->created_by !== Auth::id() && !$recipe->isApproved()) {
            abort(403);
        }

        $recipe->load(['products', 'creator', 'approver', 'reviews.user', 'comments.user']);

        return Inertia::render('User/Recipes/Show', [
            'recipe' => $recipe
        ]);
    }

    /**
     * Show the form for editing the specified recipe
     */
    public function edit(Recipe $recipe)
    {
        $this->authorize('update', $recipe);

        $recipe->load('products');

        return Inertia::render('User/Recipes/Edit', [
            'recipe' => $recipe,
            'products' => Product::where('is_available', true)->get(),
            'categories' => $this->getSeafoodCategories()
        ]);
    }

    /**
     * Update the specified recipe
     */
    public function update(Request $request, Recipe $recipe)
    {
        $this->authorize('update', $recipe);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'ingredients' => 'required|array|min:1',
            'instructions' => 'required|array|min:1',
            'cooking_time' => 'required|integer|min:1',
            'difficulty_level' => 'required|string|in:easy,medium,hard',
            'category' => 'required|string',
            'image' => 'nullable|image|max:2048',
            'video' => 'nullable|mimetypes:video/mp4,video/quicktime,video/x-msvideo,video/x-flv,video/x-ms-wmv|max:20480',
            'youtube_url' => 'nullable|string|url',
            'product_ids' => 'nullable|array',
            'product_ids.*' => 'exists:products,id',
            'action' => 'required|string|in:save_draft,submit_for_review'
        ]);

        // Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($recipe->image_url) {
                $oldImagePath = str_replace('/storage/', '', $recipe->image_url);
                Storage::disk('public')->delete($oldImagePath);
            }
            
            $imagePath = $request->file('image')->store('recipes', 'public');
            $validated['image_url'] = Storage::url($imagePath);
        }

        // Handle video upload
        if ($request->hasFile('video')) {
            // Delete old video if exists
            if ($recipe->video_url && !filter_var($recipe->video_url, FILTER_VALIDATE_URL)) {
                $oldVideoPath = str_replace('/storage/', '', $recipe->video_url);
                Storage::disk('public')->delete($oldVideoPath);
            }
            
            $videoPath = $request->file('video')->store('recipe-videos', 'public');
            $validated['video_url'] = Storage::url($videoPath);
        } elseif ($request->filled('youtube_url')) {
            $validated['video_url'] = $request->youtube_url;
        }

        // Determine status based on action
        $status = $validated['action'] === 'submit_for_review' ? 'submitted' : 'draft';
        
        // Reset approval fields if resubmitting
        if ($status === 'submitted') {
            $validated['approved_by'] = null;
            $validated['approved_at'] = null;
            $validated['rejection_reason'] = null;
        }

        $recipe->update([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'ingredients' => array_filter($validated['ingredients']),
            'instructions' => array_filter($validated['instructions']),
            'cooking_time' => $validated['cooking_time'],
            'difficulty_level' => $validated['difficulty_level'],
            'category' => $validated['category'],
            'image_url' => $validated['image_url'] ?? $recipe->image_url,
            'video_url' => $validated['video_url'] ?? $recipe->video_url,
            'status' => $status,
            'approved_by' => $validated['approved_by'] ?? $recipe->approved_by,
            'approved_at' => $validated['approved_at'] ?? $recipe->approved_at,
            'rejection_reason' => $validated['rejection_reason'] ?? $recipe->rejection_reason,
        ]);

        // Sync products
        if (isset($validated['product_ids'])) {
            $recipe->products()->sync($validated['product_ids']);
        }

        // Send notification to admins if recipe is submitted for review
        if ($status === 'submitted' && $recipe->wasChanged('status')) {
            try {
                $admins = User::where('role', 'admin')->get();
                foreach ($admins as $admin) {
                    Notification::createRecipeSubmitted(
                        $admin->id,
                        $recipe->id,
                        $recipe->title,
                        Auth::user()->name
                    );
                }
            } catch (\Exception $e) {
                // Log the error but don't fail the recipe submission
                \Log::error('Failed to create notification: ' . $e->getMessage());
            }
        }

        $message = $status === 'submitted'
            ? 'Recipe submitted for admin review successfully!'
            : 'Recipe updated successfully!';

        return redirect()->route('user.recipes.index')->with('success', $message);
    }

    /**
     * Remove the specified recipe
     */
    public function destroy(Recipe $recipe)
    {
        $this->authorize('delete', $recipe);

        // Delete associated files
        if ($recipe->image_url) {
            $imagePath = str_replace('/storage/', '', $recipe->image_url);
            Storage::disk('public')->delete($imagePath);
        }

        if ($recipe->video_url && !filter_var($recipe->video_url, FILTER_VALIDATE_URL)) {
            $videoPath = str_replace('/storage/', '', $recipe->video_url);
            Storage::disk('public')->delete($videoPath);
        }

        $recipe->delete();

        return redirect()->route('user.recipes.index')->with('success', 'Recipe deleted successfully!');
    }

    /**
     * Submit recipe for review
     */
    public function submitForReview(Recipe $recipe)
    {
        $this->authorize('update', $recipe);
        
        if (!in_array($recipe->status, ['draft', 'rejected'])) {
            return back()->with('error', 'Recipe cannot be submitted for review.');
        }

        $recipe->submitForReview();

        // Send notification to admins
        try {
            $admins = User::where('role', 'admin')->get();
            foreach ($admins as $admin) {
                Notification::createRecipeSubmitted(
                    $admin->id,
                    $recipe->id,
                    $recipe->title,
                    Auth::user()->name
                );
            }
        } catch (\Exception $e) {
            // Log the error but don't fail the recipe submission
            \Log::error('Failed to create notification: ' . $e->getMessage());
        }

        return back()->with('success', 'Recipe submitted for admin review!');
    }

    /**
     * Get available seafood categories
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
