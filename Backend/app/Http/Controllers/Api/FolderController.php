<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Folder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FolderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Folder::with(['project', 'children', 'documents']);

        if ($request->has('project_id')) {
            $query->where('project_id', $request->project_id);
        }

        $folders = $query->latest()->get();

        return response()->json($folders);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:190',
            'project_id'  => 'required|exists:projects,id',
            'parent_id'   => 'nullable|exists:folders,id',
            'description' => 'nullable|string',
        ]);

        $validated['created_by'] = auth()->id() ?? 1;

        $folder = Folder::create($validated);

        return response()->json([
            'message' => 'Dossier créé avec succès',
            'folder'  => $folder->load(['project', 'children', 'documents']),
        ], 201);
    }

    public function destroy(Folder $folder): JsonResponse
    {
        $folder->delete();

        return response()->json(['message' => 'Dossier supprimé avec succès']);
    }
}
