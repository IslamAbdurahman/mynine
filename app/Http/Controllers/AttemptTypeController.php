<?php

namespace App\Http\Controllers;

use App\Models\AttemptType;
use App\Http\Requests\StoreAttemptTypeRequest;
use App\Http\Requests\UpdateAttemptTypeRequest;
use Illuminate\Validation\ValidationException;

class AttemptTypeController extends Controller
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
    public function store(StoreAttemptTypeRequest $request)
    {
        try {

            $attemptType = AttemptType::updateOrCreate(
                [
                    'attempt_id' => $request->attempt_id,
                    'type_id' => $request->type_id,
                ],
                $request->validated()
            );

            return back()->with('success', 'Folder created successfully.');
        } catch (\Exception $e) {
            // Proper Inertia error response
            throw ValidationException::withMessages([
                'error' => [$e->getMessage()],
            ]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(AttemptType $attemptType)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(AttemptType $attemptType)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateAttemptTypeRequest $request, AttemptType $attemptType)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(AttemptType $attemptType)
    {
        //
    }
}
