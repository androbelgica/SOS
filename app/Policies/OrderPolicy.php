<?php

namespace App\Policies;

use App\Models\Order;
use App\Models\User;

class OrderPolicy
{
    public function view(User $user, Order $order)
    {
        // Allow if user is assigned delivery staff
        if ($order->assigned_to === $user->id && $user->role === 'delivery') {
            return true;
        }
        // Allow if user is the customer
        if ($order->user_id === $user->id) {
            return true;
        }
        // Allow if user is admin
        if ($user->role === 'admin') {
            return true;
        }
        return false;
    }

    public function update(User $user, Order $order)
    {
        // Allow if user is assigned delivery staff
        if ($order->assigned_to === $user->id && $user->role === 'delivery') {
            return true;
        }
        // Allow if user is the customer
        if ($order->user_id === $user->id) {
            return true;
        }
        // Allow if user is admin
        if ($user->role === 'admin') {
            return true;
        }
        return false;
    }
}
