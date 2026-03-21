<?php

use App\Http\Controllers\Api\Auth\AuthController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Auth Routes — Mobile / Desktop (NativePHP)
| All responses JSON. Sanctum token-based.
|--------------------------------------------------------------------------
*/

Route::get('api/check-subdomain', \App\Http\Controllers\Api\SubdomainCheckController::class)->middleware('central-only')->name('check-subdomain');

Route::prefix('auth')->middleware(['central-only'])->name('api.auth.')->group(function () {

    // ── Unauthenticated ───────────────────────────────────────────────────────

    // Step 1: Identify workspace context from subdomain
    // Called against central domain. App switches base_url after this.
    Route::post('/identify', [AuthController::class, 'identify'])
        ->middleware('throttle:10,1')
        ->name('identify');

    // Step 2: Login — called against the resolved base_url (tenant or central)
    Route::post('/login', [AuthController::class, 'login'])
        ->middleware('throttle:5,1')
        ->name('login');

    // Password reset — OTP flow
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])
        ->middleware('throttle:3,60')
        ->name('password.forgot');

    Route::post('/verify-otp', [AuthController::class, 'verifyOtp'])
        ->middleware('throttle:5,1')
        ->name('password.verify-otp');

    Route::post('/reset-password', [AuthController::class, 'resetPassword'])
        ->middleware('throttle:5,1')
        ->name('password.reset');

    // ── Authenticated (requires valid Sanctum token) ───────────────────────
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
    });
});
