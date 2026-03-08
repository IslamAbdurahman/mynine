<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class StoreTestRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'open' => Auth::user()->hasRole('Admin') ? ($this->open ?? 0) : 0,
        ]);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'folder_id' => 'required|exists:folders,id',
            'name' => 'required|string|max:255',
            'comment' => 'nullable|string|max:500',
            'active' => 'nullable|boolean',
            'open' => 'nullable|boolean',
        ];
    }
}
