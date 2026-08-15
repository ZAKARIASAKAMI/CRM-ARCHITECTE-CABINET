<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('prospects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('assigned_user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('source_id')->nullable()->constrained('prospect_sources')->onDelete('set null');
            $table->foreignId('status_id')->nullable()->constrained('prospect_statuses')->onDelete('set null');
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->enum('client_type', ['individual', 'company'])->default('individual');
            $table->string('company_name', 190)->nullable();
            $table->string('first_name', 100)->nullable();
            $table->string('last_name', 100)->nullable();
            $table->string('email', 190)->nullable();
            $table->string('phone', 30)->nullable();
            $table->string('city', 100)->nullable();
            $table->text('address')->nullable();
            $table->string('project_type', 150)->nullable();
            $table->decimal('estimated_budget', 15, 2)->nullable();
            $table->decimal('estimated_surface', 12, 2)->nullable();
            $table->longText('notes')->nullable();
            $table->text('lost_reason')->nullable();
            $table->dateTime('converted_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('prospects');
    }
};