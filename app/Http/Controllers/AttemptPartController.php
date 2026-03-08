<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAttemptPartRequest;
use App\Http\Requests\UpdateAttemptPartRequest;
use App\Models\AttemptPart;
use App\Models\Part;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AttemptPartController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {

            $request->validate([
                'attempt_id' => 'required|integer|exists:attempts,id',
                'type_id' => 'required|integer|exists:types,id',
            ]);

            $attempt_parts = AttemptPart::query()
                ->where('attempt_id', $request->attempt_id)
                ->whereHas('part.test_type', fn($q) => $q->where('type_id', $request->type_id)
                )
                ->with([
                    'part.test_type',
                    'part.attempt_part' => fn($q) => $q->where('attempt_id', $request->attempt_id),
                    'part.sections.questions.options',
                ])
                ->orderBy('part_id')
                ->get();

            $attempt_parts->each(function ($attempt_part) {
                $attempt_part->part->sections->load([
                    'questions.attempt_answer' => fn($q) => $q->where('attempt_part_id', $attempt_part->id)
                        ->with('attempt_answer_options')
                ]);
            });

            return response()->json([
                'data' => $attempt_parts,
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
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreAttemptPartRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(AttemptPart $attemptPart)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(AttemptPart $attemptPart)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateAttemptPartRequest $request, AttemptPart $attemptPart)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(AttemptPart $attemptPart)
    {
        //
    }
}
