<?php

namespace App\Enums;

enum ActionItemStatus: int
{
    case PENDING = 0;
    case IN_PROGRESS = 1;
    case COMPLETED = 2;
    case OVERDUE = 3;

    public function label(): string
    {
        return str_replace('_', ' ', (ucwords(strtolower($this->name))));
    }
}
