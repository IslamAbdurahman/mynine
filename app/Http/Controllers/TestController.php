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
        if ($request->per_page) {
            $per_page = $request->per_page;
        } else {
            $per_page = 10;
        }

        $test = Test::with([

        ]);

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
            $data = $request->validated();

            if ($request->hasFile('audio_path')) {
                $file = $request->file('audio_path');

                // Fayl nomini olish va tozalash (bo‘sh joy va maxsus belgilarni '_' ga almashtirish)
                $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
                $originalName = preg_replace('/[^A-Za-z0-9_-]/', '_', $originalName);

                // Fayl kengaytmasi
                $extension = $file->getClientOriginalExtension();

                // Yangi nom berish (masalan, vaqt + original nom)
                $fileName = time() . '_' . $originalName . '.' . $extension;

                // Faylni saqlash
                $filePath = $file->storeAs('audio', $fileName, 'public');

                // ✅ Array ichiga qo‘shib qo‘yish
                $data['audio_path'] = 'storage/' . $filePath;

                // 🔎 Audio uzunligini olish
                $getID3 = new \getID3();
                $fileInfo = $getID3->analyze(storage_path('app/public/' . $filePath));

                $data['playtime_seconds'] = $fileInfo['playtime_seconds'] ?? null;
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
            'tests',
        ]);
        // Non-admin users must be part of the test
        if (!Auth::user()->hasRole('Admin')) {
//            Auth::user()->user_tests()
//                ->where('test_id', $test->id)
//                ->firstOrFail(); // Throws if unauthorized
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

                $oldPath = str_replace('storage/', '', $test->audio_path);

                $file = $request->file('audio_path');

                // Fayl nomini olish va tozalash
                $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
                $originalName = preg_replace('/[^A-Za-z0-9_-]/', '_', $originalName); // bo‘sh joy va maxsus belgilarni olib tashlash

                // Fayl kengaytmasi
                $extension = $file->getClientOriginalExtension();

                // Yangi nom berish (masalan, vaqt + original nom)
                $fileName = time() . '_' . $originalName . '.' . $extension;

                // Faylni saqlash
                $filePath = $file->storeAs('audio', $fileName, 'public');

                // ✅ Array ichiga qo‘shib qo‘yish
                $data['audio_path'] = 'storage/' . $filePath;

                // 🔎 Audio uzunligini olish
                $getID3 = new \getID3();
                $fileInfo = $getID3->analyze(storage_path('app/public/' . $filePath));

                $data['playtime_seconds'] = $fileInfo['playtime_seconds'] ?? null;

                // Eski faylni o‘chirish
                if (!empty($test->audio_path)) {
                    if (Storage::disk('public')->exists($oldPath)) {
                        Storage::disk('public')->delete($oldPath);
                    }
                }

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
}
