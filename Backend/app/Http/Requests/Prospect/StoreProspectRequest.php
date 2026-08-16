<?php

namespace App\Http\Requests\Prospect;

use Illuminate\Foundation\Http\FormRequest;

class StoreProspectRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'first_name'          => 'required|string|max:100',
            'last_name'           => 'required|string|max:100',
            'company_name'        => 'nullable|string|max:150',
            'email'               => 'nullable|email|max:150',
            'phone'               => 'required|string|max:50',
            'status_id'           => 'required|exists:prospect_statuses,id',
            'source_id'           => 'nullable|exists:prospect_sources,id',
            'assigned_user_id'    => 'nullable|exists:users,id',
            'estimated_budget'    => 'nullable|numeric|min:0',
            'notes'               => 'nullable|string',
        ];
    }
}