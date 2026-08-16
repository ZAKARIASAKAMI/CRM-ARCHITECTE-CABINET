<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Http\Requests\Project\StoreProjectRequest;
use App\Http\Requests\Project\UpdateProjectRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class ProjectController extends Controller
{
    public function index(): JsonResponse
    {
        $projects = Project::with(['client', 'type', 'status', 'manager'])
            ->latest()
            ->paginate(15);

        return response()->json($projects);
    }

    public function store(StoreProjectRequest $request): JsonResponse
    {
        $project = DB::transaction(function () use ($request) {
            $project = Project::create($request->validated());

            // تسجيل أول تغيير فـ الـ Status History
            $project->statusHistories()->create([
                'project_status_id' => $project->project_status_id,
                'changed_by'        => auth()->id(),
                'notes'             => 'Création initiale du projet',
            ]);

            return $project;
        });

        return response()->json([
            'message' => 'Projet créé avec succès',
            'project' => $project->load(['client', 'type', 'status', 'manager']),
        ], 201);
    }

    public function show(Project $project): JsonResponse
    {
        return response()->json(
            $project->load(['client', 'type', 'status', 'manager', 'members', 'tasks', 'statusHistories'])
        );
    }

    public function update(UpdateProjectRequest $request, Project $project): JsonResponse
    {
        DB::transaction(function () use ($request, $project) {
            $oldStatusId = $project->project_status_id;
            $project->update($request->validated());

            // إذا تبدلات الحالة تسجيل التغيير فـ History
            if ($request->has('project_status_id') && $oldStatusId != $request->project_status_id) {
                $project->statusHistories()->create([
                    'project_status_id' => $request->project_status_id,
                    'changed_by'        => auth()->id(),
                    'notes'             => $request->input('status_note', 'Changement de statut'),
                ]);
            }
        });

        return response()->json([
            'message' => 'Projet mis à jour avec succès',
            'project' => $project->load(['client', 'type', 'status', 'manager']),
        ]);
    }

    public function destroy(Project $project): JsonResponse
    {
        $project->delete();

        return response()->json([
            'message' => 'Projet supprimé avec succès'
        ]);
    }
}