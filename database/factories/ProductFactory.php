<?php

namespace Database\Factories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->words(3, true),
            'description' => $this->faker->paragraph(),
            'price' => $this->faker->randomFloat(2, 10, 100),
            'stock_quantity' => $this->faker->numberBetween(0, 100),
            'is_available' => $this->faker->boolean(80),
            'image_url' => $this->faker->imageUrl(640, 480, 'food'),
            'category' => $this->faker->randomElement(['fish', 'shellfish', 'other']),
            'unit_type' => $this->faker->randomElement(['kg', 'piece']),
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}
