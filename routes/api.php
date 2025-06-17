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

    // Recipes API
    Route::get('/recipes', [APIRecipeController::class, 'index'])->name('api.recipes.index');
    Route::get('/recipes/{recipe}', [APIRecipeController::class, 'show'])->name('api.recipes.show');
    Route::get('/recipes/search/{query}', [APIRecipeController::class, 'search'])->name('api.recipes.search');
    Route::get('/recipes/categories', [APIRecipeController::class, 'categories'])->name('api.recipes.categories');
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
