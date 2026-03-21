<?php

namespace App\Http\Controllers\Tenancy;

use App\Http\Controllers\Controller;
use App\Models\Central\Tenant;
use App\Services\Tenancy\TenantRegistrationService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class TenantEmailVerificationController extends Controller
{
    public function __construct(
        private readonly TenantRegistrationService $registrationService
    ) {}

    public function verify(string $token): RedirectResponse
    {
        try {
            $tenant = $this->registrationService->verifyEmail($token);

            return redirect()
                ->route('tenant.verification.success')
                ->with('tenant_name', $tenant->name);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return redirect()
                ->route('tenant.verification.invalid');
        }
    }

    public function success(): Response
    {
        return Inertia::render('tenant/VerificationSuccess', [
            'tenant_name' => session('tenant_name'),
        ]);
    }

    public function invalid(): Response
    {
        return Inertia::render('tenant/VerificationInvalid');
    }

    public function resend(\Illuminate\Http\Request $request): RedirectResponse
    {
        $request->validate(['email' => ['required', 'email']]);

        $tenant = Tenant::where('email', $request->email)
            ->where('status', Tenant::STATUS_PENDING_VERIFICATION)
            ->firstOrFail();

        $this->registrationService->resendVerification($tenant);

        return back()->with('success', 'Verification email resent.');
    }
}
