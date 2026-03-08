<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMockRequest;
use App\Http\Requests\UpdateMockRequest;
use App\Models\Mock;
use App\Models\Test;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

// ✅ important

class MockController extends Controller
{
    use AuthorizesRequests;

    // ✅ add this

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {

        $this->authorize('viewAny', Mock::class); // ✅ add this

        if ($request->per_page) {
            $per_page = $request->per_page;
        } else {
            $per_page = 10;
        }

        $mock = Mock::with([

        ]);

        if ($request->search) {
            $mock->where(function ($query) use ($request) {
                $query->whereLike('name', "%$request->search%")
                    ->orWhereLike('comment', "%$request->search%");
            });
        }

        if (!Auth::user()->hasRole('Admin')) {
            $mock->where('user_id', Auth::id());
        }

        $mock = $mock->paginate($per_page);

        $tests = Test::query();

        if (!Auth::user()->hasRole('Admin')) {
            $tests->whereHas('folder', function ($query) {
                $query->where('user_id', Auth::id());
            });
        }

        $tests = $tests->get();

        return Inertia::render('mock/index', [
            'mock' => $mock,
            'tests' => $tests
        ]);
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
    public function store(StoreMockRequest $request)
    {
        try {

            if (!Auth::user()->hasRole('Admin')) {
                $mock = Mock::query()->where('user_id', Auth::id())
                    ->whereMonth('created_at', now()->month)
                    ->whereYear('created_at', now()->year)
                    ->count();

                if ($mock >= 3) {
                    throw new \Exception('You have reached the maximum number of mocks for this month.');
                }
            }

            Mock::create($request->validated());

            return back()->with('success', 'Mock created successfully.');
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
    public function show(Request $request, Mock $mock)
    {
        //
    }


    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Mock $mock)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateMockRequest $request, Mock $mock)
    {
        try {

            $mock->update($request->validated());
            return back()->with('success', 'Mock updated successfully.');
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
    public function destroy(Mock $mock)
    {
        try {
            $mock->delete();
            return back()->with('success', 'Mock deleted successfully.');
        } catch (\Exception $e) {
            // Proper Inertia error response
            throw ValidationException::withMessages([
                'error' => [$e->getMessage()],
            ]);
        }
    }
}
