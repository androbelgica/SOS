<?php

namespace App\Http\Controllers;

use App\Models\Recipe;
use App\Models\RecipeComment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class RecipeCommentController extends Controller
{
    // Middleware is now handled at the route level in routes/api.php

    /**
     * Get comments for a recipe
     */
    public function index(Recipe $recipe)
    {
        try {
            $comments = $recipe->comments()
                ->where('is_hidden', false)
                ->whereNull('parent_id')
                ->with(['user', 'replies' => function($query) {
                    $query->where('is_hidden', false)->with('user');
                }, 'reactions'])
                ->orderBy('created_at', 'desc')
                ->paginate(10);

            // Add user reaction information if user is authenticated
            if (Auth::check()) {
                $userId = Auth::id();
                $comments->getCollection()->transform(function ($comment) use ($userId) {
                    $comment->user_reaction = $comment->reactions()
                        ->where('user_id', $userId)
                        ->first()?->reaction_type;

                    // Also add user reactions for replies
                    if ($comment->replies) {
                        $comment->replies->transform(function ($reply) use ($userId) {
                            $reply->user_reaction = $reply->reactions()
                                ->where('user_id', $userId)
                                ->first()?->reaction_type;
                            return $reply;
                        });
                    }

                    return $comment;
                });
            }

        } catch (\Exception $e) {
            \Log::error('Error loading comments for recipe ' . $recipe->id . ': ' . $e->getMessage());
            return response()->json(['error' => 'Failed to load comments: ' . $e->getMessage()], 500);
        }

        return response()->json([
            'comments' => [
                'data' => $comments->items(),
                'current_page' => $comments->currentPage(),
                'last_page' => $comments->lastPage(),
                'per_page' => $comments->perPage(),
                'total' => $comments->total()
            ],
            'total_count' => $comments->total()
        ]);
    }

    /**
     * Store a new comment
     */
    public function store(Request $request, Recipe $recipe)
    {
        $validated = $request->validate([
            'comment' => 'required|string|max:500',
            'parent_id' => 'nullable|exists:recipe_comments,id'
        ]);

        // Check if parent comment belongs to the same recipe
        if ($validated['parent_id']) {
            $parentComment = RecipeComment::find($validated['parent_id']);
            if ($parentComment->recipe_id !== $recipe->id) {
                throw ValidationException::withMessages([
                    'parent_id' => 'Invalid parent comment.'
                ]);
            }
        }

        $comment = $recipe->comments()->create([
            'user_id' => Auth::id(),
            'comment' => $validated['comment'],
            'parent_id' => $validated['parent_id'] ?? null
        ]);

        $comment->load(['user', 'reactions']);

        // Notify recipe author if someone comments (not self)
        if ($recipe->created_by !== Auth::id()) {
            \App\Models\Notification::createRecipeCommented(
                $recipe->created_by,
                $recipe->id,
                $recipe->title,
                Auth::user()->name,
                $comment->id
            );
        }
        // Notify parent comment author if this is a reply (not self or recipe author)
        if (!empty($validated['parent_id'])) {
            $parentComment = \App\Models\RecipeComment::find($validated['parent_id']);
            if ($parentComment && $parentComment->user_id !== Auth::id() && $parentComment->user_id !== $recipe->created_by) {
                \App\Models\Notification::createCommentReplied(
                    $parentComment->user_id,
                    $recipe->id,
                    $recipe->title,
                    Auth::user()->name,
                    $comment->id
                );
            }
        }

        return response()->json([
            'comment' => $comment,
            'message' => 'Comment added successfully!'
        ], 201);
    }

    /**
     * Update a comment
     */
    public function update(Request $request, RecipeComment $comment)
    {
        if (!$comment->canEdit(Auth::user())) {
            return response()->json([
                'message' => 'You can only edit your own comments within 24 hours.'
            ], 403);
        }

        $validated = $request->validate([
            'comment' => 'required|string|max:500'
        ]);

        $comment->update([
            'comment' => $validated['comment'],
            'is_edited' => true,
            'edited_at' => now()
        ]);

        $comment->load(['user', 'reactions']);

        return response()->json([
            'comment' => $comment,
            'message' => 'Comment updated successfully!'
        ]);
    }

    /**
     * Delete a comment
     */
    public function destroy(RecipeComment $comment)
    {
        if (!$comment->canDelete(Auth::user())) {
            return response()->json([
                'message' => 'You can only delete your own comments.'
            ], 403);
        }

        // Soft delete by hiding the comment
        $comment->update(['is_hidden' => true]);

        return response()->json([
            'message' => 'Comment deleted successfully!'
        ]);
    }

    /**
     * Get replies for a comment
     */
    public function replies(RecipeComment $comment)
    {
        $replies = $comment->replies()
            ->with(['user', 'reactions'])
            ->paginate(5);

        // Add user reaction information if user is authenticated
        if (Auth::check()) {
            $userId = Auth::id();
            $replies->getCollection()->transform(function ($reply) use ($userId) {
                $reply->user_reaction = $reply->reactions()
                    ->where('user_id', $userId)
                    ->first()?->reaction_type;
                return $reply;
            });
        }

        return response()->json([
            'replies' => $replies
        ]);
    }
}
