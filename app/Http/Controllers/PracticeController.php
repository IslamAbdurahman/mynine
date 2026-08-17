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
            $this->checkAndAutoFinishExpired($request->attempt_id);
            $attempt = Attempt::with(['user', 'test.types', 'attempt_types', 'mock'])->find($request->attempt_id);

            if (!$attempt) {
                return back()->with('error', __('error.attempt_not_found'));
            }

            if ($attempt->mock) {
                $mock = $attempt->mock;
                if ($mock->active != 1) {
                    return back()->with('error', 'Ushbu Mock test hozirda faol emas!');
                }
                $now = now();
                if ($mock->started_at && $now->lt(\Carbon\Carbon::parse($mock->started_at))) {
                    $formattedStart = \Carbon\Carbon::parse($mock->started_at)->format('d.m.Y H:i');
                    return back()->with('error', "Ushbu Mock test hali boshlanmagan! Boshlanish vaqti: {$formattedStart}");
                }
                if ($mock->finished_at && $now->gt(\Carbon\Carbon::parse($mock->finished_at))) {
                    $formattedFinish = \Carbon\Carbon::parse($mock->finished_at)->format('d.m.Y H:i');
                    return back()->with('error', "Ushbu Mock test vaqti tugagan! Yakunlangan vaqti: {$formattedFinish}");
                }
            }

            if ($attempt->user_id !== Auth::id()) {
                $sessionMockStudentId = session('mock_student_id');
                if (!$sessionMockStudentId || (int)$attempt->mock_student_id !== (int)$sessionMockStudentId) {
                    return back()->with('error', __('error.unauthorized_attempt'));
                }
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
                'mock',
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
                if (session()->has('mock_student_id') || !Auth::check()) {
                    session()->forget(['mock_student_id', 'mock_attempt_id']);
                    return redirect('/')->with('success', __('success.test_submitted'));
                }
                return redirect(route('attempt.index'))->with('success', __('success.test_submitted'));
            }

            $attempt->finish();

            if (session()->has('mock_student_id') || !Auth::check()) {
                session()->forget(['mock_student_id', 'mock_attempt_id']);
                return redirect('/')->with('success', __('success.test_submitted'));
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

    public function recordViolation(Request $request, $attempt_id)
    {
        try {
            $attempt = Attempt::findOrFail($attempt_id);
            $count = (int) $request->input('count', 1);
            $attempt->increment('tab_switch_count', $count);

            return response()->json([
                'success' => true,
                'tab_switch_count' => $attempt->fresh()->tab_switch_count,
            ]);
        } catch (\Exception $e) {
            return response()->json([
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

            if ($attempt_type->is_submitted) {
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
                ->whereRaw('LENGTH(answer_text) > 10')
                ->get();

            foreach ($attempt_answers as $answer) {
                EvaluateEssayJob::dispatch($answer->id);
            }

            $attempt_type->finish();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Test type submitted successfully.',
                'data' => $attempt_type,
                'server_time' => now()->toIso8601String(),
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
            $this->checkAndAutoFinishExpired($attempt_id);

            $attempt = Attempt::with([
                'user',
                'attempt_types',
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
                'server_time' => now()->toIso8601String(),
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

            $this->checkAndAutoFinishExpired($request->attempt_id);

            $test_type = TestType::with([
                'parts'
            ])
                ->findOrFail($test_type_id);

            return response()->json([
                'data' => $test_type,
                'success' => true,
                'message' => 'Attempt retrieved successfully',
                'server_time' => now()->toIso8601String(),
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

            $this->checkAndAutoFinishExpired($request->attempt_id);

            DB::beginTransaction();

            $part = Part::with([
                'test_type.test',
                'test_type.type',
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
                'server_time' => now()->toIso8601String(),
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

    private function checkAndAutoFinishExpired($attemptId)
    {
        $expiredAttemptTypes = AttemptType::where('attempt_id', $attemptId)
            ->where('is_submitted', false)
            ->whereNotNull('finished_at')
            ->where('finished_at', '<', now())
            ->get();

        foreach ($expiredAttemptTypes as $attemptType) {
            $attempt_answers = AttemptAnswer::query()
                ->whereHas('attempt_part', function ($query) use ($attemptId, $attemptType) {
                    $query->where('attempt_id', $attemptId)
                        ->whereHas('part.test_type', function ($q) use ($attemptType) {
                            $q->where('type_id', $attemptType->type_id);
                        });
                })
                ->whereHas('question.section.question_type', function ($query) {
                    $query->where('type', 'essay');
                })
                ->whereRaw('LENGTH(answer_text) > 10')
                ->get();

            foreach ($attempt_answers as $answer) {
                EvaluateEssayJob::dispatch($answer->id);
            }

            $attemptType->finish();
        }
    }
}
