<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreFolderRequest;
use App\Http\Requests\UpdateFolderRequest;
use App\Models\Folder;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class FolderController extends Controller
{

    use AuthorizesRequests;

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {


        $this->authorize('viewAny', Folder::class); // ✅ add this

        $per_page = $request->per_page === 'all' ? 100 : min((int)($request->per_page ?? 10), 100);

        $folder = Folder::with([

        ]);

        if ($request->search) {
            $folder->where(function ($query) use ($request) {
                $query->where('name', 'like', "%$request->search%")
                    ->orWhere('comment', 'like', "%$request->search%")
                    ->orWhereHas('user', function ($q) use ($request) {
                        $q->where('name', 'like', "%$request->search%");
                    });
            });
        }

        if ($request->from && $request->to) {
            $folder->whereBetween('created_at', [$request->from, $request->to]);
        }

        if ($request->user_id) {
            $folder->where(function ($query) use ($request) {
                $query->where('user_id', $request->user_id);
            });
        }

        if ($request->teacher_id) {
            $folder->where('user_id', $request->teacher_id);
        }

        if (Auth::user()->hasRole('Admin')) {
            // Admin can see all folders
        } elseif (Auth::user()->hasRole('Teacher')) {
            // Teacher can see only their own folders
            $folder->where(fn($q) => $q->where('user_id', Auth::id()));
        } else {
            // Student and others can see only active folders
            $folder->where(fn($q) => $q->where('active', 1));
        }

        $folder = $folder->paginate($per_page);

        // Filter users based on role for the search filter
        $users_query = \App\Models\User\User::select('id', 'name');
        if (Auth::user()->hasRole('Teacher')) {
            $users_query->where(fn($q) => $q->where('user_id', Auth::id())
                ->orWhere('ref_telegram_id', Auth::user()->telegram_id)
                ->orWhere('id', Auth::id()));
        } elseif (!Auth::user()->hasRole('Admin')) {
            $users_query->where('id', Auth::id());
        }

        $teachers = Auth::user()->hasRole('Admin')
            ? \App\Models\User\User::whereHas('roles', function ($q) {
                $q->where('name', 'Teacher');
            })->select('id', 'name')->get()
            : [];

        return Inertia::render('folder/index', [
            'folder' => $folder,
            'users' => $users_query->get(),
            'teachers' => $teachers,
            'isAdmin' => Auth::user()->hasRole('Admin'),
            'filters' => $request->only(['search', 'teacher_id', 'user_id', 'from', 'to', 'per_page']),
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
    public function store(StoreFolderRequest $request)
    {
        try {
            Folder::create($request->validated());

            return back()->with('success', __('updated_successfully'));
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
    public function show(Request $request, Folder $folder)
    {
        $folder->load([
            'tests' => function ($query) use ($request) {
                if ($request->search) {
                    $query->where('name', 'like', '%' . $request->search . '%');
                }
                $query->with([
                    'types' => function ($query) {
                        $query->with([
                            'type'
                        ]);
                    }
                ])->withCount('attempts');
            },
        ]);
        // Non-admin users must be part of the folder
        if (!Auth::user()->hasRole('Admin')) {
//            Auth::user()->user_folders()
//                ->where('folder_id', $folder->id)
//                ->firstOrFail(); // Throws if unauthorized
        }

        return Inertia::render('folder/show', [
            'folder' => $folder
        ]);
    }


    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Folder $folder)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateFolderRequest $request, Folder $folder)
    {
        try {
            $folder->update($request->validated());
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
    public function destroy(Folder $folder)
    {
        try {
            $folder->delete();
            return back()->with('success', __('deleted_successfully'));
        } catch (\Exception $e) {
            // Proper Inertia error response
            throw ValidationException::withMessages([
                'error' => [$e->getMessage()],
            ]);
        }
    }
}
