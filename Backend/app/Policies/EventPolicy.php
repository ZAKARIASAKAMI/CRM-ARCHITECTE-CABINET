<?php

namespace App\Policies;

use App\Models\Event;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class EventPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['Administrator', 'Architect', 'Secretary']);
    }

    public function view(User $user, Event $event): bool
    {
        if ($user->hasAnyRole(['Administrator', 'Architect'])) {
            return true;
        }

        if ($user->hasRole('Secretary')) {
            return true;
        }

        // Collaborator: only events on projects they are members of
        if ($user->hasRole('Collaborator')) {
            if ($event->project_id) {
                return $event->project->members()->where('user_id', $user->id)->exists();
            }
            return false;
        }

        return false;
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['Administrator', 'Architect', 'Secretary']);
    }

    public function update(User $user, Event $event): bool
    {
        return $user->hasAnyRole(['Administrator', 'Architect', 'Secretary']);
    }

    public function delete(User $user, Event $event): bool
    {
        return $user->hasAnyRole(['Administrator', 'Architect', 'Secretary']);
    }
}
