<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TelegramAuthController extends Controller
{
    public function login(Request $request)
    {
        $data = $request->validate([
            'id' => 'required|numeric',
            'first_name' => 'nullable|string',
            'last_name' => 'nullable|string',
            'username' => 'nullable|string',
            'photo_url' => 'nullable|string',
        ]);

        // 1️⃣ Try to find by telegram_id or by email (if older record exists)
        $user = User::where('telegram_id', $data['id'])
            ->first();

        if (!$user) {
            // 2️⃣ Create new user if not found
            $user = new User();
            $user->telegram_id = $data['id'];
        }

        // 3️⃣ Update basic info
        $user->name = trim(($data['first_name'] ?? '') . ' ' . ($data['last_name'] ?? ''));
        $user->username = $data['username'] ?? null;
        $user->avatar = $data['photo_url'] ?? null;
        $user->save();

        // Assign default role only if the user was just created
        if ($user->wasRecentlyCreated) {
            $user->assignRole('Student');
        }

        // 5️⃣ Log in user
        Auth::login($user, true);

        return response()->json([
            'success' => true,
            'redirect' => route('all-test.index'),
        ]);
    }
}
