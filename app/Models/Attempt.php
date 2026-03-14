<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\AttemptAnswer;
use App\Jobs\EvaluateEssayJob;
use Illuminate\Support\Facades\DB;

class Attempt extends Model
{
    /** @use HasFactory<\Database\Factories\AttemptsFactory> */
    use HasFactory;


    protected $fillable = [
        'name',
        'mock_id',
        'user_id',
        'test_id',
        'started_at',
        'finished_at',
        'status',
    ];

    protected $with = [
        'test',
        'user',
        'mock',
        'attempt_types',
    ];

    public function mock()
    {
        return $this->belongsTo(Mock::class, 'mock_id');
    }

    public function user()
    {
        return $this->belongsTo(User\User::class, 'user_id');
    }

    public function test()
    {
        return $this->belongsTo(Test::class, 'test_id');
    }


    public function attempt_parts()
    {
        return $this->hasMany(AttemptPart::class, 'attempt_id');
    }

    public function attempt_types()
    {
        return $this->hasMany(AttemptType::class, 'attempt_id');
    }

    public function finish()
    {
        if ($this->finished_at) {
            return $this;
        }

        DB::beginTransaction();
        try {
            // Mark the attempt as finished
            $this->finished_at = now();
            $this->save();

            // Mark all attempt parts as finished
            foreach ($this->attempt_parts as $attempt_part) {
                if (!$attempt_part->finished_at) {
                    $attempt_part->finished_at = now();
                    $attempt_part->save();
                }
            }

            // Calculate and store is_correct_count for all attempt_types
            foreach ($this->attempt_types as $attemptType) {
                $attemptType->recalculateIsCorrectCount();
            }

            // Dispatch Essay Evaluation Jobs if any
            $essayAnswers = AttemptAnswer::query()
                ->whereHas('attempt_part', function ($query) {
                    $query->where('attempt_id', $this->id);
                })
                ->whereHas('question.section.question_type', function ($query) {
                    $query->where('type', 'essay');
                })
                ->whereRaw('LENGTH(answer_text) > 200')
                ->get();

            foreach ($essayAnswers as $answer) {
                EvaluateEssayJob::dispatch($answer->id);
            }

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }

        return $this;
    }

}
