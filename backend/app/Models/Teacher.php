<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Teacher extends Model
{
    use HasFactory;

    protected $fillable = [
        'institution_id',
        'name',
        'last_name',
        'specialty',
        'type',
        'max_hours',
        'email',
        'phone',
        'identification',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // ===== RELACIONES =====

    public function institution()
    {
        return $this->belongsTo(Institution::class);
    }

    public function assignments()
    {
        return $this->hasMany(Assignment::class);
    }

    // ===== SCOPES =====

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeSpecialist($query)
    {
        return $query->where('type', 'especialista');
    }

    public function scopeGrado($query)
    {
        return $query->where('type', 'grado');
    }

    // ===== MÉTODOS =====

    public function getFullNameAttribute(): string
    {
        return "{$this->name} {$this->last_name}";
    }

    public function getAssignedHours(): int
    {
        return $this->assignments()->sum('hours');
    }

    public function getRemainingHours(): int
    {
        return $this->max_hours - $this->getAssignedHours();
    }

    public function isOverloaded(): bool
    {
        return $this->getAssignedHours() > $this->max_hours;
    }

    public function getLoadPercentage(): float
    {
        if ($this->max_hours === 0) return 0;
        return ($this->getAssignedHours() / $this->max_hours) * 100;
    }
}
