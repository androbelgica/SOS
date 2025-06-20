<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Enums\ProductCategory;

class ProductCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ensure all product categories exist in the database (if needed)
        // If you have a ProductCategory model/table, seed categories here.
        // Example (uncomment and adjust if you have a ProductCategory model):
        // foreach (ProductCategory::cases() as $category) {
        //     \App\Models\ProductCategory::firstOrCreate(['name' => $category->value]);
        // }
    }
}
