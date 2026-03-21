<?php

declare(strict_types=1);

use App\Http\Controllers\Auth\PasswordResetController;
use App\Http\Controllers\Auth\TenantLoginController;
use Illuminate\Support\Facades\Route;
use Stancl\Tenancy\Middleware\InitializeTenancyByDomain;
use Stancl\Tenancy\Middleware\PreventAccessFromCentralDomains;

/*
|--------------------------------------------------------------------------
| Tenant Routes
|--------------------------------------------------------------------------
|
| Here you can register the tenant routes for your application.
| These routes are loaded by the TenantRouteServiceProvider.
|
| Feel free to customize them however you want. Good luck!
|
*/

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

    // // ── Users ─────────────────────────────────────────────────────────────
    // // Included here because user→role assignment lives alongside role management
    // Route::resource('users', UserController::class)->names([
    //     'index'   => 'tenant.users.index',
    //     'create'  => 'tenant.users.create',
    //     'store'   => 'tenant.users.store',
    //     'show'    => 'tenant.users.show',
    //     'edit'    => 'tenant.users.edit',
    //     'update'  => 'tenant.users.update',
    //     'destroy' => 'tenant.users.destroy',
    // ]);

    // // Dedicated endpoint for assigning/syncing roles to a user
    // Route::put('users/{user}/roles', [UserController::class, 'syncRoles'])->name('tenant.users.roles.sync');
});
