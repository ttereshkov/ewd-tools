<?php

namespace App;

enum PeriodStatus: string
{
    case DRAFT = 'draft';
    case ACTIVE = 'active';
    case ENDED = 'ended';
    case EXPIRED = 'expired';
    
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    public static function labels(): array
    {
        return [
            self::DRAFT->value => 'Draft',
            self::ACTIVE->value => 'Aktif',
            self::ENDED->value => 'Berakhir',
            self::EXPIRED->value => 'Kadaluwarsa',
        ];
    }
}
