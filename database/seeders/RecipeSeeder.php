<?php

namespace Database\Seeders;

use App\Models\Recipe;
use App\Models\Product;
use Illuminate\Database\Seeder;

class RecipeSeeder extends Seeder
{
    public function run(): void
    {
        $recipes = [
            [
                'title' => 'Grilled Salmon with Lemon Herb Butter',
                'description' => 'A delicious and healthy grilled salmon recipe with a fresh lemon herb butter sauce.',
                'ingredients' => [
                    'Fresh salmon fillet - 6 oz',
                    'Butter - 2 tbsp',
                    'Fresh herbs (parsley, dill) - 2 tbsp',
                    'Lemon - 1',
                    'Salt and pepper to taste'
                ],
                'instructions' => [
                    'Preheat grill to medium-high heat',
                    'Season salmon with salt and pepper',
                    'Grill for 4-5 minutes per side',
                    'Prepare lemon herb butter by mixing softened butter with herbs and lemon zest',
                    'Top grilled salmon with lemon herb butter'
                ],
                'cooking_time' => 20,
                'difficulty_level' => 'easy',
                'image_url' => 'https://example.com/images/grilled-salmon.jpg',
                'products' => ['Fresh Atlantic Salmon']
            ],
            [
                'title' => 'Garlic Shrimp Pasta',
                'description' => 'A quick and flavorful pasta dish with jumbo shrimp and garlic.',
                'ingredients' => [
                    'Jumbo shrimp - 1 lb',
                    'Linguine pasta - 8 oz',
                    'Garlic cloves - 4',
                    'Olive oil - 3 tbsp',
                    'Red pepper flakes - 1/4 tsp',
                    'Fresh parsley - 2 tbsp',
                    'Salt and pepper to taste'
                ],
                'instructions' => [
                    'Cook pasta according to package instructions',
                    'Sauté garlic in olive oil',
                    'Add shrimp and cook until pink',
                    'Toss with pasta and add parsley',
                    'Season with salt and pepper'
                ],
                'cooking_time' => 25,
                'difficulty_level' => 'easy',
                'image_url' => 'https://example.com/images/shrimp-pasta.jpg',
                'products' => ['Jumbo Shrimp']
            ],
            [
                'title' => 'Seared Tuna with Asian Slaw',
                'description' => 'Fresh tuna steak seared rare with a crunchy Asian slaw.',
                'ingredients' => [
                    'Tuna steak - 6 oz',
                    'Shredded cabbage - 1 cup',
                    'Shredded carrots - 1/2 cup',
                    'Soy sauce - 2 tbsp',
                    'Rice vinegar - 1 tbsp',
                    'Sesame oil - 1 tsp',
                    'Salt and pepper to taste'
                ],
                'instructions' => [
                    'Season tuna with salt and pepper',
                    'Sear in hot pan for 1-2 minutes per side',
                    'Prepare slaw with shredded cabbage and carrots',
                    'Mix soy sauce dressing',
                    'Slice tuna and serve over slaw'
                ],
                'cooking_time' => 15,
                'difficulty_level' => 'medium',
                'image_url' => 'https://example.com/images/seared-tuna.jpg',
                'products' => ['Fresh Tuna Steak']
            ]
        ];

        foreach ($recipes as $recipeData) {
            $productNames = $recipeData['products'];
            unset($recipeData['products']);

            $recipe = Recipe::create($recipeData);

            $products = Product::whereIn('name', $productNames)->get();
            $recipe->products()->attach($products->pluck('id'));
        }
    }
}
