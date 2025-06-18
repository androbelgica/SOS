<?php

namespace Database\Factories;

use App\Models\Product;
use App\Enums\ProductCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        $category = $this->faker->randomElement(ProductCategory::values());

        return [
            'name' => $this->generateProductName($category),
            'description' => $this->generateProductDescription($category),
            'price' => $this->faker->randomFloat(2, 10, 100),
            'stock_quantity' => $this->faker->numberBetween(0, 100),
            'is_available' => $this->faker->boolean(80),
            'image_url' => null, // Will use fallback images in frontend
            'category' => $category,
            'unit_type' => $this->getUnitTypeForCategory($category),
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }

    /**
     * Generate realistic product names based on category
     */
    private function generateProductName(string $category): string
    {
        $names = match($category) {
            'seafood', 'fish' => [
                'Fresh Salmon Fillet', 'Tuna Steak', 'Sea Bass', 'Cod Fillet', 'Mackerel',
                'Red Snapper', 'Halibut', 'Sardines', 'Anchovies', 'Trout'
            ],
            'shellfish' => [
                'Fresh Shrimp', 'Lobster Tail', 'Crab Legs', 'Scallops', 'Mussels',
                'Oysters', 'Clams', 'Prawns', 'Crawfish', 'Abalone'
            ],
            'meat' => [
                'Beef Ribeye Steak', 'Chicken Breast', 'Pork Tenderloin', 'Ground Beef', 'Lamb Chops',
                'Turkey Breast', 'Bacon Strips', 'Sausages', 'Ham Slices', 'Beef Brisket'
            ],
            'vegetable' => [
                'Fresh Spinach', 'Organic Carrots', 'Bell Peppers', 'Broccoli', 'Tomatoes',
                'Lettuce', 'Onions', 'Potatoes', 'Cucumber', 'Zucchini'
            ],
            'fruit' => [
                'Fresh Apples', 'Bananas', 'Oranges', 'Strawberries', 'Grapes',
                'Pineapple', 'Mangoes', 'Berries Mix', 'Avocados', 'Lemons'
            ],
            default => ['Mixed Product', 'Special Item', 'Gourmet Selection']
        };

        return $this->faker->randomElement($names);
    }

    /**
     * Generate realistic descriptions based on category
     */
    private function generateProductDescription(string $category): string
    {
        $descriptions = match($category) {
            'seafood', 'fish' => [
                'Fresh, sustainably caught fish with excellent flavor and texture.',
                'Premium quality seafood, perfect for grilling or pan-searing.',
                'Wild-caught fish, rich in omega-3 fatty acids and protein.'
            ],
            'shellfish' => [
                'Fresh shellfish, carefully selected for quality and taste.',
                'Premium shellfish, perfect for seafood dishes and appetizers.',
                'Sustainably sourced shellfish with sweet, tender meat.'
            ],
            'meat' => [
                'Premium quality meat, carefully selected and aged for tenderness.',
                'Fresh, locally sourced meat with excellent marbling and flavor.',
                'High-quality protein source, perfect for various cooking methods.'
            ],
            'vegetable' => [
                'Fresh, organic vegetables grown with sustainable farming practices.',
                'Crisp and nutritious vegetables, perfect for healthy meals.',
                'Farm-fresh produce, rich in vitamins and minerals.'
            ],
            'fruit' => [
                'Sweet, ripe fruits packed with natural vitamins and antioxidants.',
                'Fresh, seasonal fruits perfect for snacking or cooking.',
                'Premium quality fruits, carefully selected for ripeness and flavor.'
            ],
            default => ['High-quality product with excellent taste and nutritional value.']
        };

        return $this->faker->randomElement($descriptions);
    }

    /**
     * Get appropriate unit type based on category
     */
    private function getUnitTypeForCategory(string $category): string
    {
        return match($category) {
            'seafood', 'fish', 'shellfish', 'meat' => $this->faker->randomElement(['kg', 'piece']),
            'vegetable', 'fruit' => $this->faker->randomElement(['kg', 'piece']),
            default => 'piece'
        };
    }
}
