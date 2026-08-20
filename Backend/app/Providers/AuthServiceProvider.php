<?php

namespace App\Providers;

use App\Models\Client;
use App\Models\Document;
use App\Models\Event;
use App\Models\Project;
use App\Models\Prospect;
use App\Models\Task;
use App\Models\User;
use App\Policies\ClientPolicy;
use App\Policies\DocumentPolicy;
use App\Policies\EventPolicy;
use App\Policies\ProjectPolicy;
use App\Policies\ProspectPolicy;
use App\Policies\TaskPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        Project::class => ProjectPolicy::class,
        Task::class => TaskPolicy::class,
        Client::class => ClientPolicy::class,
        Prospect::class => ProspectPolicy::class,
        Document::class => DocumentPolicy::class,
        Event::class => EventPolicy::class,
    ];

    public function boot(): void
    {
        $this->registerPolicies();
    }
}
