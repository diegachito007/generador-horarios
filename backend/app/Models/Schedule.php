<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Schedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'institution_id',
        'name',
        'score',
        'is_valid',
        'is_active',
        'generated_at',
    ];

    protected $casts = [
        'is_valid' => 'boolean',
        'is_active' => 'boolean',
        'generated_at' => 'datetime',
    ];

    // ===== RELACIONES =====

    public function institution()
    {
        return $this->belongsTo(Institution::class);
    }

    public function slots()
    {
        return $this->hasMany(ScheduleSlot::class);
    }

    public function validationErrors()
    {
        return $this->hasMany(ValidationError::class);
    }

    // ===== SCOPES =====

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeValid($query)
    {
        return $query->where('is_valid', true);
    }

    // ===== MÉTODOS =====

    public function activate(): void
    {
        // Desactivar otros horarios de la misma institución
        Schedule::where('institution_id', $this->institution_id)
            ->where('id', '!=', $this->id)
            ->update(['is_active' => false]);

        $this->update(['is_active' => true]);
    }

    public function deactivate(): void
    {
        $this->update(['is_active' => false]);
    }

    public function getSlotsByLevel(int $levelId): \Illuminate\Database\Eloquent\Collection
    {
        return $this->slots()->where('level_id', $levelId)->get();
    }

    public function getSlotsByTeacher(int $teacherId): \Illuminate\Database\Eloquent\Collection
    {
        return $this->slots()->where('teacher_id', $teacherId)->get();
    }

    public function getSlotsByDay(int $dayOfWeek): \Illuminate\Database\Eloquent\Collection
    {
        return $this->slots()->where('day_of_week', $dayOfWeek)->get();
    }
}
