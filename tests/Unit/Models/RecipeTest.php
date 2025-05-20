<?php

namespace Tests\Unit\Models;

use Tests\TestCase;
use App\Models\Recipe;
use Illuminate\Foundation\Testing\RefreshDatabase;

class RecipeTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_create_recipe(): void
    {
        $recipe = Recipe::factory()->create();

        $this->assertNotNull($recipe);
        $this->assertDatabaseHas('recipes', [
            'id' => $recipe->id,
            'title' => $recipe->title
        ]);
    }

    public function test_recipe_has_array_casts(): void
    {
        $recipe = Recipe::factory()->create([
            'ingredients' => ['ingredient1', 'ingredient2'],
            'instructions' => ['step1', 'step2']
        ]);

        $this->assertIsArray($recipe->ingredients);
        $this->assertIsArray($recipe->instructions);
        $this->assertCount(2, $recipe->ingredients);
        $this->assertCount(2, $recipe->instructions);
    }
}
