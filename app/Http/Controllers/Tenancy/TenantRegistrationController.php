<?php

namespace App\Http\Controllers\Tenancy;

use App\Http\Controllers\Controller;
use App\Http\Requests\Tenancy\TenantRegistrationRequest;
use App\Models\Central\SubscriptionPackage;
use App\Services\Tenancy\TenantRegistrationService;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class TenantRegistrationController extends Controller
{
    public function __construct(
        private readonly TenantRegistrationService $registrationService
    ) {}

    public function create(): Response
    {
        $packages = SubscriptionPackage::query()
            ->active()
            ->ordered()
            ->with(['moduleActions.module'])
            ->get()
            ->map(fn($pkg) => [
                'id'            => $pkg->id,
                'name'          => $pkg->name,
                'slug'          => $pkg->slug,
                'description'   => $pkg->description,
                'price'         => $pkg->price,
                'billing_cycle' => $pkg->billing_cycle,
                'modules'       => $pkg->moduleActions
                    ->groupBy(fn($a) => $a->module->name)
                    ->map(fn($actions) => $actions->pluck('name')->values())
                    ->toArray(),
            ]);

        return Inertia::render('tenant/TenantRegister', [
            'packages' => $packages,
        ]);
    }

    public function store(TenantRegistrationRequest $request): RedirectResponse
    {
        $this->registrationService->register($request->validated());

        return redirect()
            ->route('tenant.registration.success')
            ->with('email', $request->email);
    }

    public function success(): Response
    {
        return Inertia::render('tenant/RegisterSuccess', [
            'email' => session('email'),
        ]);
    }
}
