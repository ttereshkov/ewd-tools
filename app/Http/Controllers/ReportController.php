<?php

namespace App\Http\Controllers;

use App\Models\Report;
use App\Services\ReportService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportController extends Controller
{
    protected ReportService $reportService;

    public function __construct(
        ReportService $reportService,
    ) {
        $this->reportService = $reportService;
    }

    public function index()
    {
        $reports = $this->reportService->getAllReports();
        return Inertia::render('report/index', [
            'reports' => $reports
        ]);
    }

    public function show(int $id)
    {
        $report = $this->reportService->getReportById($id);
        return Inertia::render('report/show', [
            'report' => $report
        ]);
    }
}
