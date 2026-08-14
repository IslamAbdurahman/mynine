<?php

use App\Jobs\SendResultEmailJob;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\GoogleAuthController;
use App\Http\Controllers\Auth\GithubAuthController;
use App\Http\Controllers\Auth\TelegramAuthController;
use App\Http\Controllers\Telegram\TelegramController;
use App\Http\Controllers\Telegram\MynineUzBotController;
use App\Http\Controllers\Auth\TelegramLoginController;


Route::post('/webapp-login', [TelegramAuthController::class, 'login']);
Route::post('/mock-student/enter', [\App\Http\Controllers\MockStudentController::class, 'enter'])->name('mock-student.enter');

Route::any('/bot/webhook', [TelegramController::class, 'handle']);
Route::any('/bot/MynineUzBot/webhook', [MynineUzBotController::class, 'handle']);


Route::get('/', [\App\Http\Controllers\HomeController::class, 'home'])->name('home');


Route::get('landing-page-tests', [\App\Http\Controllers\LandingPageController::class, 'tests'])->name('landing-page-tests');

Route::get('fix-views', function () {
    \Illuminate\Support\Facades\Artisan::call('view:clear');
    \Illuminate\Support\Facades\Artisan::call('cache:clear');

    $logFile = storage_path('logs/laravel.log');
    if (file_exists($logFile)) {
        chmod($logFile, 0666);
    }

    return 'Views, Cache, and Log permissions cleared and fixed successfully!';
})->middleware(['auth', 'role:Admin']);

Route::get('sendmail', function () {

    $attempts = \App\Models\Attempt::query()
        ->whereNotNull('finished_at')
        ->whereHas('user', function ($query) {
            $query->whereNotNull('google_id');
        })
        ->get();

    foreach ($attempts as $attempt) {
        dispatch(new SendResultEmailJob($attempt->user, $attempt));
    }

})->middleware(['auth', 'role:Admin']);

Route::middleware(['auth', 'verified'])->group(function () {
//    Route::get('dashboard', function () {
//        return Inertia::render('dashboard');
//    })->name('dashboard');

    Route::get('dashboard', [\App\Http\Controllers\HomeController::class, 'index'])->name('dashboard');

    Route::resource('user', \App\Http\Controllers\User\UserController::class);
    Route::resource('folder', \App\Http\Controllers\FolderController::class);
    Route::resource('test', \App\Http\Controllers\TestController::class)->except(['update']);
    Route::post('/test/{test}/update', [\App\Http\Controllers\TestController::class, 'update'])->name('test.update');
    Route::resource('test-type', \App\Http\Controllers\TestTypeController::class);
    Route::resource('part', \App\Http\Controllers\PartController::class)->except(['update']);
    Route::post('/part/{part}/update', [\App\Http\Controllers\PartController::class, 'update'])->name('part.update');
    Route::post('/part/{part}/import-ai', [\App\Http\Controllers\TestImportController::class, 'importAI'])->name('part.import-ai');
    Route::resource('section', \App\Http\Controllers\SectionController::class);
    Route::post('/section/{section}/options/sync', [\App\Http\Controllers\SectionController::class, 'syncOptions'])->name('section.options.sync');
    Route::resource('question', \App\Http\Controllers\QuestionController::class);
    Route::resource('question-type', \App\Http\Controllers\QuestionTypeController::class);
    Route::resource('option', \App\Http\Controllers\OptionController::class);


    Route::resource('all-test', \App\Http\Controllers\AllTestController::class);
    Route::resource('attempt', \App\Http\Controllers\AttemptController::class);

    Route::resource('mock', \App\Http\Controllers\MockController::class);
    Route::post('/mock-student', [\App\Http\Controllers\MockStudentController::class, 'store'])->name('mock-student.store');
    Route::delete('/mock-student/{mockStudent}', [\App\Http\Controllers\MockStudentController::class, 'destroy'])->name('mock-student.destroy');
});

// Routes accessible to logged-in users OR candidate code session holders
Route::middleware([\App\Http\Middleware\EnsureCandidateOrAuthenticated::class])->group(function () {
    Route::resource('practice', \App\Http\Controllers\PracticeController::class);
    Route::get('practice-attempt-submit/{attempt_id}', [\App\Http\Controllers\PracticeController::class, 'submit'])->name('practice-attempt-submit');
    Route::get('practice-attempt/{attempt_id}', [\App\Http\Controllers\PracticeController::class, 'practice_attempt'])->name('practice-attempt');
    Route::get('practice-test-type/{test_type_id}', [\App\Http\Controllers\PracticeController::class, 'practice_test_type'])->name('practice-test-type');
    Route::get('practice-test-type-submit/{attempt_id}/{type_id}', [\App\Http\Controllers\PracticeController::class, 'submit_test_type'])->name('practice-test-type-submit');
    Route::get('practice-part/{part_id}', [\App\Http\Controllers\PracticeController::class, 'practice_part'])->name('practice-part');
    Route::post('practice-attempt-violation/{attempt_id}', [\App\Http\Controllers\PracticeController::class, 'recordViolation'])->name('practice-attempt-violation');

    Route::resource('attempt-part', \App\Http\Controllers\AttemptPartController::class);
    Route::resource('attempt-type', \App\Http\Controllers\AttemptTypeController::class);
    Route::resource('attempt-answer', \App\Http\Controllers\AttemptAnswerController::class);
    Route::resource('attempt-answer-option', \App\Http\Controllers\AttemptAnswerOptionController::class);
});

Route::get('attempt-pdf/{attempt}', [\App\Http\Controllers\AttemptController::class, 'pdf'])->name('attempt.pdf');


require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';


Route::get('/auth/google', [GoogleAuthController::class, 'redirect'])->name('google.redirect');
Route::get('/auth/google/callback', [GoogleAuthController::class, 'callback'])->name('google.callback');

Route::get('/auth/github', [GithubAuthController::class, 'redirect'])->name('github.redirect');
Route::get('/auth/github/callback', [GithubAuthController::class, 'callback'])->name('github.callback');

Route::any('/auth/telegram/callback', [TelegramLoginController::class, 'handle'])->name('telegram.callback');

Route::get('/lang/{locale}', function ($locale) {
    if (!in_array($locale, ['en', 'uz', 'ru'])) {
        abort(400);
    }
    session(['locale' => $locale]);
    app()->setLocale($locale);
    return back();
});


//handle requests from payment system
Route::any('/handle/{paysys}', function ($paysys) {
    (new Goodoneuz\PayUz\PayUz)->driver($paysys)->handle();
});

//redirect to payment system or payment form
Route::any('/pay/{paysys}/{key}/{amount}', function ($paysys, $key, $amount) {
    $model = Goodoneuz\PayUz\Services\PaymentService::convertKeyToModel($key);
    $url = request('redirect_url', '/'); // redirect url after payment completed
    $pay_uz = new Goodoneuz\PayUz\PayUz;
    $pay_uz
        ->driver($paysys)
        ->redirect($model, $amount, 860, $url);
});
