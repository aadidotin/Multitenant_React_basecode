<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RoleModuleAction extends Model
{
    protected $fillable = [
        'role_id',
        'module_slug',
        'action_key',
    ];

    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    /**
     * Resolve the TenantModule this action belongs to.
     */
    public function tenantModule(): ?TenantModule
    {
        return TenantModule::where('module_slug', $this->module_slug)->first();
    }
}
