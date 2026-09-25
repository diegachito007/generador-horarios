<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class License extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'license_key',
        'max_institutions',
        'status',
        'price',
        'is_lifetime',
        'purchase_date',
        'expiry_date',
        'notes',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'is_lifetime' => 'boolean',
        'purchase_date' => 'date',
        'expiry_date' => 'date',
    ];

    // ===== RELACIONES =====

    public function users()
    {
        return $this->hasMany(User::class);
    }

    // ===== SCOPES =====

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeExpired($query)
    {
        return $query->where('status', 'expired');
    }

    public function scopeSuspended($query)
    {
        return $query->where('status', 'suspended');
    }

    // ===== MÉTODOS =====

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function isExpired(): bool
    {
        if ($this->is_lifetime) return false;
        return $this->expiry_date && $this->expiry_date->isPast();
    }

    public function getTypeNameAttribute(): string
    {
        return match($this->type) {
            'basic' => 'Básica',
            'professional' => 'Profesional',
            'consultant' => 'Consultor',
            default => 'Desconocida',
        };
    }

    public function suspend(): void
    {
        $this->update(['status' => 'suspended']);
    }

    public function activate(): void
    {
        $this->update(['status' => 'active']);
    }

    public function checkExpiry(): void
    {
        if (!$this->is_lifetime && $this->isExpired() && $this->status === 'active') {
            $this->update(['status' => 'expired']);
        }
    }
}
