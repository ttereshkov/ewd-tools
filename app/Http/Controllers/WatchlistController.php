<?php

namespace App\Http\Controllers;

use App\Models\ActionItem;
use App\Models\MonitoringNote;
use App\Models\Report;
use Inertia\Inertia;

class WatchlistController extends Controller
{
    public function show(Report $report)
    {
        $report->load(['borrower', 'period', 'creator']);

        $monitoringNote = MonitoringNote::firstOrCreate([
            ['report_id' => $report->id],
            [
                'watchlist_reason' => 'Alasan watchlist belum diisi',
                'account_strategy' => '',
            ],
        ]);

        $actionItems = ActionItem::where('monitoring_note_id', $monitoringNote->id)->get()->groupBy('item_type');

        return Inertia::render('watchlist-note', [
            'report' => $report,
            'monitoring_note' => $monitoringNote,
            'action_items' => [
                'previous_period' => $actionItems->get('previous_period', []),
                'next_period' => $actionItems->get('next_period', []),
            ],
        ]);
    }
}
