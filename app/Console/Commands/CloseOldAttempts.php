<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class CloseOldAttempts extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'attempts:close-old';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Close attempts older than 24 hours';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $oldAttempts = \App\Models\Attempt::whereNull('finished_at')
            ->where('created_at', '<', now()->subHours(24))
            ->get();

        $count = $oldAttempts->count();
        $this->info("Found {$count} old attempts to close.");

        foreach ($oldAttempts as $attempt) {
            try {
                $attempt->finish();
                $this->line("Closed attempt ID: {$attempt->id}");
            } catch (\Exception $e) {
                $this->error("Failed to close attempt ID: {$attempt->id}. Error: {$e->getMessage()}");
            }
        }

        $this->info("Done.");
    }
}
