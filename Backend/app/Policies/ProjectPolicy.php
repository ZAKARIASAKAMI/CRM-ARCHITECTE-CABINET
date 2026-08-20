<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class ProjectPolicy
{
    use HandlesAuthorization;

    /**
     * Administrateur and Architecte responsable have full access.
     * Collaborateur can only view projects where they are a member.
     */
    public function viewAny(User $user): bool
    {
        if ($user->hasAnyRole(['Administrateur', 'Architecte responsable'])) {
            return true;
        }

        // Collaborateur sees only projects they are member of
        return true;
    }

    /**
     * Admin & Architect can view any project.
     * Collaborateur can only view projects they are a member of.
     */
    public function view(User $user, Project $project): bool
    {
        if ($user->hasAnyRole(['Administrateur', 'Architecte responsable'])) {
            return true;
        }

        // Collaborateur: only if they are a member of this project
        if ($user->hasRole('Collaborateur')) {
            return $project->members()->where('user_id', $user->id)->exists();
        }

        return false;
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['Administrateur', 'Architecte responsable']);
    }

    public function update(User $user, Project $project): bool
    {
        if ($user->hasAnyRole(['Administrateur', 'Architecte responsable'])) {
            return true;
        }

        // Collaborateur: cannot update projects
        return false;
    }

    public function delete(User $user, Project $project): bool
    {
        return $user->hasAnyRole(['Administrateur', 'Architecte responsable']);
    }

    /**
     * Collaborateurs viewing their assigned projects list
     * should only see projects where they are members.
     */
    public function viewAssignedProjects(User $user): bool
    {
        return $user->hasRole('Collaborateur');
    }
}
