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

        // Run other seeders
        $this->call([
            ProductCategorySeeder::class, // New comprehensive category seeder
            // ProductSeeder::class,         // Remove this
            // RecipeSeeder::class,          // Remove this
            // Any Order-related seeders should also be removed
        ]);
    }
}
