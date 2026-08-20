<?php

namespace App\Policies;

use App\Models\Document;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class DocumentPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Document $document): bool
    {
        if ($user->hasAnyRole(['Administrator', 'Architect', 'Secretary'])) {
            return true;
        }

        // Collaborator: only documents linked to projects they are members of
        if ($user->hasRole('Collaborator')) {
            return $document->projects()
                ->whereHas('members', fn ($q) => $q->where('user_id', $user->id))
                ->exists();
        }

        return false;
    }

    public function create(User $user): bool
    {
        if ($user->hasAnyRole(['Administrator', 'Architect', 'Secretary'])) {
            return true;
        }

        return $user->hasRole('Collaborator');
    }

    public function update(User $user, Document $document): bool
    {
        return $user->hasAnyRole(['Administrator', 'Architect']);
    }

    public function delete(User $user, Document $document): bool
    {
        return $user->hasAnyRole(['Administrator', 'Architect']);
    }
}
