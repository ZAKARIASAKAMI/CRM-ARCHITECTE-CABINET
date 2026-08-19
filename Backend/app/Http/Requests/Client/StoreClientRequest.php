<?php

namespace App\Http\Requests\Client;

use Illuminate\Foundation\Http\FormRequest;

class StoreClientRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'client_type'   => 'required|in:individual,company',
            'first_name'    => 'required_if:client_type,individual|nullable|string|max:100',
            'last_name'     => 'required_if:client_type,individual|nullable|string|max:100',
            'company_name'  => 'required_if:client_type,company|nullable|string|max:150',
            'email'         => 'nullable|email|max:150',
            'phone'         => 'required|string|max:50',
            'address'       => 'nullable|string',
            'city'          => 'nullable|string|max:100',
            'country'       => 'nullable|string|max:100',
            'ice'           => 'nullable|string|max:50',
            'tax_identifier' => 'nullable|string|max:50',
            'trade_register' => 'nullable|string|max:50',
            'notes'         => 'nullable|string',
        ];
    }
}