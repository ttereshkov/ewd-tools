<?php

namespace App\Services;

use App\Enums\ApprovalStatus;
use App\Models\Approval;
use App\Models\Report;
use App\ReportStatus;
use Illuminate\Support\Facades\Auth;

class ApprovalService extends BaseService
{
    public function approve(Approval $approval): void
    {
        $this->authorize('approve report');

        $this->tx(function () use ($approval) {
            $approval->update([
                'status' => ApprovalStatus::APPROVED,
                'reviewed_by' => Auth::id(),
            ]);

            $this->audit('Approval', $approval->id, 'approved', [
                'report_id' => $approval->report_id,
                'level'     => $approval->level->label(),
            ]);

            if ($this->isFinalApproval($approval->report)) {
                $approval->report->update(['status' => 'approved']);
            }
        });
    }

    public function reject(Approval $approval, ?string $reason = null): void
    {
        $this->authorize('reject report');

        $this->tx(function () use ($approval, $reason) {
            $approval->update([
                'status' => ApprovalStatus::REJECTED,
                'reviewed_by' => Auth::id(),
            ]);

            $approval->report->update([
                'status' => 'rejected',
                'rejection_reason' => $reason,
            ]);

            $this->audit('Approval', $approval->id, 'rejected', [
                'report_id' => $approval->report_id,
                'reason'    => $reason,
                'level'     => $approval->level->label(),
            ]);
        });
    }

    public function resetApprovals(Report $report): void
    {
        $this->tx(function () use ($report) {
            $report->approvals()->update([
                'status' => ApprovalStatus::PENDING,
                'reviewed_by' => null,
            ]);

            $report->update(['status' => ReportStatus::SUBMITTED]);

            $this->audit('Report', $report->id, 'reset_approvals');
        });
    }

    protected function isFinalApproval(Report $report): bool
    {
        return $report->approvals()
            ->where('status', '!=', ApprovalStatus::APPROVED)
            ->doesntExist();
    }
}