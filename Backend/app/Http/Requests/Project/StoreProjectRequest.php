<?php

namespace App\Http\Requests\Project;

use Illuminate\Foundation\Http\FormRequest;

class StoreProjectRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'reference'            => 'required|string|unique:projects,reference|max:50',
            'name'                 => 'required|string|max:190',
            'description'          => 'nullable|string',
            'client_id'            => 'required|exists:clients,id',
            'project_type_id'      => 'required|exists:project_types,id',
            'project_status_id'    => 'required|exists:project_statuses,id',
            'manager_user_id'      => 'nullable|exists:users,id',
            'priority'             => 'nullable|string|max:20',
            'city'                 => 'nullable|string|max:100',
            'address'              => 'nullable|string',
            'latitude'             => 'nullable|numeric',
            'longitude'            => 'nullable|numeric',
            'land_surface'         => 'nullable|numeric',
            'estimated_built_surface' => 'nullable|numeric',
            'estimated_budget'     => 'nullable|numeric|min:0',
            'start_date'           => 'nullable|date',
            'expected_end_date'    => 'nullable|date|after_or_equal:start_date',
            'progress_percentage'  => 'nullable|integer|min:0|max:100',
            'notes'                => 'nullable|string',
        ];
    }
}