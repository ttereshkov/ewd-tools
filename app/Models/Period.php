<?php

namespace App\Models;

use App\PeriodStatus;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use PHPUnit\Logging\OpenTestReporting\Status;

class Period extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'start_date',
        'end_date',
        'created_by',
        'status'
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'status' => PeriodStatus::class
    ];

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * OTHER FUNCTIONS
     */
    public static function getAllPeriods()
    {
        return static::with('createdBy')->orderBy('start_date', 'desc')->get();
    }

    public static function getPeriodById(int $id): Period
    {
        return static::findOrFail($id);
    }

    public function createPeriod(array $data): Period
    {
        $startDate = $this->combineDateTime($data['start_date'], $data['start_time'] ?? '00:00');
        $endDate = isset($data['end_date']) ? $this->combineDateTime($data['end_date'], $data['end_time'] ?? '23:59') : null;

        $this->fill([
            'name' => $data['name'],
            'start_date' => $startDate,
            'end_date' => $endDate,
            'created_by' => auth()->id(),
            'status' => PeriodStatus::from($data['status']),
        ])->save();

        return $this;
    }

    public function updatePeriod(array $data): Period
    {
        if (isset($data['status']) && PeriodStatus::from($data['status']) !== $this->status) {
            $newStatus = PeriodStatus::from($data['status']);

            match ($newStatus) {
                PeriodStatus::ACTIVE => $this->markAsActive(),
                PeriodStatus::DRAFT => $this->markAsDraft(),
                PeriodStatus::ENDED => $this->markAsEnded(),
                PeriodStatus::EXPIRED => $this->markAsExpired(),
            };
        }

        $updateData = $data;
        unset($updateData['status']);

         if (isset($updateData['start_date'])) {
            $updateData['start_date'] = $this->combineDateTime($updateData['start_date'], $updateData['start_time'] ?? '00:00');
        }
        if (isset($updateData['end_date'])) {
            $updateData['end_date'] = $this->combineDateTime($updateData['end_date'], $updateData['end_time'] ?? '23:59');
        }

        unset($updateData['start_time']);
        unset($updateData['end_time']);

        if (!empty($updateData)) {
            $this->update($updateData);
        }

        return $this->fresh();
    }

    public function deletePeriod(): void
    {
        $this->delete();
    }

    public function markAsActive(): void
    {
        $activePeriodExists = static::where('status', PeriodStatus::ACTIVE)
                                    ->where('id', '!=', $this->id)
                                    ->exists();

        if ($activePeriodExists) {
            throw ValidationException::withMessages([
                'error' => 'Tidak bisa memulai periode baru. Harap selesaikan periode yang sedang aktif terlebih dahulu.',
            ]);
        }

        $this->status = PeriodStatus::ACTIVE;
        $this->save();

        Cache::forget('active_period');
    }

    public function markAsDraft(): void
    {
        $this->status = PeriodStatus::DRAFT;
        $this->save();
    }

    public function markAsEnded(): void
    {
        $this->status = PeriodStatus::ENDED;
        $this->end_date = now();
        $this->save();
    }

    public function markAsExpired(): void
    {
        $this->status = PeriodStatus::EXPIRED;
        $this->save();
    }

    public function isActive(): bool
    {
        return $this->status === PeriodStatus::ACTIVE;
    }

    public function isExpired(): bool
    {
        return $this->end_date && now()->gt($this->end_date) && $this->status === PeriodStatus::ACTIVE;
    }

    public function getRemainingTime(): ?string
    {
        if (!$this->end_date) {
            return null;
        }

        $diff = now()->diff($this->end_date);

        return $diff->format('%a hari, %h jam, %i menit');
    }

    public function extendPeriod(string $newEndDate): Period
    {
        $this->end_date = Carbon::parse($newEndDate);
        $this->save();

        return $this;
    }

    public static function checkAndMarkExpiredPeriods(): int
    {
        $expiredPeriods = static::where('status', PeriodStatus::ACTIVE)
            ->where('end_date', '<', now())
            ->get();

        $count = 0;
        foreach ($expiredPeriods as $period) {
            $period->markAsExpired();
            $count++;
            Log::info("Period '{$period->name}' (ID: {$period->id}) automatically marked as expired");
        }

        return $count;
    }

    public static function combineDateTime(string $date, string $time): Carbon
    {
        return Carbon::parse("{$date} {$time}");
    }

    public static function getActivePeriod()
    {
        return static::where('status', PeriodStatus::ACTIVE)
            ->where('start_date', '<=', now())
            ->where('end_date', '>=', now())
            ->first();
    }
}
