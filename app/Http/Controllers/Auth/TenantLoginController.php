<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Services\Auth\AuthenticationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Handles authentication for TENANT users.
 * Accessible at: acme.example.com/login
 *
 * Tenant context is already initialized by InitializeTenancyByDomain
 * middleware before this controller runs, so Auth::attempt() automatically
 * queries the tenant's own database.
 */
class TenantLoginController extends Controller
{
    public function __construct(
        private readonly AuthenticationService $authService
    ) {}

    public function create(): Response
    {
        return Inertia::render('auth/Login', [
            'tenantName' => tenant('name'),
        ]);
    }

    public function store(LoginRequest $request): RedirectResponse
    {
        $user = $this->authService->attempt($request);

        Auth::login($user, $request->boolean('remember'));

        $request->session()->regenerate();

        return redirect()->intended(route('tenant.dashboard'));
    }

    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('tenant.login');
    }
}
