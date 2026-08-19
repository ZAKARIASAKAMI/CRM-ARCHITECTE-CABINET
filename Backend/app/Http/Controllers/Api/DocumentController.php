<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\DocumentCategory;
use App\Models\Folder;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class DocumentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Document::with(['folder', 'category', 'uploader', 'currentVersion', 'links']);

        if ($request->has('folder_id')) {
            $query->where('folder_id', $request->folder_id);
        }

        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        $documents = $query->latest()->get();
        $folders = Folder::with('project')->latest()->get();
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

    public function destroy(Document $document): JsonResponse
    {
        $document->delete();

        return response()->json(['message' => 'Document supprimé avec succès']);
    }
}
