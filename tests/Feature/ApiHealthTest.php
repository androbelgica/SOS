<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiHealthTest extends TestCase
{
    /**
     * Test the main API health endpoint.
     */
    public function test_api_health_endpoint_returns_success(): void
    {
        $response = $this->get('/api/v1/health');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'status',
                     'timestamp',
                     'server' => [
                         'host',
                         'port',
                         'ip',
                         'user_agent'
                     ],
                     'app' => [
                         'name',
                         'env',
                         'url'
                     ]
                 ])
                 ->assertJson([
                     'status' => 'ok'
                 ]);
    }

    /**
     * Test the main backend API endpoint.
     */
    public function test_main_api_endpoint_returns_success(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'message',
                     'status',
                     'version',
                     'timestamp',
                     'endpoints' => [
                         'api',
                         'health',
                         'docs'
                     ]
                 ])
                 ->assertJson([
                     'message' => 'SeaBasket Backend API',
                     'status' => 'operational',
                     'version' => '1.0.0'
                 ]);
    }

    /**
     * Test the API documentation endpoint.
     */
    public function test_api_docs_endpoint_returns_success(): void
    {
        $response = $this->get('/api/docs');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'message',
                     'version',
                     'base_url',
                     'endpoints' => [
                         'Authentication',
                         'Products',
                         'Recipes',
                         'Orders',
                         'Cart'
                     ]
                 ])
                 ->assertJson([
                     'message' => 'SeaBasket API Documentation',
                     'version' => '1.0.0'
                 ]);
    }

    /**
     * Test that products API endpoint is accessible.
     */
    public function test_products_api_endpoint_is_accessible(): void
    {
        $response = $this->get('/api/v1/products');

        // Should return 200 (success) or 401 (unauthorized) but not 404 (not found)
        $this->assertContains($response->getStatusCode(), [200, 401]);
    }

    /**
     * Test that recipes API endpoint is accessible.
     */
    public function test_recipes_api_endpoint_is_accessible(): void
    {
        $response = $this->get('/api/v1/recipes');

        // Should return 200 (success) or 401 (unauthorized) but not 404 (not found)
        $this->assertContains($response->getStatusCode(), [200, 401]);
    }
}
