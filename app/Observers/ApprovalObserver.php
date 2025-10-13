<?php

namespace App\Observers;

use App\Models\Approval;
use App\Models\ReportAudit;
use Illuminate\Support\Facades\Auth;

class ApprovalObserver
{
    /**
     * Handle the Approval "created" event.
     */
    public function created(Approval $approval): void
    {
        //
    }

    /**
     * Handle the Approval "updated" event.
     */
    public function updated(Approval $approval): void
    {
        if ($approval->isDirty('status')) {
            $before = ['status' => $approval->getOriginal('status')];
            $after  = ['status' => $approval->status];

            $action = match ($approval->status->value) {
                1 => 'approved',
                2 => 'rejected',
                default => 'pending',
            };

            ReportAudit::create([
                'auditable_id'   => $approval->id,
                'auditable_type' => Approval::class,
                'report_id'      => $approval->report_id,
                'user_id'        => Auth::id(),
                'action'         => $action,
                'level'          => $approval->level->value,
                'approval_id'    => $approval->id,
                'before'         => $before,
                'after'          => $after,
                'source'         => 'UI',
            ]);
        }
    }

    /**
     * Handle the Approval "deleted" event.
     */
    public function deleted(Approval $approval): void
    {
        //
    }

    /**
     * Handle the Approval "restored" event.
     */
    public function restored(Approval $approval): void
    {
        //
    }

    /**
     * Handle the Approval "force deleted" event.
     */
    public function forceDeleted(Approval $approval): void
    {
        //
    }
}
