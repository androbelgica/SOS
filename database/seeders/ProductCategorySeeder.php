<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Enums\ProductCategory;
use Illuminate\Database\Seeder;

class ProductCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create sample products for each category
        $this->createSeafoodProducts();
        $this->createMeatProducts();
        $this->createVegetableProducts();
        $this->createFruitProducts();
    }

    private function createSeafoodProducts(): void
    {
        $seafoodProducts = [
            [
                'name' => 'Fresh Atlantic Salmon',
                'description' => 'Premium Atlantic salmon fillet, rich in omega-3 fatty acids. Perfect for grilling, baking, or pan-searing.',
                'price' => 28.99,
                'stock_quantity' => 25,
                'category' => ProductCategory::Fish->value,
                'unit_type' => 'kg',
                'nutritional_facts' => 'Calories: 208 per 100g, Protein: 25g, Fat: 12g, Omega-3: 2.3g'
            ],
            [
                'name' => 'Jumbo Shrimp',
                'description' => 'Large, succulent shrimp perfect for grilling, frying, or adding to pasta dishes.',
                'price' => 24.99,
                'stock_quantity' => 30,
                'category' => ProductCategory::Shellfish->value,
                'unit_type' => 'kg',
                'nutritional_facts' => 'Calories: 99 per 100g, Protein: 24g, Fat: 0.3g, Cholesterol: 152mg'
            ],
            [
                'name' => 'Fresh Tuna Steaks',
                'description' => 'Sushi-grade tuna steaks, perfect for searing or enjoying raw in sashimi.',
                'price' => 35.99,
                'stock_quantity' => 15,
                'category' => ProductCategory::Fish->value,
                'unit_type' => 'piece',
                'nutritional_facts' => 'Calories: 144 per 100g, Protein: 30g, Fat: 1g, Mercury: Low'
            ],
            [
                'name' => 'Live Blue Mussels',
                'description' => 'Fresh live mussels, perfect for steaming with white wine and garlic.',
                'price' => 12.99,
                'stock_quantity' => 40,
                'category' => ProductCategory::Shellfish->value,
                'unit_type' => 'kg',
                'nutritional_facts' => 'Calories: 86 per 100g, Protein: 18g, Iron: 4mg, Vitamin B12: High'
            ]
        ];

        foreach ($seafoodProducts as $product) {
            Product::create($product);
        }
    }

    private function createMeatProducts(): void
    {
        $meatProducts = [
            [
                'name' => 'Premium Beef Ribeye',
                'description' => 'Marbled ribeye steak, aged for 21 days for maximum tenderness and flavor.',
                'price' => 45.99,
                'stock_quantity' => 20,
                'category' => ProductCategory::Meat->value,
                'unit_type' => 'piece',
                'nutritional_facts' => 'Calories: 291 per 100g, Protein: 25g, Fat: 21g, Iron: 2.9mg'
            ],
            [
                'name' => 'Free-Range Chicken Breast',
                'description' => 'Organic, free-range chicken breast, hormone-free and antibiotic-free.',
                'price' => 18.99,
                'stock_quantity' => 35,
                'category' => ProductCategory::Meat->value,
                'unit_type' => 'kg',
                'nutritional_facts' => 'Calories: 165 per 100g, Protein: 31g, Fat: 3.6g, Sodium: 74mg'
            ],
            [
                'name' => 'Pork Tenderloin',
                'description' => 'Lean and tender pork tenderloin, perfect for roasting or grilling.',
                'price' => 22.99,
                'stock_quantity' => 25,
                'category' => ProductCategory::Meat->value,
                'unit_type' => 'piece',
                'nutritional_facts' => 'Calories: 143 per 100g, Protein: 26g, Fat: 3.5g, Thiamine: High'
            ],
            [
                'name' => 'Ground Turkey (Lean)',
                'description' => '93% lean ground turkey, perfect for healthy burgers and meatballs.',
                'price' => 14.99,
                'stock_quantity' => 30,
                'category' => ProductCategory::Meat->value,
                'unit_type' => 'kg',
                'nutritional_facts' => 'Calories: 120 per 100g, Protein: 26g, Fat: 1.5g, Selenium: High'
            ]
        ];

        foreach ($meatProducts as $product) {
            Product::create($product);
        }
    }

    private function createVegetableProducts(): void
    {
        $vegetableProducts = [
            [
                'name' => 'Organic Baby Spinach',
                'description' => 'Fresh, tender baby spinach leaves, perfect for salads and smoothies.',
                'price' => 4.99,
                'stock_quantity' => 50,
                'category' => ProductCategory::Vegetable->value,
                'unit_type' => 'piece',
                'nutritional_facts' => 'Calories: 23 per 100g, Iron: 2.7mg, Vitamin K: 483μg, Folate: 194μg'
            ],
            [
                'name' => 'Rainbow Bell Peppers',
                'description' => 'Colorful mix of red, yellow, and orange bell peppers, sweet and crunchy.',
                'price' => 6.99,
                'stock_quantity' => 45,
                'category' => ProductCategory::Vegetable->value,
                'unit_type' => 'kg',
                'nutritional_facts' => 'Calories: 31 per 100g, Vitamin C: 190mg, Vitamin A: 3131 IU'
            ],
            [
                'name' => 'Organic Broccoli Crowns',
                'description' => 'Fresh broccoli crowns, rich in vitamins and perfect for steaming or stir-frying.',
                'price' => 3.99,
                'stock_quantity' => 40,
                'category' => ProductCategory::Vegetable->value,
                'unit_type' => 'piece',
                'nutritional_facts' => 'Calories: 34 per 100g, Vitamin C: 89mg, Fiber: 2.6g, Sulforaphane: High'
            ],
            [
                'name' => 'Heirloom Tomatoes',
                'description' => 'Colorful heirloom tomatoes with exceptional flavor and texture.',
                'price' => 8.99,
                'stock_quantity' => 35,
                'category' => ProductCategory::Vegetable->value,
                'unit_type' => 'kg',
                'nutritional_facts' => 'Calories: 18 per 100g, Lycopene: 2573μg, Vitamin C: 14mg, Potassium: 237mg'
            ]
        ];

        foreach ($vegetableProducts as $product) {
            Product::create($product);
        }
    }

    private function createFruitProducts(): void
    {
        $fruitProducts = [
            [
                'name' => 'Organic Honeycrisp Apples',
                'description' => 'Sweet and crispy apples, perfect for snacking or baking.',
                'price' => 5.99,
                'stock_quantity' => 60,
                'category' => ProductCategory::Fruit->value,
                'unit_type' => 'kg',
                'nutritional_facts' => 'Calories: 52 per 100g, Fiber: 2.4g, Vitamin C: 4.6mg, Antioxidants: High'
            ],
            [
                'name' => 'Fresh Strawberries',
                'description' => 'Sweet, juicy strawberries, perfect for desserts or eating fresh.',
                'price' => 7.99,
                'stock_quantity' => 40,
                'category' => ProductCategory::Fruit->value,
                'unit_type' => 'piece',
                'nutritional_facts' => 'Calories: 32 per 100g, Vitamin C: 59mg, Folate: 24μg, Anthocyanins: High'
            ],
            [
                'name' => 'Ripe Avocados',
                'description' => 'Perfectly ripe avocados, rich in healthy fats and perfect for toast or guacamole.',
                'price' => 2.99,
                'stock_quantity' => 50,
                'category' => ProductCategory::Fruit->value,
                'unit_type' => 'piece',
                'nutritional_facts' => 'Calories: 160 per 100g, Healthy Fats: 15g, Fiber: 7g, Potassium: 485mg'
            ],
            [
                'name' => 'Tropical Mango',
                'description' => 'Sweet, tropical mangoes with rich flavor and smooth texture.',
                'price' => 3.99,
                'stock_quantity' => 45,
                'category' => ProductCategory::Fruit->value,
                'unit_type' => 'piece',
                'nutritional_facts' => 'Calories: 60 per 100g, Vitamin A: 1082 IU, Vitamin C: 36mg, Beta-carotene: High'
            ]
        ];

        foreach ($fruitProducts as $product) {
            Product::create($product);
        }
    }
}
