<?php

namespace App\Http\Requests\Client;

use Illuminate\Foundation\Http\FormRequest;

class StoreClientRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'first_name'   => 'required|string|max:100',
            'last_name'    => 'required|string|max:100',
            'company_name' => 'nullable|string|max:150',
            'email'        => 'nullable|email|max:150',
            'phone'        => 'required|string|max:50',
            'address'      => 'nullable|string',
            'status'       => 'required|in:active,inactive',
        ];
    }
}