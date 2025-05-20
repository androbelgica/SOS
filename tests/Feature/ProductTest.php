<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

class ProductTest extends TestCase
{
    use RefreshDatabase;

    public function test_products_page_displays_available_products()
    {
        Product::factory()->count(5)->create(['is_available' => true]);
        Product::factory()->count(2)->create(['is_available' => false]);

        $response = $this->get('/products');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Products/Index')
            ->has('products.data', 5)
        );
    }

    public function test_product_detail_page_shows_correct_information()
    {
        $product = Product::factory()->create([
            'is_available' => true,
            'name' => 'Fresh Salmon',
            'price' => 15.99,
            'description' => 'Fresh Atlantic Salmon'
        ]);

        $response = $this->get("/products/{$product->id}");

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Products/Show')
            ->where('product.name', 'Fresh Salmon')
            ->where('product.price', 15.99)
            ->where('product.description', 'Fresh Atlantic Salmon')
        );
    }

    public function test_admin_can_create_product()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        
        $productData = [
            'name' => 'New Product',
            'description' => 'Product Description',
            'price' => 29.99,
            'stock_quantity' => 100,
            'is_available' => true
        ];

        $response = $this->actingAs($admin)
            ->post('/products', $productData);

        $response->assertStatus(302);
        $this->assertDatabaseHas('products', [
            'name' => 'New Product',
            'price' => 29.99
        ]);
    }

    public function test_customer_cannot_create_product()
    {
        $customer = User::factory()->create(['role' => 'customer']);
        
        $productData = [
            'name' => 'New Product',
            'description' => 'Product Description',
            'price' => 29.99,
            'stock_quantity' => 100,
            'is_available' => true
        ];

        $response = $this->actingAs($customer)
            ->post('/products', $productData);

        $response->assertStatus(403);
    }

    public function test_products_are_searchable()
    {
        Product::factory()->create(['name' => 'Fresh Tuna']);
        Product::factory()->create(['name' => 'Salmon Fillet']);
        Product::factory()->create(['name' => 'Cod Fish']);

        $response = $this->get('/products?search=Tuna');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Products/Index')
            ->has('products.data', 1)
            ->where('products.data.0.name', 'Fresh Tuna')
        );
    }
}
