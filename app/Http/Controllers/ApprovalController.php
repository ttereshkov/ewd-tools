<?php

namespace App\Http\Controllers;

use App\Models\Approval;
use App\Services\ApprovalService;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;

class ApprovalController extends Controller
{
    protected ApprovalService $approvalService;

    public function __construct(ApprovalService $approvalService)
    {
        $this->approvalService = $approvalService;
    }

    public function approve(Approval $approval): RedirectResponse
    {
        try {
            $this->approvalService->approve($approval);
            return back()->with('success', 'Laporan berhasil disetujui');
        } catch (\Exception $e) {
            return back()->with('error', 'Gagal menyetujui laporan: ' . $e->getMessage());
        }
    }

    public function reject(Request $request, Approval $approval): RedirectResponse
    {
        $request->validate([
            'reason' => 'required|string|max:1000'
        ]);

        try {
            $this->approvalService->reject($approval, $request->reason);
            return back()->with('success', 'Laporan berhasil ditolak');
        } catch (\Exception $e) {
            return back()->with('error', 'Gagal menolak laporan: ' . $e->getMessage());
        }
    }
}