<?php

namespace App\Http\Controllers;

use App\Models\Report;
use App\Models\ReportSummary;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Throwable;

class SummaryController extends Controller
{
    public function show(Report $report)
    {
        $report->load([
            'borrower.division',
            'borrower.detail',
            'borrower.facilities',
            'summary',
            'aspects.aspectVersion.aspect',
            'creator',
            'period',
        ]);

        return Inertia::render('summary', [
            'reportData' => $report,
        ]);
    }

    public function update(Request $request, int $reportId)
    {
        try {
            $validated = $request->validate([
                'businessNotes' => 'nullable|string',
                'reviewerNotes' => 'nullable|string',
                'isOverride' => 'boolean',
                'overrideReason' => 'nullable|string|required_if:isOverride,true',
                'indicativeCollectibility' => 'integer|min:1|max:5',
                'finalClassification' => 'required|string|in:WATCHLIST,SAFE',
            ]);

            ReportSummary::updateOrCreate(
                ['report_id' => $reportId],
                [
                    'business_notes' => $validated['businessNotes'],
                    'reviewer_notes' => $validated['reviewerNotes'],
                    'is_override' => $validated['isOverride'],
                    'override_reason' => $validated['overrideReason'],
                    'indicative_collectibility' => $validated['indicativeCollectibility'],
                    'final_classification' => $validated['finalClassification'],
                ]
            );

            return response()->json([
                'success' => true,
                'message' => 'Ringkasan laporan berhasil disimpan.',
            ]);
        } catch (Throwable $e) {
            Log::error('Error updating report summary: '.$e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan pada server saat menyimpan ringkasan.',
            ], 500);
        }
    }
}
