<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_registration_settings', function (Blueprint $table) {
            $table->id();

            // Permanent token — the URL /register/users/{token} is always live.
            // Rotating the token is the mechanism to "disable" registrations.
            $table->string('registration_token')->unique();
            $table->timestamp('token_expires_at')->nullable();

            // Role auto-assigned when an application is approved
            $table->foreignId('default_role_id')->nullable()->constrained('roles')->nullOnDelete();

            // Notification preferences
            $table->boolean('notify_on_submission')->default(true);
            $table->boolean('notify_on_review')->default(true);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_registration_settings');
    }
};
