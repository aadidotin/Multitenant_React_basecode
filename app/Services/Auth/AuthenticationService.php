<?php

namespace App\Services\Auth;

use App\Models\User;
use App\Notifications\Auth\PasswordResetOtp;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthenticationService
{
    // ── Login ─────────────────────────────────────────────────────────────────

    /**
     * Attempt to authenticate a user.
     * Throws ValidationException on failure (rate limit or bad credentials).
     *
     * @throws ValidationException
     */
    public function attempt(Request $request, string $guard = 'web'): User
    {
        $this->checkRateLimit($request);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            RateLimiter::hit($this->rateLimitKey($request));

            throw ValidationException::withMessages([
                'email' => __('auth.failed'),
            ]);
        }

        RateLimiter::clear($this->rateLimitKey($request));

        return $user;
    }

    // ── OTP Password Reset ────────────────────────────────────────────────────

    /**
     * Generate a 6-digit OTP, hash it, store it, send via email.
     * Silently succeeds even if email not found (prevents user enumeration).
     */
    public function sendPasswordResetOtp(string $email): void
    {
        $user = User::where('email', $email)->first();

        if (! $user) {
            return; // silent — don't reveal if email exists
        }

        $otp = $this->generateOtp();

        $user->update([
            'password_reset_otp'            => Hash::make($otp),
            'password_reset_otp_expires_at' => now()->addMinutes(15),
        ]);

        $user->notify(new PasswordResetOtp($otp));
    }

    /**
     * Verify the OTP.
     * Returns a signed reset token on success.
     *
     * @throws ValidationException
     */
    public function verifyOtp(string $email, string $otp): string
    {
        $user = User::where('email', $email)->first();

        if (
            ! $user
            || ! $user->password_reset_otp
            || ! Hash::check($otp, $user->password_reset_otp)
            || now()->isAfter($user->password_reset_otp_expires_at)
        ) {
            throw ValidationException::withMessages([
                'otp' => 'The OTP is invalid or has expired.',
            ]);
        }

        // Invalidate OTP immediately after successful verification
        $user->update([
            'password_reset_otp'            => null,
            'password_reset_otp_expires_at' => null,
        ]);

        // Return a short-lived signed token the client uses for the reset step
        return $this->generateResetToken($user);
    }

    /**
     * Reset the user's password using the signed reset token.
     *
     * @throws ValidationException
     */
    public function resetPassword(string $token, string $password): User
    {
        $userId = $this->validateResetToken($token);

        $user = User::findOrFail($userId);

        $user->update([
            'password'                      => Hash::make($password),
            'password_reset_otp'            => null,
            'password_reset_otp_expires_at' => null,
        ]);

        // Invalidate all existing sessions and Sanctum tokens
        $user->tokens()->delete();

        return $user;
    }

    // ── Rate limiting ─────────────────────────────────────────────────────────

    /**
     * @throws ValidationException
     */
    private function checkRateLimit(Request $request): void
    {
        $key = $this->rateLimitKey($request);

        if (! RateLimiter::tooManyAttempts($key, 5)) {
            return;
        }

        event(new Lockout($request));

        $seconds = RateLimiter::availableIn($key);

        throw ValidationException::withMessages([
            'email' => __('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ]),
        ]);
    }

    private function rateLimitKey(Request $request): string
    {
        return Str::transliterate(
            Str::lower($request->email) . '|' . $request->ip()
        );
    }

    // ── Reset token helpers ───────────────────────────────────────────────────

    /**
     * Generate a short-lived signed reset token (valid 30 minutes).
     * Stored in cache — not in DB — to avoid extra columns.
     */
    private function generateResetToken(User $user): string
    {
        $token = Str::random(64);

        cache()->put(
            "password_reset_token:{$token}",
            $user->id,
            now()->addMinutes(30)
        );

        return $token;
    }

    /**
     * @throws ValidationException
     */
    private function validateResetToken(string $token): int
    {
        $userId = cache()->pull("password_reset_token:{$token}");

        if (! $userId) {
            throw ValidationException::withMessages([
                'token' => 'This password reset link is invalid or has expired.',
            ]);
        }

        return $userId;
    }

    // ── OTP generation ────────────────────────────────────────────────────────

    private function generateOtp(): string
    {
        return str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    }
}
