<?php

namespace App\Policies;

use App\Models\Prospect;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class ProspectPolicy
{
    use HandlesAuthorization;

    /**
     * Only Administrateur and Assistante can manage prospects.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['Administrateur', 'Assistante']);
    }

    public function view(User $user, Prospect $prospect): bool
    {
        return $user->hasAnyRole(['Administrateur', 'Assistante']);
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['Administrateur', 'Assistante']);
    }

    public function update(User $user, Prospect $prospect): bool
    {
        return $user->hasAnyRole(['Administrateur', 'Assistante']);
    }

    public function delete(User $user, Prospect $prospect): bool
    {
        return $user->hasAnyRole(['Administrateur', 'Assistante']);
    }

    /**
     * Convert a prospect into a client (and optionally a project).
     * Only Admin and Assistante.
     */
    public function convert(User $user, Prospect $prospect): bool
    {
        return $user->hasAnyRole(['Administrateur', 'Assistante']);
    }
}
