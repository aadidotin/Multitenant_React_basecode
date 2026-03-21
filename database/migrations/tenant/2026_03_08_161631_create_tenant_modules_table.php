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
        Schema::create('tenant_modules', function (Blueprint $table) {
            $table->id();
            $table->string('module_slug')->unique();   // e.g. "invoices"
            $table->string('module_name');             // e.g. "Invoices"
            $table->string('module_group')->nullable(); // e.g. "Billing"
            $table->string('module_icon')->nullable(); // e.g. "FileText"
            $table->json('allowed_actions');           // e.g. ["create","read","update"]
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tenant_modules');
    }
};
