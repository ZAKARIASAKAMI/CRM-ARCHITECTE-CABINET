<?php

namespace App\Http\Requests\Project;

use Illuminate\Foundation\Http\FormRequest;

class StoreProjectRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'code'              => 'required|string|unique:projects,code|max:50',
            'title'             => 'required|string|max:200',
            'description'       => 'nullable|string',
            'client_id'         => 'required|exists:clients,id',
            'project_type_id'   => 'required|exists:project_types,id',
            'project_status_id' => 'required|exists:project_statuses,id',
            'manager_user_id'   => 'nullable|exists:users,id',
            'estimated_budget'  => 'nullable|numeric|min:0',
            'start_date'        => 'nullable|date',
            'deadline'          => 'nullable|date|after_or_equal:start_date',
        ];
    }
}