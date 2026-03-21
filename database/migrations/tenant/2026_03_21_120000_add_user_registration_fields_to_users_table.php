<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Registration status lifecycle:
            // pending  → submitted, awaiting review (unauthenticated flow)
            // approved → active, can log in
            // rejected → declined by reviewer
            // blocked  → permanently banned
            $table->enum('status', ['pending', 'approved', 'rejected', 'blocked'])
                ->default('approved')     // authenticated registrations are auto-approved
                ->after('email');

            // Which flow created this user
            $table->enum('registration_type', ['authenticated', 'self_registered'])
                ->default('authenticated')
                ->after('status');

            // Optional: who approved/rejected/blocked and when
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete()->after('registration_type');
            $table->timestamp('reviewed_at')->nullable()->after('reviewed_by');

            // Reviewer notes (rejection reason, block reason, etc.)
            $table->text('review_notes')->nullable()->after('reviewed_at');

            // Additional profile fields typically collected at registration
            $table->string('phone')->nullable()->after('review_notes');
            $table->string('designation')->nullable()->after('phone');
            $table->string('department')->nullable()->after('designation');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['reviewed_by']);
            $table->dropColumn([
                'status',
                'registration_type',
                'reviewed_by',
                'reviewed_at',
                'review_notes',
                'phone',
                'designation',
                'department',
            ]);
        });
    }
};
