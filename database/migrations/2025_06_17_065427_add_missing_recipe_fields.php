<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('recipes', function (Blueprint $table) {
            // Check if columns don't exist before adding them
            if (!Schema::hasColumn('recipes', 'created_by')) {
                $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('cascade');
            }
            if (!Schema::hasColumn('recipes', 'status')) {
                $table->enum('status', ['draft', 'submitted', 'under_review', 'approved', 'rejected'])->default('approved');
            }
            if (!Schema::hasColumn('recipes', 'category')) {
                $table->string('category')->nullable();
            }
            if (!Schema::hasColumn('recipes', 'approved_by')) {
                $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            }
            if (!Schema::hasColumn('recipes', 'approved_at')) {
                $table->timestamp('approved_at')->nullable();
            }
            if (!Schema::hasColumn('recipes', 'rejection_reason')) {
                $table->text('rejection_reason')->nullable();
            }
        });

        // Add indexes if they don't exist
        try {
            Schema::table('recipes', function (Blueprint $table) {
                $table->index(['status', 'created_at']);
                $table->index(['created_by', 'status']);
                $table->index('category');
            });
        } catch (\Exception $e) {
            // Indexes might already exist, ignore the error
        }

        // Update existing recipes to have approved status and set created_by to first admin
        $adminUser = DB::table('users')->where('role', 'admin')->first();
        if ($adminUser) {
            DB::table('recipes')
                ->whereNull('created_by')
                ->update([
                    'status' => 'approved',
                    'created_by' => $adminUser->id,
                    'approved_by' => $adminUser->id,
                    'approved_at' => now()
                ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('recipes', function (Blueprint $table) {
            // Drop indexes first
            try {
                $table->dropIndex(['status', 'created_at']);
                $table->dropIndex(['created_by', 'status']);
                $table->dropIndex(['category']);
            } catch (\Exception $e) {
                // Indexes might not exist, ignore the error
            }

            // Drop foreign keys and columns
            if (Schema::hasColumn('recipes', 'created_by')) {
                $table->dropForeign(['created_by']);
                $table->dropColumn('created_by');
            }
            if (Schema::hasColumn('recipes', 'approved_by')) {
                $table->dropForeign(['approved_by']);
                $table->dropColumn('approved_by');
            }
            if (Schema::hasColumn('recipes', 'status')) {
                $table->dropColumn('status');
            }
            if (Schema::hasColumn('recipes', 'category')) {
                $table->dropColumn('category');
            }
            if (Schema::hasColumn('recipes', 'approved_at')) {
                $table->dropColumn('approved_at');
            }
            if (Schema::hasColumn('recipes', 'rejection_reason')) {
                $table->dropColumn('rejection_reason');
            }
        });
    }
};
