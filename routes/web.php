<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\RecipeController;
use App\Http\Controllers\UserRecipeController;
use App\Http\Controllers\RecipeCommentController;
use App\Http\Controllers\RecipeReactionController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProductLabelController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ProductRecognitionController;
use App\Http\Controllers\DeliveryOrderController;
use App\Http\Middleware\DeliveryMiddleware;
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

Route::get('/check-manifest', function () {
    return file_exists(public_path('build/manifest.json'))
        ? 'Manifest found ✅'
        : 'Manifest missing ❌';
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
    Route::get('/orders/{order}/scanner', [OrderController::class, 'scanner'])->name('orders.scanner');
    Route::post('/orders/{order}/cancel', [OrderController::class, 'cancel'])->name('orders.cancel');
});

// Recipe routes
Route::get('/recipes', [RecipeController::class, 'index'])->name('recipes.index');
Route::get('/recipes/{recipe}', [RecipeController::class, 'show'])->name('recipes.show');
Route::post('/recipes/{recipe}/reviews', [RecipeController::class, 'addReview'])->middleware(['auth'])->name('recipes.reviews.store');

// User Recipe Management Routes (Authenticated Users)
Route::middleware(['auth', 'verified'])->prefix('my')->name('user.')->group(function () {
    Route::get('/recipes', [UserRecipeController::class, 'index'])->name('recipes.index');
    Route::get('/recipes/create', [UserRecipeController::class, 'create'])->name('recipes.create');
    Route::post('/recipes', [UserRecipeController::class, 'store'])->name('recipes.store');
    Route::get('/recipes/{recipe}', [UserRecipeController::class, 'show'])->name('recipes.show');
    Route::get('/recipes/{recipe}/edit', [UserRecipeController::class, 'edit'])->name('recipes.edit');
    Route::put('/recipes/{recipe}', [UserRecipeController::class, 'update'])->name('recipes.update');
    Route::delete('/recipes/{recipe}', [UserRecipeController::class, 'destroy'])->name('recipes.destroy');
    Route::post('/recipes/{recipe}/submit', [UserRecipeController::class, 'submitForReview'])->name('recipes.submit');
});

// Notification Routes (Authenticated Users)
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::get('/notifications/recent', [NotificationController::class, 'getRecent'])->name('notifications.recent');
    Route::get('/notifications/unread-count', [NotificationController::class, 'getUnreadCount'])->name('notifications.unread-count');
    Route::post('/notifications/{notification}/mark-read', [NotificationController::class, 'markAsRead'])->name('notifications.mark-read');
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead'])->name('notifications.mark-all-read');
    Route::delete('/notifications/{notification}', [NotificationController::class, 'destroy'])->name('notifications.destroy');
    Route::post('/notifications/clear-read', [NotificationController::class, 'clearRead'])->name('notifications.clear-read');
});

// Order verification route (accessible without authentication)
Route::get('/orders/{order}/verify/{product}', [ProductLabelController::class, 'verify'])->name('orders.verify');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', function () {
        $user = Auth::user();
        if ($user->role === 'admin') {
            return redirect()->route('admin.dashboard');
        }
        if ($user->role === 'delivery') {
            $orders = \App\Models\Order::where('assigned_to', $user->id)
                ->whereIn('delivery_status', ['for_delivery', 'out_for_delivery'])
                ->with(['user', 'items.product'])
                ->latest()
                ->get();
            return Inertia::render('Delivery/Dashboard', [
                'orders' => $orders
            ]);
        }
        // Default: customer dashboard
        return Inertia::render('Customer/Dashboard', [
            'orders' => \App\Models\Order::where('user_id', $user->id)
                ->with('products')
                ->latest()
                ->take(5)
                ->get(),
            'recentRecipes' => \App\Models\Recipe::with(['reviews', 'creator'])
                ->withAvg('reviews', 'rating')
                ->latest()
                ->take(3)
                ->get(),
        ]);
    })->name('dashboard');

    Route::get('/profile', function () {
        $user = Auth::user();
        if ($user->role === 'delivery') {
            return Inertia::render('Profile/DeliveryEdit', [
                'mustVerifyEmail' => $user instanceof \Illuminate\Contracts\Auth\MustVerifyEmail,
                'status' => session('status'),
            ]);
        }
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $user instanceof \Illuminate\Contracts\Auth\MustVerifyEmail,
            'status' => session('status'),
        ]);
    })->name('profile.edit');
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
        Route::get('/recipes/{recipe}', [RecipeController::class, 'adminShow'])->name('recipes.show');
        Route::put('/recipes/{recipe}', [RecipeController::class, 'update'])->name('recipes.update');
        Route::delete('/recipes/{recipe}', [RecipeController::class, 'destroy'])->name('recipes.destroy');

        // Recipe Approval Routes
        Route::post('/recipes/{recipe}/approve', [RecipeController::class, 'approve'])->name('recipes.approve');
        Route::post('/recipes/{recipe}/reject', [RecipeController::class, 'reject'])->name('recipes.reject');
        Route::post('/recipes/{recipe}/under-review', [RecipeController::class, 'setUnderReview'])->name('recipes.under-review');

        // Product Recognition Management (Admin)
        Route::get('/product-recognition', [ProductRecognitionController::class, 'index'])->name('product-recognition.index');
        Route::get('/product-recognition/{recognition}', [ProductRecognitionController::class, 'show'])->name('product-recognition.show');
        Route::delete('/product-recognition/{recognition}', [ProductRecognitionController::class, 'destroy'])->name('product-recognition.destroy');

        // Delivery Staff Management (Admin Only)
        Route::get('delivery-staff', [\App\Http\Controllers\Admin\DeliveryStaffController::class, 'index'])->name('delivery-staff.index');
        Route::post('delivery-staff', [\App\Http\Controllers\Admin\DeliveryStaffController::class, 'store'])->name('delivery-staff.store');
        Route::put('delivery-staff/{user}', [\App\Http\Controllers\Admin\DeliveryStaffController::class, 'update'])->name('delivery-staff.update');
        Route::delete('delivery-staff/{user}', [\App\Http\Controllers\Admin\DeliveryStaffController::class, 'destroy'])->name('delivery-staff.destroy');
        Route::post('delivery-staff/{user}/toggle-status', [\App\Http\Controllers\Admin\DeliveryStaffController::class, 'toggleStatus'])->name('delivery-staff.toggle-status');
        Route::post('delivery-staff/{user}/reset-password', [\App\Http\Controllers\Admin\DeliveryStaffController::class, 'resetPassword'])->name('delivery-staff.reset-password');
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

// Route to get a fresh CSRF token
Route::get('/csrf-token', function () {
    return response()->json(['token' => csrf_token()]);
});

// Delivery staff routes
Route::middleware(['auth', DeliveryMiddleware::class])->prefix('delivery')->name('delivery.')->group(function () {
    Route::get('/orders', [DeliveryOrderController::class, 'index'])->name('orders.index');
    Route::get('/orders/{order}', [DeliveryOrderController::class, 'show'])->name('orders.show');
    Route::post('/orders/{order}/accept', [DeliveryOrderController::class, 'accept'])->name('orders.accept');
    Route::post('/orders/{order}/delivered', [DeliveryOrderController::class, 'markDelivered'])->name('orders.delivered');
    Route::post('/orders/{order}/cancelled', [DeliveryOrderController::class, 'markCancelled'])->name('orders.cancelled');
    Route::post('/orders/lookup-qr', [DeliveryOrderController::class, 'lookupByQr'])->name('orders.lookup-qr');
    Route::post('/orders/{order}/settle-payment', [DeliveryOrderController::class, 'settlePayment'])->name('orders.settle-payment');
});

// Featured products routes
Route::middleware(['auth', 'admin'])->group(function () {
    Route::post('/products/{id}/feature', [ProductController::class, 'feature']);
    Route::delete('/products/{id}/feature', [ProductController::class, 'unfeature']);
});
Route::get('/featured-products', [ProductController::class, 'featuredProducts']);

require __DIR__ . '/auth.php';

// Include debug routes (only for development)
if (app()->environment('local')) {
    require __DIR__ . '/web-debug.php';
}
