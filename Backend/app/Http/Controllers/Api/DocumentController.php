<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\DocumentCategory;
use App\Models\Folder;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class DocumentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Document::with(['folder', 'category', 'uploader', 'currentVersion', 'links']);

        // Collaborator: only documents in folders belonging to projects they are members of
        if ($request->user()->hasRole('Collaborator')) {
            $query->whereHas('folder', function ($fq) use ($request) {
                $fq->whereHas('project', function ($pq) use ($request) {
                    $pq->whereHas('members', fn ($mq) => $mq->where('user_id', $request->user()->id));
                });
            });
        }

        if ($request->has('folder_id')) {
            $query->where('folder_id', $request->folder_id);
        }

        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        $documents = $query->latest()->get();

        $folderQuery = Folder::with('project')->latest();
        if ($request->user()->hasRole('Collaborator')) {
            $folderQuery->whereHas('project', function ($pq) use ($request) {
                $pq->whereHas('members', fn ($mq) => $mq->where('user_id', $request->user()->id));
            });
        }
        $folders = $folderQuery->get();
        $categories = DocumentCategory::where('is_active', true)->orderBy('sort_order')->get();

        return response()->json([
            'documents' => $documents,
            'folders' => $folders,
            'categories' => $categories,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:190',
            'folder_id' => 'nullable|exists:folders,id',
            'category_id' => 'nullable|exists:document_categories,id',
            'description' => 'nullable|string',
            'file' => 'nullable|file|max:10240', // 10MB max
        ]);

        $validated['uploaded_by'] = auth()->id() ?? 1;
        $validated['original_name'] = $request->hasFile('file') ? $request->file('file')->getClientOriginalName() : $validated['name'];
        $validated['current_version'] = 1;
        $validated['extension'] = $request->hasFile('file') ? $request->file('file')->getClientOriginalExtension() : 'pdf';
        $validated['mime_type'] = $request->hasFile('file') ? $request->file('file')->getMimeType() : 'application/pdf';
        $validated['file_size'] = $request->hasFile('file') ? $request->file('file')->getSize() : 0;
        $validated['storage_disk'] = 'local';
        $validated['storage_path'] = $request->hasFile('file') ? $request->file('file')->store('documents', 'local') : 'documents/sample.pdf';

        $document = Document::create($validated);

        return response()->json([
            'message' => 'Document ajouté avec succès',
            'document' => $document->load(['folder', 'category', 'uploader']),
        ], 201);
    }

    public function show(Document $document): JsonResponse
    {
        return response()->json(
            $document->load(['folder', 'category', 'uploader', 'currentVersion', 'links', 'versions'])
        );
    }

    public function update(Request $request, Document $document): JsonResponse
    {
        if (!auth()->user()->hasPermissionTo('documents.edit')) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:190',
            'folder_id' => 'sometimes|nullable|exists:folders,id',
            'category_id' => 'sometimes|nullable|exists:document_categories,id',
            'description' => 'sometimes|nullable|string',
        ]);

        $document->update($validated);

        return response()->json([
            'message' => 'Document modifié avec succès',
            'document' => $document->load(['folder', 'category', 'uploader']),
        ]);
    }

    public function destroy(Document $document): JsonResponse
    {
        if (!auth()->user()->hasPermissionTo('documents.delete')) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $document->delete();

        return response()->json(['message' => 'Document supprimé avec succès']);
    }

    public function download(Document $document)
    {
        $disk = $document->storage_disk ?? 'local';
        $path = $document->storage_path;

        if (!$path || !Storage::disk($disk)->exists($path)) {
            return response()->json(['message' => 'Fichier introuvable'], 404);
        }

        return Storage::disk($disk)->download($path, $document->original_name ?? $document->name);
    }
}
