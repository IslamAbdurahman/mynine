<?php

namespace App\Http\Controllers;

use App\Models\Folder;
use App\Models\Test;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AllTestController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        if ($request->per_page) {
            $per_page = $request->per_page;
        } else {
            $per_page = 10;
        }

        $folder = Folder::with([
            'tests' => function ($query) {
                $query->with([
                    'types' => function ($query) {
                        $query->whereHas('parts');
                    }
                ])
                    ->where('active', 1)
                    ->where('open', 1);
            }
        ])
            ->whereHas('tests', function ($query) {
                $query->where('active', 1)
                    ->where('open', 1);
            })
            ->where('active', 1);

        if ($request->search) {
            $folder->where(function ($query) use ($request) {
                $query->whereLike('name', "%$request->search%")
                    ->orWhereLike('comment', "%$request->search%");
            });
        }

        $folder = $folder->paginate($per_page);

        return Inertia::render('all-test/index', [
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
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Test $test)
    {
        //
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
