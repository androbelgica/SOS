<?php

namespace App\Http\Controllers;

use App\Models\Recipe;
use App\Models\RecipeReaction;
use App\Models\RecipeComment;
use App\Models\CommentReaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Events\RecipeReactionUpdated;

class RecipeReactionController extends Controller
{
    // Middleware is now handled at the route level in routes/api.php

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
            // Notify recipe author if not self
            if ($recipe->created_by !== $userId) {
                \App\Models\Notification::createRecipeReacted(
                    $recipe->created_by,
                    $recipe->id,
                    $recipe->title,
                    Auth::user()->name,
                    $reactionType
                );
            }
        }

        // Get updated reaction counts
        $reactionCounts = $recipe->fresh()->reaction_counts;
        $userReaction = $recipe->getUserReaction($userId);

        // Real-time event
        event(new RecipeReactionUpdated($recipe->id, $reactionCounts, $userReaction ? $userReaction->reaction_type : null));

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
            // Notify comment author if not self
            if ($comment->user_id !== $userId) {
                $recipe = $comment->recipe;
                \App\Models\Notification::createCommentReacted(
                    $comment->user_id,
                    $recipe->id,
                    $recipe->title,
                    Auth::user()->name,
                    $reactionType,
                    $comment->id
                );
            }
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
