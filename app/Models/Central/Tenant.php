<?php

namespace App\Models\Central;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;
use Stancl\Tenancy\Contracts\TenantWithDatabase;
use Stancl\Tenancy\Database\Concerns\HasDatabase;
use Stancl\Tenancy\Database\Concerns\HasDomains;
use Stancl\Tenancy\Database\Models\Tenant as BaseTenant;

class Tenant extends BaseTenant implements TenantWithDatabase
{
    use HasDatabase, HasDomains, SoftDeletes, Notifiable;

    // ── Status constants ──────────────────────────────────────────────────────

    const STATUS_PENDING_VERIFICATION = 'pending_verification';
    const STATUS_PENDING_APPROVAL     = 'pending_approval';
    const STATUS_ACTIVE               = 'active';
    const STATUS_TRIAL_EXPIRED        = 'trial_expired';
    const STATUS_SUSPENDED            = 'suspended';
    const STATUS_CANCELLED            = 'cancelled';

    protected $casts = [
        'trial_ends_at'       => 'datetime',
        'email_verified_at'   => 'datetime',
        'approved_at'         => 'datetime',
        'data'                => 'array',
    ];

    // stancl/tenancy requires declaring custom columns
    public static function getCustomColumns(): array
    {
        return [
            'id',
            'name',
            'email',
            'phone',
            'address',
            'city',
            'country',
            'subscription_package_id',
            'trial_ends_at',
            'status',
            'email_verification_token',
            'email_verified_at',
            'approved_at',
            'approved_by',
        ];
    }

    // ── Relationships ─────────────────────────────────────────────────────────

    public function subscriptionPackage(): BelongsTo
    {
        return $this->belongsTo(SubscriptionPackage::class);
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    // ── Status helpers ────────────────────────────────────────────────────────

    public function isPendingVerification(): bool
    {
        return $this->status === self::STATUS_PENDING_VERIFICATION;
    }

    public function isPendingApproval(): bool
    {
        return $this->status === self::STATUS_PENDING_APPROVAL;
    }

    public function isActive(): bool
    {
        return $this->status === self::STATUS_ACTIVE;
    }

    public function isTrialExpired(): bool
    {
        return $this->status === self::STATUS_TRIAL_EXPIRED;
    }

    public function isSuspended(): bool
    {
        return $this->status === self::STATUS_SUSPENDED;
    }

    public function isOnTrial(): bool
    {
        return $this->trial_ends_at !== null && $this->trial_ends_at->isFuture();
    }

    // ── Domain helpers ────────────────────────────────────────────────────────

    public function getPrimaryDomain(): ?string
    {
        return $this->domains()->where('is_primary', true)->value('domain');
    }

    // ── Token generation ──────────────────────────────────────────────────────

    public static function generateVerificationToken(): string
    {
        return Str::random(64);
    }
}
