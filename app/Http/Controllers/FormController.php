<?php

namespace App\Http\Controllers;

use App\Models\Borrower;
use App\Models\Period;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FormController extends Controller
{
    public function index()
    {
        $borrowers = Borrower::all();
        $period = Period::getActivePeriod();

        return Inertia::render('form/index', [
            'borrowers' => $borrowers,
            'period' => $period
        ]);
    }
}
