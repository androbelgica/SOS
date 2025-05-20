<?php

namespace App\Policies;

use App\Models\Product;
use App\Models\User;

class ProductPolicy
{
    public function viewAny(User $user): bool
    {
        return true; // Everyone can view products
    }

    public function view(User $user, Product $product): bool
    {
        return true; // Everyone can view individual products
    }

    public function create(User $user): bool
    {
        return $user->role === 'admin';
    }

    public function update(User $user, Product $product): bool
    {
        return $user->role === 'admin';
    }

    public function delete(User $user, Product $product): bool
    {
        return $user->role === 'admin';
    }

    public function restore(User $user, Product $product): bool
    {
        return $user->role === 'admin';
    }

    public function forceDelete(User $user, Product $product): bool
    {
        return $user->role === 'admin';
    }
}
