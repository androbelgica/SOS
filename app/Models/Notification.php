<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
    protected $fillable = [
        'user_id',
        'type',
        'title',
        'message',
        'data',
        'read_at'
    ];

    protected $casts = [
        'data' => 'array',
        'read_at' => 'datetime'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function markAsRead(): void
    {
        if (!$this->read_at) {
            $this->update(['read_at' => now()]);
        }
    }

    public function isRead(): bool
    {
        return !is_null($this->read_at);
    }

    public function isUnread(): bool
    {
        return is_null($this->read_at);
    }

    // Scopes
    public function scopeUnread($query)
    {
        return $query->whereNull('read_at');
    }

    public function scopeRead($query)
    {
        return $query->whereNotNull('read_at');
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeOfType($query, $type)
    {
        return $query->where('type', $type);
    }

    // Static methods for creating notifications
    public static function createRecipeApproved($userId, $recipeId, $recipeTitle)
    {
        return self::create([
            'user_id' => $userId,
            'type' => 'recipe_approved',
            'title' => 'Recipe Approved!',
            'message' => "Your recipe '{$recipeTitle}' has been approved and is now live.",
            'data' => ['recipe_id' => $recipeId, 'recipe_title' => $recipeTitle]
        ]);
    }

    public static function createRecipeRejected($userId, $recipeId, $recipeTitle, $reason)
    {
        return self::create([
            'user_id' => $userId,
            'type' => 'recipe_rejected',
            'title' => 'Recipe Needs Revision',
            'message' => "Your recipe '{$recipeTitle}' needs some changes. Reason: {$reason}",
            'data' => ['recipe_id' => $recipeId, 'recipe_title' => $recipeTitle, 'reason' => $reason]
        ]);
    }

    public static function createRecipeSubmitted($adminUserId, $recipeId, $recipeTitle, $submitterName)
    {
        return self::create([
            'user_id' => $adminUserId,
            'type' => 'recipe_submitted',
            'title' => 'New Recipe Submitted',
            'message' => "{$submitterName} submitted a new recipe '{$recipeTitle}' for review.",
            'data' => ['recipe_id' => $recipeId, 'recipe_title' => $recipeTitle, 'submitter_name' => $submitterName]
        ]);
    }

    public static function createRecipeUnderReview($userId, $recipeId, $recipeTitle)
    {
        return self::create([
            'user_id' => $userId,
            'type' => 'recipe_under_review',
            'title' => 'Recipe Under Review',
            'message' => "Your recipe '{$recipeTitle}' is now being reviewed by our team.",
            'data' => ['recipe_id' => $recipeId, 'recipe_title' => $recipeTitle]
        ]);
    }

    public static function createRecipeCommented($recipeAuthorId, $recipeId, $recipeTitle, $commenterName, $commentId)
    {
        return self::create([
            'user_id' => $recipeAuthorId,
            'type' => 'recipe_commented',
            'title' => 'New Comment on Your Recipe',
            'message' => "{$commenterName} commented on your recipe '{$recipeTitle}'.",
            'data' => [
                'recipe_id' => $recipeId,
                'recipe_title' => $recipeTitle,
                'commenter_name' => $commenterName,
                'comment_id' => $commentId
            ]
        ]);
    }

    public static function createCommentReplied($commentAuthorId, $recipeId, $recipeTitle, $replierName, $commentId)
    {
        return self::create([
            'user_id' => $commentAuthorId,
            'type' => 'comment_replied',
            'title' => 'New Reply to Your Comment',
            'message' => "{$replierName} replied to your comment on recipe '{$recipeTitle}'.",
            'data' => [
                'recipe_id' => $recipeId,
                'recipe_title' => $recipeTitle,
                'replier_name' => $replierName,
                'comment_id' => $commentId
            ]
        ]);
    }

    public static function createRecipeReacted($recipeAuthorId, $recipeId, $recipeTitle, $reactorName, $reactionType)
    {
        return self::create([
            'user_id' => $recipeAuthorId,
            'type' => 'recipe_reacted',
            'title' => 'New Reaction on Your Recipe',
            'message' => "{$reactorName} reacted to your recipe '{$recipeTitle}' with {$reactionType}.",
            'data' => [
                'recipe_id' => $recipeId,
                'recipe_title' => $recipeTitle,
                'reactor_name' => $reactorName,
                'reaction_type' => $reactionType
            ]
        ]);
    }

    public static function createCommentReacted($commentAuthorId, $recipeId, $recipeTitle, $reactorName, $reactionType, $commentId)
    {
        return self::create([
            'user_id' => $commentAuthorId,
            'type' => 'comment_reacted',
            'title' => 'New Reaction on Your Comment',
            'message' => "{$reactorName} reacted to your comment on recipe '{$recipeTitle}' with {$reactionType}.",
            'data' => [
                'recipe_id' => $recipeId,
                'recipe_title' => $recipeTitle,
                'reactor_name' => $reactorName,
                'reaction_type' => $reactionType,
                'comment_id' => $commentId
            ]
        ]);
    }

    public static function createRecipeDeleted($userId, $recipeTitle, $adminName)
    {
        return self::create([
            'user_id' => $userId,
            'type' => 'recipe_deleted',
            'title' => 'Recipe Deleted',
            'message' => "Your recipe '{$recipeTitle}' has been deleted by administrator {$adminName}.",
            'data' => [
                'recipe_title' => $recipeTitle,
                'admin_name' => $adminName
            ]
        ]);
    }
}
