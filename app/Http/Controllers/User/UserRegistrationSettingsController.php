<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\UpdateRegistrationSettingsRequest;
use App\Models\Role;
use App\Services\User\UserRegistrationSettingsService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserRegistrationSettingsController extends Controller
{
    public function __construct(
        private readonly UserRegistrationSettingsService $settingsService
    ) {}

    public function show(): Response
    {
        $settings = $this->settingsService->getSettings();

        return Inertia::render('user/UserRegistrationSettings', [
            'settings'        => $settings,
            'roles'           => Role::active()->ordered()->get(['id', 'name', 'slug']),
            'registrationUrl' => request()->getSchemeAndHttpHost() . $settings->registrationPath(),
            'isExpired'       => $settings->isTokenExpired(),
        ]);
    }

    public function update(UpdateRegistrationSettingsRequest $request): RedirectResponse
    {
        $this->settingsService->update($request->validated());

        return back()->with('success', 'Registration settings updated.');
    }

    public function rotateToken(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'expires_in_days' => ['nullable', 'integer', 'min:1', 'max:365'],
        ]);

        $this->settingsService->rotateToken($data['expires_in_days'] ?? null);

        return back()->with('success', 'Registration link rotated.');
    }
}
