<?php

namespace App\Http\Controllers;

use App\Models\Recipe;
use App\Models\RecipeComment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class RecipeCommentController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    /**
     * Get comments for a recipe
     */
    public function index(Recipe $recipe)
    {
        $comments = $recipe->comments()
            ->with(['user', 'replies.user', 'reactions'])
            ->paginate(10);

        return response()->json([
            'comments' => $comments,
            'total_count' => $recipe->comments_count
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

        return response()->json([
            'replies' => $replies
        ]);
    }
}
