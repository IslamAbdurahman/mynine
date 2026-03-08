<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAttemptRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'mock_id' => 'required|exists:mocks,id',
            'user_id' => 'required|exists:users,id',
            'test_id' => 'required|exists:tests,id',
            'started_at' => 'required|date_format:Y-m-d H:i:s',
            'finished_at' => 'required|date_format:Y-m-d H:i:s|after_or_equal:started_at',
            'status' => 'nullable|integer|in:0,1',
        ];
    }
}
