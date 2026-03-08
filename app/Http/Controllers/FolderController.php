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

        if ($request->per_page) {
            $per_page = $request->per_page;
        } else {
            $per_page = 10;
        }

        $folder = Folder::with([

        ]);

        if ($request->search) {
            $folder->where(function ($query) use ($request) {
                $query->whereLike('name', "%$request->search%")
                    ->orWhereLike('comment', "%$request->search%");
            });
        }


        if (!Auth::user()->hasRole('Admin')) {
            $folder->where('user_id', Auth::id());
        }

        $folder = $folder->paginate($per_page);

        return Inertia::render('folder/index', [
            'folder' => $folder
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
    public function show(Request $request, Folder $folder)
    {
        $folder->load([
            'tests' => function ($query) {
                $query->with([
                    'types' => function ($query) {
                        $query->with([
                            'type'
                        ]);
                    }
                ]);
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
            return back()->with('success', 'Folder updated successfully.');
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
            return back()->with('success', 'Folder deleted successfully.');
        } catch (\Exception $e) {
            // Proper Inertia error response
            throw ValidationException::withMessages([
                'error' => [$e->getMessage()],
            ]);
        }
    }
}
