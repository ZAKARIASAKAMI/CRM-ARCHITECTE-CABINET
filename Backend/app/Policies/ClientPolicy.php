<?php

namespace App\Policies;

use App\Models\Client;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class ClientPolicy
{
    use HandlesAuthorization;

    /**
     * Administrateur, Architecte responsable, and Assistante can manage clients.
     * Collaborateur cannot access clients at all.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['Administrateur', 'Architecte responsable', 'Assistante']);
    }

    public function view(User $user, Client $client): bool
    {
        return $user->hasAnyRole(['Administrateur', 'Architecte responsable', 'Assistante']);
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['Administrateur', 'Architecte responsable', 'Assistante']);
    }

    public function update(User $user, Client $client): bool
    {
        return $user->hasAnyRole(['Administrateur', 'Architecte responsable', 'Assistante']);
    }

    public function delete(User $user, Client $client): bool
    {
        return $user->hasAnyRole(['Administrateur', 'Architecte responsable', 'Assistante']);
    }
}
