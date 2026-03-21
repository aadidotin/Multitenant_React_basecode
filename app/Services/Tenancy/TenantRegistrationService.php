<?php

namespace App\Services\Tenancy;

use App\Models\Central\Tenant;
use App\Notifications\Tenant\VerifyTenantEmail;
use App\Notifications\Tenant\TenantApproved;
use App\Notifications\Admin\NewTenantPendingApproval;
use App\Models\User;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;
use Stancl\Tenancy\Jobs\CreateDatabase;

class TenantRegistrationService
{
    public function __construct(
        private readonly ModuleProvisioningService $moduleProvisioning
    ) {}

    /**
     * Register a new tenant.
     * Creates the tenant record + subdomain, sends verification email.
     * Does NOT provision the database yet (happens after approval).
     */
    public function register(array $data): Tenant
    {
        return DB::transaction(function () use ($data) {
            $tenant = Tenant::create([
                'name'                       => $data['company_name'],
                'email'                      => $data['email'],
                'phone'                      => $data['phone'] ?? null,
                'address'                    => $data['address'] ?? null,
                'city'                       => $data['city'] ?? null,
                'country'                    => $data['country'] ?? null,
                'status'                     => Tenant::STATUS_PENDING_VERIFICATION,
                'email_verification_token'   => Tenant::generateVerificationToken(),
                'subscription_package_id'  => $data['subscription_package_id'],
            ]);

            // Create the subdomain
            $tenant->domains()->create([
                'domain'     => $data['subdomain'] . '.' . config('tenancy.central_domain'),
                'type'       => 'subdomain',
                'is_primary' => true,
            ]);

            // Send verification email
            $tenant->notify(new VerifyTenantEmail($tenant));

            return $tenant;
        });
    }

    /**
     * Verify tenant's email address.
     */
    public function verifyEmail(string $token): Tenant
    {
        $tenant = Tenant::where('email_verification_token', $token)
            ->where('status', Tenant::STATUS_PENDING_VERIFICATION)
            ->firstOrFail();

        $tenant->update([
            'status'                     => Tenant::STATUS_PENDING_APPROVAL,
            'email_verified_at'          => now(),
            'email_verification_token'   => null,
        ]);

        // Notify admins a new tenant is waiting approval
        $this->notifyAdmins($tenant);

        return $tenant;
    }

    /**
     * Admin approves tenant:
     * 1. Sets status to active + starts trial clock
     * 2. Provisions tenant database
     * 3. Syncs module permissions from chosen package into tenant DB
     * 4. Notifies tenant
     */
    public function approve(Tenant $tenant, ?User $approvedBy): Tenant
    {
        DB::transaction(function () use ($tenant, $approvedBy) {
            $tenant->update([
                'status'        => Tenant::STATUS_ACTIVE,
                'approved_at'   => now(),
                'approved_by'   => $approvedBy?->id,
                'trial_ends_at' => now()->addDays(config('tenancy.trial_days', 14)),
            ]);
        });

        try {
            CreateDatabase::dispatchSync($tenant);

            // tenants:migrate runs migrations
            Artisan::call('tenants:migrate', [
                '--tenants' => [$tenant->id],
                '--force'   => true,
            ]);

            Artisan::call('tenants:seed', [
                '--tenants' => [$tenant->id],
                '--class'   => 'TenantDatabaseSeeder',
                '--force'   => true,
            ]);

            // Sync module permissions into tenant DB
            $package = $tenant->subscriptionPackage;

            if ($package) {
                $this->moduleProvisioning->syncForPackage($tenant, $package);
            } else {
                Log::warning("Tenant {$tenant->id} approved with no package selected.");
            }
        } catch (\Throwable $e) {
            Log::error("Tenant provisioning failed for {$tenant->id}: " . $e->getMessage());
            throw $e;
        }

        // Notify the tenant they're approved
        $tenant->notify(new TenantApproved($tenant));

        return $tenant->fresh();
    }

    /**
     * Suspend a tenant and revoke all module access.
     */
    public function suspend(Tenant $tenant, string $reason = ''): Tenant
    {
        $tenant->update(['status' => Tenant::STATUS_SUSPENDED]);
        $this->moduleProvisioning->revokeAll($tenant);

        return $tenant;
    }

    /**
     * Resend verification email.
     */
    public function resendVerification(Tenant $tenant): void
    {
        abort_unless($tenant->isPendingVerification(), 422, 'Email already verified.');

        $tenant->update([
            'email_verification_token' => Tenant::generateVerificationToken(),
        ]);

        $tenant->notify(new VerifyTenantEmail($tenant));
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private function notifyAdmins(Tenant $tenant): void
    {
        $admins = User::where('is_admin', true)->get();
        Notification::send($admins, new NewTenantPendingApproval($tenant));
    }
}
