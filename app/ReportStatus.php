<?php

namespace App;

enum ReportStatus: string
{
    case SUBMITTED = 'submitted';
    case APPROVED = 'approved';
    case REJECTED = 'rejected';
    case DONE = 'done';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    public static function labels(): array
    {
        return [
            self::SUBMITTED->value => 'Submitted',
            self::APPROVED->value => 'Disetujui',
            self::REJECTED->value => 'Ditolak',
            self::DONE->value => 'Selesai'
        ];
    }
}
