<?php

namespace App;

enum Classification: string
{
    case SAFE = 'safe';
    case WATCHLIST = 'watchlist';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    public static function labels(): array
    {
        return [
            self::SAFE->value       => 'Safe',
            self::WATCHLIST->value  => 'Watchlist'
        ];
    }
}
