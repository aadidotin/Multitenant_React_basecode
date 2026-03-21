<?php

use App\Http\Controllers\Admin\Module\ModuleActionController;
use App\Http\Controllers\Admin\Module\ModuleController;
use Illuminate\Support\Facades\Route;

// ── Modules ───────────────────────────────────────────────────────────────
Route::get('/', [ModuleController::class, 'index'])->name('index');
Route::post('/', [ModuleController::class, 'store'])->name('store');
Route::get('create', [ModuleController::class, 'create'])->name('create');
Route::get('{module}', [ModuleController::class, 'show'])->name('show');
Route::get('{module}/edit', [ModuleController::class, 'edit'])->name('edit');
Route::put('{module}', [ModuleController::class, 'update'])->name('update');
Route::delete('{module}', [ModuleController::class, 'destroy'])->name('destroy');

// ── Module Actions (nested) ───────────────────────────────────────────────
Route::prefix('{module}/actions')
    ->name('actions.')
    ->group(function () {
        Route::post('/', [ModuleActionController::class, 'store'])->name('store');
        Route::put('/{action}', [ModuleActionController::class, 'update'])->name('update');
        Route::delete('/{action}', [ModuleActionController::class, 'destroy'])->name('destroy');
    });
