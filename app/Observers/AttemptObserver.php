<?php

namespace App\Observers;

use App\Jobs\SendResultEmailJob;
use App\Jobs\SendResultTelegramJob;
use App\Models\Attempt;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AttemptObserver
{
    /**
     * Handle the Attempt "created" event.
     */
    public function created(Attempt $attempt): void
    {
        //
    }

    /**
     * Handle the Attempt "updated" event.
     */
    public function updating(Attempt $attempt): void
    {

    }

    public function updated(Attempt $attempt): void
    {
        // Only trigger when finished_at changes from null → not null
        if ($attempt->getOriginal('finished_at') === null && $attempt->finished_at !== null) {

            // Send email if user has Google ID
            if (filter_var($attempt->user->email, FILTER_VALIDATE_EMAIL)) {
                dispatch(new \App\Jobs\SendResultEmailJob($attempt->user, $attempt));
            }

            // Send Telegram message if user has Telegram ID
            if ($attempt->user->telegram_id !== null) {
                dispatch(new SendResultTelegramJob($attempt->user, $attempt));
            }
        }
    }

    /**
     * Handle the Attempt "deleted" event.
     */
    public function deleting(Attempt $attempt): void
    {
        $authUser = Auth::user();

        // Admin emas yoki test egasi ham emas bo'lsa -> taqiqlanadi
        if (
            !$authUser->hasRole('Admin') &&
            $authUser->id !== $attempt->mock?->user_id
        ) {
            throw new \Exception('You are not allowed to access this page');
        }

        DB::transaction(function () use ($attempt) {
            // Delete parts
            foreach ($attempt->attempt_parts as $attempt_part) {
                // Delete answers inside part
                foreach ($attempt_part->attempt_answers as $attempt_answer) {
                    $attempt_answer->attempt_answer_options()->delete();
                    $attempt_answer->delete();
                }
                $attempt_part->delete(); // delete part after answers
            }

            // Delete types
            $attempt->attempt_types()->delete();
        });
    }


    /**
     * Handle the Attempt "restored" event.
     */
    public function restored(Attempt $attempt): void
    {
        //
    }

    /**
     * Handle the Attempt "force deleted" event.
     */
    public function forceDeleted(Attempt $attempt): void
    {
        //
    }
}
