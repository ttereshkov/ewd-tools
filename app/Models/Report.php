<?php

namespace App\Models;

use App\ReportStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Report extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'borrower_id',
        'period_id',
        'template_id',
        'status',
        'submitted_at',
        'rejection_reason',
        'created_by',
    ];

    protected $casts = [
        'status' => ReportStatus::class,
        'submitted_at' => 'datetime',
    ];

    public function borrower(): BelongsTo
    {
        return $this->belongsTo(Borrower::class);
    }

    public function facilities(): HasMany
    {
        return $this->hasMany(BorrowerFacility::class);
    }

    public function period(): BelongsTo
    {
        return $this->belongsTo(Period::class);
    }

    public function template(): BelongsTo
    {
        return $this->belongsTo(Template::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function answers(): HasMany
    {
        return $this->hasMany(Answer::class);
    }

     public function summary(): HasOne
    {
        return $this->hasOne(ReportSummary::class);
    }

    public function aspects(): HasMany
    {
        return $this->hasMany(ReportAspect::class);
    }

    public function calculateAndStoreSummary()
    {
        $this->loadMissing([
            'borrower.detail',
            'template.latestTemplateVersion.aspectVersions',
            'answers.questionVersion.aspectVersion',
            'answers.questionOption'
        ]);

        $aspectScores = $this->calculateAspectScores();
        $overallSummary = $this->calculateOverallSummary($aspectScores);
        $this->storeCalculationResults((array) $aspectScores, (array) $overallSummary);
    }

    private function calculateAspectScores() 
    {
        $aspectScores = [];

        $answerByAspect = $this->answers->groupBy('questionVersion.aspectVersion.aspect.id');
        
        foreach ($answerByAspect as $aspectVersionId => $answers) {
            $totalScore = 0;
            
            foreach ($answers as $answer) {
                $questionWeight = ($answer->questionVersion->weight) / 100;
                $optionScore = $answer->questionOption->score ?? 0;
                
                $totalScore += $questionWeight * $optionScore;
            }

            $aspectScores[$aspectVersionId] = [
                'total_score' => $totalScore
            ];
        }

        return $aspectScores;
    }

    /** 
     * Menghitung summary dengan menggabungkan skor aspek yang sudah dihitung dengan bobot.
     * 
     * @param array $aspectScores
     * @return float
     */
    private function calculateOverallSummary(array $aspectScores): array
    {
        $totalWeightedScore = 0;

        foreach ($aspectScores as $aspectVersionId => $scoreData) {
            $aspectWeight = $this->getAspectWeightFromTemplate($aspectVersionId);
            $totalWeightedScore += ($scoreData['total_score'] * $aspectWeight / 100);
        }

        return [
            'total_score' => round($totalWeightedScore, 2),
            'final_classification' => $this->determineClassification($totalWeightedScore),
            'collectibility' => $this->borrower->detail->collectibility,
        ];
    }

    private function storeCalculationResults(array $aspectScores, array $overallSummary)
    {
        foreach ($aspectScores as $aspectVersionId => $scoreData) {
            ReportAspect::updateOrCreate(
                ['report_id' => $this->id, 'aspect_version_id' => $aspectVersionId],
                ['total_score' => $scoreData['total_score']]
            );
        }

        ReportSummary::updateOrCreate(
            ['report_id' => $this->id],
            [
                'total_score' => $overallSummary['total_score'],
                'final_classification' => $overallSummary['final_classification'],
                'indicative_collectibility' => $overallSummary['collectibility'],
            ]
        );
    }

    /**
     * Helper untuk mendapatkan bobot aspek dari relasi pivot template.
     * 
     * @param int $aspectVersionId
     * @return int
     */
    private function getAspectWeightFromTemplate(int $aspectVersionId)
    {
        $aspectVersionPivot = $this->template->latestTemplateVersion->aspectVersions->where('id', $aspectVersionId)->first();
        return $aspectVersionPivot ? $aspectVersionPivot->pivot->weight : 0;
    }

    /**
     * Menentukan klasifikasi akhir berdasarkan total skor.
     * 
     * @param float $totalScore
     * @return string
     */
    private function determineClassification(float $totalScore)
    {
        return ($totalScore >= 80) ? 'safe' : 'watchlist';
    }
}
