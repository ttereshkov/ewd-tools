<?php

namespace App;

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

    public static function options(): array
    {
        return array_column(self::cases(), 'label', 'value');
    }
}