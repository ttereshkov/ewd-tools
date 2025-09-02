<?php

use App\Http\Controllers\AspectController;
use App\Http\Controllers\BorrowerController;
use App\Http\Controllers\DivisionController;
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
    
require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
