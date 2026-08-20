<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\TaskAttachment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TaskAttachmentController extends Controller
{
    public function index(Request $request, Task $task): JsonResponse
    {
        $attachments = TaskAttachment::with('uploader')
            ->where('task_id', $task->id)
            ->latest()
            ->get();

        return response()->json($attachments);
    }

    public function store(Request $request, Task $task): JsonResponse
    {
        if (!$request->user()->hasPermissionTo('documents.upload')) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $validated = $request->validate([
            'file' => 'required|file|max:20480',
            'name' => 'nullable|string|max:190',
        ]);

        $file = $request->file('file');
        $attachment = TaskAttachment::create([
            'task_id' => $task->id,
            'uploaded_by' => $request->user()->id,
            'name' => $validated['name'] ?? $file->getClientOriginalName(),
            'original_name' => $file->getClientOriginalName(),
            'extension' => $file->getClientOriginalExtension(),
            'mime_type' => $file->getMimeType(),
            'file_size' => $file->getSize(),
            'storage_disk' => 'local',
            'storage_path' => $file->store('task_attachments', 'local'),
        ]);

        return response()->json([
            'message' => 'Fichier téléversé',
            'attachment' => $attachment->load('uploader'),
        ], 201);
    }

    public function destroy(Request $request, Task $task, TaskAttachment $attachment): JsonResponse
    {
        if ($attachment->task_id !== $task->id) {
            return response()->json(['message' => 'Fichier introuvable'], 404);
        }

        $attachment->delete();

        return response()->json(['message' => 'Fichier supprimé']);
    }
}
