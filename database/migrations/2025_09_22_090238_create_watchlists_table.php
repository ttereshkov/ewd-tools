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
        Schema::create('watchlists', function (Blueprint $table) {
            $table->id();
            $table->foreignId('borrower_id')->constrained('borrowers')->cascadeOnDelete();
            $table->foreignId('report_id')->nullable()->constrained('reports');
            $table->enum('status', ['active', 'resolved', 'archived'])->default('active');
            $table->foreignId('added_by')->constrained('users');
            $table->foreignId('resolved_by')->nullable()->constrained('users');
            $table->text('resolver_notes')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('watchlists');
    }
};
