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

        return Inertia::render('dashboard', [
            'user' => $user,
            'recent_attempts' => $recent_attempts
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
