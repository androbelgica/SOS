<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Recipe;
use App\Models\RecipeComment;
use App\Models\RecipeReaction;

class CommentReactionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get or create a test user
        $user = User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => bcrypt('password'),
                'role' => 'customer'
            ]
        );

        // Get or create a test recipe
        $recipe = Recipe::firstOrCreate(
            ['title' => 'Test Seafood Recipe'],
            [
                'description' => 'A delicious test seafood recipe',
                'ingredients' => ['Fresh fish', 'Lemon', 'Herbs'],
                'instructions' => ['Cook the fish', 'Add lemon', 'Serve hot'],
                'cooking_time' => 35,
                'difficulty_level' => 'easy'
            ]
        );

        // Create some test comments
        RecipeComment::firstOrCreate(
            [
                'user_id' => $user->id,
                'recipe_id' => $recipe->id,
                'content' => 'This recipe looks amazing! Can\'t wait to try it.'
            ]
        );

        RecipeComment::firstOrCreate(
            [
                'user_id' => $user->id,
                'recipe_id' => $recipe->id,
                'content' => 'I made this last night and it was delicious!'
            ]
        );

        // Create some test reactions
        RecipeReaction::firstOrCreate(
            [
                'user_id' => $user->id,
                'recipe_id' => $recipe->id,
                'reaction_type' => 'like'
            ]
        );

        $this->command->info('Comment and Reaction test data seeded successfully!');
    }
}
