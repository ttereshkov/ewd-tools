<?php

namespace App\Services;

use App\ActionItemType;
use App\Classification;
use App\Models\MonitoringNote;
use App\Models\Report;
use App\Models\Watchlist;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Exception;

class MonitoringNoteService extends BaseService
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

    public function getMonitoringNoteData(int $reportId): array
    {
        $this->authorize('view monitoring_notes');

        $report = $this->reportService->getReportById($reportId);
        $watchlist = $this->getOrCreateWatchlistByReportId($reportId);
        $monitoringNote = $this->getOrCreateMonitoringNoteByWatchlist($watchlist->id, $report->borrower_id);

        $actionItems = [
            'previous_period'  => $monitoringNote->actionItems
                ->where('item_type', ActionItemType::PREVIOUS_PERIOD->value)
                ->values(),
            'current_progress' => $monitoringNote->actionItems
                ->where('item_type', ActionItemType::CURRENT_PROGRESS->value)
                ->values(),
            'next_period'      => $monitoringNote->actionItems
                ->where('item_type', ActionItemType::NEXT_PERIOD->value)
                ->values(),
        ];

        $this->audit('MonitoringNote', $monitoringNote->id, 'fetched', [
            'report_id' => $reportId,
            'watchlist_id' => $watchlist->id,
            'action_item_counts' => [
                'previous' => $actionItems['previous_period']->count(),
                'current'  => $actionItems['current_progress']->count(),
                'next'     => $actionItems['next_period']->count(),
            ],
        ]);

        return compact('watchlist', 'report', 'monitoringNote', 'actionItems');
    }

    public function getOrCreateWatchlistByReportId(int $reportId): Watchlist
    {
        return $this->tx(function () use ($reportId) {
            $watchlist = Watchlist::with(['borrower', 'report', 'addedBy', 'resolvedBy'])
                ->where('report_id', $reportId)
                ->first();

            if (!$watchlist) {
                $report = Report::findOrFail($reportId);
                $watchlist = $this->watchlistService->getOrCreateWatchlist($report);
                $this->audit('Watchlist', $watchlist->id, 'auto_created', [
                    'report_id' => $reportId,
                    'borrower_id' => $report->borrower_id,
                ]);
            }

            return $watchlist->fresh(['borrower', 'report', 'addedBy', 'resolvedBy']);
        });
    }

    public function getOrCreateMonitoringNoteByWatchlist(int $watchlistId, ?int $borrowerId = null): MonitoringNote
    {
        return $this->tx(function () use ($watchlistId, $borrowerId) {
            $monitoringNote = MonitoringNote::with('actionItems')
                ->where('watchlist_id', $watchlistId)
                ->first();

            if (!$monitoringNote) {
                $monitoringNote = MonitoringNote::create([
                    'watchlist_id'     => $watchlistId,
                    'watchlist_reason' => '',
                    'account_strategy' => '',
                    'created_by'       => Auth::id(),
                    'updated_by'       => Auth::id(),
                ]);

                $this->audit('MonitoringNote', $monitoringNote->id, 'created', [
                    'watchlist_id' => $watchlistId,
                    'borrower_id'  => $borrowerId,
                ]);

                if ($borrowerId) {
                    $this->autoCopyFromPreviousPeriod($monitoringNote->id, $borrowerId);
                }
            } else {
                $hasPrevious = $monitoringNote->actionItems
                    ->where('item_type', ActionItemType::PREVIOUS_PERIOD->value)
                    ->count() > 0;

                if (!$hasPrevious && $borrowerId) {
                    $this->autoCopyFromPreviousPeriod($monitoringNote->id, $borrowerId);
                }
            }

            return $monitoringNote->fresh(['actionItems']);
        });
    }

    public function isNawRequired(int $reportId): bool
    {
        $report = Report::with('summary')->findOrFail($reportId);
        return $report->summary &&
            $report->summary->final_classification === Classification::WATCHLIST->value;
    }

    private function autoCopyFromPreviousPeriod(int $monitoringNoteId, int $borrowerId): void
    {
        try {
            $this->actionItemService->copyFromPreviousPeriod($monitoringNoteId, $borrowerId);
            $this->audit('MonitoringNote', $monitoringNoteId, 'auto_copy_previous_period', [
                'borrower_id' => $borrowerId,
            ]);
        } catch (Exception $e) {
            Log::warning('Failed to auto-copy from previous period: ' . $e->getMessage());
            $this->audit('MonitoringNote', $monitoringNoteId, 'auto_copy_failed', [
                'borrower_id' => $borrowerId,
                'error' => $e->getMessage(),
            ]);
        }
    }

    public function validateCompletion(MonitoringNote $monitoringNote): array
    {
        $missingItems = [];

        if (empty(trim($monitoringNote->watchlist_reason ?? ''))) {
            $missingItems[] = 'Alasan Watchlist';
        }

        if (empty(trim($monitoringNote->account_strategy ?? ''))) {
            $missingItems[] = 'Account Strategy';
        }

        $actionItems = $monitoringNote->actionItems;

        $previousItems = $actionItems->where('item_type', ActionItemType::PREVIOUS_PERIOD->value);
        $previousItemsWithProgress = $previousItems->filter(
            fn($item) => !empty(trim($item->progress_notes ?? ''))
        );

        if ($previousItems->count() > 0 && $previousItemsWithProgress->count() < $previousItems->count()) {
            $missingItems[] = 'Progress dari periode sebelumnya belum lengkap';
        }

        $nextItems = $actionItems->where('item_type', ActionItemType::NEXT_PERIOD->value);
        if ($nextItems->count() === 0) {
            $missingItems[] = 'Rencana tindak lanjut periode berikutnya belum diisi';
        }

        $isComplete = empty($missingItems);

        $this->audit('MonitoringNote', $monitoringNote->id, 'validated', [
            'is_complete' => $isComplete,
            'missing_items' => $missingItems,
        ]);

        return compact('isComplete', 'missingItems');
    }
}
