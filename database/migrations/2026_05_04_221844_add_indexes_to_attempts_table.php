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
        Schema::table('attempts', function (Blueprint $table) {
            $table->index(['user_id', 'finished_at']);
            $table->index(['mock_id', 'finished_at']);
            $table->index(['test_id', 'finished_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('attempts', function (Blueprint $table) {
            $table->dropIndex(['user_id', 'finished_at']);
            $table->dropIndex(['mock_id', 'finished_at']);
            $table->dropIndex(['test_id', 'finished_at']);
        });
    }
};
