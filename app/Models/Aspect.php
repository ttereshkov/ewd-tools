<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Aspect extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
    ];

    public function aspectVersions(): HasMany
    {
        return $this->hasMany(AspectVersion::class);
    }

    public function latestAspectVersion(): HasOne
    {
        return $this->hasOne(AspectVersion::class)->latestOfMany();
    }
}
