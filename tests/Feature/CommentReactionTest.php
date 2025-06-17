<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Recipe;
use App\Models\Comment;
use App\Models\Reaction;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CommentReactionTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_comment_on_recipe()
    {
        $user = User::factory()->create();
        $recipe = Recipe::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->post(route('comments.store'), [
            'recipe_id' => $recipe->id,
            'content' => 'This is a test comment'
        ]);

        $response->assertStatus(302);
        $this->assertDatabaseHas('comments', [
            'recipe_id' => $recipe->id,
            'user_id' => $user->id,
            'content' => 'This is a test comment'
        ]);
    }

    public function test_user_can_react_to_recipe()
    {
        $user = User::factory()->create();
        $recipe = Recipe::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->post(route('reactions.store'), [
            'recipe_id' => $recipe->id,
            'type' => 'like'
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('reactions', [
            'recipe_id' => $recipe->id,
            'user_id' => $user->id,
            'type' => 'like'
        ]);
    }

    public function test_user_can_toggle_reaction()
    {
        $user = User::factory()->create();
        $recipe = Recipe::factory()->create(['user_id' => $user->id]);

        // First reaction
        $this->actingAs($user)->post(route('reactions.store'), [
            'recipe_id' => $recipe->id,
            'type' => 'like'
        ]);

        // Toggle reaction (should remove it)
        $response = $this->actingAs($user)->post(route('reactions.store'), [
            'recipe_id' => $recipe->id,
            'type' => 'like'
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseMissing('reactions', [
            'recipe_id' => $recipe->id,
            'user_id' => $user->id,
            'type' => 'like'
        ]);
    }

    public function test_user_can_delete_own_comment()
    {
        $user = User::factory()->create();
        $recipe = Recipe::factory()->create(['user_id' => $user->id]);
        $comment = Comment::factory()->create([
            'user_id' => $user->id,
            'recipe_id' => $recipe->id
        ]);

        $response = $this->actingAs($user)->delete(route('comments.destroy', $comment));

        $response->assertStatus(302);
        $this->assertDatabaseMissing('comments', [
            'id' => $comment->id
        ]);
    }

    public function test_user_cannot_delete_others_comment()
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $recipe = Recipe::factory()->create(['user_id' => $user1->id]);
        $comment = Comment::factory()->create([
            'user_id' => $user1->id,
            'recipe_id' => $recipe->id
        ]);

        $response = $this->actingAs($user2)->delete(route('comments.destroy', $comment));

        $response->assertStatus(403);
        $this->assertDatabaseHas('comments', [
            'id' => $comment->id
        ]);
    }
}
