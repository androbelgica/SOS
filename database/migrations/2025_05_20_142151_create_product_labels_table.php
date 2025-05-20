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
        Schema::create('product_labels', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->string('qr_code_path')->nullable();
            $table->string('label_path')->nullable();
            $table->boolean('is_printed')->default(false);
            $table->timestamps();

            // Add a composite foreign key to reference order_items table
            $table->unique(['order_id', 'product_id']);
            $table->foreign(['order_id', 'product_id'])
                ->references(['order_id', 'product_id'])
                ->on('order_items')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_labels');
    }
};
