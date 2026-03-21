<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRegistrationSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'default_role_id'      => ['nullable', 'integer', 'exists:roles,id'],
            'notify_on_submission'  => ['required', 'boolean'],
            'notify_on_review'      => ['required', 'boolean'],
            'token_expires_in_days' => ['nullable', 'integer', 'min:1', 'max:365'],
        ];
    }
}
