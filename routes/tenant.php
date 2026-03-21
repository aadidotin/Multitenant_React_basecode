<?php

declare(strict_types=1);

use App\Http\Controllers\Auth\PasswordResetController;
use App\Http\Controllers\Auth\TenantLoginController;
use App\Http\Controllers\User\PublicUserRegistrationController;
use App\Http\Controllers\User\UserController;
use App\Http\Controllers\User\UserRegistrationSettingsController;
use Illuminate\Support\Facades\Route;

// ── Public: Unauthenticated user self-registration ────────────────────────────
// Token in the URL acts as the gate — 404 if disabled or token mismatch
Route::prefix('register/users')->name('tenant.users.public-register.')->group(function () {
    Route::get('/success/{token}', [PublicUserRegistrationController::class, 'success'])->name('success');
    Route::get('/{token}',         [PublicUserRegistrationController::class, 'show'])->name('show');
    Route::post('/{token}',        [PublicUserRegistrationController::class, 'store'])->name('store');
});

Route::middleware('guest')->group(function () {

    // Login
    Route::get('/login',  [TenantLoginController::class, 'create'])->name('tenant.login');
    Route::post('/login', [TenantLoginController::class, 'store'])->name('tenant.login.store');

    // Password reset — same OTP controller, tenant context auto-detected
    Route::get('/forgot-password',  [PasswordResetController::class, 'showForgotForm'])->name('tenant.password.forgot');
    Route::post('/forgot-password', [PasswordResetController::class, 'sendOtp'])->name('tenant.password.send-otp');

    Route::get('/verify-otp',  [PasswordResetController::class, 'showOtpForm'])->name('tenant.password.otp');
    Route::post('/verify-otp', [PasswordResetController::class, 'verifyOtp'])->name('tenant.password.verify-otp');

    Route::get('/reset-password',  [PasswordResetController::class, 'showResetForm'])->name('tenant.password.reset');
    Route::post('/reset-password', [PasswordResetController::class, 'resetPassword'])->name('tenant.password.update');
});

// ── Authenticated ─────────────────────────────────────────────────────────────
Route::middleware('auth')->group(function () {
    Route::post('/logout', [TenantLoginController::class, 'destroy'])->name('tenant.logout');
});

Route::middleware(['tenant-active', 'trial-status'])->group(function () {
    Route::inertia('/', 'dashboard/Dashboard')->name('tenant.dashboard');


    // ── Roles ─────────────────────────────────────────────────────────────
    Route::resource('roles', \App\Http\Controllers\Role\RoleController::class)->names([
        'index'   => 'tenant.roles.index',
        'create'  => 'tenant.roles.create',
        'store'   => 'tenant.roles.store',
        'show'    => 'tenant.roles.show',
        'edit'    => 'tenant.roles.edit',
        'update'  => 'tenant.roles.update',
        'destroy' => 'tenant.roles.destroy',
    ]);

    // ── Users ─────────────────────────────────────────────────────────────────
    // Settings routes MUST be defined before resource() to avoid {user} swallowing "settings"
    Route::prefix('users')->name('tenant.users.')->group(function () {
        Route::get('/settings',              [UserRegistrationSettingsController::class, 'show'])->name('settings');
        Route::put('/settings',              [UserRegistrationSettingsController::class, 'update'])->name('settings.update');
        Route::post('/settings/rotate-token', [UserRegistrationSettingsController::class, 'rotateToken'])->name('settings.rotate-token');

        // Review (approve / reject / block) — PATCH to single endpoint
        Route::patch('/{user}/review', [UserController::class, 'review'])->name('review');

        // Role sync
        Route::put('/{user}/roles', [UserController::class, 'syncRoles'])->name('roles.sync');
    });

    // // ── Users ─────────────────────────────────────────────────────────────
    // // Included here because user→role assignment lives alongside role management
    Route::resource('users', UserController::class)->names([
        'index'   => 'tenant.users.index',
        'create'  => 'tenant.users.create',
        'store'   => 'tenant.users.store',
        'show'    => 'tenant.users.show',
        'edit'    => 'tenant.users.edit',
        'update'  => 'tenant.users.update',
        'destroy' => 'tenant.users.destroy',
    ]);
});
