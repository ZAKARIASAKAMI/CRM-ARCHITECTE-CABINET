<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Prospect;
use App\Http\Requests\Prospect\StoreProspectRequest;
use App\Http\Requests\Prospect\UpdateProspectRequest;
use Illuminate\Http\JsonResponse;

class ProspectController extends Controller
{
    public function index(): JsonResponse
    {
        $prospects = Prospect::with(['status', 'source', 'assignedUser'])
            ->latest()
            ->paginate(15);

        return response()->json($prospects);
    }

    public function store(StoreProspectRequest $request): JsonResponse
    {
        $prospect = Prospect::create($request->validated());

        return response()->json([
            'message'  => 'Prospect créé avec succès',
            'prospect' => $prospect->load(['status', 'source', 'assignedUser']),
        ], 210);
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
}