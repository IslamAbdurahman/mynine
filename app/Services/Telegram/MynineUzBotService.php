<?php

namespace App\Services\Telegram;

use App\Models\Mock;
use App\Models\User\User;
use Telegram\Bot\Api;
use Telegram\Bot\Keyboard\Keyboard;

class MynineUzBotService
{
    protected Api $telegram;

    public function __construct()
    {
        $this->telegram = new Api(env('MynineUzBot_TOKEN'));
    }

    /**
     * Handle bot commands (/start, /help, /mocks)
     */
    public function handleCommand(array $update, string $command, int|string $chatId): void
    {
        $parts = explode(' ', $update['message']['text']);
        $command = strtolower($parts[0]); // '/start'
        $params = array_slice($parts, 1); // ['12345']

        match ($command) {
            '/start' => $this->sendWelcomeMessage($update, $chatId),
            '/help' => $this->sendHelpMessage($chatId),
            '/mocks' => $this->sendMockMessage($chatId),
            '/ref' => $this->sendRefMessage($chatId),
            default => $this->sendUnknownCommand($chatId),
        };
    }

    /**
     * /help command
     */
    protected function sendHelpMessage(int|string $chatId): void
    {
        $this->telegram->sendMessage([
            'chat_id' => $chatId,
            'text' => "📘 Available commands:\n/start - Open Mynine\n/help - Show help\n/mocks - Open Mock App\n/ref -  Get your referral link",
        ]);
    }

    /**
     * Unknown command handler
     */
    protected function sendUnknownCommand(int|string $chatId): void
    {
        $this->telegram->sendMessage([
            'chat_id' => $chatId,
            'text' => "Unknown command 😅. Type /help for available options.",
        ]);
    }

    /**
     * /start command — Welcome with WebApp button
     */
    public function sendWelcomeMessage($update, int|string $chatId): void
    {

        $from = $update['message']['from'] ?? [];

        $ref_telegram_id = isset($update['message']['text']) && str_starts_with($update['message']['text'], '/start ')
            ? trim(str_replace('/start ', '', $update['message']['text']))
            : null;

        $user = User::where('telegram_id', $chatId)->first();

        if (!$user) {
            $user = User::create([
                'telegram_id' => $chatId,
                'name' => ($from['first_name'] ?? '') . ' ' . ($from['last_name'] ?? ''),
                'username' => $from['username'] ?? null,
                'avatar' => $from['photo_url'] ?? null,
                'ref_telegram_id' => $ref_telegram_id,
            ]);
        } else {
            $user->update([
                'name' => ($from['first_name'] ?? '') . ' ' . ($from['last_name'] ?? ''),
                'username' => $from['username'] ?? null,
                'avatar' => $from['photo_url'] ?? null,
                'ref_telegram_id' => $user->ref_telegram_id ?? $ref_telegram_id,
            ]);
        }

        // Assign default role only if the user was just created
        if ($user->wasRecentlyCreated) {
            $user->assignRole('Student');
        }

        // 1. Set persistent “Open Mynine” button at the bottom (outside bot chat)
        $this->setPersistentMenuButton();

        // 2. Inline keyboard inside message
        $keyboard = Keyboard::make()
            ->inline()
            ->row([
                Keyboard::inlineButton([
                    'text' => 'Open Mynine 🎓',
                    'web_app' => ['url' => 'https://mynine.uz/all-test'],
                ]),
            ]);

        $this->sendSafeMessage(
            $chatId,
            "👋 Welcome to Mynine!\nClick below to open the app:",
            $keyboard
        );

        if (!$ref_telegram_id) {
            $this->sendRefMessage($chatId);
        }

        $this->telegram->setMyCommands([
            'commands' => [
                [
                    'command' => 'start',
                    'description' => 'Open Mynine.uz 🎓'
                ],
                [
                    'command' => 'mocks',
                    'description' => 'Open active mock tests'
                ],
                [
                    'command' => 'ref',
                    'description' => 'Get your referral link'
                ],
                [
                    'command' => 'help',
                    'description' => 'Show help and available commands'
                ],
            ],
        ]);


    }

    /**
     * /mocks command — Active mock tests list
     */
    public function sendMockMessage(int|string $chatId): void
    {
        $user = User::where('telegram_id', $chatId)->first();
        if (!$user) {
            $this->sendSafeMessage($chatId, "❗ Iltimos, avvalo Mynine botiga /start buyrug'i orqali kiring.");
            return;
        }

        $mocks = Mock::query()
            ->where('finished_at', '>', now())
            ->whereHas('user', function ($query) use ($user) {
                $query->where('telegram_id', '=', $user->ref_telegram_id);
            })
            ->get(['name', 'slug']);

        if ($mocks->isEmpty()) {
            $this->sendSafeMessage($chatId, "😕 Hozircha faol mock testlar mavjud emas.");
            return;
        }

        $keyboard = Keyboard::make()->inline();

        foreach ($mocks as $mock) {
            $keyboard->row([
                Keyboard::inlineButton([
                    'text' => "🧪 {$mock->name}",
                    'web_app' => [
                        'url' => "https://mynine.uz",
                    ],
                ]),
            ]);
        }

        $this->sendSafeMessage(
            $chatId,
            "🧠 Quyidagi faol mock testlardan birini tanlang:",
            $keyboard
        );
    }

    public function sendRefMessage(int|string $chatId): void
    {
        $this->sendSafeMessage(
            $chatId,
            "Your referral link: https://t.me/MynineUzBot?start={$chatId}"
        );
    }

    /**
     * Safe message sender (catches Telegram API errors)
     */
    protected function sendSafeMessage(int|string $chatId, string $text, Keyboard $keyboard = null): void
    {
        try {
            $params = [
                'chat_id' => $chatId,
                'text' => $text,
            ];
            if ($keyboard) {
                $params['reply_markup'] = $keyboard;
            }
            $this->telegram->sendMessage($params);
        } catch (\Exception $e) {
            \Log::error('Telegram sendMessage error: ' . $e->getMessage());
        }
    }

    /**
     * 🔹 Add persistent web app button (like Telegram Wallet)
     */
    public function setPersistentMenuButton(): void
    {
        try {
            $this->telegram->post('setChatMenuButton', [
                'menu_button' => [
                    'type' => 'web_app',
                    'text' => 'Open Mynine 🎓',
                    'web_app' => [
                        'url' => 'https://mynine.uz',
                    ],
                ],
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to set persistent menu button: ' . $e->getMessage());
        }
    }
}
