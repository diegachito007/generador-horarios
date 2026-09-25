<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SubjectLoad extends Model
{
    use HasFactory;

    protected $fillable = [
        'institution_id',
        'subject_id',
        'level_id',
        'weekly_hours',
    ];

    // ===== RELACIONES =====

    public function institution()
    {
        return $this->belongsTo(Institution::class);
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function level()
    {
        return $this->belongsTo(Level::class);
    }
}
