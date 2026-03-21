<?php

namespace App\Http\Controllers\Role;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\TenantModule;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RoleController extends Controller
{
    public function index(): Response
    {
        $roles = Role::withCount('users')
            ->ordered()
            ->get();

        return Inertia::render('role/RolesIndex', [
            'roles' => $roles,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('role/RoleForm', [
            'modules' => $this->modulesWithActions(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name'        => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:300'],
            'is_active'   => ['boolean'],
            'actions'     => ['array'],
            'actions.*'   => ['array'],
            'actions.*.module_slug' => ['required', 'string'],
            'actions.*.action_key'  => ['required', 'string'],
        ]);

        $role = Role::create([
            'name'        => $data['name'],
            'description' => $data['description'] ?? null,
            'is_active'   => $data['is_active'] ?? true,
            'is_system'   => false,
        ]);

        $role->syncModuleActions($data['actions'] ?? []);

        return redirect()
            ->route('tenant.roles.index')
            ->with('success', "Role \"{$role->name}\" created.");
    }

    public function edit(Role $role): Response
    {
        abort_if($role->is_system && ! auth()->user()->isAdmin(), 403);

        $role->load('moduleActions');

        return Inertia::render('role/RoleForm', [
            'role'    => $role,
            'modules' => $this->modulesWithActions(),
            'assignedActions' => $role->moduleActions
                ->map(fn($a) => [
                    'module_slug' => $a->module_slug,
                    'action_key'  => $a->action_key,
                ]),
        ]);
    }

    public function update(Request $request, Role $role): RedirectResponse
    {
        // System roles: only permissions can be changed, not name/slug
        if ($role->is_system) {
            $data = $request->validate([
                'actions'               => ['array'],
                'actions.*.module_slug' => ['required', 'string'],
                'actions.*.action_key'  => ['required', 'string'],
            ]);
            $role->syncModuleActions($data['actions'] ?? []);
        } else {
            $data = $request->validate([
                'name'                  => ['required', 'string', 'max:100'],
                'description'           => ['nullable', 'string', 'max:300'],
                'is_active'             => ['boolean'],
                'actions'               => ['array'],
                'actions.*.module_slug' => ['required', 'string'],
                'actions.*.action_key'  => ['required', 'string'],
            ]);
            $role->update([
                'name'        => $data['name'],
                'description' => $data['description'] ?? null,
                'is_active'   => $data['is_active'] ?? true,
            ]);
            $role->syncModuleActions($data['actions'] ?? []);
        }

        return redirect()
            ->route('tenant.roles.index')
            ->with('success', "Role \"{$role->name}\" updated.");
    }

    public function destroy(Role $role): RedirectResponse
    {
        abort_if($role->is_system, 403, 'System roles cannot be deleted.');

        $role->delete();

        return redirect()
            ->route('tenant.roles.index')
            ->with('success', "Role \"{$role->name}\" deleted.");
    }

    // ── Private ───────────────────────────────────────────────────────────────

    /**
     * Returns tenant modules with their allowed actions
     * (scoped to what the package permits — not all system actions).
     */
    private function modulesWithActions(): array
    {
        return TenantModule::orderBy('module_group')
            ->get()
            ->map(fn($m) => [
                'slug'    => $m->module_slug,
                'name'    => $m->module_name,
                'group'   => $m->module_group,
                'icon'    => $m->module_icon,
                'actions' => $m->allowed_actions,
            ])
            ->toArray();
    }
}
