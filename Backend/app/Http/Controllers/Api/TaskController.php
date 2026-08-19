<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\TaskStatus;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class TaskController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Task::with(['project', 'status', 'creator', 'assignee', 'members', 'checklistItems'])
            ->latest();

        if ($request->has('project_id')) {
            $query->where('project_id', $request->project_id);
        }

        if ($request->has('status_id')) {
            $query->where('status_id', $request->status_id);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhereHas('project', function ($pq) use ($search) {
                        $pq->where('name', 'like', "%{$search}%")
                            ->orWhere('reference', 'like', "%{$search}%");
                    });
            });
        }

        $tasks = $query->get();

        return response()->json($tasks);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->all();
        array_walk($data, function (&$value) {
            if ($value === '' || $value === 'null') $value = null;
        });

        $validated = \Validator::make($data, [
            'title' => 'required|string|max:190',
            'description' => 'nullable|string',
            'project_id' => 'nullable|exists:projects,id',
            'status_id' => 'required|exists:task_statuses,id',
            'assigned_to' => 'nullable|exists:users,id',
            'priority' => 'nullable|string|in:low,normal,medium,high,urgent',
            'start_date' => 'nullable|date',
            'due_date' => 'nullable|date',
            'estimated_hours' => 'nullable|numeric',
        ])->validate();

        $validated['created_by'] = auth()->id() ?? 1;

        $task = Task::create($validated);

        return response()->json([
            'message' => 'Tâche créée avec succès',
            'task' => $task->load(['project', 'status', 'creator', 'assignee', 'checklistItems']),
        ], 201);
    }

    public function show(Task $task): JsonResponse
    {
        return response()->json($task->load(['project', 'status', 'creator', 'assignee', 'members', 'checklistItems', 'comments.user']));
    }

    public function update(Request $request, Task $task): JsonResponse
    {
        $data = $request->all();
        array_walk($data, function (&$value) {
            if ($value === '' || $value === 'null') $value = null;
        });

        $validated = \Validator::make($data, [
            'title' => 'sometimes|required|string|max:190',
            'description' => 'nullable|string',
            'project_id' => 'nullable|exists:projects,id',
            'status_id' => 'sometimes|required|exists:task_statuses,id',
            'assigned_to' => 'nullable|exists:users,id',
            'priority' => 'nullable|string|in:low,normal,medium,high,urgent',
            'start_date' => 'nullable|date',
            'due_date' => 'nullable|date',
            'estimated_hours' => 'nullable|numeric',
            'spent_hours' => 'nullable|numeric',
            'progress_percentage' => 'nullable|integer|min:0|max:100',
        ])->validate();

        if (isset($validated['status_id'])) {
            $status = TaskStatus::find($validated['status_id']);
            if ($status && $status->is_closed) {
                $validated['completed_at'] = now();
                $validated['progress_percentage'] = 100;
            }
        }

        $task->update($validated);

        return response()->json([
            'message' => 'Tâche mise à jour avec succès',
            'task' => $task->load(['project', 'status', 'creator', 'assignee', 'checklistItems']),
        ]);
    }

    public function destroy(Task $task): JsonResponse
    {
        $task->delete();

        return response()->json(['message' => 'Tâche supprimée avec succès']);
    }
}
