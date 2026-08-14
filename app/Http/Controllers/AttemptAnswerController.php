<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAttemptAnswerRequest;
use App\Http\Requests\UpdateAttemptAnswerRequest;
use App\Models\AttemptAnswer;
use App\Models\AttemptPart;
use App\Models\Option;
use Illuminate\Validation\ValidationException;

class AttemptAnswerController extends Controller
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
    public function store(StoreAttemptAnswerRequest $request)
    {
        try {
            $attempt_part = AttemptPart::query()
                ->where('part_id', $request->part_id)
                ->where('attempt_id', $request->attempt_id)
                ->firstOrFail();

            $testType = $attempt_part->attempt->attempt_types
                ->where('type_id', $attempt_part->part->test_type->type_id)
                ->first();

            if ($testType && $testType->finished_at < now()) {
                if (!$testType->is_submitted) {
                    $attempt_answers = \App\Models\AttemptAnswer::query()
                        ->whereHas('attempt_part', function ($query) use ($testType) {
                            $query->where('attempt_id', $testType->attempt_id)
                                ->whereHas('part.test_type', function ($q) use ($testType) {
                                    $q->where('type_id', $testType->type_id);
                                });
                        })
                        ->whereHas('question.section.question_type', function ($query) {
                            $query->where('type', 'essay');
                        })
                        ->whereRaw('LENGTH(answer_text) > 10')
                        ->get();

                    foreach ($attempt_answers as $answer) {
                        \App\Jobs\EvaluateEssayJob::dispatch($answer->id);
                    }
                    $testType->finish();
                }
                throw ValidationException::withMessages([
                    'error' => ["Time is up for this test type! You cannot submit answers. ⏰"],
                ]);
            }

//            dd(
//                $attempt_part->part->test_type->type->name == 'Listening',
//                $attempt_part->part->test_type->type,
//                $attempt_part->finished_at < now()
//            );


            $attemptAnswer = AttemptAnswer::updateOrCreate(
                [
                    'attempt_part_id' => $attempt_part->id,
                    'question_id' => $request->question_id,
                ],
                [
                    'answer_text' => $request->answer_text,
                ]
            );

            // ✅ Agar options kelgan bo‘lsa
            if ($request->has('options') && is_array($request->options)) {
                // Eski optionlarni tozalash (har doim)
                $attemptAnswer->attempt_answer_options()->delete();

                // multiple_response bo‘lsa → barcha tanlangan optionlarni saqlash
                if ($attemptAnswer->question->section->question_type->type === 'multiple_response') {
                    foreach ($request->options as $optionId) {

                        $option = Option::query()->find($optionId);

                        $attemptAnswer->attempt_answer_options()->create([
                            'option_id' => $optionId,
                            'is_correct' => $option ? $option->is_correct : 0,
                        ]);
                    }
                } else {
                    // single_choice bo‘lsa → faqat birinchi optionni saqlash
                    if (count($request->options) > 0) {

                        $option = Option::query()->find($request->options[0]);

                        $attemptAnswer->attempt_answer_options()->create([
                            'option_id' => $request->options[0],
                            'is_correct' => $option ? $option->is_correct : 0,
                        ]);
                    }
                }
            }

            // ✅ FETCH uchun JSON javob qaytaramiz
            return response()->json([
                'success' => true,
                'message' => 'Attempt answer saved ✅',
                'data' => [
                    'attempt_answer_id' => $attemptAnswer->id,
                    'question_id' => $attemptAnswer->question_id,
                    'answer_text' => $attemptAnswer->answer_text,
                ],
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ]);
        }
    }


    /**
     * Display the specified resource.
     */
    public function show(AttemptAnswer $attemptAnswer)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(AttemptAnswer $attemptAnswer)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateAttemptAnswerRequest $request, AttemptAnswer $attemptAnswer)
    {
        //
    }

    /**
     * Re-trigger AI Essay Evaluation
     */
    public function reEvaluateAi(AttemptAnswer $attemptAnswer)
    {
        if (empty($attemptAnswer->answer_text) || mb_strlen($attemptAnswer->answer_text) < 10) {
            return back()->with('error', "Insho matni yetarli emas.");
        }

        \App\Jobs\EvaluateEssayJob::dispatch($attemptAnswer->id);

        return back()->with('success', "AI baholash jarayoni boshlandi! Tez orada natija yangilanadi.");
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(AttemptAnswer $attemptAnswer)
    {
        //
    }
}
