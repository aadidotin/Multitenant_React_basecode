<?php

namespace App\Http\Requests\Subscription;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSubscriptionPackageRequest extends FormRequest
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
            'name'          => ['required', 'string', 'max:100'],
            'slug'          => ['nullable', 'string', 'max:120', 'unique:subscription_packages,slug'],
            'description'   => ['nullable', 'string', 'max:500'],
            'price'         => ['required', 'numeric', 'min:0'],
            'billing_cycle' => ['required', Rule::in(['monthly', 'yearly', 'lifetime'])],
            'is_active'     => ['boolean'],
            'sort_order'    => ['integer', 'min:0'],
            'action_ids'    => ['array'],
            'action_ids.*'  => ['integer', 'exists:module_actions,id'],
        ];
    }
}
