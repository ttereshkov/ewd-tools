<?php

namespace App\Services;

use App\Enums\ApprovalLevel;
use App\Enums\ApprovalStatus;
use App\Enums\Classification;
use App\Models\Approval;
use App\Models\Report;
use App\Enums\ReportStatus;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\Auth;
use InvalidArgumentException;

class ApprovalService extends BaseService
{
    public function submitApproval(Report $report, User $actor, array $data): Approval
    {
        $status = ApprovalStatus::tryFrom($data['status'] ?? '');
        if (!$status) {
            throw new InvalidArgumentException('Status persetujuan tidak valid.');
        }

        $level = $this->getApprovalLevelForActor($actor, $report);

        if ($actor->cannot('approve-level', [$report, $level])) {
             throw new AuthorizationException("Anda tidak berhak memberikan persetujuan level {$level->name}.");
        }

        $this->validateCurrentReportStatus($report, $level);

        return $this->tx(function () use ($report, $actor, $level, $status, $data) {
            $approval = $report->approvals()->create([
                'user_id' => $actor->id,
                'level' => $level,
                'status' => $status,
                'notes' => $data['notes'] ?? null,
            ]);

            $nextReportStatus = $this->determineNextReportStatus($report, $level, $status);
            if ($nextReportStatus) {
                $report->status = $nextReportStatus;
                $report->save();
            }

            if ($level === ApprovalLevel::ERO && isset($data['final_classification'])) {
                 $report->loadMissing('summary');
                 $report->summary->update([
                     'final_classification' => Classification::tryFrom($data['final_classification']),
                     'override_reason' => $data['override_reason'] ?? $data['notes'],
                 ]);
            }

            $this->audit($actor, [
                'action' => $status === ApprovalStatus::APPROVED ? 'approved' : 'rejected',
                'auditable_id' => $report->id,
                'auditable_type' => Report::class,
                'report_id' => $report->id,
                'approval_id' => $approval->id,
                'level' => $level->value,
                'before' => ['report_status' => $report->getOriginal('status')?->value],
                'after' => ['report_status' => $nextReportStatus?->value],
                'meta' => [
                    'notes' => $approval->notes,
                    'final_classification' => $data['final_classification'] ?? null,
                ],
            ]);

            return $approval;
        });
    }

    public function reject(Approval $approval, ?string $reason = null): void
    {
        /**
         * TO DO
         */
    }

    public function resetApprovals(Report $report): void
    {
        $this->tx(function () use ($report) {
            $report->approvals()->delete();
        });
    }

    protected function getApprovalLevelForActor(User $actor, Report $report): ApprovalLevel
    {
        if ($actor->hasRole('Risk Analyst')) return ApprovalLevel::ERO;
        if ($actor->hasRole('Kadept Bisnis')) return ApprovalLevel::KADEPT_BISNIS;
        if ($actor->hasRole('Kadiv Risk')) return ApprovalLevel::KADIV_ERO;

        throw new AuthorizationException('Peran pengguna tidak dikenali untuk approval.');
    }

    protected function validateCurrentReportStatus(Report $report, ApprovalLevel $attemptingLevel): void
    {
        $expectedStatus = match ($attemptingLevel) {
            ApprovalLevel::ERO => ReportStatus::SUBMITTED,
            ApprovalLevel::KADEPT_BISNIS => ReportStatus::APPROVED,
            ApprovalLevel::KADIV_ERO => ReportStatus::APPROVED,
            default => throw new InvalidArgumentException('Level approval tidak valid.'),
        };

        if ($report->status !== $expectedStatus) {
            throw new InvalidArgumentException("Status laporan saat ini ({$report->status->name}) tidak valid untuk persetujuan level {$attemptingLevel->name}. Seharusnya {$expectedStatus->name}.");
        }
    }

    protected function determineNextReportStatus(Report $report, ApprovalLevel $level, ApprovalStatus $status): ?ReportStatus
    {
        if ($status === ApprovalStatus::REJECTED) {
            return ReportStatus::REJECTED;
        }

        return match ($level) {
            ApprovalLevel::ERO => ReportStatus::APPROVED,
            ApprovalLevel::KADEPT_BISNIS => ReportStatus::APPROVED,
            ApprovalLevel::KADIV_ERO => ReportStatus::DONE,
            default => null, 
        };
    }
}