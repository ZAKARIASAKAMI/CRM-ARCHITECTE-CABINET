<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Http\Requests\Project\StoreProjectRequest;
use App\Http\Requests\Project\UpdateProjectRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProjectController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Project::with(['client', 'type', 'status', 'manager'])->latest();

        // Collaborator (projects.view_assigned): only see projects they are member of
        if ($request->user()->hasRole('Collaborator')) {
            $query->whereHas('members', fn ($q) => $q->where('user_id', $request->user()->id));
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('reference', 'like', "%{$search}%")
                    ->orWhere('city', 'like', "%{$search}%")
                    ->orWhereHas('client', function ($cq) use ($search) {
                        $cq->where('first_name', 'like', "%{$search}%")
                            ->orWhere('last_name', 'like', "%{$search}%")
                            ->orWhere('company_name', 'like', "%{$search}%");
                    });
            });
        }

        $projects = $query->paginate(15);

        return response()->json($projects);
    }

    public function store(StoreProjectRequest $request): JsonResponse
    {
        if (!$request->user()->hasPermissionTo('projects.create')) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }
        $project = DB::transaction(function () use ($request) {
            $payload = $request->validated();

            if (isset($payload['reference'])) {
                $payload['reference'] = $payload['reference'];
            }

            if (isset($payload['name'])) {
                $payload['name'] = $payload['name'];
            }

            $project = Project::create($payload);

            $project->statusHistories()->create([
                'old_status_id' => null,
                'new_status_id' => $project->project_status_id,
                'changed_by'    => auth()->id(),
                'comment'       => 'Création initiale du projet',
                'changed_at'    => now(),
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
            $payload = $request->validated();

            if (isset($payload['reference'])) {
                $payload['reference'] = $payload['reference'];
            }

            if (isset($payload['name'])) {
                $payload['name'] = $payload['name'];
            }

            $project->update($payload);

            if ($request->has('project_status_id') && $oldStatusId != $request->project_status_id) {
                $project->statusHistories()->create([
                    'old_status_id' => $oldStatusId,
                    'new_status_id' => $request->project_status_id,
                    'changed_by'    => auth()->id(),
                    'comment'       => $request->input('status_note', 'Changement de statut'),
                    'changed_at'    => now(),
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
        if (!auth()->user()->hasPermissionTo('projects.delete')) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }
        $project->delete();

        return response()->json([
            'message' => 'Projet supprimé avec succès'
        ]);
    }
}