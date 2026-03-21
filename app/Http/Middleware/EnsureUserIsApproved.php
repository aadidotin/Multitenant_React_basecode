<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * Ensures only approved users can access authenticated tenant routes.
 *
 * - pending  → force logout + redirect to login with message
 * - rejected → force logout + redirect to login with message
 * - blocked  → force logout + redirect to login with message
 *
 * This runs after 'auth' middleware. Order matters in bootstrap/app.php.
 */
class EnsureUserIsApproved
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();

        if (! $user) {
            return $next($request);
        }

        if ($user->isApproved()) {
            return $next($request);
        }

        // Log out the user so they can't stay authenticated with a bad status
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        $message = match ($user->status) {
            'pending'  => 'Your account is pending approval. You will be notified by email once reviewed.',
            'rejected' => 'Your account application was not approved. Please contact the workspace administrator.',
            'blocked'  => 'Your account has been suspended. Please contact the workspace administrator.',
            default    => 'Your account is not active.',
        };

        return redirect()
            ->route('tenant.login')
            ->withErrors(['email' => $message]);
    }
}
