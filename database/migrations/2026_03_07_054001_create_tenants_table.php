<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTenantsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up(): void
    {
        Schema::create('tenants', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('name');                   // Company / organisation name
            $table->string('email')->unique();        // Primary contact email
            $table->string('phone')->nullable();
            $table->string('address')->nullable();
            $table->string('city')->nullable();
            $table->string('country')->nullable();

            // Trial / package
            $table->foreignId('subscription_package_id')->nullable()->constrained();
            $table->timestamp('trial_ends_at')->nullable();

            // Lifecycle
            $table->enum('status', [
                'pending_verification',   // just registered, email not verified
                'pending_approval',       // email verified, waiting admin approval
                'active',                 // approved and operational
                'trial_expired',          // trial period expired
                'suspended',              // manually suspended
                'cancelled',              // churned
            ])->default('pending_verification');

            $table->string('email_verification_token')->nullable()->index();
            $table->timestamp('email_verified_at')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users');

            $table->json('data')->nullable();         // stancl/tenancy extra data column
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down(): void
    {
        Schema::dropIfExists('tenants');
    }
}
