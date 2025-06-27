<?php

namespace App\Models;

use App\Enums\ProductCategory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'nutritional_facts',
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
        'unit_type' => 'string',
        'featured' => 'boolean',
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

    // Category Scopes
    public function scopeSeafood($query)
    {
        return $query->whereIn('category', [ProductCategory::Seafood->value, ProductCategory::Fish->value, ProductCategory::Shellfish->value]);
    }

    public function scopeMeat($query)
    {
        return $query->where('category', ProductCategory::Meat->value);
    }

    public function scopeVegetable($query)
    {
        return $query->where('category', ProductCategory::Vegetable->value);
    }

    public function scopeFruit($query)
    {
        return $query->where('category', ProductCategory::Fruit->value);
    }

    public function scopeByCategory($query, string $category)
    {
        return $query->where('category', $category);
    }

    // Helper methods
    public function getCategoryEnum(): ?ProductCategory
    {
        return ProductCategory::tryFrom($this->category);
    }

    public function getCategoryDisplayName(): string
    {
        $categoryEnum = $this->getCategoryEnum();
        return $categoryEnum ? $categoryEnum->getDisplayName() : ucfirst($this->category);
    }

    public function getCategoryIcon(): string
    {
        $categoryEnum = $this->getCategoryEnum();
        return $categoryEnum ? $categoryEnum->getIcon() : '📦';
    }

    public function getCategoryColor(): string
    {
        $categoryEnum = $this->getCategoryEnum();
        return $categoryEnum ? $categoryEnum->getColor() : 'gray';
    }

    public function orders(): BelongsToMany
    {
        return $this->belongsToMany(Order::class, 'order_items')
            ->withPivot('quantity', 'price');
    }
}
