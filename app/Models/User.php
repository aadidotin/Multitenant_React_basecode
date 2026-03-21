<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Collection;

class User extends Authenticatable
{
    use Notifiable;

    // ── Status constants ──────────────────────────────────────────────────────

    const STATUS_PENDING  = 'pending';
    const STATUS_APPROVED = 'approved';
    const STATUS_REJECTED = 'rejected';
    const STATUS_BLOCKED  = 'blocked';

    const TYPE_AUTHENTICATED   = 'authenticated';
    const TYPE_SELF_REGISTERED = 'self_registered';

    // ── Mass assignment ───────────────────────────────────────────────────────

    protected $fillable = [
        'name',
        'email',
        'password',
        'status',
        'registration_type',
        'reviewed_by',
        'reviewed_at',
        'review_notes',
        'phone',
        'designation',
        'department',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'reviewed_at'       => 'datetime',
        'password'          => 'hashed',
    ];

    // ── Relationships ─────────────────────────────────────────────────────────

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'role_user')->withTimestamps();
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    // ── Scopes ────────────────────────────────────────────────────────────────

    public function scopePending(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    public function scopeApproved(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_APPROVED);
    }

    public function scopeActive(Builder $query): Builder
    {
        // Only approved users can access the application
        return $query->where('status', self::STATUS_APPROVED);
    }

    public function scopeSelfRegistered(Builder $query): Builder
    {
        return $query->where('registration_type', self::TYPE_SELF_REGISTERED);
    }

    // ── Status helpers ────────────────────────────────────────────────────────

    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    public function isApproved(): bool
    {
        return $this->status === self::STATUS_APPROVED;
    }

    public function isRejected(): bool
    {
        return $this->status === self::STATUS_REJECTED;
    }

    public function isBlocked(): bool
    {
        return $this->status === self::STATUS_BLOCKED;
    }

    public function isSelfRegistered(): bool
    {
        return $this->registration_type === self::TYPE_SELF_REGISTERED;
    }

    // ── Permission resolution ─────────────────────────────────────────────────

    /**
     * Get the user's merged permissions across all roles,
     * intersected with what the tenant's package allows.
     *
     * Returns: ['invoices' => ['create', 'read'], 'contacts' => ['read']]
     */
    public function resolvedPermissions(): array
    {
        // Admin bypass — system admin gets ALL tenant module actions
        if ($this->isAdmin()) {
            return TenantModule::asMap();
        }

        $merged = $this->roles()
            ->with('moduleActions')
            ->get()
            ->flatMap(fn($role) => $role->moduleActions)
            ->groupBy('module_slug')
            ->map(fn($items) => $items->pluck('action_key')->unique()->values()->toArray())
            ->toArray();

        $tenantModules = TenantModule::asMap();

        $resolved = [];
        foreach ($merged as $moduleSlug => $actions) {
            if (! isset($tenantModules[$moduleSlug])) {
                continue;
            }

            $allowed = array_intersect($actions, $tenantModules[$moduleSlug]);

            if (! empty($allowed)) {
                $resolved[$moduleSlug] = array_values($allowed);
            }
        }

        return $resolved;
    }

    /**
     * Check module + action permission explicitly.
     *
     * For Gate-style $user->can('invoices.create') support,
     * Gate::before() in AuthServiceProvider intercepts dot-notation
     * abilities and routes them here automatically.
     *
     * Usage:
     *   $user->canDo('invoices', 'create')         // direct
     *   $user->can('invoices.create')               // via Gate
     *   Gate::allows('invoices.create')             // via Gate
     *   $this->authorize('invoices.create')         // Controller — throws 403
     *   @can('invoices.create') ... @endcan         // Blade
     */
    public function canDo(string $moduleSlug, string $actionKey): bool
    {
        // Admin bypass
        if ($this->isAdmin()) {
            return TenantModule::canDo($moduleSlug, $actionKey);
        }

        // Fast path: check tenant ceiling first (avoids role query if module not in package)
        if (! TenantModule::canDo($moduleSlug, $actionKey)) {
            return false;
        }

        return $this->roles()
            ->whereHas(
                'moduleActions',
                fn($q) =>
                $q->where('module_slug', $moduleSlug)
                    ->where('action_key', $actionKey)
            )
            ->exists();
    }

    /**
     * Check if user has access to a module at all (any action).
     */
    public function hasModule(string $moduleSlug): bool
    {
        if (! TenantModule::hasModule($moduleSlug)) {
            return false;
        }

        return $this->roles()
            ->whereHas(
                'moduleActions',
                fn($q) =>
                $q->where('module_slug', $moduleSlug)
            )
            ->exists();
    }

    /**
     * Get sidebar-ready modules for this user.
     * Only modules where user has at least one action, ordered by module_group.
     */
    public function sidebarModules(): Collection
    {
        $permissions = $this->resolvedPermissions();

        return TenantModule::whereIn('module_slug', array_keys($permissions))
            ->orderBy('module_group')
            ->get()
            ->map(fn($module) => [
                'slug'    => $module->module_slug,
                'name'    => $module->module_name,
                'group'   => $module->module_group,
                'icon'    => $module->module_icon,
                'actions' => $permissions[$module->module_slug] ?? [],
            ]);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    public function isAdmin(): bool
    {
        return $this->roles()
            ->where('slug', 'admin')
            ->where('is_system', true)
            ->exists();
    }
}
