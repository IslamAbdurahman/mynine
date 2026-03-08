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


    protected $appends = [
        'is_correct_count',
        'attempt_parts'
    ];


// AttemptType modelida
    public function getAttemptPartsAttribute()
    {
        $attempt_parts = AttemptPart::query()
            ->where('attempt_id', $this->attempt_id)
            ->whereHas('part.test_type', fn($q) => $q->where('type_id', $this->type_id)
            )
            ->with([
                'part.test_type',
                'part.attempt_part' => fn($q) => $q->where('attempt_id', $this->attempt_id),
                'part.sections.questions.options',
            ])
            ->orderBy('part_id')
            ->get();

        $attempt_parts->each(function ($attempt_part) {
            $attempt_part->part->sections->load([
                'questions.attempt_answer' => fn($q) => $q->where('attempt_part_id', $attempt_part->id)
                    ->with('attempt_answer_options')
            ]);
        });

        return $attempt_parts;
    }

    public function getIsCorrectCountAttribute()
    {
        return DB::table('attempt_answers as aa')
            ->join('attempt_parts as ap', 'aa.attempt_part_id', '=', 'ap.id')
            ->join('questions as q', 'aa.question_id', '=', 'q.id')
            ->join('sections as s', 'q.section_id', '=', 's.id')
            ->join('parts as p', 's.part_id', '=', 'p.id')
            ->join('test_types as tt', 'p.test_type_id', '=', 'tt.id')
            ->leftJoin('attempt_answer_options as aao', 'aa.id', '=', 'aao.attempt_answer_id')
            ->where('ap.attempt_id', $this->attempt_id)
            ->where('tt.type_id', $this->type_id)
            ->selectRaw("
        SUM(
            IF(
                tt.type_id IN (1, 2),
                IF(
                    aao.id IS NOT NULL,
                    aao.is_correct,
                    IF(
                        TRIM(LOWER(aa.answer_text)) = TRIM(LOWER(q.answer_text)),
                        1,
                        0
                    )
                ),
                aa.score
            )
        ) AS is_correct_count
    ")
            ->value('is_correct_count');

//
//        return DB::table('attempt_answers as aa')
//            ->join('questions as q', 'aa.question_id', '=', 'q.id')
//            ->join('sections as s', 'q.section_id', '=', 's.id')
//            ->join('question_types as qt', 's.question_type_id', '=', 'qt.id')
//            ->leftJoin('attempt_answer_options as aao', 'aa.id', '=', 'aao.attempt_answer_id')
//            ->leftJoin('options as o', 'aao.option_id', '=', 'o.id')
//            ->join('attempt_parts as ap', 'aa.attempt_part_id', '=', 'ap.id')
//            ->join('parts as p', 'ap.part_id', '=', 'p.id')
//            ->join('test_types as tt', 'p.test_type_id', '=', 'tt.id')
//            ->join('types as t', 'tt.type_id', '=', 't.id')
//            ->where('ap.attempt_id', $this->attempt_id)
//            ->where('tt.type_id', $this->type_id)
//            ->selectRaw("
//                        SUM(
//                            IF(
//                                t.name IN ('Listening', 'Reading'),
//                                IF(
//                                    o.id,
//                                    o.is_correct,
//                                    IF(
//                                        TRIM(LOWER(aa.answer_text)) = TRIM(LOWER(q.answer_text)),
//                                        1,
//                                        0
//                                    )
//                                ),
//                                aa.score
//                            )
//                        ) AS is_correct_count
//                    ")
//
//            ->value('is_correct_count');


    }

}
