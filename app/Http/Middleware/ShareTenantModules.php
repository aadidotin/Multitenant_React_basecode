<?php

namespace App\Http\Middleware;

use App\Models\TenantModule;
use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class ShareTenantModules
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (tenancy()->initialized()) {
            Inertia::share('modules', fn () => TenantModule::asMap());
        }

        return $next($request);
    }
}
