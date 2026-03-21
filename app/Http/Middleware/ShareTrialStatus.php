<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class ShareTrialStatus
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $tenant = tenant();

        if ($tenant && $tenant->isActive() && $tenant->isOnTrial()) {
            $daysLeft = (int) now()->diffInDays($tenant->trial_ends_at, false);

            Inertia::share('trial', [
                'is_on_trial'  => true,
                'days_left'    => max(0, $daysLeft),
                'ends_at'      => $tenant->trial_ends_at,
                'show_warning' => $daysLeft <= 3,
            ]);
        } else {
            Inertia::share('trial', null);
        }

        return $next($request);
    }
}
