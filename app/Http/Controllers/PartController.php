<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePartRequest;
use App\Http\Requests\UpdatePartRequest;
use App\Models\Part;
use App\Models\TestType;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class PartController extends Controller
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
    public function create(\Illuminate\Http\Request $request)
    {

        $request->validate([
            'test_type_id' => 'required',
        ]);

        $testType = TestType::with([
            'test.folder',
            'type',
        ])->find($request->test_type_id);

        return Inertia::render('part/create-part', [
            'testType' => $testType
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePartRequest $request)
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

                $data['minute'] = $fileInfo['playtime_seconds'] ?? null
                    ? ceil($fileInfo['playtime_seconds'] / 60)
                    : null;
            }

            $part = Part::create($data);

//            return back()->with('success', 'Part created successfully!');
            return redirect()->route('test-type.show', [
                'test_type' => $request->test_type_id,
                'tab' => $part->id
            ]);


        } catch (\Exception $e) {
            throw ValidationException::withMessages([
                'error' => [$e->getMessage()],
            ]);
        }
    }


    /**
     * Display the specified resource.
     */
    public function show(Part $part)
    {
        $part = $part->load([
            'test_type.test.folder',
            'sections',
            'images',
        ]);

        return Inertia::render('part/edit-part', [
            'part' => $part
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Part $part)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */

    public function update(UpdatePartRequest $request, Part $part)
    {
        try {
            $data = $request->validated();

            if ($request->hasFile('audio_path')) {
                // Eski faylni o‘chirish (agar mavjud bo‘lsa)
                if (!empty($part->audio_path)) {
                    $oldPath = str_replace('storage/', '', $part->audio_path);
                    if (Storage::disk('public')->exists($oldPath)) {
                        Storage::disk('public')->delete($oldPath);
                    }
                }

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

                $data['minute'] = $fileInfo['playtime_seconds'] ?? null
                    ? ceil($fileInfo['playtime_seconds'] / 60)
                    : null;
            } else {
                $data['audio_path'] = $part->audio_path;
            }

            $part->update($data);

            return redirect()->route('test-type.show', $part->test_type_id);

        } catch (\Exception $e) {
            throw ValidationException::withMessages([
                'error' => [$e->getMessage()],
            ]);
        }
    }


    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Part $part)
    {
        try {
            $part->delete();
            return back()->with('success', 'Part deleted successfully.');
        } catch (\Exception $e) {
            // Proper Inertia error response
            throw ValidationException::withMessages([
                'error' => [$e->getMessage()],
            ]);
        }
    }
}
