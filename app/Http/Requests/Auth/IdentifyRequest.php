<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class IdentifyRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // nullable — blank/null means central admin context
            'subdomain' => [
                'nullable',
                'string',
                'max:63',
                'regex:/^[a-z0-9]([a-z0-9\-]*[a-z0-9])?$/',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'subdomain.regex' => 'The subdomain may only contain lowercase letters, numbers, and hyphens.',
            'subdomain.max'   => 'The subdomain must not exceed 63 characters.',
        ];
    }

    /**
     * Normalize subdomain to lowercase and treat empty string as null.
     */
    protected function prepareForValidation(): void
    {
        $subdomain = trim(strtolower($this->subdomain ?? ''));

        $this->merge([
            'subdomain' => $subdomain === '' ? null : $subdomain,
        ]);
    }
}
