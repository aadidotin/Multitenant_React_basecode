<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Http\Requests\Auth\VerifyOtpRequest;
use App\Services\Auth\AuthenticationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * 3-step OTP password reset flow.
 * Used by both central (/portal/forgot-password) and
 * tenant (acme.example.com/forgot-password) routes.
 */
class PasswordResetController extends Controller
{
    public function __construct(
        private readonly AuthenticationService $authService
    ) {}

    // ── Step 1: Enter email ───────────────────────────────────────────────────

    public function showForgotForm(): Response
    {
        return Inertia::render('auth/ForgotPassword');
    }

    public function sendOtp(ForgotPasswordRequest $request): RedirectResponse
    {
        // Rate limit: 3 attempts per email per hour
        $key = 'otp:' . $request->email;

        if (RateLimiter::tooManyAttempts($key, 3)) {
            $seconds = RateLimiter::availableIn($key);
            throw ValidationException::withMessages([
                'email' => "Too many attempts. Please try again in {$seconds} seconds.",
            ]);
        }

        RateLimiter::hit($key, 3600);

        $this->authService->sendPasswordResetOtp($request->email);

        // Always redirect to OTP step — even if email not found (prevents enumeration)
        return redirect()
            ->route($this->otpRoute())
            ->with('email', $request->email);
    }

    // ── Step 2: Enter OTP ─────────────────────────────────────────────────────

    public function showOtpForm(): Response
    {
        return Inertia::render('auth/VerifyOtp', [
            'email' => session('email'),
        ]);
    }

    public function verifyOtp(VerifyOtpRequest $request): RedirectResponse
    {
        $token = $this->authService->verifyOtp($request->email, $request->otp);

        return redirect()
            ->route($this->resetRoute())
            ->with(['token' => $token, 'email' => $request->email]);
    }

    // ── Step 3: New password ──────────────────────────────────────────────────

    public function showResetForm(): Response
    {
        return Inertia::render('auth/ResetPassword', [
            'token' => session('token'),
            'email' => session('email'),
        ]);
    }

    public function resetPassword(ResetPasswordRequest $request): RedirectResponse
    {
        $this->authService->resetPassword($request->token, $request->password);

        return redirect()
            ->route($this->loginRoute())
            ->with('success', 'Password reset successfully. Please sign in.');
    }

    // ── Route helpers (works for both central + tenant contexts) ──────────────

    private function isTenantContext(): bool
    {
        return tenancy()->initialized();
    }

    private function otpRoute(): string
    {
        return $this->isTenantContext() ? 'tenant.password.otp' : 'central.password.otp';
    }

    private function resetRoute(): string
    {
        return $this->isTenantContext() ? 'tenant.password.reset' : 'central.password.reset';
    }

    private function loginRoute(): string
    {
        return $this->isTenantContext() ? 'tenant.login' : 'central.login';
    }
}
