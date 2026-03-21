<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class UserRegistrationSettings extends Model
{
    protected $fillable = [
        'registration_token',
        'default_role_id',
        'notify_on_submission',
        'notify_on_review',
        'token_expires_at',
    ];

    protected $casts = [
        'notify_on_submission' => 'boolean',
        'notify_on_review'     => 'boolean',
        'token_expires_at'     => 'datetime',
    ];

    // ── Relationships ─────────────────────────────────────────────────────────

    public function defaultRole(): BelongsTo
    {
        return $this->belongsTo(Role::class, 'default_role_id');
    }

    // ── Static helpers ────────────────────────────────────────────────────────

    /**
     * Retrieve the single settings row, creating with defaults if absent.
     * There is always exactly one row per tenant.
     */
    public static function current(): static
    {
        return static::firstOrCreate([], [
            'registration_token'   => Str::random(32),
            'notify_on_submission' => true,
            'notify_on_review'     => true,
        ]);
    }

    // Add this helper
    public function isTokenExpired(): bool
    {
        return $this->token_expires_at !== null
            && $this->token_expires_at->isPast();
    }

    // Update rotateToken to accept optional expiry duration in days
    public function rotateToken(?int $expiresInDays = null): void
    {
        $this->update([
            'registration_token' => Str::random(32),
            'token_expires_at'   => $expiresInDays
                ? now()->addDays($expiresInDays)
                : null,
        ]);
    }

    /**
     * The public URL path for unauthenticated registration.
     */
    public function registrationPath(): string
    {
        return "/register/users/{$this->registration_token}";
    }
}
