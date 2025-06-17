<?php

namespace App\Policies;

use App\Models\Recipe;
use App\Models\User;

class RecipePolicy
{
    public function viewAny(User $user): bool
    {
        return true; // Everyone can view recipes
    }

    public function view(User $user, Recipe $recipe): bool
    {
        return true; // Everyone can view individual recipes
    }

    public function create(User $user): bool
    {
        return true; // All authenticated users can create recipes
    }

    public function update(User $user, Recipe $recipe): bool
    {
        return $recipe->canBeEditedBy($user);
    }

    public function delete(User $user, Recipe $recipe): bool
    {
        return $recipe->canBeDeletedBy($user);
    }

    public function approve(User $user, Recipe $recipe): bool
    {
        return $user->role === 'admin';
    }

    public function reject(User $user, Recipe $recipe): bool
    {
        return $user->role === 'admin';
    }

    public function restore(User $user, Recipe $recipe): bool
    {
        return $user->role === 'admin';
    }

    public function forceDelete(User $user, Recipe $recipe): bool
    {
        return $user->role === 'admin';
    }
}
