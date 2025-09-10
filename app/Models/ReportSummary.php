<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReportSummary extends Model
{
    use HasFactory;

    protected $fillable = [
        'report_id',
        'final_classification',
        'indicative_collectibility',
        'is_override',
        'override_reason',
        'business_notes',
        'reviewer_notes',
    ];

    protected $casts = [
        'is_override' => 'boolean',
        'indicative_collectibility' => 'integer',
    ];

    public function report(): BelongsTo
    {
        return $this->belongsTo(Report::class);
    }
}
