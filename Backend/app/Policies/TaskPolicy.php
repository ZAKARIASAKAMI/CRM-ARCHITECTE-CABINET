<?php

namespace App\Policies;

use App\Models\Task;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class TaskPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        // Administrator, Architect: full view
        // Collaborator: view assigned tasks only (filtered in controller)
        return true;
    }

    public function view(User $user, Task $task): bool
    {
        if ($user->hasAnyRole(['Administrator', 'Architect'])) {
            return true;
        }

        if ($user->hasRole('Collaborator')) {
            return $task->assigned_to === $user->id
                || $task->members()->where('user_id', $user->id)->exists();
        }

        return false;
    }

    public function create(User $user): bool
    {
        if ($user->hasAnyRole(['Administrator', 'Architect'])) {
            return true;
        }

        // Collaborator: cannot create tasks
        return false;
    }

    public function update(User $user, Task $task): bool
    {
        if ($user->hasAnyRole(['Administrator', 'Architect'])) {
            return true;
        }

        if ($user->hasRole('Collaborator')) {
            return $task->assigned_to === $user->id
                || $task->members()->where('user_id', $user->id)->exists();
        }

        return false;
    }

    public function delete(User $user, Task $task): bool
    {
        return $user->hasAnyRole(['Administrator', 'Architect']);
    }
}
