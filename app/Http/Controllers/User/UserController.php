<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\SroteUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\User\User;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    use AuthorizesRequests;

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {

        $this->authorize('viewAny', User::class);

        if ($request->per_page) {
            $per_page = $request->per_page;
        } else {
            $per_page = 10;
        }

        $user = User::with([
            'roles',
        ])
            ->whereNotIn('id', [Auth::user()->id])
            ->orderBy('id', 'desc');

        if ($request->search) {
            $user->where(function ($query) use ($request) {
                $query->whereLike('name', "%$request->search%")
                    ->orWhereLike('phone', "%$request->search%")
                    ->orWhereLike('username', "%$request->search%")
                    ->orWhereLike('telegram_id', "%$request->search%")
                    ->orWhereLike('email', "%$request->search%");
            });
        }

        if ($request->role) {
            $user->whereHas('roles', function ($query) use ($request) {
                $query->where('name', $request->role);
            });
        }

        if (!Auth::user()->hasRole('Admin')) {
            $user->where(function ($query) {
                $query->where('user_id', '=', Auth::id())
                    ->orWhere('ref_telegram_id', '=', Auth::user()->telegram_id);
            });
        }

        $user = $user->paginate($per_page);

        $roles = Role::all();

        return Inertia::render('user/index', [
            'user' => $user,
            'roles' => $roles,
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
    public function store(SroteUserRequest $request)
    {
        $this->authorize('viewAny', User::class);

        try {

            $validated = $request->validated();

            if (!empty($validated['password'])) {
                $validated['password'] = Hash::make($validated['password']);
            } else {
                unset($validated['password']); // Don't update if password is empty
            }

            $user = User::create($validated);

            $user->assignRole('Student');

            return back()->with('success', 'User updated successfully.');
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
    public function show(User $user)
    {

        if (!Auth::user()->hasRole('Admin')) {
            return back()->with('error', "You are not allowed to access this page");
        }

        return Inertia::render('user/show', [
            'user' => $user,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateUserRequest $request, User $user)
    {
        try {

            $validated = $request->validated();

            if (!empty($validated['password'])) {
                $validated['password'] = Hash::make($validated['password']);
            } else {
                unset($validated['password']); // Don't update if password is empty
            }

            $user->update($validated);

            if (Auth::user()->hasRole('Admin')) {
                if (isset($validated['role'])) {
                    $user->syncRoles($validated['role']);
                }
            }

            return back()->with('success', 'User updated successfully.');
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
    public function destroy(User $user)
    {
        try {

            $user->delete();
            return back()->with('success', 'User deleted successfully.');
        } catch (\Exception $e) {
            // Proper Inertia error response
            throw ValidationException::withMessages([
                'error' => [$e->getMessage()],
            ]);
        }
    }
}
