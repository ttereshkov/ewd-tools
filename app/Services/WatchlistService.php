<?php

namespace App\Services;

use App\Models\Report;
use App\Models\Watchlist;
use App\WatchlistStatus;
use Illuminate\Support\Facades\Auth;

class WatchlistService
{
    public function getOrCreateWatchlist(Report $report): Watchlist
    {
        $watchlist = Watchlist::where('borrower_id', $report->borrower_id)
            ->where('status', WatchlistStatus::ACTIVE->value)
            ->first();

        if (!$watchlist) {
            $watchlist = Watchlist::create([
                'borrower_id' => $report->borrower_id,
                'report_id' => $report->id,
                'status' => WatchlistStatus::ACTIVE->value,
                'added_by' => Auth::id(),
            ]);
        }

        return $watchlist;
    }
}