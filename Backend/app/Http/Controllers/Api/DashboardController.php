<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Prospect;
use App\Models\Client;
use App\Models\Project;
use App\Models\Task;
use App\Models\Event;
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

        $pendingTasks = Task::whereHas('status', function ($query) {
            $query->where('is_closed', false);
        })->count();

        $upcomingEvents = Event::where('start_at', '>=', now())
            ->orderBy('start_at')
            ->take(5)
            ->with(['project', 'client', 'creator'])
            ->get();

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
                'active' => $activeProjects,
                'completed' => $completedProjects,
                'recent' => $recentProjects,
            ],
            'tasks' => [
                'pending' => $pendingTasks,
            ],
            'upcoming_events' => $upcomingEvents,
            'recent_prospects' => $recentProspects,
        ]);
    }
}
