<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('recipes', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description');
            $table->json('ingredients');
            $table->json('instructions');
            $table->integer('cooking_time');
            $table->string('difficulty_level');
            $table->string('image_url')->nullable();
            $table->timestamps();
        });

        Schema::create('product_recipe', function (Blueprint $table) {
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->foreignId('recipe_id')->constrained()->onDelete('cascade');
            $table->decimal('quantity', 8, 2)->default(1);
            $table->string('unit')->default('piece');
            $table->primary(['product_id', 'recipe_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_recipe');
        Schema::dropIfExists('recipes');
    }
};