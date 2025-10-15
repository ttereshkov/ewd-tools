<?php

namespace App\Enums;

use App\Traits\HasEnumHelpers;

enum ReportStatus: int
{
    use HasEnumHelpers;

    case SUBMITTED = 1;
    case APPROVED = 2;
    case REJECTED = 3;
    case DONE = 4;

    public function label(): string
    {
        return match($this) {
            self::SUBMITTED => 'Submitted',
            self::APPROVED => 'Approved',
            self::REJECTED => 'Rejected',
            self::DONE => 'Done',
        };
    }
}
