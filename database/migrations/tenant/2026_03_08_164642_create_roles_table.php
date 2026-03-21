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
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('is_system')->default(false); // system roles can't be deleted
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        // ── Role → Module Action assignments ──────────────────────────────────
        Schema::create('role_module_actions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('role_id')->constrained()->cascadeOnDelete();
            $table->string('module_slug');   // references tenant_modules.module_slug
            $table->string('action_key');    // e.g. "create", "read", "update"
            $table->timestamps();

            $table->unique(['role_id', 'module_slug', 'action_key'], 'rma_unique');
        });

        // ── User → Role pivot ─────────────────────────────────────────────────
        Schema::create('role_user', function (Blueprint $table) {
            $table->foreignId('role_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->primary(['role_id', 'user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('role_user');
        Schema::dropIfExists('role_module_actions');
        Schema::dropIfExists('roles');
    }
};
