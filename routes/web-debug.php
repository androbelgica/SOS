<?php

use Illuminate\Support\Facades\Route;
use App\Models\Product;

Route::get('/debug/products', function () {
    $products = Product::all(['id', 'name', 'unit_type']);
    return response()->json($products);
});

Route::get('/debug/product/mussel', function () {
    $product = Product::where('name', 'like', '%mussel%')->first(['id', 'name', 'unit_type']);
    return response()->json($product);
});
