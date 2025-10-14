<?php

namespace App\Services;

use App\Models\Report;
use App\Models\Watchlist;
use App\WatchlistStatus;
use Illuminate\Support\Facades\Auth;

class WatchlistService extends BaseService
{
    /**
     * Get or create active watchlist for borrower based on report.
     */
    public function getOrCreateWatchlist(Report $report): Watchlist
    {
        $this->authorize('create watchlist');

        return $this->tx(function () use ($report) {
            $watchlist = Watchlist::where('borrower_id', $report->borrower_id)
                ->where('status', WatchlistStatus::ACTIVE)
                ->first();

            if (!$watchlist) {
                $watchlist = Watchlist::create([
                    'borrower_id' => $report->borrower_id,
                    'report_id' => $report->id,
                    'status' => WatchlistStatus::ACTIVE,
                    'added_by' => Auth::id(),
                ]);

                $this->audit('Watchlist', $watchlist->id, 'created', [
                    'borrower_id' => $report->borrower_id,
                    'report_id'   => $report->id,
                    'status'      => WatchlistStatus::ACTIVE,
                ]);
            } else {
                $this->audit('Watchlist', $watchlist->id, 'retrieved', [
                    'borrower_id' => $report->borrower_id,
                    'status'      => $watchlist->status->label(),
                ]);
            }

            return $watchlist->fresh(['borrower', 'report']);
        });
    }

    public function resolve(Watchlist $watchlist, ?string $reason = null): Watchlist
    {
        $this->authorize('update watchlist');

        return $this->tx(function () use ($watchlist, $reason) {
            $before = $watchlist->toArray();

            $watchlist->update([
                'status'       => WatchlistStatus::RESOLVED,
                'resolved_at'    => now(),
                'resolved_by'    => Auth::id(),
                'resolved_notes' => $reason,
            ]);

            $this->audit('Watchlist', $watchlist->id, 'resolved', [
                'before' => $before,
                'after'  => $watchlist->toArray(),
                'reason' => $reason,
            ]);

            return $watchlist->fresh();
        });
    }

    public function archive(Watchlist $watchlist): Watchlist
    {
        $this->authorize('update watchlist');

        return $this->tx(function () use ($watchlist) {
            $before = $watchlist->toArray();

            $watchlist->update([
                'status' => WatchlistStatus::ARCHIVED,
            ]);

            $this->audit('Watchlist', $watchlist->id, 'archived', [
                'before' => $before,
                'after'  => $watchlist->toArray(),
            ]);

            return $watchlist->fresh();
        });
    }
}