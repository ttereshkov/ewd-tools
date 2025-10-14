<?php

namespace App\Enums;

enum FacilityType: int
{
    case KIE = 1;
    case KMKE = 2;
    case BOTH = 3;

    public function label(): string
    {
        return match ($this) {
            self::KIE => 'KIE',
            self::KMKE => 'KMKE',
            self::BOTH => 'KIE & KMKE',
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    public static function options(): array
    {
        return collect(self::cases())->map(fn($case) => [
            'value' => $case->value,
            'label' => $case->label(),
        ])->all();
    }
}
