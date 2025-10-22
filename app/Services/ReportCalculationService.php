<?php

namespace App\Services;

use App\Data\AspectScoreDto;
use App\Data\OverallSummaryDto;
use App\Enums\Classification;
use App\Enums\WatchlistStatus;
use App\Models\Report;
use App\Models\ReportAspect;
use App\Models\ReportSummary;
use App\Models\User;
use App\Models\Watchlist;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use InvalidArgumentException;

class ReportCalculationService extends BaseService
{
    public function calculateAndStoreSummary(Report $report, ?User $actor = null): Report
    {
        return $this->tx(function () use ($report, $actor) {
            $report->loadMissing([
                'borrower.detail',
                'template.latestTemplateVersion.aspects',
                'answers.questionVersion',
                'answers.questionOption',
            ]);

            $aspectWeightMap = $this->buildAspectWeightMap($report);

            $aspectScores = $this->calculateAspectScores($report->answers);

            $overallSummary = $this->calculateOverallSummary(
                $aspectScores,
                $aspectWeightMap,
                $report->answers,
                $report->collectibility,
            );

            $this->storeCalculationResults($report, $aspectScores, $overallSummary);

            $this->audit($actor, [
                'action' => 'recalculated',
                'auditable_id' => $report->summary->id,
                'auditable_type' => ReportSummary::class,
                'report_id' => $report->id,
                'meta' => [
                    'total_score' => $overallSummary->totalScore,
                    'classification' => $overallSummary->finalClassification->name,
                ]
            ]);

            if ($overallSummary->finalClassification === Classification::WATCHLIST) {
                $this->createOrAttachWatchlist($report);
            }

            return $report->fresh(['summary', 'aspects']);
        });
    }

    /**
     * Membuat peta sederhana [aspect_version_id => weight] untuk pencarian cepat.
     */
    private function buildAspectWeightMap(Report $report): array
    {
        if (!$report->template || !$report->template->latestTemplateVersion) {
            throw new InvalidArgumentException("Laporan #{$report->id} tidak memiliki template atau versi template yang aktif");
        }

        return $report->template->latestTemplateVersion->aspects
            ->pluck('pivot.weight', 'id')
            ->map(fn ($weight) => $weight ?? 0)
            ->all();
    }

    /**
     * Hitung skor untuk setiap aspek berdasarkan jawaban.
     * Kembalikan koleksi DTO.
     */
    private function calculateAspectScores(Collection $answers): Collection
    {
        $answersByAspect = $answers->groupBy('questionVersion.aspectVersion.id');

        return $answersByAspect->map(function ($aspectAnswers, $aspectVersionId) {
            $totalScore = 0;

            foreach ($aspectAnswers as $answer) {
                $questionWeight = ($answer->questionVersion->weight ?? 0) / 100;
                $optionScore = $answer->questionOption->score ?? 0;
                $totalScore += $questionWeight * $optionScore;
            }

            $totalScore = round($totalScore, 2);

            return new AspectScoreDto(
                aspectVersionId: (int) $aspectVersionId,
                totalScore: $totalScore,
                classification: $this->determineAspectClassification($totalScore)
            );
        });
    }

    /**
     * Tentukan klasifikasi hanya untuk satu aspek (logika terpisah).
     */
    private function determineAspectClassification(float $totalScore): Classification
    {
        return $this->passesScoreRule($totalScore) ? Classification::SAFE : Classification::WATCHLIST;
    }

    /**
     * Hitung skor dan klasifikasi kebutuhan.
     * Mengembalikan sebuah DTO.
     */
    private function calculateOverallSummary(
        Collection $aspectScores,
        array $aspectWeightMap,
        Collection $answers,
        ?string $collectibility,
    ): OverallSummaryDto {
        $totalWeightedScore = 0;

        foreach ($aspectScores as $aspectVersionId => $scoreData) {
            $aspectWeight = $aspectWeightMap[$aspectScores->aspectVersionId] ?? 0;
            $totalWeightedScore += ($scoreData['total_score'] * $aspectWeight / 100);
        }

        $totalScore = round($totalWeightedScore, 2);

        $finalClassification = $this->determineFinalClassification($totalScore, $aspectScores, $answers);

        return new OverallSummaryDto(
            totalScore: $totalScore,
            finalClassification: $finalClassification,
            collectibility: $collectibility,
        );
    }

    /**
     * Simpan hasil kalkulasi dari DTO ke database.
     */
    private function storeCalculationResults(Report $report, Collection $aspectScores, OverallSummaryDto $overallSummary): void
    {
        foreach ($aspectScores as $scoreData) {
            ReportAspect::updateOrCreate(
                ['report_id' => $report->id, 'aspect_version_id' => $scoreData->aspectVersionId],
                [
                    'total_score' => $scoreData->totalScore,
                    'classification' => $scoreData->classification,
                ]
            );
        }

        ReportSummary::updateOrCreate(
            ['report_id' => $report->id],
            [
                'total_score' => $overallSummary->totalScore,
                'final_classification' => $overallSummary->finalClassification,
                'indicative_collectibility' => $overallSummary->collectibility,
            ]
        );
    }

    // --- LOGIKA PENENTUAN KLASIFIKASI (DI-REFAKTOR) ---

    /**
     * Menentukan klasifikasi final berdasarkan semua aturan.
     * Ini adalah perbaikan LOGIKA KRITIS.
     */
    private function determineFinalClassification(float $totalScore, Collection $aspectScores, Collection $answers): Classification
    {
        if ($this->passesScoreRule($totalScore)
            && $this->passesAspectRule($aspectScores) // <-- Gunakan skor BARU
            && $this->passesMandatoryRule($answers)) { // <-- Gunakan jawaban mentah
            return Classification::SAFE;
        }

        return Classification::WATCHLIST;
    }

    private function passesScoreRule(float $totalScore): bool
    {
        return $totalScore >= 80;
    }

    private function passesAspectRule(Collection $aspectScores): bool
    {
        return !$aspectScores->contains(
            fn (AspectScoreDto $aspect) => $aspect->classification === Classification::WATCHLIST
        );
    }

    /**
     * Periksa aturan wajib dari data $answers mentah.
     */
    private function passesMandatoryRule(Collection $answers): bool
    {
        $mandatoryLimit = 1;

        $failedMandatoryCount = $answers
            ->filter(fn($answer) => $answer->questionVersion?->is_mandatory)
            ->filter(fn($answer) => !$answer->questionOption || $answer->questionOption->score < 0)
            ->count();

        return $failedMandatoryCount <= $mandatoryLimit;
    }

    // --- LOGIC SIDE-EFFECT

    /**
     * Buat atau lampirkan Watchlist, dipicu oleh Aktor.
     */
    private function createOrAttachWatchlist(Report $report, ?User $actor = null): Watchlist
    {
        $existing = Watchlist::where('borrower_id', $report->borrower_id)
            ->where('status', WatchlistStatus::ACTIVE)
            ->first();

        if ($existing) {
            return $existing;
        }

        $watchlist = Watchlist::create([
            'borrower_id' => $report->borrower_id,
            'report_id' => $report->id,
            'status' => WatchlistStatus::ACTIVE,
            'added_by' => $actor?->id,
        ]);

        $this->audit($actor, [
            'action' => 'created-from-calculation',
            'auditable_id' => $watchlist->id,
            'auditable_type' => Watchlist::class,
            'report_id' => $report->id,
            'meta' => [
                'report_id' => $report->id,
            ]
        ]);

        return $watchlist;
    }
}