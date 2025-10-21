<?php

namespace App\Services;

use App\Enums\ApprovalLevel;
use App\Enums\ApprovalStatus;
use App\Models\Approval;
use App\Models\Report;
use App\Enums\ReportStatus;
use App\Models\User;
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
                $approval->report->update(['status' => ReportStatus::APPROVED]);
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
                'status' => ReportStatus::REJECTED,
                'rejection_reason' => $reason,
            ]);

            $this->audit('Approval', $approval->id, 'rejected', [
                'report_id' => $approval->report_id,
                'reason'    => $reason,
                'level'     => $approval->level->label(),
            ]);
        });
    }

    public function createApprovals(Report $report): void
    {
        $this->authorize('create approvals');

        $this->tx(function () use ($report) {
            foreach (ApprovalLevel::cases() as $level) {
                Approval::create([
                    'report_id' => $report->id,
                    'requested_by' => Auth::id(),
                    'level' => $level,
                    'status' => ApprovalStatus::PENDING,
                ]);
            };
        });

        $this->audit('Report', $report->id, 'approvals_created', [
            'levels_count' => count(ApprovalLevel::cases()),
        ]);
    }

    public function getNextPendingApproval(Report $report): ?Approval
    {
        return $report->approvals()
            ->where('status', ApprovalStatus::PENDING)
            ->orderBy('level')
            ->first();
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

    public function canUserApprove(Approval $approval, int $userId): bool
    {
        $user = User::find($userId);

        if (!$user || !$user->can('approve report')) {
            return false;
        }

        $nextPendingApproval = $this->getNextPendingApproval($approval->report);

        return $nextPendingApproval && $nextPendingApproval->id === $approval->id;
    }

    protected function isFinalApproval(Report $report): bool
    {
        return $report->approvals()
            ->where('status', '!=', ApprovalStatus::APPROVED)
            ->doesntExist();
    }
}