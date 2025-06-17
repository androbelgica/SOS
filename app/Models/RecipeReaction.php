<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RecipeReaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'recipe_id',
        'user_id',
        'reaction_type'
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    /**
     * Available reaction types with their emoji representations
     */
    public const REACTION_TYPES = [
        'like' => '👍',
        'love' => '❤️',
        'yum' => '😋',
        'fire' => '🔥',
        'clap' => '👏'
    ];

    /**
     * Get the recipe that owns the reaction
     */
    public function recipe(): BelongsTo
    {
        return $this->belongsTo(Recipe::class);
    }

    /**
     * Get the user that owns the reaction
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the emoji for this reaction type
     */
    public function getEmojiAttribute(): string
    {
        return self::REACTION_TYPES[$this->reaction_type] ?? '👍';
    }

    /**
     * Get the label for this reaction type
     */
    public function getLabelAttribute(): string
    {
        return ucfirst($this->reaction_type);
    }

    /**
     * Scope to filter by reaction type
     */
    public function scopeOfType($query, string $type)
    {
        return $query->where('reaction_type', $type);
    }
}
