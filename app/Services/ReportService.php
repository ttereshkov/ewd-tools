<?php

namespace App\Services;

use App\Models\Report;

class ReportService
{
    public function getAllReports()
    {
    $reports = Report::with(['borrower', 'borrower.division', 'period', 'creator'])->latest()->get();
        return $reports;
    }

    public function getReportById(int $id)
    {
        $report = Report::with([
                'borrower', 
                'borrower.division', 
                'borrower.detail', 
                'borrower.facilities',
                'template', 
                'period', 
                'summary', 
                'creator',
                'answers',
                'aspects',
            ])->findOrFail($id);
        return $report;
    }
}