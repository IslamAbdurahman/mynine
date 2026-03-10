<?php

namespace App\Http\Controllers;

use App\Jobs\EvaluateEssayJob;
use App\Models\Attempt;
use App\Models\AttemptAnswer;
use App\Models\AttemptPart;
use App\Models\AttemptType;
use App\Models\Part;
use App\Models\Test;
use App\Models\TestType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Illuminate\Validation\ValidationException;

class PracticeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $request->validate([
            'attempt_id' => 'required|exists:attempts,id'
        ]);

        try {
            $attempt = Attempt::find($request->attempt_id);

            if (!$attempt) {
                return back()->with('error', __('error.attempt_not_found'));
            }

            if ($attempt->user_id !== Auth::id()) {
                return back()->with('error', __('error.unauthorized_attempt'));
            }

            if ($attempt->finished_at !== null) {
                return back()->with('error', __('error.attempt_already_finished'));
            }

            return Inertia::render('practice/index', [
                'attempt' => $attempt
            ]);
            

        } catch (\Exception $e) {
            throw ValidationException::withMessages([
                'error' => [$e->getMessage()],
            ]);
        }


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
    public function store(Request $request)
    {
        //
    }

    public function submit($attempt_id)
    {
        try {
            $attempt = Attempt::with([
                'test' => function ($query) {
                    $query->with([
                        'types'
                    ]);
                },
                'attempt_parts' => function ($query) {
                    $query->with([
                        'part',
                        'attempt_answers' => function ($query) {
                            $query->with('attempt_answer_options');
                        }
                    ]);
                },
            ])
                ->findOrFail($attempt_id);

            // If the attempt is already finished, return it
            if ($attempt->finished_at) {
                return redirect(route('attempt.index'))->with('success', __('success.test_submitted'));
            }

            DB::beginTransaction();

            $attempt_answers = AttemptAnswer::query()
                ->whereHas('attempt_part', function ($query) use ($attempt) {
                    $query->where('attempt_id', $attempt->id);
                })
                ->whereHas('question.section.question_type', function ($query) {
                    $query->where('type', 'essay');
                })
                ->whereRaw('LENGTH(answer_text) > 200')
                ->get();

            foreach ($attempt_answers as $answer) {
                EvaluateEssayJob::dispatch($answer->id);
            }

            // Mark the attempt as finished
            $attempt->finished_at = now();
            $attempt->save();

            // Mark all attempt parts as finished
            foreach ($attempt->attempt_parts as $attempt_part) {
                if (!$attempt_part->finished_at) {
                    $attempt_part->finished_at = now();
                    $attempt_part->save();
                }
            }

            // Calculate and store is_correct_count for all attempt_types
            $attempt_types = AttemptType::where('attempt_id', $attempt->id)->get();
            foreach ($attempt_types as $attemptType) {
                $attemptType->recalculateIsCorrectCount();
            }

            DB::commit();

            if ($attempt->mock_id && $attempt->mock?->slug) {
                return redirect('/?slug=' . $attempt->mock->slug)->with('success', __('success.test_submitted'));
            }

            return redirect(route('attempt.index'))->with('success', __('success.test_submitted'));

        } catch (\Exception $e) {
            return response()->json([
                'data' => [],
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }

    }

    public function submit_test_type($attempt_id, $type_id)
    {
        try {
            $attempt_type = AttemptType::where('attempt_id', $attempt_id)
                ->where('type_id', $type_id)
                ->firstOrFail();

            if ($attempt_type->finished_at && $attempt_type->finished_at <= now()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Test type already submitted.',
                ]);
            }

            DB::beginTransaction();

            // Dispatch Essay Evaluation Jobs if any
            $attempt_answers = \App\Models\AttemptAnswer::query()
                ->whereHas('attempt_part', function ($query) use ($attempt_id, $type_id) {
                    $query->where('attempt_id', $attempt_id)
                        ->whereHas('part.test_type', function ($q) use ($type_id) {
                            $q->where('type_id', $type_id);
                        });
                })
                ->whereHas('question.section.question_type', function ($query) {
                    $query->where('type', 'essay');
                })
                ->whereRaw('LENGTH(answer_text) > 200')
                ->get();

            foreach ($attempt_answers as $answer) {
                EvaluateEssayJob::dispatch($answer->id);
            }

            $attempt_type->finish();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Test type submitted successfully.',
                'data' => $attempt_type
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, $part_id)
    {
        //
    }

    public function practice_attempt($attempt_id)
    {
        try {

            $attempt = Attempt::with([
                'test' => function ($query) {
                    $query->with([
                        'types' => function ($query) {
                            $query->whereHas('parts');
                        }
                    ]);
                },
            ])
                ->findOrFail($attempt_id);

            return response()->json([
                'data' => $attempt,
                'success' => true,
                'message' => 'Attempt retrieved successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'data' => [],
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function practice_test_type(Request $request, $test_type_id)
    {
        try {

            $request->validate([
                'attempt_id' => 'required|exists:attempts,id',
            ]);

            $test_type = TestType::with([
                'parts'
            ])
                ->findOrFail($test_type_id);

            return response()->json([
                'data' => $test_type,
                'success' => true,
                'message' => 'Attempt retrieved successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'data' => [],
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);

        }
    }

    public function practice_part(Request $request, $part_id)
    {
        try {
            $request->validate([
                'attempt_id' => 'required|exists:attempts,id',
            ]);

            DB::beginTransaction();

            $part = Part::with([
                'test_type'
            ])->findOrFail($part_id);


            if ($part->test_type->type->name == 'Listening') {
                $finished_at = now()->addSeconds($part->test_type->test->playtime_seconds + 5);
            } else {
                $finished_at = now()->addMinutes($part->test_type->type->minute);
            }

            $attempt_type = AttemptType::firstOrCreate(
                [
                    'attempt_id' => $request->attempt_id,
                    'type_id' => $part->test_type->type_id
                ],
                [
                    'started_at' => now(),
                    'finished_at' => $finished_at,
                ]
            );

            $attempt_part = AttemptPart::firstOrCreate(
                [
                    'attempt_id' => $request->attempt_id,
                    'part_id' => $part_id
                ],
                [
                    'started_at' => now(),
                    'finished_at' => now()->addMinutes($part->minute),
                ]
            );

            $part = Part::with([
                'test_type',
                'attempt_part' => function ($query) use ($attempt_part) {
                    $query->where('attempt_id', $attempt_part->attempt_id);
                },
                'sections' => function ($query) use ($attempt_part) {
                    $query->with([
                        'questions' => function ($query) use ($attempt_part) {
                            $query->with([
                                'options',
                                'attempt_answer' => function ($query) use ($attempt_part) {
                                    $query->where('attempt_part_id', $attempt_part->id)
                                        ->with('attempt_answer_options');
                                }
                            ]);
                        }
                    ]);
                },
            ])
                ->findOrFail($part_id);

            DB::commit();

            return response()->json([
                'data' => $part,
                'success' => true,
                'message' => 'Attempt retrieved successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'data' => [],
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Test $test)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Test $test)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Test $test)
    {
        //
    }
}
