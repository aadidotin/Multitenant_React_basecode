<?php

use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Support\Facades\Route;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        // web: __DIR__ . '/../routes/web.php',
        // api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
        using: function () {
            $centralDomain = config('tenancy.central_domain');

            // Route::middleware(['web'])->domain($centralDomain)->group(base_path('routes/web.php'));
            Route::middleware(['web'])->group(base_path('routes/web.php'));
            Route::middleware(['api'])->group(base_path('routes/api.php'));

            Route::middleware(['web', 'tenant'])->group(base_path('routes/tenant.php'));
        }
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->validateCsrfTokens(except: [
            '*',
        ]);

        $middleware->group('tenant', [
            \Stancl\Tenancy\Middleware\InitializeTenancyByDomain::class,
            \Stancl\Tenancy\Middleware\PreventAccessFromCentralDomains::class,
        ]);

        $middleware->alias([
            'central-only' => \App\Http\Middleware\PreventAccessFromTenantDomains::class,
            'tenant-active' => \App\Http\Middleware\EnsureTenantIsActive::class,
            'trial-status' => \App\Http\Middleware\ShareTrialStatus::class,
        ]);

        $middleware->web(append: [
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
