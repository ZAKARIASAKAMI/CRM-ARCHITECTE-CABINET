<?php

namespace Database\Migrations;

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('task_attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('task_id')->constrained('tasks')->onDelete('cascade');
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->onDelete('set null');
            $table->string('name', 190);
            $table->string('original_name', 255);
            $table->string('extension', 20)->nullable();
            $table->string('mime_type', 100)->nullable();
            $table->bigInteger('file_size')->unsigned()->default(0);
            $table->string('storage_disk', 50)->default('local');
            $table->string('storage_path', 500);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('task_attachments');
    }
};
