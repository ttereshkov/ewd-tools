<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BorrowerDetail extends Model
{
    use HasFactory;

    protected $fillable = [
        'borrower_id',
        'borrower_group',
        'purpose',
        'economic_sector',
        'business_field',
        'borrower_business',
        'collectibility',
        'restructuring',
    ];

    protected $casts = [
        'restructuring' => 'boolean',
    ];

    public function borrower(): BelongsTo
    {
        return $this->belongsTo(Borrower::class);
    }
}
