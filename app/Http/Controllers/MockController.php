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

        $per_page = $request->per_page === 'all' ? 99999 : ($request->per_page ?? 10);

        $mock = Mock::with([

        ]);

        if ($request->search) {
            $mock->where(function ($query) use ($request) {
                $query->where('name', 'like', "%$request->search%")
                    ->orWhere('comment', 'like', "%$request->search%")
                    ->orWhereHas('user', function ($q) use ($request) {
                        $q->where('name', 'like', "%$request->search%");
                    })
                    ->orWhereHas('test', function ($q) use ($request) {
                        $q->where('name', 'like', "%$request->search%");
                    });
            });
        }

        if ($request->from && $request->to) {
            $mock->whereBetween('created_at', [$request->from, $request->to]);
        }

        if ($request->user_id) {
            $mock->where(function ($query) use ($request) {
                $query->where('user_id', $request->user_id);
            });
        }

        if ($request->test_id) {
            $mock->where(function ($query) use ($request) {
                $query->where('test_id', $request->test_id);
            });
        }

        if (Auth::user()->hasRole('Admin')) {
            // Admin can see everything
        } elseif (Auth::user()->hasRole('Teacher')) {
            // Teacher can see their own mocks
            $mock->where(fn($q) => $q->where('user_id', Auth::id()));
        } else {
            // Students see active mocks
            $mock->where(fn($q) => $q->where('active', 1));
        }

        $mock = $mock->paginate($per_page);

        // Filter tests and users based on role for search dropdowns
        $tests_query = Test::query()->select('id', 'name', 'folder_id')->with('folder:id,name');
        $users_query = \App\Models\User\User::select('id', 'name');

        if (Auth::user()->hasRole('Teacher')) {
            $tests_query->whereHas('folder', function ($q) {
                $q->where('user_id', Auth::id());
            });
            $users_query->where(fn($q) => $q->where('user_id', Auth::id())
                ->orWhere('ref_telegram_id', Auth::user()->telegram_id)
                ->orWhere('id', Auth::id()));
        } elseif (!Auth::user()->hasRole('Admin')) {
            $tests_query->where('active', 1)->where('open', 1);
            $users_query->where('id', Auth::id());
        }

        return Inertia::render('mock/index', [
            'mock' => $mock,
            'tests' => $tests_query->get(),
            'users' => $users_query->get(),
            'isAdmin' => Auth::user()->hasRole('Admin'),
            'filters' => $request->only(['search', 'user_id', 'test_id', 'from', 'to', 'per_page']),
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
                    throw new \Exception(__('error.max_mocks_reached'));
                }
            }

            Mock::create($request->validated());

            return back()->with('success', __('success.mock_created'));
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
            return back()->with('success', __('success.mock_updated'));
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
            return back()->with('success', __('success.mock_deleted'));
        } catch (\Exception $e) {
            // Proper Inertia error response
            throw ValidationException::withMessages([
                'error' => [$e->getMessage()],
            ]);
        }
    }
}
