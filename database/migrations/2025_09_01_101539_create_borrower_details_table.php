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
        Schema::create('borrower_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('borrower_id')->constrained('borrowers');
            $table->string('borrower_group')->nullable();
            $table->string('purpose');
            $table->string('economic_sector');
            $table->string('business_field');
            $table->string('borrower_business');
            $table->integer('collectibility');
            $table->boolean('restructuring');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('borrower_details');
    }
};
