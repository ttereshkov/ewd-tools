<?php

namespace App\Models;

use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class ReportAudit extends Model
{
    use HasFactory, Auditable;

    protected $fillable = [
        'auditable_id',
        'auditable_type',
        'report_id',
        'user_id',
        'action',
        'level',
        'approval_id',
        'before',
        'after',
        'source',
    ];

    protected $casts = [
        'before' => 'array',
        'after' => 'array',
    ];

    public function auditable(): MorphTo
    {
        return $this->morphTo();
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function report()
    {
        return $this->belongsTo(Report::class);
    }
}
