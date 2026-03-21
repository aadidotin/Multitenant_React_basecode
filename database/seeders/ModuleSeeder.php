<?php

namespace Database\Seeders;

use App\Models\Central\Module;
use App\Models\Central\SubscriptionPackage;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ModuleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $modules = [
            ['group' => 'CRM',      'name' => 'Contacts',     'slug' => 'contacts',     'icon' => 'Users'],
            ['group' => 'CRM',      'name' => 'Leads',        'slug' => 'leads',        'icon' => 'TrendingUp'],
            ['group' => 'Billing',  'name' => 'Invoices',     'slug' => 'invoices',     'icon' => 'FileText'],
            ['group' => 'Billing',  'name' => 'Payments',     'slug' => 'payments',     'icon' => 'CreditCard'],
            ['group' => 'Reports',  'name' => 'Analytics',    'slug' => 'analytics',    'icon' => 'BarChart2'],
            ['group' => 'Settings', 'name' => 'Users',        'slug' => 'users',        'icon' => 'User'],
            ['group' => 'Settings', 'name' => 'Roles',        'slug' => 'roles',        'icon' => 'Shield'],
        ];

        $defaultActions = [
            ['name' => 'Create', 'key' => 'create', 'sort_order' => 1],
            ['name' => 'Read',   'key' => 'read',   'sort_order' => 2],
            ['name' => 'Update', 'key' => 'update', 'sort_order' => 3],
            ['name' => 'Delete', 'key' => 'delete', 'sort_order' => 4],
            ['name' => 'Export', 'key' => 'export', 'sort_order' => 5],
        ];

        foreach ($modules as $i => $data) {
            $module = Module::firstOrCreate(
                ['slug' => $data['slug']],
                [...$data, 'sort_order' => $i + 1, 'is_active' => true]
            );

            foreach ($defaultActions as $action) {
                $module->actions()->firstOrCreate(
                    ['key' => $action['key']],
                    $action
                );
            }
        }

        // ── Sample packages ──────────────────────────────────────────────────
        $packages = [
            ['name' => 'Starter',    'slug' => 'starter',    'price' => 29,  'billing_cycle' => 'monthly'],
            ['name' => 'Growth',     'slug' => 'growth',     'price' => 79,  'billing_cycle' => 'monthly'],
            ['name' => 'Enterprise', 'slug' => 'enterprise', 'price' => 199, 'billing_cycle' => 'monthly'],
        ];

        foreach ($packages as $i => $data) {
            SubscriptionPackage::firstOrCreate(
                ['slug' => $data['slug']],
                [...$data, 'sort_order' => $i + 1, 'is_active' => true]
            );
        }
    }
}
