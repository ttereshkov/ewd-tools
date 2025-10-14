<?php

namespace App;

enum WatchlistStatus: int
{
    case ACTIVE = 1;
    case RESOLVED = 2;
    case ARCHIVED = 3;

    public function label(): string
    {
        return ucfirst(strtolower($this->name));
    }
}
