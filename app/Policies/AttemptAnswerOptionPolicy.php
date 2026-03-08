<?php

namespace App\Policies;

use App\Models\AttemptAnswerOption;
use App\Models\User\User;

class AttemptAnswerOptionPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return false;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, AttemptAnswerOption $attemptAnswerOption): bool
    {
        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return false;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, AttemptAnswerOption $attemptAnswerOption): bool
    {
        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, AttemptAnswerOption $attemptAnswerOption): bool
    {
        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, AttemptAnswerOption $attemptAnswerOption): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, AttemptAnswerOption $attemptAnswerOption): bool
    {
        return false;
    }
}
