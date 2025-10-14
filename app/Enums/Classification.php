<?php

namespace App\Enums;

enum Classification: int
{
    case SAFE = 1;
    case WATCHLIST = 2;
    
    public function label(): string
    {
        return ucfirst(strtolower($this->name));
    }
}
