<?php

namespace App\Policies;

use App\Models\Task;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class TaskPolicy
{
    use HandlesAuthorization;

    /**
     * Admin & Architecte: full access to all tasks.
     * Collaborateur: can view/update only tasks assigned to them or where they are a member.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Task $task): bool
    {
        if ($user->hasAnyRole(['Administrateur', 'Architecte responsable'])) {
            return true;
        }

        // Collaborateur: only assigned tasks or tasks where they are a member
        if ($user->hasRole('Collaborateur')) {
            return $task->assigned_to === $user->id
                || $task->members()->where('user_id', $user->id)->exists();
        }

        return false;
    }

    public function create(User $user): bool
    {
        if ($user->hasAnyRole(['Administrateur', 'Architecte responsable'])) {
            return true;
        }

        // Collaborateur: can create tasks only if they have the permission
        // (policy is a secondary gate after permission check)
        return $user->hasPermissionTo('tasks.create');
    }

    /**
     * Admin & Architect: can update any task.
     * Collaborateur: can only update tasks assigned to them or where they are a member.
     */
    public function update(User $user, Task $task): bool
    {
        if ($user->hasAnyRole(['Administrateur', 'Architecte responsable'])) {
            return true;
        }

        if ($user->hasRole('Collaborateur')) {
            return $task->assigned_to === $user->id
                || $task->members()->where('user_id', $user->id)->exists();
        }

        return false;
    }

    public function delete(User $user, Task $task): bool
    {
        return $user->hasAnyRole(['Administrateur', 'Architecte responsable']);
    }
}
