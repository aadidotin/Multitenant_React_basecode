<?php

namespace App\Services\Tenancy;

use App\Models\Central\SubscriptionPackage;
use App\Models\Central\Tenant;
use App\Models\TenantModule;
use Illuminate\Support\Facades\Log;

/**
 * ModuleProvisioningService
 *
 * Responsible for syncing a subscription package's allowed module actions
 * into the tenant's own database (tenant_modules table).
 *
 * Called:
 *  - On admin approval (initial provisioning)
 *  - On package upgrade/downgrade
 */
class ModuleProvisioningService
{
    /**
     * Sync the package's module permissions into the tenant's database.
     * Completely replaces existing tenant_modules rows.
     */
    public function syncForPackage(Tenant $tenant, SubscriptionPackage $package): void
    {
        // Build the module map from central DB
        // Groups actions by module, loading all needed relations in one query
        $moduleMap = $package->moduleActions()
            ->with('module')
            ->get()
            ->groupBy(fn($action) => $action->module->slug)
            ->map(fn($actions) => [
                'module_slug'    => $actions->first()->module->slug,
                'module_name'    => $actions->first()->module->name,
                'module_group'   => $actions->first()->module->group,
                'module_icon'    => $actions->first()->module->icon,
                'allowed_actions' => $actions->pluck('key')->values()->toArray(),
            ])
            ->values()
            ->toArray();

        // Run inside tenant context — writes to TENANT database
        $tenant->run(function () use ($moduleMap) {
            // Wipe and re-sync — clean slate approach
            TenantModule::truncate();

            foreach ($moduleMap as $row) {
                TenantModule::create($row);
            }
        });

        Log::info("Modules synced for tenant {$tenant->id} with package {$package->slug}", [
            'module_count' => count($moduleMap),
        ]);
    }

    /**
     * Upgrade or downgrade a tenant to a new package.
     * Updates central DB record and re-syncs tenant modules.
     */
    public function changePackage(Tenant $tenant, SubscriptionPackage $newPackage): void
    {
        // Update central DB
        $tenant->update(['subscription_package_id' => $newPackage->id]);

        // Re-sync tenant DB
        $this->syncForPackage($tenant, $newPackage);
    }

    /**
     * Clear all module access — used on suspension/cancellation.
     */
    public function revokeAll(Tenant $tenant): void
    {
        $tenant->run(function () {
            TenantModule::truncate();
        });
    }
}
