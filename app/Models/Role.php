<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Role extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'is_active',
        'is_system',
        'sort_order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_system' => 'boolean',
    ];

    // ── Boot ──────────────────────────────────────────────────────────────────

    protected static function booted(): void
    {
        static::creating(function (self $model) {
            if (empty($model->slug)) {
                $model->slug = Str::slug($model->name);
            }
        });
    }

    // ── Relationships ─────────────────────────────────────────────────────────

    public function moduleActions(): HasMany
    {
        return $this->hasMany(RoleModuleAction::class);
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(
            \App\Models\User::class,
            'role_user'
        )->withTimestamps();
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /**
     * Sync module actions for this role.
     * Accepts: [['module_slug' => 'invoices', 'action_key' => 'create'], ...]
     */
    public function syncModuleActions(array $actions): void
    {
        // Delete all existing and re-insert — cleaner than diffing
        $this->moduleActions()->delete();

        if (empty($actions)) {
            return;
        }

        $now  = now();
        $rows = array_map(fn ($a) => [
            'role_id'     => $this->id,
            'module_slug' => $a['module_slug'],
            'action_key'  => $a['action_key'],
            'created_at'  => $now,
            'updated_at'  => $now,
        ], $actions);

        RoleModuleAction::insert($rows);
    }

    /**
     * Returns permission map for this role:
     * ['invoices' => ['create', 'read'], 'contacts' => ['read']]
     */
    public function permissionsMap(): array
    {
        return $this->moduleActions()
            ->get()
            ->groupBy('module_slug')
            ->map(fn ($items) => $items->pluck('action_key')->values()->toArray())
            ->toArray();
    }

    // ── Scopes ────────────────────────────────────────────────────────────────

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('name');
    }
}
