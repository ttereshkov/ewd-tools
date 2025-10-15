<?php

namespace App\Enums;

enum Classification: int
{
    case WATCHLIST = 0;
    case SAFE = 1;
    
    public function label(): string
    {
        return strtolower($this->name);
    }
}