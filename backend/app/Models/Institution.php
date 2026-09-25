<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Institution extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'code',
        'logo',
        'academic_year',
        'address',
        'phone',
        'email',
        'website',
    ];

    // ===== RELACIONES =====

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function jornadas()
    {
        return $this->hasMany(Jornada::class);
    }

    public function levels()
    {
        return $this->hasMany(Level::class);
    }

    public function subjects()
    {
        return $this->hasMany(Subject::class);
    }

    public function subjectLoads()
    {
        return $this->hasMany(SubjectLoad::class);
    }

    public function teachers()
    {
        return $this->hasMany(Teacher::class);
    }

    public function assignments()
    {
        return $this->hasMany(Assignment::class);
    }

    public function schedules()
    {
        return $this->hasMany(Schedule::class);
    }

    // ===== MÉTODOS =====

    public function getActiveSchedule(): ?Schedule
    {
        return $this->schedules()->where('is_active', true)->latest()->first();
    }

    public function getTotalTeachersAttribute(): int
    {
        return $this->teachers()->count();
    }

    public function getTotalStudentsAttribute(): int
    {
        return $this->levels()->count();
    }
}
