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
        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('borrower_id')->constrained('borrowers');
            $table->foreignId('template_id')->constrained('templates');
            $table->foreignId('period_id')->constrained('periods');
            $table->foreignId('created_by')->constrained('users');
            $table->enum('status', ['submitted', 'approved', 'rejected', 'done']);
            $table->timestamp('submitted_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reports');
    }
};
