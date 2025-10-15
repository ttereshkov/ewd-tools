<?php

namespace App\Services;

use App\Models\Answer;
use App\Models\BorrowerDetail;
use App\Models\BorrowerFacility;
use App\Models\Report;
use App\Enums\ReportStatus;
use Illuminate\Support\Facades\Auth;

class FormService extends BaseService
{
    protected ReportCalculationService $reportCalculationService;
    protected ApprovalService $approvalService;

    public function __construct(
        ReportCalculationService $reportCalculationService,
        ApprovalService $approvalService
    ) {
        $this->reportCalculationService = $reportCalculationService;
        $this->approvalService = $approvalService;
    }

    public function submit(array $validated): Report
    {
        $this->authorize('create report');

        return $this->tx(function () use ($validated) {
            $borrowerId = $validated['informationBorrower']['borrowerId'];
            $info = $validated['informationBorrower'];

            BorrowerDetail::updateOrCreate(
                ['borrower_id' => $borrowerId],
                [
                    'borrower_group'    => $info['borrowerGroup'] ?? null,
                    'purpose'           => $info['purpose'],
                    'economic_sector'   => $info['economicSector'],
                    'business_field'    => $info['businessField'],
                    'borrower_business' => $info['borrowerBusiness'],
                    'collectibility'    => $info['collectibility'],
                    'restructuring'     => $info['restructuring'],
                ]
            );

            BorrowerFacility::where('borrower_id', $borrowerId)->delete();

            foreach ($validated['facilitiesBorrower'] as $facility) {
                BorrowerFacility::create([
                    'borrower_id'       => $borrowerId,
                    'facility_name'     => $facility['name'],
                    'limit'             => $facility['limit'],
                    'outstanding'       => $facility['outstanding'],
                    'interest_rate'     => $facility['interestRate'],
                    'principal_arrears' => $facility['principalArrears'],
                    'interest_arrears'  => $facility['interestArrears'],
                    'pdo_days'          => $facility['pdo'],
                    'maturity_date'     => $facility['maturityDate'],
                ]);
            }

            $report = Report::create([
                'borrower_id'   => $borrowerId,
                'template_id'   => $validated['reportMeta']['template_id'],
                'period_id'     => $validated['reportMeta']['period_id'],
                'status'        => ReportStatus::SUBMITTED,
                'created_by'    => Auth::id(),
                'submitted_at'  => now(),
            ]);

            foreach ($validated['aspectsBorrower'] as $aspectAnswer) {
                Answer::create([
                    'report_id'             => $report->id,
                    'question_version_id'   => $aspectAnswer['questionId'],
                    'question_option_id'    => $aspectAnswer['selectedOptionId'],
                    'notes'                 => $aspectAnswer['notes'] ?? null,
                ]);
            }

            $this->reportCalculationService->calculateAndStoreSummary($report);

            $this->approvalService->resetApprovals($report);

            $this->audit('Report', $report->id, 'form_submitted', [
                'borrower_id'   => $borrowerId,
                'borrower_name' => $info['borrowerName'] ?? null,
                'template_id'   => $validated['reportMeta']['template_id'],
                'period_id'     => $validated['reportMeta']['period_id'],
                'created_by'    => Auth::id(),
            ]);

            return $report->fresh(['summary', 'aspects']);
        });
    }
}