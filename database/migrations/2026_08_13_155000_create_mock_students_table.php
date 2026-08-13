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
        Schema::create('mock_students', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mock_id')->constrained('mocks')->onDelete('cascade');
            $table->string('name');
            $table->string('code')->unique();
            $table->boolean('attended')->default(false);
            $table->string('phone')->nullable();
            $table->timestamps();
        });

        Schema::table('attempts', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->change();
            $table->foreignId('mock_student_id')->nullable()->after('mock_id')->constrained('mock_students')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('attempts', function (Blueprint $table) {
            $table->dropForeign(['mock_student_id']);
            $table->dropColumn('mock_student_id');
        });

        Schema::dropIfExists('mock_students');
    }
};
