Broadcast::channel('user.{userId}', function ($user, $userId) {
return (int) $user->id === (int) $userId;
});

Broadcast::channel('recipe.{recipeId}', function ($user, $recipeId) {
return Auth::check(); // Or add more logic if you want to restrict
});