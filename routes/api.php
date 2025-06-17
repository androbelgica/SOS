<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\RecipeCommentController;
use App\Http\Controllers\RecipeReactionController;

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
