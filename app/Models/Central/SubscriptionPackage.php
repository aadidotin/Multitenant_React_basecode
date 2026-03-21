<?php

namespace App\Models\Central;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class SubscriptionPackage extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'price',
        'billing_cycle',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'is_active'  => 'boolean',
        'price'      => 'decimal:2',
    ];

    // ─── Boot ────────────────────────────────────────────────────────────────

    protected static function booted(): void
    {
        static::creating(function (self $model) {
            if (empty($model->slug)) {
                $model->slug = Str::slug($model->name);
            }
        });
    }

    // ─── Relationships ────────────────────────────────────────────────────────

    /**
     * All actions (across all modules) allowed for this package.
     */
    public function moduleActions(): BelongsToMany
    {
        return $this->belongsToMany(
            ModuleAction::class,
            'subscription_package_module_action'
        )->withTimestamps();
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    /**
     * Returns a nested structure: module → actions allowed.
     * Useful for permission checks at runtime.
     *
     * @return \Illuminate\Support\Collection
     */
    public function allowedModulesMap(): \Illuminate\Support\Collection
    {
        return $this->moduleActions()
            ->with('module')
            ->get()
            ->groupBy(fn($action) => $action->module->slug)
            ->map(fn($actions) => $actions->pluck('key'));
    }

    /**
     * Sync allowed actions for this package.
     * Replaces the entire pivot with the given action IDs.
     */
    public function syncAllowedActions(array $actionIds): void
    {
        $this->moduleActions()->sync($actionIds);
    }

    // ─── Scopes ───────────────────────────────────────────────────────────────

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('name');
    }
}
