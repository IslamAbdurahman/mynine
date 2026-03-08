<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Question extends Model
{
    /** @use HasFactory<\Database\Factories\QuestionFactory> */
    use HasFactory;


    protected $fillable = [
        'section_id',
        'order',
        'textarea',
        'answer_text'
    ];

    protected $with = [
        'options'
    ];

    public function section()
    {
        return $this->belongsTo(Section::class, 'section_id');
    }

    public function images()
    {
        return $this->hasMany(Image::class, 'question_id');
    }

    public function options()
    {
        return $this->hasMany(Option::class, 'question_id');
    }

    public function attempt_answer()
    {
        return $this->hasOne(AttemptAnswer::class, 'question_id');
    }

    public function attempt_answers()
    {
        return $this->hasMany(AttemptAnswer::class, 'question_id');
    }


    protected $appends = ['is_correct_count'];

    public function getIsCorrectCountAttribute()
    {
        return DB::table('options')
            ->where('options.question_id', $this->id)
            ->selectRaw("
            CASE
                WHEN COUNT(options.id) = 0 THEN 1
                ELSE SUM(CASE WHEN options.is_correct = 1 THEN 1 ELSE 0 END)
            END as is_correct_count
        ")
            ->value('is_correct_count');
    }
}



