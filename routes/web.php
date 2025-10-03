<?php

use App\Http\Controllers\AspectController;
use App\Http\Controllers\BorrowerController;
use App\Http\Controllers\DivisionController;
use App\Http\Controllers\FormController;
use App\Http\Controllers\PeriodController;
use App\Http\Controllers\SummaryController;
use App\Http\Controllers\TemplateController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::post('periods/{period}/start', [PeriodController::class, 'start'])->name('periods.start');
    Route::post('periods/{period}/stop', [PeriodController::class, 'stop'])->name('periods.stop');

    Route::get('forms', [FormController::class, 'index'])->name('forms.index');
    Route::post('forms', [FormController::class, 'store'])->name('forms.store');
    Route::post('forms/save-step', [FormController::class, 'saveStepData'])->name('forms.saveStep');
    Route::get('summary/{report}', [SummaryController::class, 'show'])->name('summary.show');
    Route::put('summary/{report}', [SummaryController::class, 'update'])->name('summary.update');
});

Route::resource('divisions', DivisionController::class)
    ->middleware(['auth', 'verified'])
    ->names('divisions');

Route::resource('users', UserController::class)
    ->middleware(['auth', 'verified'])
    ->names('users');

Route::resource('borrowers', BorrowerController::class)
    ->middleware(['auth', 'verified'])
    ->names('borrowers');

Route::resource('aspects', AspectController::class)
    ->middleware(['auth', 'verified'])
    ->names('aspects');

Route::resource('templates', TemplateController::class)
    ->middleware(['auth', 'verified'])
    ->names('templates');

Route::resource('periods', PeriodController::class)
        ->middleware(['auth', 'verified'])
        ->names('periods');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/watchlist.php';
