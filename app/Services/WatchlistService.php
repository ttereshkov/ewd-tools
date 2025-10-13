<?php

namespace App\Services;

use App\Models\Report;
use App\Models\Watchlist;
use App\WatchlistStatus;
use Illuminate\Support\Facades\Auth;

class WatchlistService extends BaseService
{
    public function getOrCreateWatchlist(Report $report): Watchlist
    {
        $this->authorize('create watchlist');

        return $this->tx(function () use ($report) {
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

                $this->audit('Watchlist', $watchlist->id, 'created', [
                    'borrower_id' => $report->borrower_id,
                    'report_id'   => $report->id,
                    'status'      => WatchlistStatus::ACTIVE->value,
                ]);
            } else {
                $this->audit('Watchlist', $watchlist->id, 'retrieved', [
                    'borrower_id' => $report->borrower_id,
                    'status'      => $watchlist->status,
                ]);
            }

            return $watchlist->fresh(['borrower', 'report']);
        });
    }

    public function closeWatchlist(Watchlist $watchlist, ?string $reason = null): Watchlist
    {
        $this->authorize('update watchlist');

        return $this->tx(function () use ($watchlist, $reason) {
            $before = $watchlist->toArray();

            $watchlist->update([
                'status'       => WatchlistStatus::CLOSED->value,
                'closed_at'    => now(),
                'closed_by'    => Auth::id(),
                'close_reason' => $reason,
            ]);

            $this->audit('Watchlist', $watchlist->id, 'closed', [
                'before' => $before,
                'after'  => $watchlist->toArray(),
                'reason' => $reason,
            ]);

            return $watchlist->fresh();
        });
    }

    public function deactivate(Watchlist $watchlist): Watchlist
    {
        $this->authorize('update watchlist');

        return $this->tx(function () use ($watchlist) {
            $before = $watchlist->toArray();

            $watchlist->update([
                'status' => WatchlistStatus::INACTIVE->value,
                'updated_by' => Auth::id(),
            ]);

            $this->audit('Watchlist', $watchlist->id, 'deactivated', [
                'before' => $before,
                'after'  => $watchlist->toArray(),
            ]);

            return $watchlist->fresh();
        });
    }
}