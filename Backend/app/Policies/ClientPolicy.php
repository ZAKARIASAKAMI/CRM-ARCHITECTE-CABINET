<?php

namespace App\Policies;

use App\Models\Client;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class ClientPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['Administrator', 'Architect', 'Secretary']);
    }

    public function view(User $user, Client $client): bool
    {
        return $user->hasAnyRole(['Administrator', 'Architect', 'Secretary']);
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['Administrator', 'Architect', 'Secretary']);
    }

    public function update(User $user, Client $client): bool
    {
        return $user->hasAnyRole(['Administrator', 'Architect', 'Secretary']);
    }

    public function delete(User $user, Client $client): bool
    {
        return $user->hasAnyRole(['Administrator', 'Architect', 'Secretary']);
    }
}
