<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Skip this migration as unit_type is already added in the create_products_table migration
        if (Schema::hasColumn('products', 'unit_type')) {
            return;
        }

        Schema::table('products', function (Blueprint $table) {
            if (Schema::hasColumn('products', 'category')) {
                $table->string('unit_type')->default('piece')->after('category'); // 'weight' or 'piece'
            } else {
                $table->string('unit_type')->default('piece');
            }
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('unit_type');
        });
    }
};
