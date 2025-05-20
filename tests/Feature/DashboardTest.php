<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Order;
use App\Models\Product;
use App\Models\Recipe;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_welcome_page_shows_featured_content()
    {
        // Create test products and recipes
        Product::factory()->count(5)->create(['is_available' => true]);
        Recipe::factory()->count(5)->create();

        $response = $this->get('/');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Welcome')
            ->has('featuredProducts', 3)
            ->has('featuredRecipes', 3)
        );
    }

    public function test_customer_can_access_customer_dashboard()
    {
        $user = User::factory()->create(['role' => 'customer']);
        
        $response = $this->actingAs($user)
            ->get('/dashboard');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Customer/Dashboard')
            ->has('orders')
            ->has('recentRecipes')
        );
    }

    public function test_admin_can_access_admin_dashboard()
    {
        $user = User::factory()->create(['role' => 'admin']);
        
        $response = $this->actingAs($user)
            ->get('/dashboard');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Dashboard')
            ->has('stats.newOrders')
            ->has('stats.todayRevenue')
            ->has('stats.lowStockCount')
            ->has('stats.totalProducts')
        );
    }

    public function test_guest_cannot_access_dashboard()
    {
        $response = $this->get('/dashboard');
        
        $response->assertRedirect('/login');
    }

    public function test_dashboard_shows_correct_stats_for_admin()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        
        // Create test data
        Product::factory()->count(3)->create(['stock_quantity' => 5]); // Low stock products
        Product::factory()->count(2)->create(['stock_quantity' => 20]); // Normal stock products
        Order::factory()->count(2)->create(['status' => 'pending']);

        $response = $this->actingAs($admin)
            ->get('/dashboard');

        $response->assertInertia(fn (Assert $page) => $page
            ->where('stats.lowStockCount', 3)
            ->where('stats.totalProducts', 5)
            ->where('stats.newOrders', 2)
        );
    }
}
