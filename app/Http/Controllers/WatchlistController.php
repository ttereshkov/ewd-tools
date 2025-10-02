<?php

namespace App\Http\Controllers;

use App\Models\ActionItem;
use App\Models\MonitoringNote;
use App\Models\Report;
use App\Services\MonitoringNoteService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Exception;

class WatchlistController extends Controller
{
    protected MonitoringNoteService $monitoringNoteService;

    public function __construct(
        MonitoringNoteService $monitoringNoteService,
    ) {
        $this->monitoringNoteService = $monitoringNoteService;
    }

    public function show(Request $request)
    {
        $reportId = $request->query('reportId');

        if (!$reportId) {
            abort(400, 'Report ID is required');
        }

        try {
            $monitoringNoteData = $this->monitoringNoteService->getMonitoringNoteData($reportId);
            return Inertia::render('watchlist-note', $monitoringNoteData);
        } catch (Exception $e) {
            abort(400, $e->getMessage());
        }
    }

    // public function save(Request $request, Report $report)
    // {
    //     $validated = $request->validate([
    //         'monitoring_note.watchlist_reason' => 'required|string',
    //         'monitoring_note.account_strategy' => 'required|string',
    //         'action_items'                     => 'array',
    //         'action_items.previous_period'     => 'array', 
    //         'action_items.current_progress'    => 'array',
    //         'action_items.next_period'         => 'array',
    //     ]);

    //     $monitoringNote = MonitoringNote::updateOrCreate(
    //         ['watchlist_id' => $report->watchlist->id],
    //         [
    //             'watchlist_reason' => $validated['monitoring_note']['watchlist_reason'],
    //             'account_strategy' => $validated['monitoring_'],
    //         ],
    //     )
    // }
}
