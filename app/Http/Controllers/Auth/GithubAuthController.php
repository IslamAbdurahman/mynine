<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User\User;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class GithubAuthController extends Controller
{
    /**
     * Redirect to Google for authentication.
     */
    public function redirect()
    {
        return Socialite::driver('github')->redirect();
    }

    /**
     * Handle Google callback and authenticate the user.
     */
    public function callback()
    {
        try {
            $githubUser = Socialite::driver('github')->user();

            // Find or create the user
            $user = User::updateOrCreate(
                ['email' => $githubUser->getEmail()],
                [
                    'name' => $githubUser->getName() ?? $githubUser->getNickname(),
                    'github_id' => $githubUser->getId(),
                    'avatar' => $githubUser->getAvatar(),
                    'username' => $githubUser->getNickname(),
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
