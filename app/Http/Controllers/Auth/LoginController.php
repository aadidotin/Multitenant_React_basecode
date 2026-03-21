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
 * Handles authentication for CENTRAL (platform admin) users.
 * Accessible at: example.com/portal/login
 */
class LoginController extends Controller
{
    public function __construct(
        private readonly AuthenticationService $authService
    ) {}

    public function create(): Response
    {
        return Inertia::render('admin/auth/Login');
    }

    public function store(LoginRequest $request): RedirectResponse
    {
        $user = $this->authService->attempt($request);

        // Ensure this is a central admin user
        abort_unless($user->is_admin, 403, 'Access denied.');

        Auth::login($user, $request->boolean('remember'));

        $request->session()->regenerate();

        return redirect()->intended(route('central.dashboard'));
    }

    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('central.login');
    }
}
