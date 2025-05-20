<?php

namespace Database\Factories;

use App\Models\Recipe;
use Illuminate\Database\Eloquent\Factories\Factory;

class RecipeFactory extends Factory
{
    protected $model = Recipe::class;

    public function definition(): array
    {
        return [
            'title' => $this->faker->words(4, true),
            'description' => $this->faker->paragraph(),
            'ingredients' => json_encode($this->faker->words(10)),
            'instructions' => $this->faker->paragraphs(3, true),
            'cooking_time' => $this->faker->numberBetween(15, 120),
            'difficulty_level' => $this->faker->randomElement(['easy', 'medium', 'hard']),
            'image_url' => $this->faker->imageUrl(640, 480, 'food'),
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}
