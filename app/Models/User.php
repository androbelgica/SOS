<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'google_id',
        'avatar',
        'address',
        'phone',
        'city',
        'state',
        'postal_code',
        'country',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function isAdmin()
    {
        return $this->role === 'admin';
    }

    /**
     * Scope for admin users
     */
    public function scopeAdmins($query)
    {
        return $query->where('role', 'admin');
    }

    /**
     * Get the user's notification preferences
     */
    public function notificationPreferences(): array
    {
        return $this->notification_preferences ?? [
            'order_status' => true,
            'payment_status' => true,
            'shipping_updates' => true,
            'email_notifications' => true,
            'push_notifications' => true,
            'order_reminders' => true,
        ];
    }

    // Recipe relationships
    public function recipes(): HasMany
    {
        return $this->hasMany(Recipe::class, 'created_by');
    }

    public function approvedRecipes(): HasMany
    {
        return $this->hasMany(Recipe::class, 'approved_by');
    }

    public function recipeComments(): HasMany
    {
        return $this->hasMany(RecipeComment::class);
    }

    public function recipeReactions(): HasMany
    {
        return $this->hasMany(RecipeReaction::class);
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }

    public function unreadNotifications(): HasMany
    {
        return $this->hasMany(Notification::class)->whereNull('read_at');
    }

    public function getUnreadNotificationsCountAttribute(): int
    {
        return $this->unreadNotifications()->count();
    }
}
