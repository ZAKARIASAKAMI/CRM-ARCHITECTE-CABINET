<?php

namespace App\Policies;

use App\Models\Document;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class DocumentPolicy
{
    use HandlesAuthorization;

    /**
     * View access: Admin, Architecte, Assistante, and Collaborateur
     * (Collaborateur is restricted by controller/query scope to project membership).
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Document $document): bool
    {
        if ($user->hasAnyRole(['Administrateur', 'Architecte responsable', 'Assistante'])) {
            return true;
        }

        // Collaborateur: only documents linked to projects they are members of
        if ($user->hasRole('Collaborateur')) {
            return $document->projects()
                ->whereHas('members', fn ($q) => $q->where('user_id', $user->id))
                ->exists();
        }

        return false;
    }

    /**
     * Upload permission: Admin, Architecte, Assistante have full upload.
     * Collaborateur can upload only to projects they are members of.
     */
    public function create(User $user): bool
    {
        if ($user->hasAnyRole(['Administrateur', 'Architecte responsable', 'Assistante'])) {
            return true;
        }

        return $user->hasRole('Collaborateur');
    }

    /**
     * Update: Admin and Architecte only.
     */
    public function update(User $user, Document $document): bool
    {
        return $user->hasAnyRole(['Administrateur', 'Architecte responsable']);
    }

    /**
     * Delete: Admin and Architecte only.
     * Collaborateur and Assistante cannot delete documents.
     */
    public function delete(User $user, Document $document): bool
    {
        return $user->hasAnyRole(['Administrateur', 'Architecte responsable']);
    }
}
