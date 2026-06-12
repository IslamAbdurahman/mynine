<?php

namespace App\Services;

class IeltsScoreConverter
{
    /**
     * Convert Listening correct answers count to IELTS Band Score
     */
    public static function convertListening(int $correctCount): float
    {
        if ($correctCount >= 39) return 9.0;
        if ($correctCount >= 37) return 8.5;
        if ($correctCount >= 35) return 8.0;
        if ($correctCount >= 32) return 7.5;
        if ($correctCount >= 30) return 7.0;
        if ($correctCount >= 26) return 6.5;
        if ($correctCount >= 23) return 6.0;
        if ($correctCount >= 18) return 5.5;
        if ($correctCount >= 16) return 5.0;
        if ($correctCount >= 13) return 4.5;
        if ($correctCount >= 10) return 4.0;
        if ($correctCount >= 8)  return 3.5;
        if ($correctCount >= 6)  return 3.0;
        if ($correctCount >= 4)  return 2.5;
        if ($correctCount == 3)  return 2.0;
        if ($correctCount == 2)  return 1.5;
        if ($correctCount == 1)  return 1.0;
        return 0.0;
    }

    /**
     * Convert Reading (Academic) correct answers count to IELTS Band Score
     */
    public static function convertReading(int $correctCount): float
    {
        if ($correctCount >= 39) return 9.0;
        if ($correctCount >= 37) return 8.5;
        if ($correctCount >= 35) return 8.0;
        if ($correctCount >= 33) return 7.5;
        if ($correctCount >= 30) return 7.0;
        if ($correctCount >= 27) return 6.5;
        if ($correctCount >= 23) return 6.0;
        if ($correctCount >= 19) return 5.5;
        if ($correctCount >= 15) return 5.0;
        if ($correctCount >= 13) return 4.5;
        if ($correctCount >= 10) return 4.0;
        if ($correctCount >= 8)  return 3.5;
        if ($correctCount >= 6)  return 3.0;
        if ($correctCount >= 4)  return 2.5;
        if ($correctCount == 3)  return 2.0;
        if ($correctCount == 2)  return 1.5;
        if ($correctCount == 1)  return 1.0;
        return 0.0;
    }
}
