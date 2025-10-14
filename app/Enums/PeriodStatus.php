<?php

namespace App\Enums;

enum PeriodStatus: int
{
    case DRAFT = 0;
    case ACTIVE = 1;
    case ENDED = 2;
    case EXPIRED = 3;

    public function label(): string
    {
        return ucfirst(strtolower($this->name));
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    public static function options(): array
    {
        return collect(self::cases())->map(fn ($case) => [
            'value' => $case->value,
            'label' => strtolower($case->name),
        ])->all();
    }
}