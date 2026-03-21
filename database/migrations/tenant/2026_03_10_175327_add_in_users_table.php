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
        Schema::table('users', function (Blueprint $table) {
            // ── Password reset OTP ────────────────────────────────────────────
            $table->string('password_reset_otp')->nullable()->after('password');
            $table->timestamp('password_reset_otp_expires_at')->nullable()->after('password_reset_otp');

            // ── 2FA — schema ready, feature comes later ───────────────────────
            $table->text('two_factor_secret')->nullable()->after('password_reset_otp_expires_at');
            $table->timestamp('two_factor_confirmed_at')->nullable()->after('two_factor_secret');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'password_reset_otp',
                'password_reset_otp_expires_at',
                'two_factor_secret',
                'two_factor_confirmed_at',
            ]);
        });
    }
};
