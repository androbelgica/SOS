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
        Schema::table('orders', function (Blueprint $table) {
            $table->unsignedBigInteger('assigned_to')->nullable()->after('user_id');
            $table->enum('delivery_status', ['for_delivery', 'out_for_delivery', 'delivered', 'cancelled'])->default('for_delivery')->after('status');
            $table->string('delivery_cancel_reason')->nullable()->after('delivery_status');
            $table->timestamp('delivered_at')->nullable()->after('delivery_cancel_reason');
            $table->timestamp('cancelled_at')->nullable()->after('delivered_at');

            $table->foreign('assigned_to')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['assigned_to']);
            $table->dropColumn(['assigned_to', 'delivery_status', 'delivery_cancel_reason', 'delivered_at', 'cancelled_at']);
        });
    }
};
