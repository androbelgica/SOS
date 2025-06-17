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
}
