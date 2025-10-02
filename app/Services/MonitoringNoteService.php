<?php

namespace App\Services;

use App\ActionItemType;
use App\Classification;
use App\Models\MonitoringNote;
use App\Models\Report;
use App\Models\Watchlist;
use Illuminate\Support\Facades\Log;
use Exception;
use Illuminate\Support\Facades\Auth;

class MonitoringNoteService
{
    protected ReportService $reportService;
    protected WatchlistService $watchlistService;
    protected ActionItemService $actionItemService;

    public function __construct(
        ReportService $reportService,
        WatchlistService $watchlistService,
        ActionItemService $actionItemService
    ) {
        $this->reportService = $reportService;
        $this->watchlistService = $watchlistService;
        $this->actionItemService = $actionItemService;
    }

    public function getMonitoringNoteData(int $reportId)
    {
        $report = $this->reportService->getReportById($reportId);
        $watchlist = $this->getOrCreateWatchlistByReportId($reportId);
        $monitoringNote = $this->getOrCreateMonitoringNoteByWatchlist($watchlist->id, $report->borrower_id);

        $actionItems = [
            'previous_period'   =>
                $monitoringNote->actionItems->where('item_type', ActionItemType::PREVIOUS_PERIOD->value)->values(),
            'current_progress'  =>
                $monitoringNote->actionItems->where('item_type', ActionItemType::CURRENT_PROGRESS->value)->values(),
            'next_period'       =>
                $monitoringNote->actionItems->where('item_type', ActionItemType::NEXT_PERIOD->value)->values(),
        ];

        return [
            'watchlist'         => $watchlist,
            'report_data'            => $report,
            'monitoring_note'    => $monitoringNote,
            'action_items'       => $actionItems,
            'is_naw_required'     => $this->isNawRequired($reportId)
        ];
    }

    public function getOrCreateWatchlistByReportId(int $reportId)
    {
        // Mencari watchlist yang sudah ada
        $watchlist = Watchlist::with([
            'borrower',
            'report',
            'addedBy',
            'resolvedBy',
        ])->where('report_id', $reportId)->first();

        // Jika tidak ada, buat baru menggunakan WatchlistService
        if (!$watchlist) {
            $report = Report::findOrFail($reportId);
            $watchlist = $this->watchlistService->getOrCreateWatchlist($report);

            $watchlist->load([
                'borrower',
                'report',
                'addedBy',
                'resolvedBy'
            ]);
        }

        return $watchlist;
    }

    public function getOrCreateMonitoringNoteByWatchlist(int $watchlistId, int $borrowerId = null)
    {
        // Mencari monitoring note yang sudah ada
        $monitoringNote = MonitoringNote::with('actionItems')
            ->where('watchlist_id', $watchlistId)
            ->first();

        // Jika tidak ada, buat baru
        if (!$monitoringNote) {
            $monitoringNote = MonitoringNote::create([
                'watchlist_id'      => $watchlistId,
                'watchlist_reason'  => '',
                'account_strategy'  => '',
                'created_by'        => Auth::id(),
                'updated_by'        => Auth::id(),
            ]);

            // Load relationships yang telah dibuat
            $monitoringNote->load('actionItems');

            // Auto-copy dari periode sebelumnya jika ada borrowerId
            if ($borrowerId) {
                $this->autoCopyFromPreviousPeriod($monitoringNote->id, $borrowerId);
                $monitoringNote->load('actionItems');
            }
        } else {
            // Jika monitoring note sudah ada tapi belum ada previous period items, auto-copy
            $hasPreviousItems = $monitoringNote->actionItems->where('item_type', ActionItemType::PREVIOUS_PERIOD->value)->count() > 0;
            if (!$hasPreviousItems && $borrowerId) {
                $this->autoCopyFromPreviousPeriod($monitoringNote->id, $borrowerId);
                $monitoringNote->load('actionItems');
            }
        }

        return $monitoringNote;
    }

    public function isNawRequired(int $reportId): bool
    {
        $report = Report::with('summary')->findOrFail($reportId);

        // NAW diperlukan jika klasifikasi final adalah 'watchlist'
        return $report->summary && $report->summary->final_classification === Classification::WATCHLIST->value;
    }

    /**
     * Auto-copy action items from previous period
     */
    private function autoCopyFromPreviousPeriod(int $monitoringNoteId, int $borrowerId)
    {
        try {
            $this->actionItemService->copyFromPreviousPeriod($monitoringNoteId, $borrowerId);
        } catch (Exception $e) {
            Log::warning('Failed to auto-copy from previous period: ' . $e->getMessage());
        }
    }
}