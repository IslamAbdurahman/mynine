<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreQuestionRequest;
use App\Http\Requests\UpdateQuestionRequest;
use App\Models\Question;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class QuestionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreQuestionRequest $request)
    {
        try {
            $data = $request->validated();

            DB::beginTransaction();
            // ✅ Create the Question
            $question = Question::create([
                'section_id' => $data['section_id'],
                'textarea' => $data['textarea'],
                'answer_text' => $data['answer_text'],
            ]);

            // ✅ Save options if provided
            if (!empty($data['options'])) {
                foreach ($data['options'] as $option) {
                    $question->options()->create([
                        'textarea' => $option['textarea'],
                        'is_correct' => $option['is_correct'] ? 1 : 0,
                    ]);
                }
            }

            DB::commit();

            return back()->with('success', __('updated_successfully'));
        } catch (\Exception $e) {
            throw ValidationException::withMessages([
                'error' => [$e->getMessage()],
            ]);
        }
    }


    /**
     * Display the specified resource.
     */
    public function show(Question $question)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Question $question)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateQuestionRequest $request, Question $question)
    {
        try {

            $question->update($request->validated());

            return back()->with('success', __('updated_successfully'));

        } catch (\Exception $e) {
            // Proper Inertia error response
            throw ValidationException::withMessages([
                'error' => [$e->getMessage()],
            ]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Question $question)
    {
        $test = $question->section?->part?->test_type?->test;
        if ($test && ($test->attempts()->exists() || $test->mocks()->whereHas('attempts')->exists())) {
            throw ValidationException::withMessages([
                'error' => [__('test_has_attempts')],
            ]);
        }

        try {
            $question->delete();
            return back()->with('success', __('deleted_successfully'));
        } catch (\Exception $e) {
            // Proper Inertia error response
            throw ValidationException::withMessages([
                'error' => [$e->getMessage()],
            ]);
        }
    }

}
