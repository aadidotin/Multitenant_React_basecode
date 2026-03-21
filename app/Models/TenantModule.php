<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * This model reads from the TENANT database.
 * It is only used within tenant context (after tenancy()->initialize()).
 */
class TenantModule extends Model
{
    protected $fillable = [
        'module_slug',
        'module_name',
        'module_group',
        'module_icon',
        'allowed_actions',
    ];

    protected $casts = [
        'allowed_actions' => 'array',
    ];

    // ── Static helpers ────────────────────────────────────────────────────────

    /**
     * Check if a specific action is allowed on a module.
     *
     * Usage: TenantModule::canDo('invoices', 'create')
     */
    public static function canDo(string $moduleSlug, string $action): bool
    {
        $module = static::where('module_slug', $moduleSlug)->first();

        if (! $module) {
            return false;
        }

        return in_array($action, $module->allowed_actions ?? [], true);
    }

    /**
     * Check if a module exists at all for this tenant.
     *
     * Usage: TenantModule::hasModule('invoices')
     */
    public static function hasModule(string $moduleSlug): bool
    {
        return static::where('module_slug', $moduleSlug)->exists();
    }

    /**
     * Get all allowed actions for a module.
     *
     * Usage: TenantModule::actionsFor('invoices') → ['create', 'read']
     */
    public static function actionsFor(string $moduleSlug): array
    {
        return static::where('module_slug', $moduleSlug)
            ->value('allowed_actions') ?? [];
    }

    /**
     * Get all modules as a flat map.
     * Useful for sharing with frontend via Inertia.
     *
     * Returns: ['invoices' => ['create','read'], 'contacts' => ['read']]
     */
    public static function asMap(): array
    {
        return static::all()
            ->keyBy('module_slug')
            ->map(fn($m) => $m->allowed_actions)
            ->toArray();
    }

    // ── Scopes ────────────────────────────────────────────────────────────────

    public function scopeForGroup($query, string $group)
    {
        return $query->where('module_group', $group);
    }
}
