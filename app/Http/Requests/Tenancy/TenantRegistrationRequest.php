<?php

namespace App\Http\Requests\Tenancy;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TenantRegistrationRequest extends FormRequest
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
        $centralDomain = config('tenancy.central_domain');

        return [
            'company_name' => ['required', 'string', 'max:150'],
            'email'        => ['required', 'email', 'max:200', 'unique:tenants,email'],
            'phone'        => ['nullable', 'string', 'max:30'],
            'address'      => ['nullable', 'string', 'max:300'],
            'city'         => ['nullable', 'string', 'max:100'],
            'country'      => ['required', 'string', 'max:100'],
            'subdomain'    => [
                'required',
                'string',
                'min:3',
                'max:63',
                'regex:/^[a-z0-9]([a-z0-9\-]*[a-z0-9])?$/',   // valid DNS label
                Rule::unique('domains', 'domain')->where(
                    fn($q) => $q->where('domain', 'like', "%.{$centralDomain}")
                ),
                Rule::notIn(config('tenancy.reserved_subdomains', [
                    'www',
                    'api',
                    'admin',
                    'mail',
                    'ftp',
                    'app',
                    'static',
                    'assets',
                    'cdn',
                    'dev',
                    'staging',
                ])),
            ],
            'subscription_package_id' => [
                'required',
                'integer',
                Rule::exists('subscription_packages', 'id')->where('is_active', true),
            ],
            // Terms acceptance
            'terms'        => ['required', 'accepted'],
        ];
    }

    public function messages(): array
    {
        return [
            'subdomain.regex'    => 'The subdomain may only contain lowercase letters, numbers, and hyphens, and cannot start or end with a hyphen.',
            'subdomain.not_in'   => 'This subdomain is reserved and cannot be used.',
            'subdomain.unique'   => 'This subdomain is already taken.',
            'terms.accepted'     => 'You must accept the terms and conditions.',
        ];
    }
}
