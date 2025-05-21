<?php

use Illuminate\Support\Facades\Route;
use App\Models\Product;
use App\Http\Controllers\FileBrowserController;

Route::get('/debug/products', function () {
    $products = Product::all(['id', 'name', 'unit_type']);
    return response()->json($products);
});

Route::get('/debug/product/mussel', function () {
    $product = Product::where('name', 'like', '%mussel%')->first(['id', 'name', 'unit_type']);
    return response()->json($product);
});

// Debug route for testing the file browser API without authentication
Route::get('/debug/files/{type}/images', [FileBrowserController::class, 'listImages'])
    ->where('type', 'products|recipes')
    ->name('debug.files.images');

// Debug route to check storage paths
Route::get('/debug/storage-paths', function () {
    $paths = [
        'storage_path' => storage_path(),
        'public_path' => public_path(),
        'app_public_path' => storage_path('app/public'),
        'app_public_public_path' => storage_path('app/public/public'),
        'products_path' => storage_path('app/public/products'),
        'public_products_path' => storage_path('app/public/public/products'),
    ];

    $exists = [];
    foreach ($paths as $key => $path) {
        $exists[$key] = [
            'path' => $path,
            'exists' => file_exists($path),
            'is_dir' => is_dir($path),
            'is_readable' => is_readable($path),
        ];

        if (is_dir($path)) {
            $exists[$key]['contents'] = scandir($path);
        }
    }

    return response()->json($exists);
});
