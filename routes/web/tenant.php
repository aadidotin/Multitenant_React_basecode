<?php


// ── Admin: Tenant Management ──────────────────────────────────────────────────

use App\Http\Controllers\Admin\Tenancy\TenantManagementController;
use Illuminate\Support\Facades\Route;

// Route::middleware(['auth', 'verified'])->group(function () {
Route::get('/', [TenantManagementController::class, 'index'])->name('index');
Route::get('/{tenant}', [TenantManagementController::class, 'show'])->name('show');
Route::post('/{tenant}/approve', [TenantManagementController::class, 'approve'])->name('approve');
Route::post('/{tenant}/suspend', [TenantManagementController::class, 'suspend'])->name('suspend');
Route::delete('/{tenant}', [TenantManagementController::class, 'destroy'])->name('destroy');
// });
