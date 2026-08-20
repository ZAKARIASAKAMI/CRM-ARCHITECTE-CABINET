<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class ProjectPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        if ($user->hasAnyRole(['Administrator', 'Architect'])) {
            return true;
        }

        // Secretary: no project access
        // Collaborator: sees only projects they are member of (filtered in controller)
        if ($user->hasRole('Collaborator')) {
            return true;
        }

        return false;
    }

    public function view(User $user, Project $project): bool
    {
        if ($user->hasAnyRole(['Administrator', 'Architect'])) {
            return true;
        }

        if ($user->hasRole('Collaborator')) {
            return $project->members()->where('user_id', $user->id)->exists();
        }

        return false;
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['Administrator', 'Architect']);
    }

    public function update(User $user, Project $project): bool
    {
        if ($user->hasAnyRole(['Administrator', 'Architect'])) {
            return true;
        }

        // Collaborator: cannot update projects
        return false;
    }

    public function delete(User $user, Project $project): bool
    {
        return $user->hasAnyRole(['Administrator', 'Architect']);
    }
}
