<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\SelfRegisterUserRequest;
use App\Models\UserRegistrationSettings;
use App\Services\User\UserService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PublicUserRegistrationController extends Controller
{
    public function __construct(private readonly UserService $userService) {}

    /**
     * Show the public registration form.
     * GET /register/users/{token}
     *
     * 404 if the token doesn't match any settings row —
     * that's the only gate now (no enable/disable toggle).
     */
    public function show(string $token): Response
    {
        $this->resolveSettings($token);

        return Inertia::render('user/PublicRegistrationForm', [
            'token'      => $token,
            'tenantName' => config('app.name'),
        ]);
    }

    /**
     * Handle the public registration form submission.
     * POST /register/users/{token}
     */
    public function store(SelfRegisterUserRequest $request, string $token): RedirectResponse
    {
        $settings = $this->resolveSettings($token);

        $user = $this->userService->selfRegister($request->validated(), $settings);

        return redirect()
            ->route('tenant.users.public-register.success', ['token' => $token])
            ->with('userName', $user->name);
    }

    /**
     * Thank-you / pending review page.
     * GET /register/users/success/{token}
     */
    public function success(string $token): Response
    {
        $this->resolveSettings($token);

        return Inertia::render('user/PublicRegistrationSuccess', [
            'tenantName' => config('app.name'),
            'userName'   => session('userName', ''),
        ]);
    }

    // ── Private ───────────────────────────────────────────────────────────────

    private function resolveSettings(string $token): UserRegistrationSettings
    {
        $settings = UserRegistrationSettings::where('registration_token', $token)->firstOrFail();

        abort_if($settings->isTokenExpired(), 404, 'This registration link has expired.');

        return $settings;
    }
}
