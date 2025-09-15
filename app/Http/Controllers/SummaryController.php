<?php

namespace App\Http\Controllers;

use App\Models\Report;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SummaryController extends Controller
{
    public function show(Report $report)
    {
        $report->load([
            'borrower.division',
            'borrower.detail',
            'summary',
            'aspects.aspectVersion',
            'creator',
            'period',
        ]);

        return Inertia::render('summary', [
            'reportData' => $report,
        ]);
    }
}
