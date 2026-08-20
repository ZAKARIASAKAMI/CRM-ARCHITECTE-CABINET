<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\TaskComment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TaskCommentController extends Controller
{
    public function index(Request $request, Task $task): JsonResponse
    {
        $comments = TaskComment::with('user')
            ->where('task_id', $task->id)
            ->latest()
            ->get();

        return response()->json($comments);
    }

    public function store(Request $request, Task $task): JsonResponse
    {
        $validated = $request->validate([
            'comment' => 'required|string',
        ]);

        $comment = TaskComment::create([
            'task_id' => $task->id,
            'user_id' => $request->user()->id,
            'comment' => $validated['comment'],
        ]);

        return response()->json([
            'message' => 'Commentaire ajouté',
            'comment' => $comment->load('user'),
        ], 201);
    }

    public function destroy(Task $task, TaskComment $comment): JsonResponse
    {
        if ($comment->task_id !== $task->id) {
            return response()->json(['message' => 'Commentaire introuvable'], 404);
        }

        $comment->delete();

        return response()->json(['message' => 'Commentaire supprimé']);
    }
}
