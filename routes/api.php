<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\RecipeCommentController;
use App\Http\Controllers\RecipeReactionController;
use App\Http\Controllers\API\ProductController as APIProductController;
use App\Http\Controllers\API\RecipeController as APIRecipeController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Recipe Comments API routes (public access for viewing)
Route::get('/recipes/{recipe}/comments', [RecipeCommentController::class, 'index'])->name('api.recipes.comments.index');
Route::get('/comments/{comment}/replies', [RecipeCommentController::class, 'replies'])->name('api.comments.replies');

// Recipe Comments & Reactions API routes (authenticated users only)
// Using web middleware for session-based authentication
Route::middleware(['web', 'auth'])->group(function () {
    // Recipe Comments (write operations)
    Route::post('/recipes/{recipe}/comments', [RecipeCommentController::class, 'store'])->name('api.recipes.comments.store');
    Route::put('/comments/{comment}', [RecipeCommentController::class, 'update'])->name('api.comments.update');
    Route::delete('/comments/{comment}', [RecipeCommentController::class, 'destroy'])->name('api.comments.destroy');

    // Recipe Reactions
    Route::post('/recipes/{recipe}/reactions', [RecipeReactionController::class, 'toggleRecipeReaction'])->name('api.recipes.reactions.toggle');
    Route::get('/recipes/{recipe}/reactions', [RecipeReactionController::class, 'getRecipeReactions'])->name('api.recipes.reactions.get');
    Route::post('/comments/{comment}/reactions', [RecipeReactionController::class, 'toggleCommentReaction'])->name('api.comments.reactions.toggle');
});

// Public API Routes for Mobile App
Route::prefix('v1')->group(function () {
    // Products API
    Route::get('/products', [APIProductController::class, 'index'])->name('api.products.index');
    Route::get('/products/{product}', [APIProductController::class, 'show'])->name('api.products.show');
    Route::get('/products/search/{query}', [APIProductController::class, 'search'])->name('api.products.search');
    Route::get('/products/categories', [APIProductController::class, 'categories'])->name('api.products.categories');
    Route::get('/products/by-category', [APIProductController::class, 'byCategory'])->name('api.products.by-category');
    Route::post('/products', [APIProductController::class, 'store'])->name('api.products.store');
    Route::put('/products/{product}', [APIProductController::class, 'update'])->name('api.products.update');
    Route::patch('/products/{product}', [APIProductController::class, 'update']);
    Route::delete('/products/{product}', [APIProductController::class, 'destroy'])->name('api.products.destroy');

    // Recipes API
    Route::get('/recipes', [APIRecipeController::class, 'index'])->name('api.recipes.index');
    Route::get('/recipes/{recipe}', [APIRecipeController::class, 'show'])->name('api.recipes.show');
    Route::get('/recipes/search/{query}', [APIRecipeController::class, 'search'])->name('api.recipes.search');
    Route::get('/recipes/categories', [APIRecipeController::class, 'categories'])->name('api.recipes.categories');
    Route::post('/recipes', [APIRecipeController::class, 'store'])->name('api.recipes.store');
    Route::put('/recipes/{recipe}', [APIRecipeController::class, 'update'])->name('api.recipes.update');
    Route::patch('/recipes/{recipe}', [APIRecipeController::class, 'update']);
    Route::delete('/recipes/{recipe}', [APIRecipeController::class, 'destroy'])->name('api.recipes.destroy');
});

// Legacy API Routes (for backward compatibility with mobile app)
Route::get('/products', [APIProductController::class, 'index'])->name('api.products.legacy');
Route::get('/products/{product}', [APIProductController::class, 'show'])->name('api.products.show.legacy');
Route::get('/products/search/{query}', [APIProductController::class, 'search'])->name('api.products.search.legacy');
Route::get('/products/categories', [APIProductController::class, 'categories'])->name('api.products.categories.legacy');

Route::get('/recipes', [APIRecipeController::class, 'index'])->name('api.recipes.legacy');
Route::get('/recipes/{recipe}', [APIRecipeController::class, 'show'])->name('api.recipes.show.legacy');
Route::get('/recipes/search/{query}', [APIRecipeController::class, 'search'])->name('api.recipes.search.legacy');
Route::get('/recipes/categories', [APIRecipeController::class, 'categories'])->name('api.recipes.categories.legacy');

// --- Additional RESTful API endpoints for mobile app ---

// User profile and management
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    // Add more user routes as needed (update, delete, etc.)
});

// Orders
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('orders', App\Http\Controllers\API\OrderController::class);
});

// Notifications
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/notifications', [App\Http\Controllers\API\NotificationController::class, 'index']);
    Route::post('/notifications/{notification}/read', [App\Http\Controllers\API\NotificationController::class, 'markAsRead']);
    Route::delete('/notifications/{notification}', [App\Http\Controllers\API\NotificationController::class, 'destroy']);
});

// Product Recognition
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('product-recognitions', App\Http\Controllers\API\ProductRecognitionController::class)->only(['index', 'store', 'show']);
});

// --- High-priority API endpoints for mobile app ---

// Admin Dashboard Stats
Route::middleware(['auth:sanctum', 'admin'])->get('/admin/dashboard-stats', [App\Http\Controllers\API\AdminController::class, 'dashboardStats']);

// Featured Products
Route::get('/featured-products', [APIProductController::class, 'featuredProducts']);
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::post('/products/{id}/feature', [APIProductController::class, 'feature']);
    Route::delete('/products/{id}/feature', [APIProductController::class, 'unfeature']);
    Route::put('/products/{product}/stock', [APIProductController::class, 'updateStock']);
    Route::post('/products/batch-stock-update', [APIProductController::class, 'batchUpdateStock']);
});

// Recipe Approval (Admin)
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::post('/recipes/{recipe}/approve', [APIRecipeController::class, 'approve']);
    Route::post('/recipes/{recipe}/reject', [APIRecipeController::class, 'reject']);
    Route::post('/recipes/{recipe}/under-review', [APIRecipeController::class, 'setUnderReview']);
});

// Delivery Order Management
Route::middleware(['auth:sanctum', 'delivery'])->prefix('delivery')->group(function () {
    Route::get('/orders', [App\Http\Controllers\API\DeliveryOrderController::class, 'index']);
    Route::get('/orders/{order}', [App\Http\Controllers\API\DeliveryOrderController::class, 'show']);
    Route::post('/orders/{order}/accept', [App\Http\Controllers\API\DeliveryOrderController::class, 'accept']);
    Route::post('/orders/{order}/delivered', [App\Http\Controllers\API\DeliveryOrderController::class, 'markDelivered']);
    Route::post('/orders/{order}/cancelled', [App\Http\Controllers\API\DeliveryOrderController::class, 'markCancelled']);
    Route::post('/orders/lookup-qr', [App\Http\Controllers\API\DeliveryOrderController::class, 'lookupByQr']);
    Route::post('/orders/{order}/settle-payment', [App\Http\Controllers\API\DeliveryOrderController::class, 'settlePayment']);
});

// User Profile Update/Delete
Route::middleware('auth:sanctum')->group(function () {
    Route::patch('/user', [App\Http\Controllers\API\UserController::class, 'update']);
    Route::delete('/user', [App\Http\Controllers\API\UserController::class, 'destroy']);
});
