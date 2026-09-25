<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ValidationError extends Model
{
    use HasFactory;

    protected $table = 'validation_errors';

    protected $fillable = [
        'schedule_id',
        'error_type',
        'message',
        'details',
    ];

    // ===== RELACIONES =====

    public function schedule()
    {
        return $this->belongsTo(Schedule::class);
    }

    // ===== MÉTODOS =====

    public function getTypeLabel(): string
    {
        return match($this->error_type) {
            'teacher_conflict' => 'Cruce de Docente',
            'course_conflict' => 'Cruce de Curso',
            'missing_hours' => 'Horas Incompletas',
            'overload' => 'Sobrecarga Docente',
            'bad_distribution' => 'Mala Distribución',
            'wrong_block' => 'Bloque Incorrecto',
            default => 'Error Desconocido',
        };
    }
}
