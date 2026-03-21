<?php

use App\Http\Controllers\Admin\Subscription\SubscriptionPackageController;
use Illuminate\Support\Facades\Route;

Route::get('/', [SubscriptionPackageController::class, 'index'])->name('index');
Route::get('create', [SubscriptionPackageController::class, 'create'])->name('create');
Route::post('/', [SubscriptionPackageController::class, 'store'])->name('store');
Route::get('{subscription_package}', [SubscriptionPackageController::class, 'show'])->name('show');
Route::get('{subscription_package}/edit', [SubscriptionPackageController::class, 'edit'])->name('edit');
Route::put('{subscription_package}', [SubscriptionPackageController::class, 'update'])->name('update');
Route::delete('{subscription_package}', [SubscriptionPackageController::class, 'destroy'])->name('destroy');
