<?php

namespace App\Http\Controllers;

use App\Models\Attempt;
use App\Models\Mock;
use App\Models\MockStudent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class MockStudentController extends Controller
{
    /**
     * Store new student candidates for a mock (Single, Bulk names, or from Group)
     */
    public function store(Request $request)
    {
        $request->validate([
            'mock_id' => 'required|exists:mocks,id',
            'names' => 'nullable|string', // Single name or newline/comma separated names
            'group_id' => 'nullable|exists:groups,id',
            'phone' => 'nullable|string',
        ]);

        $mock = Mock::findOrFail($request->mock_id);

        if (!Auth::user()->hasRole('Admin') && $mock->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }

        $createdCount = 0;

        DB::transaction(function () use ($mock, $request, &$createdCount) {
            // Option 1: From Group
            if ($request->group_id) {
                $group = \App\Models\Group::with('students')->findOrFail($request->group_id);
                foreach ($group->students as $student) {
                    MockStudent::create([
                        'mock_id' => $mock->id,
                        'name' => $student->name,
                        'code' => MockStudent::generateUniqueCode(),
                        'phone' => $student->phone ?? null,
                        'attended' => false,
                    ]);
                    $createdCount++;
                }
            }

            // Option 2: From Raw Names
            if (!empty($request->names)) {
                $nameList = preg_split('/[\r\n,]+/', $request->names);
                foreach ($nameList as $rawName) {
                    $name = trim($rawName);
                    if (empty($name)) continue;

                    MockStudent::create([
                        'mock_id' => $mock->id,
                        'name' => $name,
                        'code' => MockStudent::generateUniqueCode(),
                        'phone' => $request->phone ?? null,
                        'attended' => false,
                    ]);

                    $createdCount++;
                }
            }
        });

        if ($createdCount === 0) {
            return back()->with('error', "Hech qanday o'quvchi qo'shilmadi.");
        }

        return back()->with('success', "{$createdCount} ta o'quvchi muvaffaqiyatli qo'shildi!");
    }

    /**
     * Delete candidate student
     */
    public function destroy(MockStudent $mockStudent)
    {
        $mock = $mockStudent->mock;
        if (!Auth::user()->hasRole('Admin') && $mock->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }

        $mockStudent->delete();
        return back()->with('success', "O'quvchi o'chirildi.");
    }

    /**
     * Public endpoint for candidates entering mock exam via Candidate Code (MSXXXXXX)
     */
    public function enter(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
        ]);

        $code = strtoupper(trim($request->code));

        $student = MockStudent::with(['mock.test'])->where('code', $code)->first();

        if (!$student) {
            throw ValidationException::withMessages([
                'code' => ["Kiritilgan kod ({$code}) topilmadi!"],
            ]);
        }

        $mock = $student->mock;

        if (!$mock || $mock->active != 1) {
            throw ValidationException::withMessages([
                'code' => ["Ushbu Mock test hozirda faol emas!"],
            ]);
        }

        $now = now();

        if ($mock->started_at && $now->lt(\Carbon\Carbon::parse($mock->started_at))) {
            $formattedStart = \Carbon\Carbon::parse($mock->started_at)->format('d.m.Y H:i');
            throw ValidationException::withMessages([
                'code' => ["Ushbu Mock test hali boshlanmagan! Boshlanish vaqti: {$formattedStart}"],
            ]);
        }

        if ($mock->finished_at && $now->gt(\Carbon\Carbon::parse($mock->finished_at))) {
            $formattedFinish = \Carbon\Carbon::parse($mock->finished_at)->format('d.m.Y H:i');
            throw ValidationException::withMessages([
                'code' => ["Ushbu Mock test vaqti tugagan! Yakunlangan vaqti: {$formattedFinish}"],
            ]);
        }

        // Mark candidate as attended
        if (!$student->attended) {
            $student->attended = true;
            $student->save();
        }

        // Get or create attempt
        $attempt = Attempt::where('mock_student_id', $student->id)->first();

        if (!$attempt) {
            $attempt = Attempt::create([
                'name' => $student->name,
                'mock_id' => $student->mock_id,
                'mock_student_id' => $student->id,
                'user_id' => Auth::check() ? Auth::id() : null,
                'test_id' => $student->mock->test_id,
                'started_at' => now(),
            ]);
        }

        // Save session for guest student candidate access
        session([
            'mock_student_id' => $student->id,
            'mock_attempt_id' => $attempt->id,
        ]);

        return redirect()->route('practice.index', ['attempt_id' => $attempt->id]);
    }
}
