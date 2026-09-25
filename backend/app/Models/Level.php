<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Level extends Model
{
    use HasFactory;

    protected $fillable = [
        'institution_id',
        'jornada_id',
        'name',
        'level',
        'modality',
        'specialty',
        'parallel',
        'section',
        'sort_order',
    ];

    // ===== RELACIONES =====

    public function institution()
    {
        return $this->belongsTo(Institution::class);
    }

    public function jornada()
    {
        return $this->belongsTo(Jornada::class);
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

    public function scopeEGB($query)
    {
        return $query->where('level', 'egb');
    }

    public function scopeBachillerato($query)
    {
        return $query->where('level', 'bachillerato');
    }

    public function scopeCiencias($query)
    {
        return $query->where('modality', 'ciencias');
    }

    public function scopeTecnico($query)
    {
        return $query->where('modality', 'tecnico');
    }

    // ===== MÉTODOS =====

    public function getFullNameAttribute(): string
    {
        $name = "{$this->name} {$this->parallel}";
        if ($this->specialty) {
            $name .= " - {$this->specialty}";
        }
        return trim($name);
    }

    public function isEGB(): bool
    {
        return $this->level === 'egb';
    }

    public function isBachillerato(): bool
    {
        return $this->level === 'bachillerato';
    }

    public function getJornadaBlocks(): int
    {
        return $this->jornada ? $this->jornada->blocks : 6;
    }
}
