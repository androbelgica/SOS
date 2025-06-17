<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Carbon\Carbon;

class RecipeComment extends Model
{
    use HasFactory;

    protected $fillable = [
        'recipe_id',
        'user_id',
        'parent_id',
        'comment',
        'is_edited',
        'edited_at',
        'is_hidden'
    ];

    protected $casts = [
        'is_edited' => 'boolean',
        'is_hidden' => 'boolean',
        'edited_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    protected $with = ['user', 'reactions'];

    /**
     * Get the recipe that owns the comment
     */
    public function recipe(): BelongsTo
    {
        return $this->belongsTo(Recipe::class);
    }

    /**
     * Get the user that owns the comment
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the parent comment (for threading)
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(RecipeComment::class, 'parent_id');
    }

    /**
     * Get the child comments (replies)
     */
    public function replies(): HasMany
    {
        return $this->hasMany(RecipeComment::class, 'parent_id')
            ->where('is_hidden', false)
            ->orderBy('created_at', 'asc');
    }

    /**
     * Get all reactions for this comment
     */
    public function reactions(): HasMany
    {
        return $this->hasMany(CommentReaction::class, 'comment_id');
    }

    /**
     * Get reaction counts grouped by type
     */
    public function getReactionCountsAttribute()
    {
        return $this->reactions()
            ->selectRaw('reaction_type, COUNT(*) as count')
            ->groupBy('reaction_type')
            ->pluck('count', 'reaction_type')
            ->toArray();
    }

    /**
     * Get total reaction count
     */
    public function getTotalReactionsAttribute()
    {
        return $this->reactions()->count();
    }

    /**
     * Check if user can edit this comment
     */
    public function canEdit(User $user): bool
    {
        // User can edit their own comment within 24 hours
        return $this->user_id === $user->id && 
               $this->created_at->diffInHours(now()) < 24;
    }

    /**
     * Check if user can delete this comment
     */
    public function canDelete(User $user): bool
    {
        // User can delete their own comment or admin can delete any
        return $this->user_id === $user->id || $user->role === 'admin';
    }

    /**
     * Get formatted time ago
     */
    public function getTimeAgoAttribute()
    {
        return $this->created_at->diffForHumans();
    }

    /**
     * Scope to get only visible comments
     */
    public function scopeVisible($query)
    {
        return $query->where('is_hidden', false);
    }

    /**
     * Scope to get only top-level comments (no parent)
     */
    public function scopeTopLevel($query)
    {
        return $query->whereNull('parent_id');
    }
}
