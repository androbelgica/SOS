<?php

namespace App\Http\Controllers;

use App\Models\Recipe;
use App\Models\RecipeReaction;
use App\Models\RecipeComment;
use App\Models\CommentReaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RecipeReactionController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    /**
     * Toggle reaction on a recipe
     */
    public function toggleRecipeReaction(Request $request, Recipe $recipe)
    {
        $validated = $request->validate([
            'reaction_type' => 'required|string|in:like,love,yum,fire,clap'
        ]);

        $userId = Auth::id();
        $reactionType = $validated['reaction_type'];

        // Check if user already has a reaction on this recipe
        $existingReaction = $recipe->reactions()
            ->where('user_id', $userId)
            ->first();

        if ($existingReaction) {
            if ($existingReaction->reaction_type === $reactionType) {
                // Same reaction - remove it
                $existingReaction->delete();
                $action = 'removed';
            } else {
                // Different reaction - update it
                $existingReaction->update(['reaction_type' => $reactionType]);
                $action = 'updated';
            }
        } else {
            // No existing reaction - create new one
            $recipe->reactions()->create([
                'user_id' => $userId,
                'reaction_type' => $reactionType
            ]);
            $action = 'added';
        }

        // Get updated reaction counts
        $reactionCounts = $recipe->fresh()->reaction_counts;
        $userReaction = $recipe->getUserReaction($userId);

        return response()->json([
            'action' => $action,
            'reaction_counts' => $reactionCounts,
            'user_reaction' => $userReaction ? $userReaction->reaction_type : null,
            'total_reactions' => array_sum($reactionCounts),
            'message' => ucfirst($action) . ' reaction successfully!'
        ]);
    }

    /**
     * Toggle reaction on a comment
     */
    public function toggleCommentReaction(Request $request, RecipeComment $comment)
    {
        $validated = $request->validate([
            'reaction_type' => 'required|string|in:like,love,yum,fire,clap'
        ]);

        $userId = Auth::id();
        $reactionType = $validated['reaction_type'];

        // Check if user already has a reaction on this comment
        $existingReaction = $comment->reactions()
            ->where('user_id', $userId)
            ->first();

        if ($existingReaction) {
            if ($existingReaction->reaction_type === $reactionType) {
                // Same reaction - remove it
                $existingReaction->delete();
                $action = 'removed';
            } else {
                // Different reaction - update it
                $existingReaction->update(['reaction_type' => $reactionType]);
                $action = 'updated';
            }
        } else {
            // No existing reaction - create new one
            $comment->reactions()->create([
                'user_id' => $userId,
                'reaction_type' => $reactionType
            ]);
            $action = 'added';
        }

        // Get updated reaction counts
        $reactionCounts = $comment->fresh()->reaction_counts;
        $userReaction = $comment->reactions()->where('user_id', $userId)->first();

        return response()->json([
            'action' => $action,
            'reaction_counts' => $reactionCounts,
            'user_reaction' => $userReaction ? $userReaction->reaction_type : null,
            'total_reactions' => array_sum($reactionCounts),
            'message' => ucfirst($action) . ' reaction successfully!'
        ]);
    }

    /**
     * Get reaction details for a recipe
     */
    public function getRecipeReactions(Recipe $recipe)
    {
        $reactionCounts = $recipe->reaction_counts;
        $userReaction = Auth::check() ? $recipe->getUserReaction(Auth::id()) : null;

        return response()->json([
            'reaction_counts' => $reactionCounts,
            'user_reaction' => $userReaction ? $userReaction->reaction_type : null,
            'total_reactions' => array_sum($reactionCounts)
        ]);
    }
}
