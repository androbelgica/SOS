<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Recipe extends Model
{
    use HasFactory;    protected $fillable = [
        'title',
        'description',
        'ingredients',
        'instructions',
        'cooking_time',
        'difficulty_level',
        'image_url',
        'video_url'
    ];

    protected $casts = [
        'cooking_time' => 'integer',
        'instructions' => 'array',
        'ingredients' => 'array'
    ];

    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class)
            ->withPivot('quantity', 'unit');
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(RecipeReview::class);
    }

    public function comments(): HasMany
    {
        return $this->hasMany(RecipeComment::class)
            ->where('is_hidden', false)
            ->whereNull('parent_id') // Only top-level comments
            ->orderBy('created_at', 'desc');
    }

    public function allComments(): HasMany
    {
        return $this->hasMany(RecipeComment::class)
            ->where('is_hidden', false)
            ->orderBy('created_at', 'desc');
    }

    public function reactions(): HasMany
    {
        return $this->hasMany(RecipeReaction::class);
    }

    public function getAverageRatingAttribute(): float
    {
        return $this->reviews()->avg('rating') ?? 0.0;
    }

    public function getReviewsCountAttribute(): int
    {
        return $this->reviews()->count();
    }

    public function getCommentsCountAttribute(): int
    {
        return $this->allComments()->count();
    }

    public function getReactionCountsAttribute(): array
    {
        return $this->reactions()
            ->selectRaw('reaction_type, COUNT(*) as count')
            ->groupBy('reaction_type')
            ->pluck('count', 'reaction_type')
            ->toArray();
    }

    public function getTotalReactionsAttribute(): int
    {
        return $this->reactions()->count();
    }

    public function getUserReaction($userId): ?RecipeReaction
    {
        return $this->reactions()->where('user_id', $userId)->first();
    }
}