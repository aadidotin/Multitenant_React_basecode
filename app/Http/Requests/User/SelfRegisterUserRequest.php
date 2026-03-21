<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

/**
 * Unauthenticated user submitting their own registration application.
 * Password is required — a temporary password that they can change after approval.
 */
class SelfRegisterUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // token-gated at the route/controller level
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
        ];
    }
}
