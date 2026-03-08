<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMockRequest extends FormRequest
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
            'name' => 'required|string|max:255',
            'test_id' => 'required|exists:tests,id',
            'comment' => 'nullable|string',
            'started_at' => 'required|date|date_format:Y-m-d H:i|before:finished_at',
            'finished_at' => 'required|date|date_format:Y-m-d H:i|after:started_at',
            'active' => 'nullable|boolean',
        ];
    }
}
