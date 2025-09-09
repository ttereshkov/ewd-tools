<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class AspectVersion extends Model
{
    use HasFactory;

    protected $fillable = [
        'aspect_id',
        'version_number',
        'name',
        'description',
    ];
    
    public function aspect(): BelongsTo
    {
        return $this->belongsTo(Aspect::class);
    }

    public function aspectTemplates(): BelongsToMany
    {
        return $this->belongsToMany(TemplateVersion::class, 'aspect_template_versions')
                    ->withPivot('weight')
                    ->withTimestamps();
    }

    public function questionVersions(): HasMany
    {
        return $this->hasMany(QuestionVersion::class);
    }

    public function visibilityRules(): MorphMany
    {
        return $this->morphMany(VisibilityRule::class, 'entity');
    }
}
