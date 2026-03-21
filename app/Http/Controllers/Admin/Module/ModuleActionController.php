<?php

namespace App\Http\Controllers\Admin\Module;

use App\Http\Controllers\Controller;
use App\Http\Requests\Module\StoreModuleActionRequest;
use App\Http\Requests\Module\UpdateModuleActionRequest;
use App\Models\Central\Module;
use App\Models\Central\ModuleAction;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ModuleActionController extends Controller
{
    public function store(StoreModuleActionRequest $request, Module $module): RedirectResponse
    {
        $module->actions()->create($request->validated());

        return back()->with('success', 'Action added.');
    }

    public function update(UpdateModuleActionRequest $request, Module $module, ModuleAction $action): RedirectResponse
    {
        abort_if($action->module_id !== $module->id, 404);

        $action->update($request->validated());

        return back()->with('success', 'Action updated.');
    }

    public function destroy(Module $module, ModuleAction $action): RedirectResponse
    {
        abort_if($action->module_id !== $module->id, 404);

        $action->delete();

        return back()->with('success', 'Action removed.');
    }
}
