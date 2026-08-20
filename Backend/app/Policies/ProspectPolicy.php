<?php

namespace App\Policies;

use App\Models\Prospect;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class ProspectPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['Administrator', 'Secretary']);
    }

    public function view(User $user, Prospect $prospect): bool
    {
        return $user->hasAnyRole(['Administrator', 'Secretary']);
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['Administrator', 'Secretary']);
    }

    public function update(User $user, Prospect $prospect): bool
    {
        return $user->hasAnyRole(['Administrator', 'Secretary']);
    }

    public function delete(User $user, Prospect $prospect): bool
    {
        return $user->hasAnyRole(['Administrator', 'Secretary']);
    }

    public function convert(User $user, Prospect $prospect): bool
    {
        return $user->hasAnyRole(['Administrator', 'Secretary']);
    }
}
