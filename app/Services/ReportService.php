<?php

namespace App\Services;

use App\Models\Report;
use App\Models\User;
use App\Enums\ReportStatus;
use App\Enums\ApprovalLevel;
use App\Enums\ApprovalStatus;

class ReportService
{
    public function getAllReports()
    {
        $reports = Report::with(['borrower', 'borrower.division', 'period', 'creator'])->latest()->get();
        return $reports;
    }

    public function getReportById(int $id)
    {
        $report = Report::with([
                'borrower', 
                'borrower.division', 
                'borrower.detail', 
                'borrower.facilities',
                'template', 
                'period', 
                'summary', 
                'creator',
                'answers',
                'aspects',
                'aspects.aspectVersion',
                'approvals',
                'approvals.reviewer',
            ])->findOrFail($id);
        return $report;
    }

    public function getReportsForApproval(User $user)
    {
        $approvalLevel = null;
        if ($user->hasRole('risk_analyst')) {
            $approvalLevel = ApprovalLevel::ERO;
        } elseif ($user->hasRole('kadept_bisnis')) {
            $approvalLevel = ApprovalLevel::KADEPT_BISNIS;
        } elseif ($user->hasRole('kadept_risk')) {
            $approvalLevel = ApprovalLevel::KADIV_ERO;
        }

        if (!$approvalLevel) {
            return collect();
        }

        $query = Report::with([
            'borrower', 
            'borrower.division', 
            'period', 
            'creator',
            'summary',
            'approvals' => function($q) {
                $q->orderBy('level');
            },
            'approvals.reviewer'
        ]);

        // Filter by user's division if user has a division
        if ($user->division_id) {
            $query->whereHas('borrower', function($q) use ($user) {
                $q->where('division_id', $user->division_id);
            });
        }

        // Filter based on approval level and workflow
        if ($approvalLevel === ApprovalLevel::ERO) {
            // ERO can approve reports that are SUBMITTED
            $query->where('status', ReportStatus::SUBMITTED);
        } elseif ($approvalLevel === ApprovalLevel::KADEPT_BISNIS) {
            // Kadept Bisnis can approve reports that are APPROVED (by ERO)
            $query->where('status', ReportStatus::APPROVED)
                  ->whereHas('approvals', function($q) {
                      $q->where('level', ApprovalLevel::ERO)
                        ->where('status', ApprovalStatus::APPROVED);
                  });
        } elseif ($approvalLevel === ApprovalLevel::KADIV_ERO) {
            // Kadiv Risk can approve reports that are APPROVED (by Kadept Bisnis)
            $query->where('status', ReportStatus::APPROVED)
                  ->whereHas('approvals', function($q) {
                      $q->where('level', ApprovalLevel::KADEPT_BISNIS)
                        ->where('status', ApprovalStatus::APPROVED);
                  });
        }

        // Only show reports that have pending approval at this level
        $query->whereHas('approvals', function($q) use ($approvalLevel) {
            $q->where('level', $approvalLevel)
              ->where('status', ApprovalStatus::PENDING);
        });

        return $query->latest()->get();
    }
}