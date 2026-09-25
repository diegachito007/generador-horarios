<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subject extends Model
{
    use HasFactory;

    protected $fillable = [
        'institution_id',
        'name',
        'code',
        'priority',
        'is_specialist',
        'color',
        'description',
    ];

    protected $casts = [
        'is_specialist' => 'boolean',
    ];

    // ===== RELACIONES =====

    public function institution()
    {
        return $this->belongsTo(Institution::class);
    }

    public function subjectLoads()
    {
        return $this->hasMany(SubjectLoad::class);
    }

    public function assignments()
    {
        return $this->hasMany(Assignment::class);
    }

    // ===== SCOPES =====

    public function scopeHighPriority($query)
    {
        return $query->where('priority', '>=', 8);
    }

    public function scopeSpecialist($query)
    {
        return $query->where('is_specialist', true);
    }

    public function scopeByPriority($query)
    {
        return $query->orderByDesc('priority');
    }

    // ===== MÉTODOS =====

    public function isHighPriority(): bool
    {
        return $this->priority >= 8;
    }

    public function getPriorityLabel(): string
    {
        return match(true) {
            $this->priority >= 9 => 'Muy Alta',
            $this->priority >= 7 => 'Alta',
            $this->priority >= 5 => 'Media',
            $this->priority >= 3 => 'Baja',
            default => 'Muy Baja',
        };
    }
}
