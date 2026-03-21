<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\TenantModule;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class TenantDatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Create the system Administrator role
        $adminRole = Role::create([
            'name'        => 'Administrator',
            'slug'        => 'admin',
            'description' => 'Full access to all permitted modules.',
            'is_active'   => true,
            'is_system'   => true,   // cannot be deleted by tenant
            'sort_order'  => 0,
        ]);

        // 2. Assign ALL tenant module actions to the admin role
        //    (tenant_modules is already populated by ModuleProvisioningService)
        $actions = TenantModule::all()->flatMap(function ($module) {
            return collect($module->allowed_actions)->map(fn($action) => [
                'module_slug' => $module->module_slug,
                'action_key'  => $action,
            ]);
        })->toArray();

        $adminRole->syncModuleActions($actions);

        // 3. Create the tenant owner user
        //    tenant() helper gives access to central tenant data
        $ownerPassword = Str::random(16);

        $owner = User::create([
            'name'                 => tenant('name'),
            'email'                => tenant('email'),
            'password'             => Hash::make($ownerPassword),
            'email_verified_at'    => now(),
        ]);

        // 4. Assign admin role to owner
        $owner->roles()->attach($adminRole->id);

        // Log the temporary password so admin can share it securely
        // In production, send this via the TenantApproved notification instead
        \Illuminate\Support\Facades\Log::info(
            "Tenant owner created for " . tenant('id'),
            ['email' => $owner->email, 'temp_password' => $ownerPassword]
        );
    }
}
