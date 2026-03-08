<?php

namespace App\Http\Controllers\Telegram;

use App\Http\Controllers\Controller;
use App\Services\Telegram\TelegramService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class TelegramController extends Controller
{
    protected TelegramService $telegramService;

    public function __construct(TelegramService $telegramService)
    {
        $this->telegramService = $telegramService;
    }

    public function handle(Request $request)
    {
        Log::info('Webhook received:', $request->all()); // storage/logs/laravel.log da yoziladi

        $update = $request->all();

        // Handle /start command
        if (isset($update['message']['text'])) {
            $chatId = $update['message']['chat']['id'];
            $command = trim($update['message']['text']);

            $this->telegramService->handleCommand($chatId);
        }

        return response('OK', 200);
    }
}
