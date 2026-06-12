<?php

namespace App\Services;

use OpenAI;
use Exception;

class OpenAIService
{
    protected $client;

    public function __construct()
    {
        $this->client = OpenAI::client(config('services.openai.key'));
    }

    public function evaluateEssay(string $taskPrompt, string $questionText, string $essayText): string
    {
        $essayText = mb_substr($essayText, 0, 4000);
        $questionText = strip_tags($questionText);

        $promptText = <<<EOT
You are an IELTS examiner. Evaluate the following essay based on the four IELTS writing criteria:
1. Task Response
2. Coherence & Cohesion
3. Lexical Resource
4. Grammatical Range & Accuracy

Return a JSON object containing:
- "overall": The overall band score (0 to 9, e.g. 6.5).
- "scores": An object containing the individual criteria band scores:
  - "task_response"
  - "coherence_cohesion"
  - "lexical_resource"
  - "grammatical_range_accuracy"
- "feedback": Detailed feedback and recommendations (about 250 words) formatted in markdown.

Task: {$taskPrompt}
Question: {$questionText}
Essay: {$essayText}
EOT;

        try {
            $response = $this->client->chat()->create([
                'model' => 'gpt-4o-mini',
                'response_format' => ['type' => 'json_object'],
                'messages' => [
                    ['role' => 'system', 'content' => 'You are an IELTS writing examiner. You must return your evaluation in the requested JSON structure.'],
                    ['role' => 'user', 'content' => $promptText],
                ],
                'max_tokens' => 1200,
            ]);

            return $response->choices[0]->message->content ?? '{"overall": 0, "feedback": "No response from AI"}';
        } catch (\Exception $e) {
            return json_encode([
                'overall' => 0,
                'feedback' => 'Error: ' . $e->getMessage()
            ]);
        }
    }


}
