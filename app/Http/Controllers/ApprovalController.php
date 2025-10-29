<?php

namespace App\Http\Controllers;

use App\Enums\ApprovalStatus;
use App\Http\Requests\SubmitApprovalRequest;
use App\Models\Approval;
use App\Services\ApprovalService;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Redirect;

class ApprovalController extends Controller
{
    protected ApprovalService $approvalService;

    public function __construct(ApprovalService $approvalService)
    {
        $this->approvalService = $approvalService;
    }
    
    public function approve(SubmitApprovalRequest $request, Approval $approval): RedirectResponse
    {
        try {
            $this->approvalService->processApproval(
                $approval,
                $request->user(),
                ApprovalStatus::APPROVED,
                $request->validated()
            );
        } catch (\Throwable $e) {
            return Redirect::back()->withErrors(['message' => $e->getMessage()]);
        }

        return Redirect::back()->with('success', 'Laporan berhasil disetujui.');
    }

    public function reject(SubmitApprovalRequest $request, Approval $approval): RedirectResponse
    {
        try {
            $this->approvalService->processApproval(
                $approval,
                $request->user(),
                ApprovalStatus::REJECTED,
                $request->validated()
            );
        } catch (\Throwable $e) {
            return Redirect::back()->withErrors(['message' => $e->getMessage()]);
        }

        return Redirect::back()->with('success', 'Laporan berhasil ditolak.');
    }
}