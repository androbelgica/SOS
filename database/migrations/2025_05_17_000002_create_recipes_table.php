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
            $table->string('video_url')->nullable();

            // User-generated content fields
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->enum('status', ['draft', 'submitted', 'under_review', 'approved', 'rejected'])->default('draft');
            $table->string('category')->nullable(); // seafood type category
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('approved_at')->nullable();
            $table->text('rejection_reason')->nullable();

            $table->timestamps();

            // Add indexes for better performance
            $table->index(['status', 'created_at']);
            $table->index(['created_by', 'status']);
            $table->index('category');
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