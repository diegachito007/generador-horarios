<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Jornada extends Model
{
    use HasFactory;

    protected $table = 'jornadas';

    protected $fillable = [
        'institution_id',
        'name',
        'start_time',
        'end_time',
        'blocks',
        'block_duration',
    ];

    // ===== RELACIONES =====

    public function institution()
    {
        return $this->belongsTo(Institution::class);
    }

    public function levels()
    {
        return $this->hasMany(Level::class);
    }

    // ===== MÉTODOS =====

    public function getBlockStartTime(int $blockNumber): string
    {
        $startMinutes = strtotime($this->start_time) / 60;
        $blockStart = $startMinutes + ($blockNumber - 1) * $this->block_duration;
        return date('H:i', $blockStart * 60);
    }

    public function getBlockEndTime(int $blockNumber): string
    {
        $startMinutes = strtotime($this->start_time) / 60;
        $blockEnd = $startMinutes + $blockNumber * $this->block_duration;
        return date('H:i', $blockEnd * 60);
    }
}
