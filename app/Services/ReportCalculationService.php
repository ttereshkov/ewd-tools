<?php

namespace App\Services;

use App\Enums\Classification;
use App\Enums\WatchlistStatus;
use App\Models\Report;
use App\Models\ReportAspect;
use App\Models\ReportSummary;
use App\Models\Watchlist;
use Illuminate\Support\Facades\Auth;

class ReportCalculationService extends BaseService
{
    public function calculateAndStoreSummary(Report $report): Report
    {
        return $this->tx(function () use ($report) {
            $report->loadMissing([
                'borrower.detail',
                'template.latestTemplateVersion.aspectVersions',
                'answers.questionVersion.aspectVersion.aspect',
                'answers.questionOption',
                'aspects',
            ]);

            $aspectScores = $this->calculateAspectScores($report);

            $overallSummary = $this->calculateOverallSummary($report, $aspectScores);

            $this->storeCalculationResults($report, $aspectScores, $overallSummary);

            $this->audit('report', $report->id, 'recalculated', [
                'total_score' => $overallSummary['total_score'],
                'classification' => $overallSummary['final_classification']->name,
            ]);

            if ($overallSummary['final_classification'] === Classification::WATCHLIST) {
                $this->createOrAttachWatchlist($report);
            }

            return $report->fresh(['summary', 'aspects']);
        });
    }

    private function calculateAspectScores(Report $report): array
    {
        $aspectScores = [];
        $answersByAspect = $report->answers->groupBy('questionVersion.aspectVersion.aspect.id');

        foreach ($answersByAspect as $aspectVersionId => $answers) {
            $totalScore = 0;

            foreach ($answers as $answer) {
                $questionWeight = ($answer->questionVersion->weight ?? 0) / 100;
                $optionScore = $answer->questionOption->score ?? 0;
                $totalScore += $questionWeight * $optionScore;
            }

            $aspectScores[$aspectVersionId] = [
                'total_score' => round($totalScore, 2),
                'classification' => $this->determineClassification($report, $totalScore),
            ];
        }

        return $aspectScores;
    }

    private function calculateOverallSummary(Report $report, array $aspectScores): array
    {
        $totalWeightedScore = 0;

        foreach ($aspectScores as $aspectVersionId => $scoreData) {
            $aspectWeight = $this->getAspectWeightFromTemplate($report, $aspectVersionId);
            $totalWeightedScore += ($scoreData['total_score'] * $aspectWeight / 100);
        }

        return [
            'total_score' => round($totalWeightedScore, 2),
            'final_classification' => $this->determineClassification($report, $totalWeightedScore),
            'collectibility' => $report->borrower->detail->collectibility ?? null,
        ];
    }

    private function storeCalculationResults(Report $report, array $aspectScores, array $overallSummary): void
    {
        foreach ($aspectScores as $aspectVersionId => $scoreData) {
            ReportAspect::updateOrCreate(
                ['report_id' => $report->id, 'aspect_version_id' => $aspectVersionId],
                [
                    'total_score' => $scoreData['total_score'],
                    'classification' => $scoreData['classification'],
                ]
            );
        }

        ReportSummary::updateOrCreate(
            ['report_id' => $report->id],
            [
                'total_score' => $overallSummary['total_score'],
                'final_classification' => $overallSummary['final_classification'],
                'indicative_collectibility' => $overallSummary['collectibility'],
            ]
        );
    }

    private function getAspectWeightFromTemplate(Report $report, int $aspectVersionId): float
    {
        $aspectVersionPivot = $report->template
            ->latestTemplateVersion
            ->aspectVersions
            ->firstWhere('id', $aspectVersionId);

        return $aspectVersionPivot ? ($aspectVersionPivot->pivot->weight ?? 0) : 0;
    }

    private function determineClassification(Report $report, float $totalScore): Classification
    {
        if ($this->passesScoreRule($totalScore)
            && $this->passesAspectRule($report)
            && $this->passesMandatoryRule($report)) {
            return Classification::SAFE;
        }

        return Classification::WATCHLIST;
    }

    private function passesScoreRule(float $totalScore): bool
    {
        return $totalScore >= 80;
    }

    private function passesAspectRule(Report $report): bool
    {
        return !$report->aspects->contains(
            fn($aspect) => $aspect->classification === Classification::WATCHLIST
        );
    }

    private function passesMandatoryRule(Report $report): bool
    {
        $mandatoryLimit = 1;

        $failedMandatoryCount = $report->answers
            ->filter(fn($answer) => $answer->questionVersion->is_mandatory)
            ->filter(fn($answer) => !$answer->questionOption || $answer->questionOption->score < 0)
            ->count();

        return $failedMandatoryCount <= $mandatoryLimit;
    }

    private function createOrAttachWatchlist(Report $report): Watchlist
    {
        $this->authorize('create watchlist');

        $existing = Watchlist::where('borrower_id', $report->borrower_id)
            ->where('status', WatchlistStatus::ACTIVE->value)
            ->first();

        if ($existing) {
            return $existing;
        }

        $watchlist = Watchlist::create([
            'borrower_id' => $report->borrower_id,
            'report_id' => $report->id,
            'status' => WatchlistStatus::ACTIVE->value,
            'added_by' => Auth::id(),
        ]);

        $this->audit('watchlist', $watchlist->id, 'created-from-calculation', [
            'report_id' => $report->id,
        ]);

        return $watchlist;
    }
}
