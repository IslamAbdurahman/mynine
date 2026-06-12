<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class AttemptType extends Model
{
    /** @use HasFactory<\Database\Factories\AttemptTypeFactory> */
    use HasFactory;


    protected $fillable = [
        'attempt_id',
        'type_id',
        'score',
        'is_correct_count',
        'comment',
        'started_at',
        'finished_at',
    ];

    protected $with = [
        'type',
    ];

    public function attempt()
    {
        return $this->belongsTo(Attempt::class, 'attempt_id');
    }

    public function type()
    {
        return $this->belongsTo(Type:: class, 'type_id');
    }




// AttemptType modelida
    public function getAttemptPartsAttribute()
    {
        $attempt_parts = AttemptPart::query()
            ->where(function ($query) {
                $query->where('attempt_id', $this->attempt_id);
            })
            ->whereHas('part.test_type', function ($q) {
                $q->where(function ($query) {
                    $query->where('type_id', $this->type_id);
                });
            })
            ->with([
                'part.test_type',
                'part.attempt_part' => fn($q) => $q->where('attempt_id', $this->attempt_id),
                'part.sections.questions.options',
            ])
            ->orderBy('part_id')
            ->get();

        $attempt_parts->each(function ($attempt_part) {
            if ($attempt_part->part && $attempt_part->part->sections) {
                $attempt_part->part->sections->load([
                    'questions.attempt_answer' => fn($q) => $q->where('attempt_part_id', $attempt_part->id)
                        ->with('attempt_answer_options.option')
                ]);
            }
        });

        return $attempt_parts;
    }

    /**
     * is_correct_count ni hisoblash uchun static method
     * Submit qilganda va essay baholaganda chaqiriladi
     */
    public static function calculateIsCorrectCount($attempt_id, $type_id)
    {
        $answers = \App\Models\AttemptAnswer::query()
            ->whereHas('attempt_part', function ($query) use ($attempt_id, $type_id) {
                $query->where('attempt_id', $attempt_id)
                    ->whereHas('part.test_type', function ($q) use ($type_id) {
                        $q->where('type_id', $type_id);
                    });
            })
            ->with(['question.options', 'attempt_answer_options', 'attempt_part.part.test_type'])
            ->get();

        $correctCount = 0;

        foreach ($answers as $answer) {
            $question = $answer->question;
            if (!$question) {
                continue;
            }

            $testType = $answer->attempt_part->part->test_type;
            
            // Writing (3) or Speaking (4)
            if (!in_array($testType->type_id, [1, 2])) {
                $correctCount += $answer->score;
                continue;
            }

            // Listening (1) and Reading (2)
            if ($question->options->count() > 0) {
                foreach ($answer->attempt_answer_options as $aao) {
                    if ($aao->is_correct == 1) {
                        $correctCount += 1;
                    }
                }
            } else {
                $studentAnswer = trim(strtolower($answer->answer_text));
                if ($studentAnswer === '') {
                    continue;
                }

                $correctAnswerText = $question->answer_text;
                if (empty($correctAnswerText)) {
                    continue;
                }

                $delimiters = ['/', ';'];
                $normalizedCorrectAnswers = [$correctAnswerText];
                
                foreach ($delimiters as $delimiter) {
                    $tempAnswers = [];
                    foreach ($normalizedCorrectAnswers as $val) {
                        if (str_contains($val, $delimiter)) {
                            $tempAnswers = array_merge($tempAnswers, explode($delimiter, $val));
                        } else {
                            $tempAnswers[] = $val;
                        }
                    }
                    $normalizedCorrectAnswers = $tempAnswers;
                }

                $normalizedCorrectAnswers = array_map(function($val) {
                    return trim(strtolower($val));
                }, $normalizedCorrectAnswers);

                if (in_array($studentAnswer, $normalizedCorrectAnswers)) {
                    $correctCount += 1;
                }
            }
        }

        return $correctCount;
    }

    /**
     * Bu attempt_type uchun is_correct_count ni qayta hisoblash va DB ga yozish
     */
    public function recalculateIsCorrectCount()
    {
        $this->is_correct_count = static::calculateIsCorrectCount($this->attempt_id, $this->type_id) ?? 0;
        $this->save();
        return $this->is_correct_count;
    }

    /**
     * AttemptType ni vaqtidan oldin yakunlash
     */
    public function finish()
    {
        $this->finished_at = now();
        $this->save();

        // Bog'liq AttemptPartlarni ham yakunlash
        AttemptPart::query()
            ->where('attempt_id', $this->attempt_id)
            ->whereHas('part.test_type', fn($q) => $q->where('type_id', $this->type_id))
            ->where(fn($q) => $q->whereNull('finished_at')->orWhere('finished_at', '>', now()))
            ->update(['finished_at' => now()]);

        // Ballarni hisoblash
        $this->recalculateIsCorrectCount();

        return $this;
    }
}
