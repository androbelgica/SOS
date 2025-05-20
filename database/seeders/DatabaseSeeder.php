<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create admin user
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'role' => 'admin'
        ]);

        // Create regular user
        User::create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => Hash::make('password'),
            'role' => 'customer'
        ]);

        // Create test products
        \App\Models\Product::create([
            'name' => 'Fresh Atlantic Salmon',
            'description' => 'Premium farm-raised Atlantic salmon, perfect for grilling or baking.',
            'price' => 24.99,
            'stock_quantity' => 50,
            'category' => 'Fish',
            'unit_type' => 'kg',
            'is_available' => true,
            'image_url' => 'https://images.unsplash.com/photo-1574781330855-d0db8cc6a79c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1469&q=80'
        ]);

        \App\Models\Product::create([
            'name' => 'Jumbo Shrimp',
            'description' => 'Large, succulent shrimp perfect for grilling or seafood dishes.',
            'price' => 19.99,
            'stock_quantity' => 100,
            'category' => 'Shellfish',
            'unit_type' => 'piece',
            'is_available' => true,
            'image_url' => 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80'
        ]);

        \App\Models\Product::create([
            'name' => 'Maine Lobster',
            'description' => 'Fresh caught Maine lobster, perfect for special occasions.',
            'price' => 39.99,
            'stock_quantity' => 25,
            'category' => 'Shellfish',
            'unit_type' => 'piece',
            'is_available' => true,
            'image_url' => 'https://images.unsplash.com/photo-1516684732162-798a0062be99?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80'
        ]);

        // Run other seeders
        $this->call([
            ProductSeeder::class,
            RecipeSeeder::class,
        ]);
    }
}
