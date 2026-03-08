<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class TelegramLoginController extends Controller
{
    public function handle(Request $request)
    {
        // Telegram sends user info via POST
        $data = $request->all();

        // Validate Telegram login
        if (!$this->isTelegramDataValid($data)) {
            return redirect()->route('home')->with('error', 'Invalid Telegram login.');
        }

        // Create or update user
        $user = User::updateOrCreate(
            ['telegram_id' => $data['id']],
            [
                'name' => $data['first_name'] . ' ' . ($data['last_name'] ?? ''),
                'username' => $data['username'] ?? null,
                'avatar' => $data['photo_url'] ?? null
            ]
        );

        // Assign default role only if the user was just created
        if ($user->wasRecentlyCreated) {
            $user->assignRole('Student');
        }

        Auth::login($user);

        return redirect()->route('home');
    }

    private function isTelegramDataValid(array $data): bool
    {
        $botToken = env('MynineUzBot_TOKEN');
        if (!isset($data['hash'])) {
            return false;
        }

        $checkHash = $data['hash'];
        unset($data['hash']);

        $dataCheckArr = [];
        foreach ($data as $key => $value) {
            $dataCheckArr[] = $key . '=' . $value;
        }

        sort($dataCheckArr);
        $dataCheckString = implode("\n", $dataCheckArr);

        $secretKey = hash('sha256', $botToken, true);
        $hash = hash_hmac('sha256', $dataCheckString, $secretKey);

        return hash_equals($hash, $checkHash);
    }
}
