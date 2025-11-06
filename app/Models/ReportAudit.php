<?php

namespace App\Models;

use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
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
        'level' => 'integer',
    ];

    protected $appends = ['readable_message'];

    public function getReadableMessageAttribute(): string
    {
        $actor = $this->user?->name ?? 'Sistem';
        $type = class_basename($this->auditable_type ?? '');
        $typeLabel = match ($type) {
            'Report' => 'Laporan',
            'ReportSummary' => 'Ringkasan Laporan',
            'Approval' => 'Persetujuan',
            'Watchlist' => 'Watchlist',
            'MonitoringNote' => 'Catatan Monitoring',
            default => $type ?: 'Entitas',
        };

        $action = $this->action;

        // Mapping nama level persetujuan
        $levelName = null;
        if ($this->level !== null) {
            try {
                $levelName = match ($this->level) {
                    \App\Enums\ApprovalLevel::ERO->value => 'ERO',
                    \App\Enums\ApprovalLevel::KADEPT_BISNIS->value => 'Kadept Bisnis',
                    \App\Enums\ApprovalLevel::KADIV_ERO->value => 'Kadiv Risk',
                    default => (string)$this->level,
                };
            } catch (\Throwable $e) {
                $levelName = (string)$this->level;
            }
        }

        // Helper untuk memformat perubahan (before -> after)
        $formatChanges = function ($beforeRaw, $afterRaw): string {
            // Normalisasi ke array jika datang sebagai string JSON
            $before = is_array($beforeRaw)
                ? $beforeRaw
                : (is_string($beforeRaw) ? json_decode($beforeRaw, true) : null);
            $after = is_array($afterRaw)
                ? $afterRaw
                : (is_string($afterRaw) ? json_decode($afterRaw, true) : null);

            if (!$after || !is_array($after)) return '';
            $labels = [
                'report_status' => 'status laporan',
                'final_classification' => 'klasifikasi akhir',
                'indicative_collectibility' => 'kolektibilitas indikatif',
                'business_notes' => 'catatan bisnis',
                'reviewer_notes' => 'catatan reviewer',
                'override_reason' => 'alasan override',
                'status' => 'status',
            ];
            $parts = [];
            foreach ($after as $key => $newValue) {
                $oldValue = $before[$key] ?? null;
                $label = $labels[$key] ?? $key;
                $oldStr = is_scalar($oldValue) || $oldValue === null ? (string)$oldValue : json_encode($oldValue);
                $newStr = is_scalar($newValue) || $newValue === null ? (string)$newValue : json_encode($newValue);
                $parts[] = sprintf("%s dari '%s' menjadi '%s'", $label, $oldStr !== '' ? $oldStr : '-', $newStr !== '' ? $newStr : '-');
            }
            return implode('; ', $parts);
        };

        // Siapkan pesan untuk aksi 'updated'
        $changes = '';
        if ($this->before || $this->after) {
            $changes = $formatChanges($this->before, $this->after);
        }
        $updatedMessage = $changes
            ? sprintf('%s memperbarui %s: %s.', $actor, $typeLabel, $changes)
            : sprintf('%s memperbarui %s.', $actor, $typeLabel);

        // Bentuk kalimat readable
        return match ($action) {
            'created' => sprintf('%s membuat %s.', $actor, $typeLabel),
            'updated' => $updatedMessage,
            'deleted' => sprintf('%s menghapus %s.', $actor, $typeLabel),
            'approved' => sprintf('%s menyetujui laporan%s.', $actor, $levelName ? " pada level {$levelName}" : ''),
            'rejected' => sprintf('%s menolak laporan%s.', $actor, $levelName ? " pada level {$levelName}" : ''),
            'recalculated' => sprintf('%s menghitung ulang ringkasan laporan.', $actor),
            'created-from-calculation' => sprintf('%s membuat Watchlist dari hasil kalkulasi.', $actor),
            'fetched' => sprintf('%s membuka data %s.', $actor, $typeLabel),
            'auto_created' => 'Watchlist dibuat otomatis.',
            default => sprintf("%s melakukan aksi '%s' pada %s.", $actor, $action, $typeLabel),
        };
    }

    public function auditable(): MorphTo
    {
        return $this->morphTo();
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function report(): BelongsTo
    {
        return $this->belongsTo(Report::class);
    }
}
