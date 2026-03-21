<?php

namespace App\Http\Controllers\Admin\Tenancy;

use App\Http\Controllers\Controller;
use App\Models\Central\Tenant;
use App\Services\Tenancy\TenantRegistrationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TenantManagementController extends Controller
{
    public function __construct(
        private readonly TenantRegistrationService $registrationService
    ) {}

    public function index(Request $request): Response
    {
        $tenants = Tenant::query()
            ->with(['domains' => fn($q) => $q->where('is_primary', true)])
            ->withCount([])
            ->when(
                $request->search,
                fn($q, $s) =>
                $q->where('name', 'like', "%{$s}%")
                    ->orWhere('email', 'like', "%{$s}%")
            )
            ->when($request->status, fn($q, $s) => $q->where('status', $s))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        $statusCounts = Tenant::query()
            ->selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        return Inertia::render('admin/tenant/TenantsIndex', [
            'tenants'      => $tenants,
            'statusCounts' => $statusCounts,
            'filters'      => $request->only(['search', 'status']),
        ]);
    }

    public function show(Tenant $tenant): Response
    {
        $tenant->load(['domains', 'subscriptionPackage', 'approvedBy']);

        return Inertia::render('admin/tenant/TenantShow', [
            'tenant' => $tenant,
        ]);
    }

    public function approve(Request $request, Tenant $tenant): RedirectResponse
    {
        abort_unless($tenant->isPendingApproval(), 422, 'Tenant is not pending approval.');

        $this->registrationService->approve($tenant, $request->user());

        return back()->with('success', "\"{$tenant->name}\" has been approved and their workspace is being set up.");
    }

    public function suspend(Request $request, Tenant $tenant): RedirectResponse
    {
        $request->validate(['reason' => ['nullable', 'string', 'max:500']]);

        $this->registrationService->suspend($tenant, $request->reason ?? '');

        return back()->with('success', "\"{$tenant->name}\" has been suspended.");
    }

    public function destroy(Tenant $tenant): RedirectResponse
    {
        // Soft delete — does not drop the tenant DB
        $tenant->delete();

        return redirect()
            ->route('central.tenants.index')
            ->with('success', "Tenant \"{$tenant->name}\" removed.");
    }
}
