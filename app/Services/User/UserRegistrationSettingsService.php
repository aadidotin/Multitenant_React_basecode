<?php

namespace App\Services\User;

use App\Models\UserRegistrationSettings;

class UserRegistrationSettingsService
{
    public function getSettings(): UserRegistrationSettings
    {
        return UserRegistrationSettings::current()->load('defaultRole');
    }

    public function rotateToken(int|null $expiresInDays): UserRegistrationSettings
    {
        $settings = UserRegistrationSettings::current();
        $settings->rotateToken($expiresInDays);
        return $settings->fresh('defaultRole');
    }

    public function update(array $data): UserRegistrationSettings
    {
        $settings = UserRegistrationSettings::current();

        // If expiry days changed, recompute token_expires_at from now
        $payload = $data;
        if (array_key_exists('token_expires_in_days', $data)) {
            $payload['token_expires_at'] = $data['token_expires_in_days']
                ? now()->addDays($data['token_expires_in_days'])
                : null;
            unset($payload['token_expires_in_days']);
        }

        $settings->update($payload);
        return $settings->fresh('defaultRole');
    }
}
