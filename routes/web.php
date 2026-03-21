<?php

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\PasswordResetController;
use App\Http\Controllers\Tenancy\TenantEmailVerificationController;
use App\Http\Controllers\Tenancy\TenantRegistrationController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->middleware(['central-only'])->name('central.home');

Route::prefix('portal')->middleware(['central-only'])->name('central.')->group(function () {

    Route::middleware('guest')->group(function () {
        // Login
        Route::get('/login',  [LoginController::class, 'create'])->name('login');
        Route::post('/login', [LoginController::class, 'store']);

        // Password reset — 3-step OTP flow
        Route::get('/forgot-password',  [PasswordResetController::class, 'showForgotForm'])->name('password.forgot');
        Route::post('/forgot-password', [PasswordResetController::class, 'sendOtp'])->name('password.send-otp');

        Route::get('/verify-otp',  [PasswordResetController::class, 'showOtpForm'])->name('password.otp');
        Route::post('/verify-otp', [PasswordResetController::class, 'verifyOtp'])->name('password.verify-otp');

        Route::get('/reset-password',  [PasswordResetController::class, 'showResetForm'])->name('password.reset');
        Route::post('/reset-password', [PasswordResetController::class, 'resetPassword'])->name('password.update');
    });

    // ── Authenticated ─────────────────────────────────────────────────────────
    Route::middleware('auth')->group(function () {
        Route::post('/logout', [LoginController::class, 'destroy'])->name('logout');

        // Route::get('/dashboard', fn() => inertia('Admin/Dashboard'))->name('dashboard');

        // ... all other admin routes
    });

    Route::inertia('/', 'admin/dashboard/Dashboard')->name('dashboard');
    Route::inertia('/profile', 'profile/ProfilePage')->name('profile-page');
    Route::inertia('/chat', 'chat/ChatModule')->name('chat-page');

    // Module Routes
    // ->middleware(['auth', 'verified'])
    Route::prefix('modules')->name('modules.')->group(base_path('/routes/web/module.php'));

    // Subscription Routes
    Route::prefix('subscription-packages')->name('subscription-packages.')->group(base_path('/routes/web/subscription.php'));

    // Tenant Management Routes (admin)
    Route::prefix('tenants')->name('tenants.')->group(base_path('/routes/web/tenant.php'));
});


// ── Public: Tenant Registration ───────────────────────────────────────────────
Route::middleware('guest')->group(function () {
    Route::get('/register', [TenantRegistrationController::class, 'create'])->name('tenant.register');

    Route::post('/register', [TenantRegistrationController::class, 'store'])->name('tenant.register.store');

    Route::get('/register/success', [TenantRegistrationController::class, 'success'])->name('tenant.registration.success');
});

// ── Public: Email Verification ────────────────────────────────────────────────

Route::get('/verify-email/success', [TenantEmailVerificationController::class, 'success'])->name('tenant.verification.success');

Route::get('/verify-email/invalid', [TenantEmailVerificationController::class, 'invalid'])->name('tenant.verification.invalid');

Route::post('/verify-email/resend', [TenantEmailVerificationController::class, 'resend'])->name('tenant.verification.resend')
    ->middleware('throttle:3,1');

Route::get('/verify-email/{token}', [TenantEmailVerificationController::class, 'verify'])->name('tenant.email.verify');
