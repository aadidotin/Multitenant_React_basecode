<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class PreventAccessFromTenantDomains
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $centralDomain = config('tenancy.central_domain');
        $currentHost    = $request->getHost();

        // Block if request is coming from a tenant subdomain
        if ($currentHost === $centralDomain) {
            return $next($request); // is central, allow through
        }

        abort(404); // is a tenant domain, block central routes
    }
}
