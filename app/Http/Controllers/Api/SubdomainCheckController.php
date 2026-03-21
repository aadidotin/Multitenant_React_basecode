<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Stancl\Tenancy\Database\Models\Domain;

class SubdomainCheckController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $request->validate([
            'subdomain' => ['required', 'string', 'min:3', 'max:63'],
        ]);

        $centralDomain = config('tenancy.central_domain');
        $fullDomain    = $request->subdomain . '.' . $centralDomain;

        $reserved = config('tenancy.reserved_subdomains', [
            'www',
            'api',
            'admin',
            'mail',
            'ftp',
            'app',
            'static',
            'assets',
            'cdn',
            'dev',
            'staging',
        ]);

        $taken = in_array($request->subdomain, $reserved)
            || Domain::where('domain', $fullDomain)->exists();

        return response()->json(['available' => ! $taken]);
    }
}
