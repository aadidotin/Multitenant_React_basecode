<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\IdentifyRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\VerifyOtpRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Models\Domain;
use App\Services\Auth\AuthenticationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;

/**
 * Handles ALL authentication for mobile/desktop (NativePHP).
 * All responses are JSON. Uses Sanctum tokens.
 *
 * Flow:
 *  1. POST /api/auth/identify  { subdomain? }
 *     → returns context type + base_url for app to switch to
 *
 *  2. POST /api/auth/login     { email, password, remember? }
 *     → called against the base_url from step 1
 *     → returns Sanctum token + user data
 *
 *  3. POST /api/auth/logout
 *     → revokes current token
 */
class AuthController extends Controller
{
    public function __construct(
        private readonly AuthenticationService $authService
    ) {}

    // ── Step 1: Identify ──────────────────────────────────────────────────────

    /**
     * Identify the login context from a subdomain.
     *
     * Returns:
     *  { type: "tenant", name: "Acme Corp", base_url: "https://acme.example.com" }
     *  { type: "central", base_url: "https://example.com/portal" }
     */
    public function identify(IdentifyRequest $request): JsonResponse
    {
        // Rate limit: 10 attempts per IP per minute
        $key = 'identify:' . $request->ip();

        if (RateLimiter::tooManyAttempts($key, 10)) {
            return response()->json([
                'message' => 'Too many attempts. Please try again later.',
            ], 429);
        }

        RateLimiter::hit($key, 60);

        $subdomain = trim((string) $request->subdomain);

        // Blank subdomain → central admin context
        if ($subdomain === '') {
            return response()->json([
                'type'     => 'central',
                'name'     => config('app.name'),
                'base_url' => config('app.url') . '/portal',
            ]);
        }

        // Look up tenant by subdomain
        $centralDomain = config('tenancy.central_domain');
        $domain        = \Stancl\Tenancy\Database\Models\Domain::where(
            'domain',
            "{$subdomain}.{$centralDomain}"
        )->first();

        if (! $domain) {
            return response()->json([
                'message' => 'No workspace found for this subdomain.',
            ], 404);
        }

        $tenant = $domain->tenant;

        if (! in_array($tenant->status, ['active', 'trial'], true)) {
            return response()->json([
                'message' => 'This workspace is currently inactive.',
            ], 403);
        }

        return response()->json([
            'type'     => 'tenant',
            'name'     => $tenant->name,
            'base_url' => "https://{$domain->domain}",
        ]);
    }

    // ── Step 2: Login ─────────────────────────────────────────────────────────

    /**
     * Authenticate and issue a Sanctum token.
     * Called against the base_url resolved in the identify step.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $user = $this->authService->attempt($request);

        // Token name: identifies the device/platform
        $tokenName = $request->header('X-Device-Name', 'mobile');

        // remember = long-lived token (30 days), else 24 hours
        $expiry = $request->boolean('remember')
            ? now()->addDays(30)
            : now()->addHours(24);

        $token = $user->createToken($tokenName, ['*'], $expiry);

        return response()->json([
            'token'      => $token->plainTextToken,
            'token_type' => 'Bearer',
            'expires_at' => $expiry->toIso8601String(),
            'user'       => [
                'id'                   => $user->id,
                'name'                 => $user->name,
                'email'                => $user->email,
            ],
        ]);
    }

    // ── Logout ────────────────────────────────────────────────────────────────

    /**
     * Revoke the current token.
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully.']);
    }

    // ── Password Reset ────────────────────────────────────────────────────────

    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        $key = 'otp:' . $request->email;

        if (RateLimiter::tooManyAttempts($key, 3)) {
            return response()->json([
                'message' => 'Too many attempts. Please try again later.',
            ], 429);
        }

        RateLimiter::hit($key, 3600);

        $this->authService->sendPasswordResetOtp($request->email);

        return response()->json([
            'message' => 'If this email exists, a reset code has been sent.',
        ]);
    }

    public function verifyOtp(VerifyOtpRequest $request): JsonResponse
    {
        $token = $this->authService->verifyOtp($request->email, $request->otp);

        return response()->json([
            'reset_token' => $token,
            'message'     => 'OTP verified. Use the reset_token to set a new password.',
        ]);
    }

    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $this->authService->resetPassword($request->token, $request->password);

        return response()->json([
            'message' => 'Password reset successfully. Please log in.',
        ]);
    }
}
