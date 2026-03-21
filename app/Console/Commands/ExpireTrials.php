<?php

namespace App\Console\Commands;

use App\Models\Central\Tenant;
use App\Notifications\Tenant\TrialExpired;
use Illuminate\Console\Command;

class ExpireTrials extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'tenants:expire-trials';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Mark expired trials and notify tenants';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        Tenant::query()
            ->where('status', Tenant::STATUS_ACTIVE)
            ->whereNotNull('trial_ends_at')
            ->whereNull('subscription_package_id')   // no paid plan yet
            ->where('trial_ends_at', '<=', now())
            ->each(function (Tenant $tenant) {
                $tenant->update(['status' => Tenant::STATUS_TRIAL_EXPIRED]);
                $tenant->notify(new TrialExpired($tenant));
                $this->info("Trial expired: {$tenant->id}");
            });
    }
}
