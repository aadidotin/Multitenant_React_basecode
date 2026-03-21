<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

/**
 * Used by an authenticated tenant user to register another user.
 * The new user is auto-approved immediately.
 */
class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // gate checked in controller
    }

    public function rules(): array
    {
        return [
            'name'        => ['required', 'string', 'max:100'],
            'email'       => ['required', 'email', 'max:150', 'unique:users,email'],
            'password'    => ['required', 'confirmed', Password::min(8)->mixedCase()->numbers()],
            'phone'       => ['nullable', 'string', 'max:30'],
            'designation' => ['nullable', 'string', 'max:100'],
            'department'  => ['nullable', 'string', 'max:100'],
            'role_ids'    => ['nullable', 'array'],
            'role_ids.*'  => ['integer', 'exists:roles,id'],
        ];
    }
}
