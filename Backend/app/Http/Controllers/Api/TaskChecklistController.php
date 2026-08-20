<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\TaskChecklistItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TaskChecklistController extends Controller
{
    public function index(Request $request, Task $task): JsonResponse
    {
        $items = TaskChecklistItem::where('task_id', $task->id)
            ->orderBy('sort_order')
            ->get();

        return response()->json($items);
    }

    public function store(Request $request, Task $task): JsonResponse
    {
        if (!$request->user()->hasPermissionTo('tasks.check_items') && !$request->user()->hasPermissionTo('tasks.create')) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:190',
            'sort_order' => 'nullable|integer',
        ]);

        $item = TaskChecklistItem::create([
            'task_id' => $task->id,
            'title' => $validated['title'],
            'sort_order' => $validated['sort_order'] ?? 0,
        ]);

        return response()->json([
            'message' => 'Élément ajouté',
            'item' => $item,
        ], 201);
    }

    public function toggle(Request $request, Task $task, TaskChecklistItem $item): JsonResponse
    {
        if (!$request->user()->hasPermissionTo('tasks.check_items')) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        if ($item->task_id !== $task->id) {
            return response()->json(['message' => 'Élément introuvable'], 404);
        }

        $item->is_completed = !$item->is_completed;
        $item->completed_by = $item->is_completed ? $request->user()->id : null;
        $item->completed_at = $item->is_completed ? now() : null;
        $item->save();

        return response()->json([
            'message' => $item->is_completed ? 'Élément coché' : 'Élément décoché',
            'item' => $item,
        ]);
    }

    public function destroy(Request $request, Task $task, TaskChecklistItem $item): JsonResponse
    {
        if (!$request->user()->hasPermissionTo('tasks.check_items') && !$request->user()->hasPermissionTo('tasks.delete')) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        if ($item->task_id !== $task->id) {
            return response()->json(['message' => 'Élément introuvable'], 404);
        }

        $item->delete();

        return response()->json(['message' => 'Élément supprimé']);
    }
}
