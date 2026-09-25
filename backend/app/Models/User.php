<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'license_id',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    // ===== RELACIONES =====

    public function license()
    {
        return $this->belongsTo(License::class);
    }

    public function institutions()
    {
        return $this->hasMany(Institution::class);
    }

    // ===== SCOPES =====

    public function scopeSuperAdmin($query)
    {
        return $query->where('role', 'superadmin');
    }

    public function scopeRegularUsers($query)
    {
        return $query->where('role', 'user');
    }

    // ===== MÉTODOS =====

    public function isSuperAdmin(): bool
    {
        return $this->role === 'superadmin';
    }

    public function hasActiveLicense(): bool
    {
        return $this->license && $this->license->status === 'active';
    }

    public function institutionsCount(): int
    {
        return $this->institutions()->count();
    }

    public function canCreateInstitution(): bool
    {
        if (!$this->hasActiveLicense()) return false;
        return $this->institutionsCount() < $this->license->max_institutions;
    }
}
