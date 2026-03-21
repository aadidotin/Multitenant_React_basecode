<?php

namespace App\Http\Requests\Module;

use Illuminate\Foundation\Http\FormRequest;

class StoreModuleRequest extends FormRequest
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
            'name'                 => ['required', 'string', 'max:100'],
            'slug'                 => ['nullable', 'string', 'max:120', 'unique:modules,slug'],
            'description'          => ['nullable', 'string', 'max:500'],
            'icon'                 => ['nullable', 'string', 'max:50'],
            'group'                => ['nullable', 'string', 'max:80'],
            'is_active'            => ['boolean'],
            'sort_order'           => ['integer', 'min:0'],
            'seed_default_actions' => ['boolean'],
        ];
    }
}
