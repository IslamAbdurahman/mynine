<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSectionRequest;
use App\Http\Requests\UpdateSectionRequest;
use App\Models\Section;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class SectionController extends Controller
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
    public function store(StoreSectionRequest $request)
    {
        try {
            DB::beginTransaction();

            $section = Section::create($request->validated());

            if ($section->question_type->type === 'complete_section' || $section->question_type->type === 'drag_and_drop') {
                $this->syncQuestions($section, $request->textarea);
            }

            DB::commit();

            return back()->with('success', 'Section created successfully.');
        } catch (\Exception $e) {
            DB::rollBack();

            throw ValidationException::withMessages([
                'error' => [$e->getMessage()],
            ]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Section $section)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Section $section)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateSectionRequest $request, Section $section)
    {
        try {
            DB::beginTransaction();

            $section->update($request->validated());

            if ($section->question_type->type === 'complete_section' || $section->question_type->type === 'drag_and_drop') {
                $this->syncQuestions($section, $request->textarea);
            }

            DB::commit();

            return back()->with('success', 'Section updated successfully.');
        } catch (\Exception $e) {
            DB::rollBack();

            throw ValidationException::withMessages([
                'error' => [$e->getMessage()],
            ]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Section $section)
    {
        try {
            $section->delete();
            return back()->with('success', 'Section deleted successfully.');
        } catch (\Exception $e) {
            // Proper Inertia error response
            throw ValidationException::withMessages([
                'error' => [$e->getMessage()],
            ]);
        }
    }


    private function syncQuestions(Section $section, string $textarea): void
    {
        preg_match_all(
            '/\{([^\}]+)\}/', // {…} orasidagi matnni olish
            preg_replace(
                '/\s*data-v-[a-z0-9-]+="[^"]*"/i', // TinyMCE (yoki Vue) tomonidan qo‘shilgan data-v-xxxx atributlarini olib tashlash
                '',
                $textarea // TinyMCE’dan kelgan content
            ),
            $matches // Natijalar bu massivga tushadi
        );

        $currentOrders = [];

        foreach ($matches[1] as $index => $number) {
            $question = $section->questions()->updateOrCreate(
                [
                    'section_id' => $section->id,
                    'order' => $index + 1,
                ],
                [
                    'answer_text' => $number,
                ]
            );

            $currentOrders[] = $question->order;
        }

        // Eski, ishlatilmay qolgan `questions`ni o‘chirish
        $section->questions()->whereNotIn('order', $currentOrders)->delete();
    }
}
