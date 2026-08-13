<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MockStudent extends Model
{
    use HasFactory;

    protected $fillable = [
        'mock_id',
        'name',
        'code',
        'attended',
        'phone',
    ];

    protected $casts = [
        'attended' => 'boolean',
    ];

    protected $with = [
        'attempt',
    ];

    public function mock()
    {
        return $this->belongsTo(Mock::class, 'mock_id');
    }

    public function attempt()
    {
        return $this->hasOne(Attempt::class, 'mock_student_id');
    }

    /**
     * Generates a unique candidate code in MSXXXXXX format (e.g., MS849201)
     */
    public static function generateUniqueCode(): string
    {
        do {
            $code = 'MS' . rand(100000, 999999);
        } while (static::where('code', $code)->exists());

        return $code;
    }
}
