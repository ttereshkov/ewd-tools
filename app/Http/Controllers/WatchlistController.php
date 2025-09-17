<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class WatchlistController extends Controller
{
    public function show() 
    {
        return Inertia::render('watchlist-note');
    }
}
