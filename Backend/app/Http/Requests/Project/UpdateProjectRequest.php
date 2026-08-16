<?php

namespace App\Http\Requests\Project;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'reference'            => 'sometimes|string|max:50|unique:projects,reference,' . $this->route('project')->id,
            'name'                 => 'sometimes|string|max:190',
            'description'          => 'sometimes|nullable|string',
            'client_id'            => 'sometimes|exists:clients,id',
            'project_type_id'      => 'sometimes|exists:project_types,id',
            'project_status_id'    => 'sometimes|exists:project_statuses,id',
            'manager_user_id'      => 'sometimes|nullable|exists:users,id',
            'priority'             => 'sometimes|nullable|string|max:20',
            'city'                 => 'sometimes|nullable|string|max:100',
            'address'              => 'sometimes|nullable|string',
            'latitude'             => 'sometimes|nullable|numeric',
            'longitude'            => 'sometimes|nullable|numeric',
            'land_surface'         => 'sometimes|nullable|numeric',
            'estimated_built_surface' => 'sometimes|nullable|numeric',
            'estimated_budget'     => 'sometimes|nullable|numeric|min:0',
            'start_date'           => 'sometimes|nullable|date',
            'expected_end_date'    => 'sometimes|nullable|date',
            'actual_end_date'      => 'sometimes|nullable|date',
            'progress_percentage'  => 'sometimes|nullable|integer|min:0|max:100',
            'notes'                => 'sometimes|nullable|string',
            'status_note'          => 'sometimes|nullable|string',
        ];
    }
}
