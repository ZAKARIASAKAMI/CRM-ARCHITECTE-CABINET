<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Prospect\StoreProspectRequest;
use App\Http\Requests\Prospect\UpdateProspectRequest;
use App\Models\Client;
use App\Models\Project;
use App\Models\ProjectStatus;
use App\Models\ProjectType;
use App\Models\Prospect;
use App\Models\ProspectStatus;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProspectController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Prospect::with(['status', 'source', 'assignedUser'])
            ->latest();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('company_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status_id')) {
            $query->where('status_id', $request->status_id);
        }

        $prospects = $query->paginate(15);

        return response()->json($prospects);
    }

    public function store(StoreProspectRequest $request): JsonResponse
    {
        $prospect = Prospect::create($request->validated());

        return response()->json([
            'message'  => 'Prospect créé avec succès',
            'prospect' => $prospect->load(['status', 'source', 'assignedUser']),
        ], 201);
    }

    public function show(Prospect $prospect): JsonResponse
    {
        return response()->json(
            $prospect->load(['status', 'source', 'assignedUser', 'activities'])
        );
    }

    public function update(UpdateProspectRequest $request, Prospect $prospect): JsonResponse
    {
        $prospect->update($request->validated());

        return response()->json([
            'message'  => 'Prospect mis à jour avec succès',
            'prospect' => $prospect->load(['status', 'source', 'assignedUser']),
        ]);
    }

    public function destroy(Prospect $prospect): JsonResponse
    {
        $prospect->delete();

        return response()->json([
            'message' => 'Prospect supprimé avec succès'
        ]);
    }

    public function convert(Request $request, Prospect $prospect): JsonResponse
    {
        if ($prospect->converted_at) {
            return response()->json(['message' => 'Ce prospect a déjà été converti en client'], 422);
        }

        if ($prospect->status && $prospect->status->is_lost) {
            return response()->json(['message' => 'Impossible de convertir un prospect perdu'], 422);
        }

        $request->validate([
            'client_type' => 'nullable|in:individual,company',
            'company_name' => 'nullable|string|max:190',
            'first_name' => 'nullable|string|max:100',
            'last_name' => 'nullable|string|max:100',
            'email' => 'nullable|email|max:190',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'create_project' => 'nullable|boolean',
            'project_name' => 'nullable|string|max:190',
            'project_type_id' => 'nullable|exists:project_types,id',
            'project_status_id' => 'nullable|exists:project_statuses,id',
            'reference' => 'nullable|string|max:50',
            'manager_user_id' => 'nullable|exists:users,id',
        ]);

        $email = $request->input('email', $prospect->email);
        if ($email && Client::where('email', $email)->exists()) {
            return response()->json(['message' => 'Un client avec cet email existe déjà'], 422);
        }

        $client = null;
        $project = null;

        DB::transaction(function () use ($request, $prospect, &$client, &$project) {
            $client = Client::create([
                'client_type' => $request->input('client_type', $prospect->client_type ?? 'individual'),
                'company_name' => $request->input('company_name', $prospect->company_name),
                'first_name' => $request->input('first_name', $prospect->first_name),
                'last_name' => $request->input('last_name', $prospect->last_name),
                'email' => $request->input('email', $prospect->email),
                'phone' => $request->input('phone', $prospect->phone),
                'address' => $request->input('address', $prospect->address),
                'city' => $request->input('city', $prospect->city),
                'notes' => $request->input('notes', $prospect->notes),
                'prospect_id' => $prospect->id,
                'created_by' => auth()->id() ?? $prospect->assigned_user_id ?? $prospect->created_by,
            ]);

            $wonStatusId = ProspectStatus::where('code', 'WON')->value('id');
            $prospect->update([
                'status_id' => $wonStatusId ?? $prospect->status_id,
                'converted_at' => now(),
            ]);

            if ($request->boolean('create_project') || $request->filled('project_name')) {
                $projectTypeId = $request->input('project_type_id', ProjectType::query()->value('id'));
                $projectStatusId = $request->input('project_status_id', ProjectStatus::query()->where('code', 'APS')->value('id') ?? ProjectStatus::query()->value('id'));

                $project = Project::create([
                    'client_id' => $client->id,
                    'project_type_id' => $projectTypeId,
                    'project_status_id' => $projectStatusId,
                    'manager_user_id' => $request->input('manager_user_id', $prospect->assigned_user_id),
                    'reference' => $request->input('reference', 'PRJ-' . date('Y') . '-' . str_pad((Project::count() + 1), 4, '0', STR_PAD_LEFT)),
                    'name' => $request->input('project_name', $request->input('company_name', $client->company_name ?: $client->first_name . ' ' . $client->last_name)),
                    'description' => $request->input('project_description', $prospect->notes),
                    'city' => $request->input('project_city', $client->city),
                    'address' => $request->input('project_address', $client->address),
                    'start_date' => $request->input('start_date'),
                    'expected_end_date' => $request->input('expected_end_date'),
                    'created_by' => auth()->id() ?? $prospect->assigned_user_id,
                ]);

                $project->statusHistories()->create([
                    'old_status_id' => null,
                    'new_status_id' => $project->project_status_id,
                    'changed_by' => auth()->id(),
                    'comment' => 'Conversion du prospect en client + création du projet',
                    'changed_at' => now(),
                ]);
            }
        });

        return response()->json([
            'message' => 'Prospect converti avec succès',
            'client' => $client->load(['projects']),
            'project' => $project ? $project->load(['client', 'status', 'type']) : null,
            'prospect' => $prospect->fresh(['status']),
        ]);
    }
}