<?php

namespace App\Enums;

enum ProductCategory: string
{
    case Seafood = 'seafood';
    case Fish = 'fish';
    case Shellfish = 'shellfish';
    case Meat = 'meat';
    case Vegetable = 'vegetable';
    case Fruit = 'fruit';
    case Other = 'other';

    /**
     * Get all category values as an array
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    /**
     * Get all category names as an array
     */
    public static function names(): array
    {
        return array_column(self::cases(), 'name');
    }

    /**
     * Get category display name
     */
    public function getDisplayName(): string
    {
        return match($this) {
            self::Seafood => 'Seafood',
            self::Fish => 'Fish',
            self::Shellfish => 'Shellfish',
            self::Meat => 'Meat',
            self::Vegetable => 'Vegetables',
            self::Fruit => 'Fruits',
            self::Other => 'Other',
        };
    }

    /**
     * Get category icon (for future UI use)
     */
    public function getIcon(): string
    {
        return match($this) {
            self::Seafood => '🐟',
            self::Fish => '🐠',
            self::Shellfish => '🦐',
            self::Meat => '🥩',
            self::Vegetable => '🥬',
            self::Fruit => '🍎',
            self::Other => '📦',
        };
    }

    /**
     * Get category color (for future UI use)
     */
    public function getColor(): string
    {
        return match($this) {
            self::Seafood => 'blue',
            self::Fish => 'cyan',
            self::Shellfish => 'orange',
            self::Meat => 'red',
            self::Vegetable => 'green',
            self::Fruit => 'yellow',
            self::Other => 'gray',
        };
    }
}
