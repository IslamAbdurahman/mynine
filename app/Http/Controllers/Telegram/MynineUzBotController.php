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
        Log::info('Webhook received:', $request->all());

        $update = $request->all();

        // Handle text message / command / code input
        if (isset($update['message']['text'])) {
            $chatId = $update['message']['chat']['id'];
            $text = trim($update['message']['text']);

            $this->telegramService->handleCommand($update, $text, $chatId);
        }

        // Handle callback query if any
        if (isset($update['callback_query'])) {
            $chatId = $update['callback_query']['message']['chat']['id'] ?? $update['callback_query']['from']['id'];
            $data = $update['callback_query']['data'] ?? '';

            $this->telegramService->handleCommand($update, $data, $chatId);
        }

        return response('OK', 200);
    }
}
