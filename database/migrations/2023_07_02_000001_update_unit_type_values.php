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
    }

    public function down(): void
    {
        // Revert back to 'weight' if needed
        Product::where('unit_type', 'kg')->update(['unit_type' => 'weight']);
    }
};
