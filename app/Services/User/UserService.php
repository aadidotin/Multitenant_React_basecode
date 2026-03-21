<?php

namespace App\Services\User;

use App\Models\Role;
use App\Models\User;
use App\Models\UserRegistrationSettings;
use App\Notifications\User\NewUserApplicationSubmitted;
use App\Notifications\User\UserApplicationApproved;
use App\Notifications\User\UserApplicationRejected;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserService
{
    // ── Authenticated registration (auto-approved) ────────────────────────────

    /**
     * Create a new user via authenticated flow.
     * The submitting admin is accountable — no approval step needed.
     */
    public function createAuthenticated(array $data): User
    {
        return DB::transaction(function () use ($data) {
            $user = User::create([
                'name'              => $data['name'],
                'email'             => $data['email'],
                'password'          => Hash::make($data['password']),
                'phone'             => $data['phone'] ?? null,
                'designation'       => $data['designation'] ?? null,
                'department'        => $data['department'] ?? null,
                'status'            => User::STATUS_APPROVED,
                'registration_type' => User::TYPE_AUTHENTICATED,
                'reviewed_by'       => auth()->id(),
                'reviewed_at'       => now(),
            ]);

            if (! empty($data['role_ids'])) {
                $user->roles()->sync($data['role_ids']);
            }

            return $user;
        });
    }

    // ── Unauthenticated self-registration ─────────────────────────────────────

    /**
     * Submit a self-registration application.
     * Always lands as pending — every public submission requires manual review.
     */
    public function selfRegister(array $data, UserRegistrationSettings $settings): User
    {
        return DB::transaction(function () use ($data, $settings) {
            $user = User::create([
                'name'              => $data['name'],
                'email'             => $data['email'],
                'password'          => Hash::make($data['password']),
                'phone'             => $data['phone'] ?? null,
                'designation'       => $data['designation'] ?? null,
                'department'        => $data['department'] ?? null,
                'status'            => User::STATUS_PENDING,
                'registration_type' => User::TYPE_SELF_REGISTERED,
            ]);

            if ($settings->notify_on_submission) {
                $this->notifyAdmins(new NewUserApplicationSubmitted($user));
            }

            return $user;
        });
    }

    // ── Review actions ────────────────────────────────────────────────────────

    public function approve(User $user, ?string $notes = null): User
    {
        $settings = UserRegistrationSettings::current();

        return DB::transaction(function () use ($user, $notes, $settings) {
            $user->update([
                'status'       => User::STATUS_APPROVED,
                'reviewed_by'  => auth()->id(),
                'reviewed_at'  => now(),
                'review_notes' => $notes,
            ]);

            $this->assignDefaultRole($user, $settings);

            if ($settings->notify_on_review) {
                $user->notify(new UserApplicationApproved($user));
            }

            return $user->fresh();
        });
    }

    public function reject(User $user, ?string $notes = null): User
    {
        $settings = UserRegistrationSettings::current();

        $user->update([
            'status'       => User::STATUS_REJECTED,
            'reviewed_by'  => auth()->id(),
            'reviewed_at'  => now(),
            'review_notes' => $notes,
        ]);

        if ($settings->notify_on_review) {
            $user->notify(new UserApplicationRejected($user));
        }

        return $user->fresh();
    }

    public function block(User $user, ?string $notes = null): User
    {
        $user->update([
            'status'       => User::STATUS_BLOCKED,
            'reviewed_by'  => auth()->id(),
            'reviewed_at'  => now(),
            'review_notes' => $notes,
        ]);

        // Revoke all tokens — user is signed out on next request
        $user->tokens()->delete();

        return $user->fresh();
    }

    // ── Update ────────────────────────────────────────────────────────────────

    public function update(User $user, array $data): User
    {
        return DB::transaction(function () use ($user, $data) {
            $payload = [
                'name'        => $data['name'],
                'email'       => $data['email'],
                'phone'       => $data['phone'] ?? null,
                'designation' => $data['designation'] ?? null,
                'department'  => $data['department'] ?? null,
            ];

            if (! empty($data['password'])) {
                $payload['password'] = Hash::make($data['password']);
            }

            $user->update($payload);

            if (array_key_exists('role_ids', $data)) {
                $user->roles()->sync($data['role_ids'] ?? []);
            }

            return $user->fresh();
        });
    }

    // ── Private ───────────────────────────────────────────────────────────────

    private function assignDefaultRole(User $user, UserRegistrationSettings $settings): void
    {
        if ($settings->default_role_id) {
            $user->roles()->syncWithoutDetaching([$settings->default_role_id]);
        }
    }

    private function notifyAdmins(mixed $notification): void
    {
        User::approved()
            ->whereHas('roles', fn($q) => $q->where('slug', 'admin')->where('is_system', true))
            ->each(fn(User $admin) => $admin->notify($notification));
    }
}