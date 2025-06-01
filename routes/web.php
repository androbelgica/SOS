<?php

use App\Http\Controllers\ProductLabelController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes - Backend API Only
|--------------------------------------------------------------------------
|
| This file contains minimal web routes for the Laravel Backend API.
| Most functionality is now served through API routes in routes/api.php
| for consumption by separate web and mobile frontends.
|
*/

// Health check endpoint
Route::get('/', function () {
    return response()->json([
        'message' => 'SeaBasket Backend API',
        'status' => 'operational',
        'version' => '1.0.0',
        'timestamp' => now()->toISOString(),
        'endpoints' => [
            'api' => url('/api/v1'),
            'health' => url('/api/v1/health'),
            'docs' => url('/api/docs'),
        ]
    ]);
});

// API Documentation route
Route::get('/api/docs', function () {
    return response()->json([
        'message' => 'SeaBasket API Documentation',
        'version' => '1.0.0',
        'base_url' => url('/api/v1'),
        'endpoints' => [
            'Authentication' => [
                'POST /api/v1/register' => 'Register new user',
                'POST /api/v1/login' => 'Login user',
                'POST /api/v1/logout' => 'Logout user (requires auth)',
                'POST /api/v1/auth/google' => 'Google OAuth login',
            ],
            'Products' => [
                'GET /api/v1/products' => 'List all products',
                'GET /api/v1/products/{id}' => 'Get product details',
                'GET /api/v1/products/search/{query}' => 'Search products',
                'GET /api/v1/products/categories' => 'Get product categories',
            ],
            'Recipes' => [
                'GET /api/v1/recipes' => 'List all recipes',
                'GET /api/v1/recipes/{id}' => 'Get recipe details',
                'GET /api/v1/recipes/search/{query}' => 'Search recipes',
                'POST /api/v1/recipes/{id}/reviews' => 'Add recipe review (requires auth)',
            ],
            'Orders' => [
                'GET /api/v1/orders' => 'Get user orders (requires auth)',
                'POST /api/v1/orders' => 'Create new order (requires auth)',
                'GET /api/v1/orders/{id}' => 'Get order details (requires auth)',
                'POST /api/v1/orders/{id}/cancel' => 'Cancel order (requires auth)',
            ],
            'Cart' => [
                'GET /api/v1/cart' => 'Get cart items (requires auth)',
                'POST /api/v1/cart/add' => 'Add item to cart (requires auth)',
                'PUT /api/v1/cart/update/{productId}' => 'Update cart item (requires auth)',
                'DELETE /api/v1/cart/remove/{productId}' => 'Remove from cart (requires auth)',
            ],
        ]
    ]);
});

// Order verification route (accessible without authentication)
Route::get('/orders/{order}/verify/{product}', [ProductLabelController::class, 'verify'])->name('orders.verify');

// Essential backend routes for admin functionality and label generation
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    // AI Generation API for admin
    Route::post('/ai/generate-product-info', [App\Http\Controllers\API\AIGenerationController::class, 'generateProductInfo'])
        ->name('ai.generate-product-info');

    Route::post('/ai/generate-recipe-description', [App\Http\Controllers\API\AIGenerationController::class, 'generateRecipeDescription'])
        ->name('ai.generate-recipe-description');

    Route::post('/ai/generate-recipe-ingredients', [App\Http\Controllers\API\AIGenerationController::class, 'generateRecipeIngredients'])
        ->name('ai.generate-recipe-ingredients');

    Route::post('/ai/generate-recipe-instructions', [App\Http\Controllers\API\AIGenerationController::class, 'generateRecipeInstructions'])
        ->name('ai.generate-recipe-instructions');

    // File Browser API for admin
    Route::get('/files/{type}/images', [App\Http\Controllers\FileBrowserController::class, 'listImages'])
        ->where('type', 'products|recipes')
        ->name('files.images');

    // Product Labels Management (essential backend functionality)
    Route::post('/orders/{order}/labels', [ProductLabelController::class, 'generateLabels'])->name('orders.labels.generate');
    Route::get('/labels/{label}', [ProductLabelController::class, 'viewLabel'])->name('labels.view');
    Route::get('/orders/{order}/labels/print', [ProductLabelController::class, 'printAllLabels'])->name('orders.labels.print');
});

// Development/Testing routes
if (app()->environment('local')) {
    Route::get('/test/files/{type}/images', [App\Http\Controllers\FileBrowserController::class, 'listImages'])
        ->where('type', 'products|recipes')
        ->name('test.files.images');
}

// Test route for Google OAuth configuration (development only)
if (app()->environment('local')) {
    Route::get('/test-google-config', function () {
        $config = [
            'client_id' => config('services.google.client_id'),
            'client_secret' => substr(config('services.google.client_secret'), 0, 5) . '...',
            'redirect' => url(config('services.google.redirect')),
        ];

        return response()->json([
            'config' => $config,
            'env_values' => [
                'GOOGLE_CLIENT_ID' => env('GOOGLE_CLIENT_ID'),
                'GOOGLE_CLIENT_SECRET' => substr(env('GOOGLE_CLIENT_SECRET') ?? '', 0, 5) . '...',
                'GOOGLE_REDIRECT_URI' => env('GOOGLE_REDIRECT_URI'),
            ],
            'app_url' => config('app.url'),
        ]);
    });

    // Include debug routes (only for development)
    if (file_exists(__DIR__ . '/web-debug.php')) {
        require __DIR__ . '/web-debug.php';
    }
}

// Note: Auth routes are handled via API routes in routes/api.php
// Web authentication is not needed for this backend API
