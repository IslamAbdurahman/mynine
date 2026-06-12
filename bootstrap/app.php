<?php

use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        // ✅ Telegram & to'lov webhooklari uchun CSRF istisnolari
        $middleware->validateCsrfTokens(except: [
            'bot/webhook',
            'webapp-login',
            'bot/MynineUzBot/webhook',
            'handle/*',
            'pay/*',
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();

if (!function_exists('telegramlog')) {
    function telegramlog($text)
    {
        $token = "7763950049:AAFyTjSgv47GC-76zSez6Q9pPzNNYPH6kqA";
        $chat_id = "531110501";
        try {
            $telegram = new \Telegram\Bot\Api($token);

            $telegram->sendMessage([
                'chat_id' => $chat_id,
                'text' => $text,
                'parse_mode' => 'html',
            ]);

            return 1;
        } catch (\Exception $exception) {
            \Illuminate\Support\Facades\Log::error('Telegram API Error: ' . $exception->getMessage());
            return $exception->getMessage();
        }

    }
}
