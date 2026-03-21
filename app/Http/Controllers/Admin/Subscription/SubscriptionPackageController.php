<?php

namespace App\Http\Controllers\Admin\Subscription;

use App\Http\Controllers\Controller;
use App\Http\Requests\Subscription\StoreSubscriptionPackageRequest;
use App\Http\Requests\Subscription\UpdateSubscriptionPackageRequest;
use App\Models\Central\Module;
use App\Models\Central\SubscriptionPackage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SubscriptionPackageController extends Controller
{
    public function index(Request $request): Response
    {
        $packages = SubscriptionPackage::query()
            ->withCount('moduleActions')
            ->when(
                $request->search,
                fn($q, $s) =>
                $q->where('name', 'like', "%{$s}%")
            )
            ->ordered()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/subscription/SubscriptionIndex', [
            'packages' => $packages,
            'filters'  => $request->only(['search']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/subscription/SubscriptionForm', [
            'modules' => $this->modulesWithActions(),
        ]);
    }

    public function store(StoreSubscriptionPackageRequest $request): RedirectResponse
    {
        $package = SubscriptionPackage::create(
            $request->safe()->except('action_ids')
        );

        $package->syncAllowedActions($request->input('action_ids', []));

        return redirect()
            ->route('central.subscription-packages.index')
            ->with('success', "Package \"{$package->name}\" created.");
    }

    public function show(SubscriptionPackage $subscriptionPackage): Response
    {
        $subscriptionPackage->load([
            'moduleActions.module',
        ]);

        return Inertia::render('admin/subscription/SubscriptionShow', [
            'package' => $subscriptionPackage,
            'modules' => $this->modulesWithActions(),
            'allowedActionIds' => $subscriptionPackage->moduleActions->pluck('id'),
        ]);
    }

    public function edit(SubscriptionPackage $subscriptionPackage): Response
    {
        return Inertia::render('admin/subscription/SubscriptionForm', [
            'package'          => $subscriptionPackage,
            'modules'          => $this->modulesWithActions(),
            'allowedActionIds' => $subscriptionPackage->moduleActions()->pluck('module_action_id'),
        ]);
    }

    public function update(
        UpdateSubscriptionPackageRequest $request,
        SubscriptionPackage $subscriptionPackage
    ): RedirectResponse {
        $subscriptionPackage->update(
            $request->safe()->except('action_ids')
        );

        $subscriptionPackage->syncAllowedActions($request->input('action_ids', []));

        return redirect()
            ->route('central.subscription-packages.index')
            ->with('success', "Package \"{$subscriptionPackage->name}\" updated.");
    }

    public function destroy(SubscriptionPackage $subscriptionPackage): RedirectResponse
    {
        $subscriptionPackage->delete();

        return redirect()
            ->route('central.subscription-packages.index')
            ->with('success', "Package \"{$subscriptionPackage->name}\" deleted.");
    }

    // ─── Private Helpers ──────────────────────────────────────────────────────

    private function modulesWithActions()
    {
        return Module::query()
            ->active()
            ->ordered()
            ->with(['actions' => fn($q) => $q->active()->orderBy('sort_order')])
            ->get();
    }
}
