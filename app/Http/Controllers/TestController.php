<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTestRequest;
use App\Http\Requests\UpdateTestRequest;
use App\Models\Test;
use App\Models\Type;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class TestController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $per_page = $request->per_page === 'all' ? 100 : min((int)($request->per_page ?? 10), 100);

        $test = Test::with([
            'folder',
        ])->withCount('attempts');

        if ($request->search) {
            $test->where(function ($query) use ($request) {
                $query->whereLike('name', "%$request->search%")
                    ->orWhereLike('comment', "%$request->search%");
            });
        }

        if (!Auth::user()->hasRole('Admin')) {
            $test->whereHas('folder', function ($query) {
                $query->where('user_id', Auth::user()->id);
            });
        }

        $test = $test->paginate($per_page);

        return Inertia::render('test/index', [
            'test' => $test
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
    public function store(StoreTestRequest $request)
    {
        try {
            $user = Auth::user();

            if (!$user->hasRole('Admin')) {
                // Foydalanuvchi joriy testlar sonini hisoblash 
                // Foydalanuvchining hamma papkalaridagi testlarni sanaymiz
                $userTestsCount = DB::table('tests')
                    ->join('folders', 'tests.folder_id', '=', 'folders.id')
                    ->where('folders.user_id', $user->id)
                    ->count();

                if ($userTestsCount >= $user->create_test_limit) {
                    throw ValidationException::withMessages([
                        'error' => [__('Sizning test yaratish limitingiz tugagan. Jami ruxsat: :limit ta', ['limit' => $user->create_test_limit])],
                    ]);
                }
            }

            $data = $request->validated();

            if ($request->hasFile('audio_path')) {
                $audioData = $this->handleAudioUpload($request->file('audio_path'));
                $data['audio_path'] = $audioData['path'];
                $data['playtime_seconds'] = $audioData['playtime'];
            } else {
                $data['audio_path'] = null;
            }

            $test = Test::create($data);

            $types = Type::all();

            $test->types()->createMany(
                $types->map(fn($type) => [
                    'type_id' => $type->id,
                ])->toArray()
            );

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
    public function show(Request $request, Test $test)
    {
        $test->load([
            'folder',
            'types.type',
        ]);
        // Non-admin users must be part of the test
        if (!Auth::user()->hasRole('Admin')) {
            // Add authorization logic here if needed, e.g. checking folder ownership
        }

        return Inertia::render('test/show', [
            'test' => $test
        ]);
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
    public function update(UpdateTestRequest $request, Test $test)
    {
        try {
            $data = $request->validated();

            if ($request->hasFile('audio_path')) {
                $audioData = $this->handleAudioUpload($request->file('audio_path'), $test->audio_path);
                $data['audio_path'] = $audioData['path'];
                $data['playtime_seconds'] = $audioData['playtime'];
            } else {
                $data['audio_path'] = $test->audio_path;
            }

            $test->update($data);

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
    public function destroy(Test $test)
    {
        try {
            DB::beginTransaction();

            $test->delete();

            DB::commit();

            return back()->with('success', __('deleted_successfully'));
        } catch (\Exception $e) {
            // Proper Inertia error response
            throw ValidationException::withMessages([
                'error' => [$e->getMessage()],
            ]);
        }
    }

    /**
     * Handle audio file upload and playtime analysis.
     */
    private function handleAudioUpload($file, $oldPath = null)
    {
        // Clean filename
        $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $originalName = preg_replace('/[^A-Za-z0-9_-]/', '_', $originalName);
        $extension = $file->getClientOriginalExtension();
        $fileName = time() . '_' . $originalName . '.' . $extension;

        // Store file
        $filePath = $file->storeAs('audio', $fileName, 'public');

        // Analyze playtime
        $getID3 = new \getID3();
        $fileInfo = $getID3->analyze(storage_path('app/public/' . $filePath));
        $playtime = $fileInfo['playtime_seconds'] ?? null;

        // Delete old file if exists
        if ($oldPath) {
            $oldFilePath = str_replace('storage/', '', $oldPath);
            if (Storage::disk('public')->exists($oldFilePath)) {
                Storage::disk('public')->delete($oldFilePath);
            }
        }

        return [
            'path' => 'storage/' . $filePath,
            'playtime' => $playtime,
        ];
    }
}
