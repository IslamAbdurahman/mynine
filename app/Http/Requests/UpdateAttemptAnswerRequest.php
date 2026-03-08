<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAttemptAnswerRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'attempt_part_id' => 'required|exists:attempt_parts,id',
            'question_id'     => 'required|exists:questions,id',
            'answer_text'     => 'nullable|string|max:1000',
            'audio_path'      => 'nullable|string|max:255',
            'transcript'      => 'nullable|string|max:1000',
            'review_note'     => 'nullable|string|max:1000',
            'is_correct'      => 'required|boolean',
            'score'           => 'required|integer|min:0',
        ];
    }
}
