<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Attempt extends Model
{
    /** @use HasFactory<\Database\Factories\AttemptsFactory> */
    use HasFactory;


    protected $fillable = [
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

}
