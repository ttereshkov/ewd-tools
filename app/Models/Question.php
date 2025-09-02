<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Question extends Model
{
    public function questionVersions(): HasMany
    {
        return $this->hasMany(QuestionVersion::class);
    }
}
