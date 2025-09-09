<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class TemplateVersion extends Model
{
    use HasFactory;

    protected $fillable = [
        'template_id',
        'name',
        'version_number',
        'description',
    ];

    public function template(): BelongsTo
    {
        return $this->belongsTo(Template::class);
    }

    public function aspects(): BelongsToMany
    {
        return $this->belongsToMany(Aspect::class)->withPivot('weight');
    }

    public function visibilityRules(): MorphMany
    {
        return $this->morphMany(VisibilityRule::class, 'entity');
    }
}
