<?php

namespace App\Policies;

use App\Models\Mock;
use App\Models\User\User;

class MockPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasRole('Admin') || $user->hasRole('Teacher');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Mock $mock): bool
    {
        return $user->hasRole('Admin') || $mock->user_id === $user->id || $mock->active == 1;
    }

    public function create(User $user): bool
    {
        return $user->hasRole('Admin') || $user->hasRole('Teacher');
    }

    public function update(User $user, Mock $mock): bool
    {
        return $user->hasRole('Admin') || $mock->user_id === $user->id;
    }

    public function delete(User $user, Mock $mock): bool
    {
        return $user->hasRole('Admin') || $mock->user_id === $user->id;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Mock $mock): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Mock $mock): bool
    {
        return false;
    }
}
