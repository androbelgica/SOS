<?php

namespace App\Policies;

use App\Models\RecipeReview;
use App\Models\User;

class RecipeReviewPolicy
{
    public function update(User $user, RecipeReview $review): bool
    {
        return $user->id === $review->user_id;
    }

    public function delete(User $user, RecipeReview $review): bool
    {
        return $user->id === $review->user_id || $user->role === 'admin';
    }
}
