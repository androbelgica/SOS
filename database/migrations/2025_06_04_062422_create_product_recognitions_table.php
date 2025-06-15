<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('product_recognitions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('image_path');
            $table->json('detected_labels')->nullable();
            $table->json('detected_objects')->nullable();
            $table->json('detected_text')->nullable();
            $table->boolean('seafood_detected')->default(false);
            $table->json('suggested_products')->nullable();
            $table->decimal('confidence_score', 5, 2)->nullable();
            $table->boolean('is_mock_data')->default(false);
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_recognitions');
    }
};
