<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'price',
        'stock_quantity',
        'image_url',
        'category',
        'unit_type',
        'is_available'
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'is_available' => 'boolean',
        'unit_type' => 'string'
    ];

    // Accessor to ensure unit_type is always properly formatted
    public function getUnitTypeAttribute($value)
    {
        // If unit_type is null or empty, default to 'piece'
        if (empty($value)) {
            return 'piece';
        }

        // Normalize 'weight' to 'kg'
        if ($value === 'weight') {
            return 'kg';
        }

        return $value;
    }

    public function recipes(): BelongsToMany
    {
        return $this->belongsToMany(Recipe::class);
    }

    public function orders(): BelongsToMany
    {
        return $this->belongsToMany(Order::class, 'order_items')
            ->withPivot('quantity', 'price');
    }
}