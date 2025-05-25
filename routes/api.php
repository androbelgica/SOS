<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\ProductController;
use App\Http\Controllers\API\RecipeController;
use App\Http\Controllers\API\OrderController;
use App\Http\Controllers\API\ProfileController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your mobile application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/


// Public routes
Route::prefix('v1')->group(function () {
    // Network debugging and health check
    Route::get('/health', function () {
        return response()->json([
            'status' => 'ok',
            'timestamp' => now()->toISOString(),
            'server' => [
                'host' => request()->getHost(),
                'port' => request()->getPort(),
                'ip' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ],
            'app' => [
                'name' => config('app.name'),
                'env' => config('app.env'),
                'url' => config('app.url'),
            ],
        ]);
    });

    // Authentication
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);

    // Social login
    Route::post('/auth/google', [AuthController::class, 'googleLogin']);

    // Products
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/categories', [ProductController::class, 'categories']);
    Route::get('/products/{product}', [ProductController::class, 'show']);
    Route::get('/products/search/{query?}', [ProductController::class, 'search']);

    // Recipes
    Route::get('/recipes', [RecipeController::class, 'index']);
    Route::get('/recipes/categories', [RecipeController::class, 'categories']);
    Route::get('/recipes/{recipe}', [RecipeController::class, 'show']);
    Route::get('/recipes/search/{query?}', [RecipeController::class, 'search']);

    // Order verification (public)
    Route::get('/orders/{order}/verify/{product}', [OrderController::class, 'verify']);
});

// Protected routes
Route::prefix('v1')->middleware('auth:sanctum')->group(function () {
    // User profile
    Route::get('/user', [ProfileController::class, 'show']);
    Route::put('/user', [ProfileController::class, 'update']);
    Route::put('/user/password', [ProfileController::class, 'updatePassword']);
    Route::post('/user/address', [ProfileController::class, 'addAddress']);
    Route::put('/user/address/{id}', [ProfileController::class, 'updateAddress']);
    Route::delete('/user/address/{id}', [ProfileController::class, 'deleteAddress']);

    // Logout
    Route::post('/logout', [AuthController::class, 'logout']);

    // Cart
    Route::get('/cart', [OrderController::class, 'getCart']);
    Route::post('/cart/add', [OrderController::class, 'addToCart']);
    Route::put('/cart/update/{productId}', [OrderController::class, 'updateCartItem']);
    Route::delete('/cart/remove/{productId}', [OrderController::class, 'removeFromCart']);
    Route::delete('/cart/clear', [OrderController::class, 'clearCart']);

    // Wishlist
    Route::get('/wishlist', [ProductController::class, 'getWishlist']);
    Route::post('/wishlist/add/{productId}', [ProductController::class, 'addToWishlist']);
    Route::delete('/wishlist/remove/{productId}', [ProductController::class, 'removeFromWishlist']);

    // Orders
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{order}', [OrderController::class, 'show']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::post('/orders/{order}/cancel', [OrderController::class, 'cancel']);

    // Recipe reviews
    Route::post('/recipes/{recipe}/reviews', [RecipeController::class, 'addReview']);
    Route::put('/recipes/reviews/{review}', [RecipeController::class, 'updateReview']);
    Route::delete('/recipes/reviews/{review}', [RecipeController::class, 'deleteReview']);

    // Favorite recipes
    Route::get('/recipes/favorites', [RecipeController::class, 'getFavorites']);
    Route::post('/recipes/{recipe}/favorite', [RecipeController::class, 'addToFavorites']);
    Route::delete('/recipes/{recipe}/unfavorite', [RecipeController::class, 'removeFromFavorites']);
});
