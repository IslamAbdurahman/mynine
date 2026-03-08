<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User\User;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{
    /**
     * Redirect to Google for authentication.
     */
    public function redirect()
    {
        return Socialite::driver('google')->redirect();
    }

    /**
     * Handle Google callback and authenticate the user.
     */
    public function callback()
    {
        try {
            $googleUser = Socialite::driver('google')->user();

            // Find or create the user
            $user = User::query()
                ->updateOrCreate(
                    ['email' => $googleUser->getEmail()],
                    [
                        'name' => $googleUser->getName(),
                        'google_id' => $googleUser->getId(),
                        'avatar' => $googleUser->getAvatar(),
                        'username' => explode('@', $googleUser->getEmail())[0],
                    ]
                );

            // Assign default role only if the user was just created
            if ($user->wasRecentlyCreated) {
                $user->assignRole('Student');
            }

            // Log the user in
            Auth::login($user);

            // Redirect to the dashboard or home
            return redirect()->route('home');
        } catch (\Exception $exception) {
            return redirect()->route('home');
        }
    }
}
