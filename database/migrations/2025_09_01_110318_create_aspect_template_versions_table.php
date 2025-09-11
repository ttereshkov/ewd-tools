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
        Schema::create('aspect_template_versions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('template_version_id')->constrained()->cascadeOnDelete();
            $table->foreignId('aspect_version_id')->constrained()->cascadeOnDelete();
            $table->integer('weight');
            $table->timestamps();

            $table->unique(['template_version_id', 'aspect_version_id'],'template_aspect_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('aspect_template_versions');
    }
};
