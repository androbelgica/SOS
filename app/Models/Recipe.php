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

    public function getAverageRatingAttribute(): float
    {
        return $this->reviews()->avg('rating') ?? 0.0;
    }

    public function getReviewsCountAttribute(): int
    {
        return $this->reviews()->count();
    }
}