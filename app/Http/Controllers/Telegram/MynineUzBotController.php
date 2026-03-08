<?php

namespace App\Http\Controllers\Telegram;

use App\Http\Controllers\Controller;
use App\Services\Telegram\MynineUzBotService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class MynineUzBotController extends Controller
{
    protected MynineUzBotService $telegramService;

    public function __construct(MynineUzBotService $telegramService)
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

            $this->telegramService->handleCommand($update, $command, $chatId);
        }

        return response('OK', 200);
    }
}
