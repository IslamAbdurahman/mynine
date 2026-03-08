<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePartRequest extends FormRequest
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
            'test_type_id' => 'required|exists:test_types,id',
            'textarea' => 'nullable|string',
            'audio_path' => ['nullable', 'file', 'max:20240'],
            'minute' => 'nullable|integer|min:0|max:60',
            'comment' => 'nullable|string|max:500',
        ];
    }
}
