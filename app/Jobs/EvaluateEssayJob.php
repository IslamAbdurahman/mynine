<?php
namespace App\Jobs;

use App\Models\AttemptAnswer;
use App\Models\AttemptType;
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
            $resultJson = $openAIService->evaluateEssay($task, $question, $essay);

            $data = json_decode($resultJson, true);
            $answer->score = null;

            if ($data && isset($data['overall'])) {
                $answer->score = $data['overall'];
                
                $scores = $data['scores'] ?? [];
                $feedback = $data['feedback'] ?? '';
                
                $formattedReview = "### IELTS Writing Evaluation\n\n";
                $formattedReview .= "**Overall Band Score:** " . $data['overall'] . "\n\n";
                if (!empty($scores)) {
                    $formattedReview .= "#### Individual Criteria Scores:\n";
                    $formattedReview .= "- **Task Response:** " . ($scores['task_response'] ?? 'N/A') . "\n";
                    $formattedReview .= "- **Coherence & Cohesion:** " . ($scores['coherence_cohesion'] ?? 'N/A') . "\n";
                    $formattedReview .= "- **Lexical Resource:** " . ($scores['lexical_resource'] ?? 'N/A') . "\n";
                    $formattedReview .= "- **Grammatical Range & Accuracy:** " . ($scores['grammatical_range_accuracy'] ?? 'N/A') . "\n\n";
                }
                $formattedReview .= "#### Detailed Feedback:\n" . $feedback;
                
                $answer->review_note_ai = trim($formattedReview);
            } else {
                $answer->review_note_ai = $resultJson;
            }
            $answer->save();

            // Recalculate is_correct_count for the corresponding attempt_type
            $this->recalculateAttemptTypeScore($answer);

        } catch (Exception $e) {
            $answer->review_note_ai = $e->getMessage();
            $answer->save();
        }
    }

    /**
     * Essay baholagandan keyin tegishli attempt_type uchun is_correct_count ni yangilash
     */
    private function recalculateAttemptTypeScore(AttemptAnswer $answer)
    {
        $attemptPart = $answer->attempt_part;
        if (!$attemptPart) return;

        $part = $attemptPart->part;
        if (!$part || !$part->test_type) return;

        $attemptType = AttemptType::where('attempt_id', $attemptPart->attempt_id)
            ->where('type_id', $part->test_type->type_id)
            ->first();

        if ($attemptType) {
            $attemptType->recalculateIsCorrectCount();
        }
    }
}

