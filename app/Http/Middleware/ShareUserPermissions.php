<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class ShareUserPermissions
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (tenancy()->initialized() && auth()->check()) {
            $user = auth()->user();

            Inertia::share([
                'permissions'    => fn() => $user->resolvedPermissions(),
                'sidebarModules' => fn() => $user->sidebarModules(),
            ]);
        }

        return $next($request);
    }
}
