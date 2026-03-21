<?php

namespace App\Services\Module;

use App\Models\Central\SubscriptionPackage;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;

/**
 * ModulePermissionService
 *
 * Provides fast, cached access to the allowed actions map for a
 * subscription package. Suitable for middleware, policies, and gate checks.
 *
 * Usage:
 *   $service = app(ModulePermissionService::class);
 *   $service->can($package, 'invoices', 'create');   // bool
 *   $service->allowedActionsFor($package);            // Collection
 */
class ModulePermissionService
{
    private const CACHE_TTL = 300; // 5 minutes

    /**
     * Check if a specific module action is allowed.
     */
    public function can(
        SubscriptionPackage $package,
        string $moduleSlug,
        string $actionKey
    ): bool {
        $map = $this->allowedActionsFor($package);

        return $map->has($moduleSlug) && $map->get($moduleSlug)->contains($actionKey);
    }

    /**
     * Returns a map of: module_slug => Collection<action_key>
     *
     * @return Collection<string, Collection<string>>
     */
    public function allowedActionsFor(SubscriptionPackage $package): Collection
    {
        $cacheKey = "pkg_permissions:{$package->id}";

        return Cache::remember($cacheKey, self::CACHE_TTL, function () use ($package) {
            return $package->allowedModulesMap();
        });
    }

    /**
     * Flush the cache for a given package (call after sync).
     */
    public function invalidate(SubscriptionPackage $package): void
    {
        Cache::forget("pkg_permissions:{$package->id}");
    }
}
