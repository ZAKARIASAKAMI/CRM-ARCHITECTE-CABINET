<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Prospect;
use App\Models\Client;
use App\Models\Project;
use App\Models\Task;
use App\Models\Event;
use App\Models\Document;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function stats(): JsonResponse
    {
        $totalProspects = Prospect::count();
        $wonProspects = Prospect::whereHas('status', function ($query) {
            $query->where('is_won', true);
        })->count();
        $lostProspects = Prospect::whereHas('status', function ($query) {
            $query->where('is_lost', true);
        })->count();

        $conversionRate = $totalProspects > 0 ? round(($wonProspects / $totalProspects) * 100, 1) : 0;

        $totalClients = Client::count();
        $activeProjects = Project::whereHas('status', function ($query) {
            $query->where('is_closed', false);
        })->count();

        $completedProjects = Project::whereHas('status', function ($query) {
            $query->where('is_closed', true);
        })->count();

        $totalProjects = Project::count();

        $pendingTasks = Task::whereHas('status', function ($query) {
            $query->where('is_closed', false);
        })->count();

        $completedTasks = Task::whereHas('status', function ($query) {
            $query->where('is_closed', true);
        })->count();

        $totalTasks = Task::count();

        $projectsInProgress = Project::with(['client', 'status', 'manager'])
            ->whereHas('status', function ($query) {
                $query->where('is_closed', false);
            })
            ->get()
            ->map(fn($p) => [
                'id'                => $p->id,
                'name'              => $p->name,
                'reference'         => $p->reference,
                'progress'          => $p->progress_percentage ?? 0,
                'status'            => $p->status?->name,
                'client'            => $p->client ? ($p->client->client_type === 'company' ? $p->client->company_name : $p->client->first_name . ' ' . $p->client->last_name) : null,
                'manager'           => $p->manager ? $p->manager->first_name . ' ' . $p->manager->last_name : null,
                'tasks_total'       => $p->tasks()->count(),
                'tasks_completed'   => $p->tasks()->whereHas('status', fn($q) => $q->where('is_closed', true))->count(),
                'estimated_budget'  => $p->estimated_budget,
                'city'              => $p->city,
            ]);

        $upcomingEvents = Event::where('start_at', '>=', now())
            ->orderBy('start_at')
            ->take(5)
            ->with(['project', 'client', 'creator'])
            ->get();

        $totalDocuments = Document::count();

        $recentProjects = Project::with(['client', 'status', 'manager'])
            ->latest()
            ->take(5)
            ->get();

        $recentProspects = Prospect::with(['status', 'source'])
            ->latest()
            ->take(5)
            ->get();

        return response()->json([
            'prospects' => [
                'total' => $totalProspects,
                'won' => $wonProspects,
                'lost' => $lostProspects,
                'conversion_rate' => $conversionRate,
            ],
            'clients_count' => $totalClients,
            'projects' => [
                'total'     => $totalProjects,
                'active'    => $activeProjects,
                'completed' => $completedProjects,
                'recent'    => $recentProjects,
            ],
            'tasks' => [
                'total'     => $totalTasks,
                'pending'   => $pendingTasks,
                'completed' => $completedTasks,
            ],
            'projects_in_progress' => $projectsInProgress,
            'upcoming_events' => $upcomingEvents,
            'recent_prospects' => $recentProspects,
            'documents_count' => $totalDocuments,
        ]);
    }
}
