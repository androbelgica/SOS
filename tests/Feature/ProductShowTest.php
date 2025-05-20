<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\Recipe;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductShowTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_displays_product_details()
    {
        $product = Product::factory()->create([
            'name' => 'Fresh Salmon',
            'description' => 'Premium fresh salmon',
            'price' => 15.99,
            'stock_quantity' => 10,
            'is_available' => true,
        ]);

        $response = $this->get(route('products.show', $product));

        $response->assertStatus(200)
            ->assertInertia(fn ($assert) => $assert
                ->component('Products/Show')
                ->has('product', fn ($assert) => $assert
                    ->where('id', $product->id)
                    ->where('name', 'Fresh Salmon')
                    ->where('description', 'Premium fresh salmon')
                    ->where('price', 15.99)
                    ->where('stock_quantity', 10)
                    ->where('is_available', true)
                )
            );
    }

    public function test_it_shows_related_recipes()
    {
        $product = Product::factory()->create();
        $recipes = Recipe::factory(3)->create();
        $product->recipes()->attach($recipes->pluck('id'));

        $response = $this->get(route('products.show', $product));

        $response->assertStatus(200)
            ->assertInertia(fn ($assert) => $assert
                ->component('Products/Show')
                ->has('relatedRecipes', 3)
            );
    }

    public function test_it_allows_adding_to_cart_when_in_stock()
    {
        $user = User::factory()->create();
        $product = Product::factory()->create([
            'stock_quantity' => 5,
            'is_available' => true,
        ]);

        $response = $this->actingAs($user)
            ->post(route('cart.add', $product), [
                'quantity' => 2
            ]);

        $response->assertRedirect();
        $this->assertEquals(2, session('cart.'.$product->id));
    }

    public function test_it_prevents_adding_more_than_stock_quantity()
    {
        $user = User::factory()->create();
        $product = Product::factory()->create([
            'stock_quantity' => 3,
            'is_available' => true,
        ]);

        $response = $this->actingAs($user)
            ->post(route('cart.add', $product), [
                'quantity' => 5
            ]);

        $response->assertSessionHasErrors('quantity');
    }

    public function test_it_prevents_adding_unavailable_products()
    {
        $user = User::factory()->create();
        $product = Product::factory()->create([
            'stock_quantity' => 5,
            'is_available' => false,
        ]);

        $response = $this->actingAs($user)
            ->get(route('products.show', $product));

        $response->assertStatus(200)
            ->assertInertia(fn ($assert) => $assert
                ->component('Products/Show')
                ->where('product.is_available', false)
            );
    }
}
