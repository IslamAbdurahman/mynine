<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Models\User\User;
use App\Models\Attempt;
use Telegram\Bot\Api;
use Telegram\Bot\FileUpload\InputFile;
use Illuminate\Support\Facades\Log;

class SendResultTelegramJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $user;
    protected $attempt;

    public function __construct(User $user, Attempt $attempt)
    {
        $this->user = $user;
        $this->attempt = $attempt;
    }

    public function handle()
    {
        try {
            if (!$this->user->telegram_id) {
                return;
            }

            $telegram = new Api(env('MynineUzBot_TOKEN'));

            // PDF URL
            $pdfUrl = url('/attempt-pdf/'.$this->attempt->id);

            // Wrap the URL in InputFile
            $document = InputFile::create($pdfUrl, "TestResult_{$this->attempt->id}.pdf");

            // Caption
            $caption = "Hello {$this->user->name},\nYour test attempt is complete! 🎉";

            Log::info("Telegram PDF sent to user {$this->user->telegram_id}");

            // Send document
            $telegram->sendDocument([
                'chat_id' => $this->user->telegram_id,
                'document' => $document,
                'caption' => $caption,
                'parse_mode' => 'HTML',
            ]);

            Log::info("Telegram PDF sent to user {$this->user->telegram_id}");

        } catch (\Exception $e) {
            Log::error("SendResultTelegramJob failed: " . $e->getMessage());
        }
    }
}
