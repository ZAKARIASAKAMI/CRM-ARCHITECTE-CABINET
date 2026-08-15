<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('client_contacts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained('clients')->onDelete('cascade');
            $table->string('first_name', 100);
            $table->string('last_name', 100)->nullable();
            $table->string('position', 150)->nullable(); 
            $table->string('email', 190)->nullable();
            $table->string('phone', 30)->nullable();
            $table->boolean('is_primary')->default(false); 
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('client_contacts');
    }
};