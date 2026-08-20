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

        // Collaborator (tasks.view_assigned): only see tasks from projects they are a member of
        if ($request->user()->hasRole('Collaborator')) {
            $query->whereHas('project', function ($q) use ($request) {
                $q->whereHas('members', fn ($mq) => $mq->where('user_id', $request->user()->id));
            });
        }

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
        if (!$request->user()->hasPermissionTo('tasks.create')) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

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

        $validated['created_by'] = $request->user()->id ?? 1;

        $task = Task::create($validated);

        return response()->json([
            'message' => 'Tâche créée avec succès',
            'task' => $task->load(['project', 'status', 'creator', 'assignee', 'checklistItems']),
        ], 201);
    }

    public function show(Task $task): JsonResponse
    {
        return response()->json($task->load(['project', 'status', 'creator', 'assignee', 'members', 'checklistItems', 'comments.user', 'attachments.uploader']));
    }

    public function update(Request $request, Task $task): JsonResponse
    {
        $user = $request->user();

        // Collaborator: restricted to status, progress, spent_hours only
        if ($user->hasRole('Collaborator')) {
            $allowed = [];

            if ($user->hasPermissionTo('tasks.update_status') && $request->has('status_id')) {
                $allowed['status_id'] = $request->status_id;
            }
            if ($user->hasPermissionTo('tasks.update_progress') && $request->has('progress_percentage')) {
                $allowed['progress_percentage'] = $request->progress_percentage;
            }
            if ($user->hasPermissionTo('tasks.log_time') && $request->has('spent_hours')) {
                $allowed['spent_hours'] = $request->spent_hours;
            }

            if (empty($allowed)) {
                return response()->json(['message' => 'Non autorisé à modifier ces champs'], 403);
            }

            if (isset($allowed['status_id'])) {
                $status = TaskStatus::find($allowed['status_id']);
                if ($status && $status->is_closed) {
                    $allowed['completed_at'] = now();
                    $allowed['progress_percentage'] = 100;
                }
            }

            $task->update($allowed);

            return response()->json([
                'message' => 'Tâche mise à jour avec succès',
                'task' => $task->load(['project', 'status', 'creator', 'assignee', 'checklistItems']),
            ]);
        }

        // Admin / Architect: full update
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
        if (!auth()->user()->hasPermissionTo('tasks.delete')) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $task->delete();

        return response()->json(['message' => 'Tâche supprimée avec succès']);
    }
}
