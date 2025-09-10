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
        Schema::create('report_summaries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('report_id')->constrained('reports');
            $table->enum('final_classification', ['safe', 'watchlist']);
            $table->integer('indicative_collectibility');
            $table->boolean('is_override')->default(false);
            $table->text('override_reason')->nullable();
            $table->foreignId('override_by')->nullable()->constrained('users');
            $table->text('business_notes')->nullable();
            $table->text('reviewer_notes')->nullable();
            $table->timestamps();

            $table->unique('report_id');
            $table->index(['final_classification', 'is_override']);
            $table->index(['is_override']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('report_summaries');
    }
};
