<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureTenantIsActive
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $tenant = tenant();

        if (! $tenant) {
            abort(404);
        }

        // Allow billing routes through even if expired/suspended
        // so tenant can actually subscribe
        if ($request->routeIs('billing.*')) {
            return $next($request);
        }

        if ($tenant->isTrialExpired()) {
            return redirect()->route('billing.index');
        }

        if ($tenant->isSuspended()) {
            return inertia('Tenancy/Suspended', [
                'tenant_name' => $tenant->name,
            ])->toResponse($request)->setStatusCode(403);
        }

        if ($tenant->status === 'cancelled') {
            return inertia('Tenancy/Cancelled')->toResponse($request)->setStatusCode(403);
        }

        return $next($request);
    }
}
