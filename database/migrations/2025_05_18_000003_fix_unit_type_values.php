<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\Product;

return new class extends Migration
{
    public function up(): void
    {
        // Update all products with unit_type 'weight' to 'kg'
        Product::where('unit_type', 'weight')->update(['unit_type' => 'kg']);
        
        // Also update any null or empty unit_type values to 'piece' as default
        Product::whereNull('unit_type')->orWhere('unit_type', '')->update(['unit_type' => 'piece']);
    }

    public function down(): void
    {
        // No need to revert as this is a fix
    }
};
