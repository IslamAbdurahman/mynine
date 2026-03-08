<?php

namespace App\Services;

use OpenAI;
use Exception;

class OpenAIService
{
    protected $client;

    public function __construct()
    {
        $this->client = OpenAI::client(env('OPENAI_API_KEY'));
    }

    public function evaluateEssay(string $taskPrompt, string $questionText, string $essayText): string
    {
        // Limit essay text to avoid token overflow (example: 4000 characters)
        $essayText = mb_substr($essayText, 0, 4000);

        $questionText = strip_tags($questionText); // removes all HTML tags

        $promptText = <<<EOT
You are an IELTS examiner. Evaluate the following essay based on:

1. Task Response
2. Coherence & Cohesion
3. Lexical Resource
4. Grammatical Range & Accuracy

Give band scores (0–9) for each and overall, plus feedback 250 words. and end of response need json {overall : 1-9 }

Task: {$taskPrompt}
Question: {$questionText}
Essay: {$essayText}
EOT;

        try {
            $response = $this->client->chat()->create([
                'model' => 'gpt-4o-mini', // lightweight & cheap
                'messages' => [
                    ['role' => 'system', 'content' => 'You are a helpful IELTS examiner.'],
                    ['role' => 'user', 'content' => $promptText],
                ],
                'max_tokens' => 1000, // control output length
            ]);

            return $response->choices[0]->message->content ?? 'No response from AI';
        } catch (\Exception $e) {
            return "Error: " . $e->getMessage();
        }
    }


}
