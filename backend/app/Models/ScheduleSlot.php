<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ScheduleSlot extends Model
{
    use HasFactory;

    protected $fillable = [
        'schedule_id',
        'institution_id',
        'level_id',
        'day_of_week',
        'block_number',
        'teacher_id',
        'subject_id',
    ];

    // ===== RELACIONES =====

    public function schedule()
    {
        return $this->belongsTo(Schedule::class);
    }

    public function institution()
    {
        return $this->belongsTo(Institution::class);
    }

    public function level()
    {
        return $this->belongsTo(Level::class);
    }

    public function teacher()
    {
        return $this->belongsTo(Teacher::class);
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    // ===== MÉTODOS =====

    public function getDayName(): string
    {
        return match($this->day_of_week) {
            1 => 'Lunes',
            2 => 'Martes',
            3 => 'Miércoles',
            4 => 'Jueves',
            5 => 'Viernes',
            default => 'Desconocido',
        };
    }
}
