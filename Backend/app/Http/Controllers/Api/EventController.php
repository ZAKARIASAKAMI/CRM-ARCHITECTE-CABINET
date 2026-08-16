<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class EventController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $events = Event::with(['project', 'client', 'creator', 'participants'])
            ->orderBy('start_at')
            ->get();

        return response()->json($events);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:190',
            'event_type' => 'required|string|max:80',
            'description' => 'nullable|string',
            'location' => 'nullable|string|max:255',
            'start_at' => 'required|date',
            'end_at' => 'nullable|date',
            'project_id' => 'nullable|exists:projects,id',
            'client_id' => 'nullable|exists:clients,id',
            'is_all_day' => 'nullable|boolean',
            'reminder_minutes' => 'nullable|integer',
            'status' => 'nullable|string|in:planned,completed,cancelled',
        ]);

        $validated['created_by'] = auth()->id() ?? 1;
        $validated['status'] = $validated['status'] ?? 'planned';

        $event = Event::create($validated);

        return response()->json([
            'message' => 'Événement ajouté au planning avec succès',
            'event' => $event->load(['project', 'client', 'creator']),
        ], 201);
    }

    public function update(Request $request, Event $event): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:190',
            'event_type' => 'sometimes|required|string|max:80',
            'description' => 'nullable|string',
            'location' => 'nullable|string|max:255',
            'start_at' => 'sometimes|required|date',
            'end_at' => 'nullable|date',
            'project_id' => 'nullable|exists:projects,id',
            'client_id' => 'nullable|exists:clients,id',
            'is_all_day' => 'nullable|boolean',
            'status' => 'nullable|string|in:planned,completed,cancelled',
        ]);

        $event->update($validated);

        return response()->json([
            'message' => 'Événement mis à jour',
            'event' => $event->load(['project', 'client', 'creator']),
        ]);
    }

    public function destroy(Event $event): JsonResponse
    {
        $event->delete();

        return response()->json(['message' => 'Événement supprimé avec succès']);
    }
}
