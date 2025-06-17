<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
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
        'video_url',
        'created_by',
        'status',
        'category',
        'approved_by',
        'approved_at',
        'rejection_reason'
    ];

    protected $casts = [
        'cooking_time' => 'integer',
        'instructions' => 'array',
        'ingredients' => 'array',
        'approved_at' => 'datetime'
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

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
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

    // Recipe status management methods
    public function isDraft(): bool
    {
        return $this->status === 'draft';
    }

    public function isSubmitted(): bool
    {
        return $this->status === 'submitted';
    }

    public function isUnderReview(): bool
    {
        return $this->status === 'under_review';
    }

    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    public function isRejected(): bool
    {
        return $this->status === 'rejected';
    }

    public function canBeEditedBy(User $user): bool
    {
        // Recipe can be edited by creator if it's draft or rejected, or by admin
        return ($this->created_by === $user->id && in_array($this->status, ['draft', 'rejected']))
               || $user->role === 'admin';
    }

    public function canBeDeletedBy(User $user): bool
    {
        // Recipe can be deleted by creator if it's draft, or by admin
        return ($this->created_by === $user->id && $this->status === 'draft')
               || $user->role === 'admin';
    }

    public function submitForReview(): void
    {
        $this->update(['status' => 'submitted']);
    }

    public function approve(User $approver): void
    {
        $this->update([
            'status' => 'approved',
            'approved_by' => $approver->id,
            'approved_at' => now(),
            'rejection_reason' => null
        ]);
    }

    public function reject(User $approver, string $reason): void
    {
        $this->update([
            'status' => 'rejected',
            'approved_by' => $approver->id,
            'approved_at' => now(),
            'rejection_reason' => $reason
        ]);
    }

    // Scopes for filtering recipes
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopePendingApproval($query)
    {
        return $query->whereIn('status', ['submitted', 'under_review']);
    }

    public function scopeByUser($query, $userId)
    {
        return $query->where('created_by', $userId);
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }
}