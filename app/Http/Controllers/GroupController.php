<?php

namespace App\Http\Controllers;

use App\Models\Group;
use App\Models\User\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class GroupController extends Controller
{
    /**
     * Display a listing of groups for the authenticated teacher/admin.
     */
    public function index(Request $request)
    {
        $per_page = $request->per_page === 'all' ? 100 : min((int)($request->per_page ?? 10), 100);

        $query = Group::withCount('students')->with('teacher:id,name,email')->orderBy('id', 'desc');

        if (Auth::user()->hasRole('Admin')) {
            if ($request->teacher_id) {
                $query->where('user_id', $request->teacher_id);
            }
        } elseif (Auth::user()->hasRole('Teacher')) {
            $query->where('user_id', Auth::id());
        } else {
            // Students can see groups they belong to
            $query->whereHas('students', function ($q) {
                $q->where('users.id', Auth::id());
            });
        }

        if ($request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $groups = $query->paginate($per_page);

        $teachers = Auth::user()->hasRole('Admin')
            ? User::whereHas('roles', fn($q) => $q->where('name', 'Teacher'))->select('id', 'name')->get()
            : [];

        return Inertia::render('group/index', [
            'groups' => $groups,
            'teachers' => $teachers,
            'isAdmin' => Auth::user()->hasRole('Admin'),
            'filters' => $request->only(['search', 'teacher_id', 'per_page']),
        ]);
    }

    /**
     * Search students via debounced AJAX API (supports 10,000+ users efficiently)
     */
    public function searchStudents(Request $request)
    {
        $search = trim($request->input('q', ''));
        $query = User::select('id', 'name', 'email', 'phone');

        if (Auth::user()->hasRole('Teacher')) {
            $query->where(function ($q) {
                $q->where('user_id', Auth::id())
                    ->orWhere('ref_telegram_id', Auth::user()->telegram_id);
            });
        }

        if ($request->group_id) {
            $query->whereDoesntHave('enrolled_groups', function ($q) use ($request) {
                $q->where('groups.id', $request->group_id);
            });
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $students = $query->limit(25)->get();

        return response()->json($students);
    }

    /**
     * Store a newly created group in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'color' => 'nullable|string|max:20',
            'student_ids' => 'nullable|array',
            'student_ids.*' => 'exists:users,id',
        ]);

        $group = Group::create([
            'user_id' => Auth::id(),
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'color' => $validated['color'] ?? '#4f46e5',
        ]);

        if (!empty($validated['student_ids'])) {
            $group->students()->sync($validated['student_ids']);
        }

        return redirect()->back()->with('success', 'Guruh muvaffaqiyatli yaratildi!');
    }

    /**
     * Display the specified group.
     */
    public function show(Group $group)
    {
        // Authorization
        if (!Auth::user()->hasRole('Admin') && $group->user_id !== Auth::id()) {
            if (!$group->students()->where('users.id', Auth::id())->exists()) {
                abort(403, 'Ushbu guruhga kirish huquqingiz yo\'q.');
            }
        }

        $group->load(['teacher:id,name,email', 'students' => function ($q) {
            $q->withCount('attempts')->with('last_attempt');
        }]);

        return Inertia::render('group/show', [
            'group' => $group,
            'isAdmin' => Auth::user()->hasRole('Admin'),
        ]);
    }

    /**
     * Update the specified group.
     */
    public function update(Request $request, Group $group)
    {
        if (!Auth::user()->hasRole('Admin') && $group->user_id !== Auth::id()) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'color' => 'nullable|string|max:20',
        ]);

        $group->update($validated);

        return redirect()->back()->with('success', 'Guruh yangilandi!');
    }

    /**
     * Add student to group.
     */
    public function addStudent(Request $request, Group $group)
    {
        if (!Auth::user()->hasRole('Admin') && $group->user_id !== Auth::id()) {
            abort(403);
        }

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $group->students()->syncWithoutDetaching([$validated['user_id']]);

        return redirect()->back()->with('success', 'Talaba guruhga qo\'shildi!');
    }

    /**
     * Remove student from group.
     */
    public function removeStudent(Group $group, User $user)
    {
        if (!Auth::user()->hasRole('Admin') && $group->user_id !== Auth::id()) {
            abort(403);
        }

        $group->students()->detach($user->id);

        return redirect()->back()->with('success', 'Talaba guruhdan chiqarildi!');
    }

    /**
     * Remove the specified group from storage.
     */
    public function destroy(Group $group)
    {
        if (!Auth::user()->hasRole('Admin') && $group->user_id !== Auth::id()) {
            abort(403);
        }

        $group->delete();

        return redirect()->route('group.index')->with('success', 'Guruh o\'chirildi!');
    }
}
