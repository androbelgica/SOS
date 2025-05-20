<?php

namespace App\Http\Controllers;

use App\Models\Recipe;
use App\Models\RecipeReview;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RecipeReviewController extends Controller
{
    public function store(Request $request, Recipe $recipe)
    {
        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000'
        ]);

        $review = $recipe->reviews()->updateOrCreate(
            ['user_id' => auth()->id()],
            $validated
        );

        return back()->with('success', 'Review submitted successfully.');
    }

    public function update(Request $request, Recipe $recipe, RecipeReview $review)
    {
        $this->authorize('update', $review);

        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000'
        ]);

        $review->update($validated);

        return back()->with('success', 'Review updated successfully.');
    }

    public function destroy(Recipe $recipe, RecipeReview $review)
    {
        $this->authorize('delete', $review);

        $review->delete();

        return back()->with('success', 'Review deleted successfully.');
    }
}
