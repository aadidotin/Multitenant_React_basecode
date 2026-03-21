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
        Schema::create('subscription_packages', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2)->default(0);
            $table->string('billing_cycle')->default('monthly'); // monthly, yearly, lifetime
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
            $table->softDeletes();
        });

        // Pivot: which actions are allowed per package
        Schema::create('subscription_package_module_action', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('subscription_package_id');
            $table->unsignedBigInteger('module_action_id');
            $table->timestamps();

            $table->foreign('subscription_package_id', 'spma_package_id_foreign')
                ->references('id')->on('subscription_packages')
                ->cascadeOnDelete();

            $table->foreign('module_action_id', 'spma_action_id_foreign')
                ->references('id')->on('module_actions')
                ->cascadeOnDelete();

            $table->unique(
                ['subscription_package_id', 'module_action_id'],
                'pkg_action_unique'
            );
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscription_packages');
        Schema::dropIfExists('subscription_package_module_action');
    }
};
