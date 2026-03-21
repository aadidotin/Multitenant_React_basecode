<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\ReviewUserRequest;
use App\Http\Requests\User\StoreUserRequest;
use App\Http\Requests\User\UpdateUserRequest;
use App\Models\Role;
use App\Models\User;
use App\Services\User\UserService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function __construct(private readonly UserService $userService) {}

    public function index(Request $request): Response
    {
        $status = $request->query('status', 'all');

        $query = User::with(['roles:id,name,slug'])
            ->withCount('roles')
            ->orderByRaw("FIELD(status, 'pending', 'approved', 'rejected', 'blocked')")
            ->orderBy('created_at', 'desc');

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        $users = $query->paginate(20)->withQueryString();

        $counts = [
            'all'      => User::count(),
            'pending'  => User::where('status', User::STATUS_PENDING)->count(),
            'approved' => User::where('status', User::STATUS_APPROVED)->count(),
            'rejected' => User::where('status', User::STATUS_REJECTED)->count(),
            'blocked'  => User::where('status', User::STATUS_BLOCKED)->count(),
        ];

        return Inertia::render('user/UsersIndex', [
            'users'         => $users,
            'counts'        => $counts,
            'currentStatus' => $status,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('user/UserForm', [
            'roles' => Role::active()->ordered()->get(['id', 'name', 'slug', 'description']),
        ]);
    }

    public function store(StoreUserRequest $request): RedirectResponse
    {
        $user = $this->userService->createAuthenticated($request->validated());

        return redirect()
            ->route('tenant.users.index')
            ->with('success', "User \"{$user->name}\" created successfully.");
    }

    public function edit(User $user): Response
    {
        $user->load(['roles:id,name,slug']);

        return Inertia::render('user/UserForm', [
            'user'  => $user,
            'roles' => Role::active()->ordered()->get(['id', 'name', 'slug', 'description']),
        ]);
    }

    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $this->userService->update($user, $request->validated());

        return redirect()
            ->route('tenant.users.index')
            ->with('success', "User \"{$user->name}\" updated successfully.");
    }

    public function destroy(User $user): RedirectResponse
    {
        // Prevent self-deletion
        abort_if($user->id === auth()->id(), 403, 'You cannot delete your own account.');

        $name = $user->name;
        $user->delete();

        return redirect()
            ->route('tenant.users.index')
            ->with('success', "User \"{$name}\" deleted.");
    }

    /**
     * Approve, reject, or block a user application.
     * PATCH /users/{user}/review
     */
    public function review(ReviewUserRequest $request, User $user): RedirectResponse
    {
        abort_if($user->id === auth()->id(), 403, 'You cannot review your own account.');

        $action = $request->validated('action');
        $notes  = $request->validated('notes');

        match ($action) {
            'approve' => $this->userService->approve($user, $notes),
            'reject'  => $this->userService->reject($user, $notes),
            'block'   => $this->userService->block($user, $notes),
        };

        $label = ucfirst($action) . 'd';

        return back()->with('success', "User \"{$user->name}\" {$label}.");
    }

    /**
     * Sync role assignments for a user.
     * PUT /users/{user}/roles
     */
    public function syncRoles(Request $request, User $user): RedirectResponse
    {
        $data = $request->validate([
            'role_ids'   => ['nullable', 'array'],
            'role_ids.*' => ['integer', 'exists:roles,id'],
        ]);

        $user->roles()->sync($data['role_ids'] ?? []);

        return back()->with('success', 'Roles updated.');
    }
}
