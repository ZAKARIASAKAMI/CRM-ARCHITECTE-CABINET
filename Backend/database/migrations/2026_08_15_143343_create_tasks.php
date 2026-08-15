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
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->nullable()->constrained('projects')->onDelete('cascade');
            $table->foreignId('parent_task_id')->nullable()->constrained('tasks')->onDelete('cascade');
            $table->foreignId('status_id')->nullable()->constrained('task_statuses')->onDelete('set null');
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('assigned_to')->nullable()->constrained('users')->onDelete('set null');
            $table->string('title', 190);
            $table->longText('description')->nullable();
            $table->string('priority', 20)->default('medium'); 
            $table->date('start_date')->nullable();
            $table->dateTime('due_date')->nullable();
            $table->dateTime('completed_at')->nullable();
            $table->decimal('estimated_hours', 8, 2)->nullable()->default(0.00);
            $table->decimal('spent_hours', 8, 2)->nullable()->default(0.00);
            $table->unsignedTinyInteger('progress_percentage')->default(0); // 0 to 100
            $table->integer('sort_order')->default(0);
            $table->timestamps();
            $table->softDeletes(); // deleted_at (Soft Delete)
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};