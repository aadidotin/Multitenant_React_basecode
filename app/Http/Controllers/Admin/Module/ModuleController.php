<?php

namespace App\Http\Controllers\Admin\Module;

use App\Http\Controllers\Controller;
use App\Http\Requests\Module\StoreModuleRequest;
use App\Http\Requests\Module\UpdateModuleRequest;
use App\Models\Central\Module;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ModuleController extends Controller
{
    public function index(Request $request): Response
    {
        $modules = Module::query()
            ->withCount('actions')
            ->when(
                $request->search,
                fn($q, $s) =>
                $q->where('name', 'like', "%{$s}%")
                    ->orWhere('group', 'like', "%{$s}%")
            )
            ->when($request->group, fn($q, $g) => $q->where('group', $g))
            ->ordered()
            ->paginate(15)
            ->withQueryString();

        $groups = Module::query()
            ->distinct()
            ->orderBy('group')
            ->pluck('group')
            ->filter()
            ->values();

        return Inertia::render('admin/module/ModuleIndex', [
            'modules' => $modules,
            'groups'  => $groups,
            'filters' => $request->only(['search', 'group']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/module/ModuleForm');
    }

    public function store(StoreModuleRequest $request): RedirectResponse
    {
        $module = Module::create($request->validated());

        // Seed default CRUD actions
        $defaults = [
            ['name' => 'Create', 'key' => 'create', 'sort_order' => 1],
            ['name' => 'Read',   'key' => 'read',   'sort_order' => 2],
            ['name' => 'Update', 'key' => 'update',  'sort_order' => 3],
            ['name' => 'Delete', 'key' => 'delete',  'sort_order' => 4],
        ];

        if ($request->boolean('seed_default_actions', true)) {
            $module->actions()->createMany($defaults);
        }

        return redirect()
            ->route('central.modules.index')
            ->with('success', "Module \"{$module->name}\" created.");
    }

    public function show(Module $module): Response
    {
        $module->load(['actions' => fn($q) => $q->orderBy('sort_order')]);

        return Inertia::render('admin/module/ModuleShow', compact('module'));
    }

    public function edit(Module $module): Response
    {
        $module->load(['actions' => fn($q) => $q->orderBy('sort_order')]);

        return Inertia::render('admin/module/ModuleForm', compact('module'));
    }

    public function update(UpdateModuleRequest $request, Module $module): RedirectResponse
    {
        $module->update($request->validated());

        return redirect()
            ->route('central.modules.index')
            ->with('success', "Module \"{$module->name}\" updated.");
    }

    public function destroy(Module $module): RedirectResponse
    {
        $module->delete();

        return redirect()
            ->route('central.modules.index')
            ->with('success', "Module \"{$module->name}\" deleted.");
    }
}
