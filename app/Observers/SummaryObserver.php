<?php

namespace App\Observers;

use App\Models\MonitoringNote;
use App\Models\ReportSummary;
use App\Models\Watchlist;
use Illuminate\Support\Facades\Auth;

class SummaryObserver
{
    public function saved(ReportSummary $summary): void
    {
        $report = $summary->report;

        if (!$report) {
            return;
        }

        if (strtolower($summary->final_classification) === 'watchlist') {
            $watchlist = Watchlist::firstOrCreate(
                [
                    'borrower_id' => $report->borrower_id,
                    'report_id' => $report->id,
                    'status' => 'active'
                ],
                [
                    'added_by' => Auth::id()
                ]
            );

            MonitoringNote::firstOrCreate(
                [
                    'watchlist_id' => $watchlist->id,
                ],
                [
                    'watchlist_reason' => '',
                    'account_strategy' => '',
                    'created_by' => Auth::id(),
                ]
            );
        } else {
            Watchlist::where('borrower_id', $report->borrower_id)
                ->where('status', 'active')
                ->update([
                    'status' => 'archived',
                    'resolved_by' => Auth::id(),
                    'resolved_at' => now(),
                ]);
        }
    }
}
