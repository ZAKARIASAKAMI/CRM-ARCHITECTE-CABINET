<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('prospect_statuses', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);                  
            $table->string('code', 50)->unique();          
            $table->integer('sort_order')->default(0);     
            $table->boolean('is_won')->default(false);    
            $table->boolean('is_lost')->default(false);    
            $table->boolean('is_active')->default(true);   
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('prospect_statuses');
    }
};