<?php

namespace App\Http\Controllers;

use App\Models\Mock;
use App\Models\User\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function index(Request $request)
    {

        $user = User::query()
            ->with([
                'last_attempt.attempt_types',
                'attempts' => function ($query) {
                    $query->whereYear('finished_at', now()->year)
                        ->whereMonth('finished_at', now()->month)
                        ->orderBy('finished_at', 'asc');
                },
                'attempts.attempt_types.type',
            ])
            ->withCount([
                'attempts as attempts_count_this_month' => function ($query) {
                    $query->whereYear('finished_at', now()->year)
                        ->whereMonth('finished_at', now()->month);
                },
                'attempts as total_attempts_count'
            ])
            ->find(Auth::id());

        // Get recent 5 attempts
        $recent_attempts = \App\Models\Attempt::where('user_id', Auth::id())
            ->whereNotNull('finished_at')
            ->orderBy('finished_at', 'desc')
            ->limit(5)
            ->get();

        $startDate = now()->subDays(30)->toDateString();
        $daily_users = User::query()
            ->selectRaw('DATE(created_at) as day_date, count(*) as items_count')
            ->whereDate('created_at', '>=', $startDate)
            ->groupBy('day_date')
            ->havingRaw('count(*) > 0')
            ->orderBy('day_date', 'asc')
            ->get();

        $daily_attempts = \App\Models\Attempt::query()
            ->selectRaw('DATE(finished_at) as day_date, count(*) as items_count, count(distinct user_id) as unique_users_count')
            ->whereNotNull('finished_at')
            ->whereDate('finished_at', '>=', $startDate)
            ->groupBy('day_date')
            ->havingRaw('count(*) > 0')
            ->orderBy('day_date', 'asc')
            ->get();

        $hourly_attempts = \App\Models\Attempt::query()
            ->selectRaw('HOUR(finished_at) as hour, count(*) as items_count')
            ->whereNotNull('finished_at')
            ->groupBy('hour')
            ->havingRaw('count(*) > 0')
            ->orderBy('hour', 'asc')
            ->get();

        $today_hourly_attempts = \App\Models\Attempt::query()
            ->selectRaw('HOUR(finished_at) as hour, count(*) as items_count')
            ->whereNotNull('finished_at')
            ->whereDate('finished_at', now()->toDateString())
            ->groupBy('hour')
            ->havingRaw('count(*) > 0')
            ->orderBy('hour', 'asc')
            ->get();

        $weekly_attempts = \App\Models\Attempt::query()
            ->selectRaw('(WEEKDAY(finished_at) + 1) as weekday, count(*) as items_count')
            ->whereNotNull('finished_at')
            ->groupBy('weekday')
            ->havingRaw('count(*) > 0')
            ->orderBy('weekday', 'asc')
            ->get();

        return Inertia::render('dashboard', [
            'user' => $user,
            'recent_attempts' => $recent_attempts,
            'daily_users' => $daily_users,
            'daily_attempts' => $daily_attempts,
            'hourly_attempts' => $hourly_attempts,
            'today_hourly_attempts' => $today_hourly_attempts,
            'weekly_attempts' => $weekly_attempts,
        ]);

    }

    public function home(Request $request)
    {

        $mock = Mock::query()
            ->where('slug', $request->slug)
            ->where('started_at', '<=', now())
            ->where('finished_at', '>=', now())
            ->where('active', true)
            ->first();


        return Inertia::render('welcome', [
            'mock' => $mock
        ]);

    }
}
