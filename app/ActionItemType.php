<?php

namespace App;

enum ActionItemType: string
{
    case PREVIOUS_PERIOD = 'previous_period';
    case CURRENT_PROGRESS = 'current_progress';
    case NEXT_PERIOD = 'next_period';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    public static function labels(): array
    {
        return [
            self::PREVIOUS_PERIOD->value => 'Periode Sebelumnya',
            self::CURRENT_PROGRESS->value => 'Progress Saat Ini',
            self::NEXT_PERIOD->value => 'Periode Berikutnya'
        ];
    }
}
