<?php

namespace App\Services;

use App\Models\Report;

class ReportService
{
    public function getReportById(int $id)
    {
        $report = Report::with(['borrower', 'template', 'period', 'summary', 'creator'])->findOrFail($id);

        return $report;
    }
}