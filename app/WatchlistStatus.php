<?php

namespace App;

enum WatchlistStatus: string
{
    case ACTIVE = 'active';
    case RESOLVED = 'resolved';
    case ARCHIVED = 'archived';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    public static function labels(): array
    {
        return [
            self::ACTIVE->value => 'Aktif',
            self::RESOLVED->value => 'Diselesaikan',
            self::ARCHIVED->value => 'Diarsipkan',
        ];
    }
}
