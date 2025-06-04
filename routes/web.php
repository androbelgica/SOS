<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\RecipeController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProductLabelController;
use App\Http\Controllers\ProductRecognitionController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\Product;
use App\Models\Recipe;

// Redirect to login for guests, dashboard for authenticated users
Route::get('/', function () {
    if (Auth::check()) {
        return redirect()->route('dashboard');
    }
    return redirect()->route('login');
});

// Old welcome page moved to /home route
Route::get('/home', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'featuredProducts' => Product::where('is_available', true)
            ->inRandomOrder()
            ->take(3)
            ->get(),
        'featuredRecipes' => Recipe::with('reviews')
            ->withAvg('reviews', 'rating')
            ->inRandomOrder()
            ->take(3)
            ->get(),
    ]);
});

Route::get('/products', [ProductController::class, 'index'])->name('products.index');
Route::get('/products/{product}', [ProductController::class, 'show'])->name('products.show');
Route::post('/products', [ProductController::class, 'store'])->middleware(['auth', 'can:create,App\\Models\\Product'])->name('products.store');
Route::post('/cart/{product}/add', [CartController::class, 'add'])->middleware(['auth'])->name('cart.add');

// Cart routes
Route::middleware(['auth'])->group(function () {
    // Cart routes
    Route::get('/cart', [CartController::class, 'index'])->name('cart.index');
    Route::match(['post', 'patch'], '/cart/{product}/update', [CartController::class, 'update'])->name('cart.update');
    Route::delete('/cart/{product}', [CartController::class, 'remove'])->name('cart.remove');
    Route::post('/cart/clear', [CartController::class, 'clear'])->name('cart.clear');
    Route::post('/cart/checkout', [CartController::class, 'checkout'])->name('cart.checkout');
    Route::post('/cart/reorder', [CartController::class, 'reorder'])->name('cart.reorder');
    Route::post('/cart/sync', [CartController::class, 'syncCart'])->name('cart.sync');
    Route::get('/checkout', [CartController::class, 'showCheckout'])->name('checkout.index');

    // Order routes
    Route::post('/orders', [OrderController::class, 'store'])->name('orders.store');
    Route::get('/orders', [OrderController::class, 'index'])->name('orders.index');
    Route::get('/orders/{order}', [OrderController::class, 'show'])->name('orders.show');
    Route::post('/orders/{order}/cancel', [OrderController::class, 'cancel'])->name('orders.cancel');
});

// Recipe routes
Route::get('/recipes', [RecipeController::class, 'index'])->name('recipes.index');
Route::get('/recipes/{recipe}', [RecipeController::class, 'show'])->name('recipes.show');
Route::post('/recipes', [RecipeController::class, 'store'])->middleware(['auth', 'can:create,App\\Models\\Recipe'])->name('recipes.store');
Route::post('/recipes/{recipe}/reviews', [RecipeController::class, 'addReview'])->middleware(['auth'])->name('recipes.reviews.store');

// Order verification route (accessible without authentication)
Route::get('/orders/{order}/verify/{product}', [ProductLabelController::class, 'verify'])->name('orders.verify');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', function () {
        $user = Auth::user();

        if ($user->role === 'admin') {
            return redirect()->route('admin.dashboard');
        }

        return Inertia::render('Customer/Dashboard', [
            'orders' => \App\Models\Order::where('user_id', $user->id)
                ->with('products')
                ->latest()
                ->take(5)
                ->get(),
            'recentRecipes' => \App\Models\Recipe::with('reviews')
                ->withAvg('reviews', 'rating')
                ->latest()
                ->take(3)
                ->get(),
        ]);
    })->name('dashboard');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // AI Generation API
    Route::post('/api/ai/generate-product-info', [App\Http\Controllers\API\AIGenerationController::class, 'generateProductInfo'])
        ->middleware(['auth', 'admin'])
        ->name('api.ai.generate-product-info');

    Route::post('/api/ai/generate-recipe-description', [App\Http\Controllers\API\AIGenerationController::class, 'generateRecipeDescription'])
        ->middleware(['auth', 'admin'])
        ->name('api.ai.generate-recipe-description');

    Route::post('/api/ai/generate-recipe-ingredients', [App\Http\Controllers\API\AIGenerationController::class, 'generateRecipeIngredients'])
        ->middleware(['auth', 'admin'])
        ->name('api.ai.generate-recipe-ingredients');

    Route::post('/api/ai/generate-recipe-instructions', [App\Http\Controllers\API\AIGenerationController::class, 'generateRecipeInstructions'])
        ->middleware(['auth', 'admin'])
        ->name('api.ai.generate-recipe-instructions');

    // File Browser API for admin
    Route::get('/api/files/{type}/images', [App\Http\Controllers\FileBrowserController::class, 'listImages'])
        ->middleware(['auth', 'admin'])
        ->where('type', 'products|recipes')
        ->name('api.files.images');

    // Temporary route for testing the file browser API without authentication
    if (app()->environment('local')) {
        Route::get('/test/files/{type}/images', [App\Http\Controllers\FileBrowserController::class, 'listImages'])
            ->where('type', 'products|recipes')
            ->name('test.files.images');
    }

    // Admin Routes - Moved inside the 'auth' and 'verified' middleware group
    Route::middleware(['admin'])->prefix('admin')->name('admin.')->group(function () {
        // Admin Dashboard
        Route::get('/dashboard', function () {
            // Get order statistics
            $pendingOrders = \App\Models\Order::where('status', 'pending')->count();
            $processingOrders = \App\Models\Order::where('status', 'processing')->count();
            $deliveredOrders = \App\Models\Order::where('status', 'delivered')->count();
            $cancelledOrders = \App\Models\Order::where('status', 'cancelled')->count();

            // Get revenue statistics
            $todayRevenue = \App\Models\Order::whereDate('created_at', today())->sum('total_amount');
            $yesterdayRevenue = \App\Models\Order::whereDate('created_at', today()->subDay())->sum('total_amount');
            $thisWeekRevenue = \App\Models\Order::whereBetween('created_at', [now()->startOfWeek(), now()])->sum('total_amount');
            $thisMonthRevenue = \App\Models\Order::whereMonth('created_at', now()->month)->sum('total_amount');

            // Get payment statistics
            $pendingPayments = \App\Models\Order::where('payment_status', 'pending')->count();
            $paidOrders = \App\Models\Order::where('payment_status', 'paid')->count();
            $failedPayments = \App\Models\Order::where('payment_status', 'failed')->count();

            // Get inventory statistics
            $lowStockCount = \App\Models\Product::where('stock_quantity', '<=', 10)->count();
            $totalProducts = \App\Models\Product::count();

            // Get recent orders
            $recentOrders = \App\Models\Order::with(['user', 'items.product'])
                ->latest()
                ->take(5)
                ->get();

            return Inertia::render('Admin/Dashboard', [
                'stats' => [
                    'orders' => [
                        'pending' => $pendingOrders,
                        'processing' => $processingOrders,
                        'delivered' => $deliveredOrders,
                        'cancelled' => $cancelledOrders,
                        'total' => $pendingOrders + $processingOrders + $deliveredOrders + $cancelledOrders
                    ],
                    'revenue' => [
                        'today' => $todayRevenue,
                        'yesterday' => $yesterdayRevenue,
                        'thisWeek' => $thisWeekRevenue,
                        'thisMonth' => $thisMonthRevenue
                    ],
                    'payments' => [
                        'pending' => $pendingPayments,
                        'paid' => $paidOrders,
                        'failed' => $failedPayments
                    ],
                    'inventory' => [
                        'lowStock' => $lowStockCount,
                        'totalProducts' => $totalProducts
                    ]
                ],
                'recentOrders' => $recentOrders
            ]);
        })->name('dashboard');

        // Admin Products Management
        Route::get('/products', [ProductController::class, 'adminIndex'])->name('products.index');
        Route::get('/products/create', [ProductController::class, 'create'])->name('products.create');
        Route::post('/products', [ProductController::class, 'store'])->name('products.store');
        Route::get('/products/{product}/edit', [ProductController::class, 'edit'])->name('products.edit');
        Route::put('/products/{product}', [ProductController::class, 'update'])->name('products.update');
        Route::delete('/products/{product}', [ProductController::class, 'destroy'])->name('products.destroy');
        Route::put('/products/{product}/stock', [ProductController::class, 'updateStock'])->name('products.stock.update');
        Route::post('/products/batch-stock-update', [ProductController::class, 'batchUpdateStock'])->name('products.stock.batch-update');

        // Orders Management
        Route::get('/orders', [OrderController::class, 'adminIndex'])->name('orders.index');
        Route::get('/orders/export', [OrderController::class, 'export'])->name('orders.export');
        Route::get('/orders/{order}', [OrderController::class, 'adminShow'])->name('orders.show');
        Route::put('/orders/{order}/status', [OrderController::class, 'updateStatus'])->name('orders.status.update');
        Route::put('/orders/{order}/payment-status', [OrderController::class, 'updatePaymentStatus'])->name('orders.payment-status.update');

        // Product Labels Management
        Route::post('/orders/{order}/labels', [ProductLabelController::class, 'generateLabels'])->name('orders.labels.generate');
        Route::get('/labels/{label}', [ProductLabelController::class, 'viewLabel'])->name('labels.view');
        Route::get('/orders/{order}/labels/print', [ProductLabelController::class, 'printAllLabels'])->name('orders.labels.print');

        // Recipe Management
        Route::get('/recipes', [RecipeController::class, 'adminIndex'])->name('recipes.index');
        Route::get('/recipes/create', [RecipeController::class, 'create'])->name('recipes.create');
        Route::post('/recipes', [RecipeController::class, 'store'])->name('recipes.store');
        Route::get('/recipes/{recipe}/edit', [RecipeController::class, 'edit'])->name('recipes.edit');
        Route::put('/recipes/{recipe}', [RecipeController::class, 'update'])->name('recipes.update');
        Route::delete('/recipes/{recipe}', [RecipeController::class, 'destroy'])->name('recipes.destroy');

        // Product Recognition Management (Admin)
        Route::get('/product-recognition', [ProductRecognitionController::class, 'index'])->name('product-recognition.index');
        Route::get('/product-recognition/{recognition}', [ProductRecognitionController::class, 'show'])->name('product-recognition.show');
        Route::delete('/product-recognition/{recognition}', [ProductRecognitionController::class, 'destroy'])->name('product-recognition.destroy');
    });
});

// Product Recognition Routes (Authenticated Users)
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/recognize-product', [ProductRecognitionController::class, 'create'])->name('product-recognition.create');
    Route::post('/recognize-product', [ProductRecognitionController::class, 'recognize'])->name('product-recognition.recognize');
    Route::get('/my-recognitions', [ProductRecognitionController::class, 'index'])->name('my-recognitions.index');
});

// Test route for Google OAuth configuration
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

require __DIR__ . '/auth.php';

// Include debug routes (only for development)
if (app()->environment('local')) {
    require __DIR__ . '/web-debug.php';
}
