<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            [
                'name' => 'Fresh Atlantic Salmon',
                'description' => 'Premium fresh Atlantic salmon, perfect for grilling or baking. Rich in omega-3 fatty acids.',
                'price' => 24.99,
                'stock_quantity' => 50,
                'category' => 'fish',
                'unit_type' => 'kg',
                'image_url' => 'https://example.com/images/salmon.jpg',
                'is_available' => true
            ],
            [
                'name' => 'Jumbo Shrimp',
                'description' => 'Large, succulent shrimp perfect for grilling, pasta dishes, or seafood platters.',
                'price' => 19.99,
                'stock_quantity' => 100,
                'category' => 'shellfish',
                'unit_type' => 'piece',
                'image_url' => 'https://example.com/images/shrimp.jpg',
                'is_available' => true
            ],
            [
                'name' => 'Fresh Tuna Steak',
                'description' => 'Sushi-grade tuna steaks, perfect for grilling or serving raw in sashimi.',
                'price' => 29.99,
                'stock_quantity' => 30,
                'category' => 'fish',
                'unit_type' => 'kg',
                'image_url' => 'https://example.com/images/tuna.jpg',
                'is_available' => true
            ],
            [
                'name' => 'Live Maine Lobster',
                'description' => 'Fresh live Maine lobsters, perfect for special occasions.',
                'price' => 39.99,
                'stock_quantity' => 20,
                'category' => 'shellfish',
                'unit_type' => 'piece',
                'image_url' => 'https://example.com/images/lobster.jpg',
                'is_available' => true
            ],
            [
                'name' => 'Fresh Oysters',
                'description' => 'Fresh local oysters, perfect for serving raw on the half shell.',
                'price' => 24.99,
                'stock_quantity' => 100,
                'category' => 'shellfish',
                'unit_type' => 'piece',
                'image_url' => 'https://example.com/images/oysters.jpg',
                'is_available' => true
            ]
        ];

        foreach ($products as $product) {
            Product::create($product);
        }
    }
}
