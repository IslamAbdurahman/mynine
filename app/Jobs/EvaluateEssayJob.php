<?php
namespace App\Jobs;

use App\Models\AttemptAnswer;
use App\Services\OpenAIService;
use Exception;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class EvaluateEssayJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $answerId;

    public function __construct($answerId)
    {
        $this->answerId = $answerId;
    }

    public function handle()
    {
        $answer = AttemptAnswer::find($this->answerId);
        if (!$answer) return;

        try {
            $task = 'Evaluate the essay';
            $question = $answer->question->section->textarea;
            $essay = $answer->answer_text;

            $openAIService = new OpenAIService();
            $result = $openAIService->evaluateEssay($task, $question, $essay);

            $resultText = $result;
            $answer->score = null;

            if (preg_match('/```json\s*(\{.*"overall".*\})\s*```/s', $resultText, $matches)) {
                $jsonString = $matches[1];
                $data = json_decode($jsonString, true);

                if ($data && isset($data['overall'])) {
                    $answer->score = $data['overall'];
                }

                $resultText = str_replace($matches[0], '', $resultText);
            }

            $answer->review_note_ai = trim($resultText);
            $answer->save();

        } catch (Exception $e) {
            $answer->review_note_ai = $e->getMessage();
            $answer->save();
        }
    }
}
