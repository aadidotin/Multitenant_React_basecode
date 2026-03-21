<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = $this->route('user')?->id;

        return [
            'name'        => ['required', 'string', 'max:100'],
            'email'       => ['required', 'email', 'max:150', Rule::unique('users', 'email')->ignore($userId)],
            'password'    => ['nullable', 'confirmed', Password::min(8)->mixedCase()->numbers()],
            'phone'       => ['nullable', 'string', 'max:30'],
            'designation' => ['nullable', 'string', 'max:100'],
            'department'  => ['nullable', 'string', 'max:100'],
            'role_ids'    => ['nullable', 'array'],
            'role_ids.*'  => ['integer', 'exists:roles,id'],
        ];
    }
}
