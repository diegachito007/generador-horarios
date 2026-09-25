<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\License;
use App\Models\User;
use App\Models\Institution;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class SuperAdminController extends Controller
{
    /**
     * Dashboard del Super Administrador
     */
    public function dashboard()
    {
        return response()->json([
            'total_clients' => User::where('role', 'user')->count(),
            'active_licenses' => License::active()->count(),
            'expired_licenses' => License::expired()->count(),
            'suspended_licenses' => License::suspended()->count(),
            'total_institutions' => Institution::count(),
            'total_teachers' => \App\Models\Teacher::count(),
            'total_subjects' => \App\Models\Subject::count(),
            'revenue' => License::sum('price'),
        ]);
    }

    /**
     * Listar todos los clientes
     */
    public function clients()
    {
        $clients = User::where('role', 'user')
            ->with('license')
            ->withCount('institutions')
            ->get()
            ->map(function($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'license' => $user->license ? [
                        'id' => $user->license->id,
                        'type' => $user->license->type,
                        'type_name' => $user->license->type_name,
                        'status' => $user->license->status,
                        'max_institutions' => $user->license->max_institutions,
                    ] : null,
                    'institutions_count' => $user->institutions_count,
                    'created_at' => $user->created_at,
                ];
            });

        return response()->json($clients);
    }

    /**
     * Crear una nueva licencia
     */
    public function createLicense(Request $request)
    {
        $validated = $request->validate([
            'type' => ['required', Rule::in(['basic', 'professional', 'consultant'])],
            'notes' => 'nullable|string',
        ]);

        $config = config('licenses.types')[$validated['type']];

        $license = License::create([
            'type' => $validated['type'],
            'license_key' => 'LIC-' . strtoupper($validated['type']) . '-' . strtoupper(\Illuminate\Support\Str::random(8)),
            'max_institutions' => $config['max_institutions'],
            'status' => 'active',
            'price' => $config['price'],
            'is_lifetime' => $config['is_lifetime'],
            'purchase_date' => now(),
            'expiry_date' => $config['is_lifetime'] ? null : now()->addYear(),
            'notes' => $validated['notes'] ?? null,
        ]);

        return response()->json($license, 201);
    }

    /**
     * Asignar licencia a un usuario
     */
    public function assignLicense(Request $request, int $userId)
    {
        $validated = $request->validate([
            'license_id' => 'required|exists:licenses,id',
        ]);

        $user = User::findOrFail($userId);
        $user->update(['license_id' => $validated['license_id']]);

        return response()->json(['message' => 'Licencia asignada correctamente', 'user' => $user->fresh()]);
    }

    /**
     * Suspender licencia
     */
    public function suspendLicense(int $licenseId)
    {
        $license = License::findOrFail($licenseId);
        $license->suspend();

        return response()->json(['message' => 'Licencia suspendida', 'license' => $license]);
    }

    /**
     * Activar licencia
     */
    public function activateLicense(int $licenseId)
    {
        $license = License::findOrFail($licenseId);
        $license->activate();

        return response()->json(['message' => 'Licencia activada', 'license' => $license]);
    }

    /**
     * Listar todas las instituciones
     */
    public function allInstitutions()
    {
        $institutions = Institution::with('user:id,name,email')
            ->withCount(['levels', 'teachers', 'schedules'])
            ->get();

        return response()->json($institutions);
    }

    /**
     * Listar todas las licencias
     */
    public function allLicenses()
    {
        $licenses = License::withCount('users')
            ->orderByDesc('created_at')
            ->get();

        return response()->json($licenses);
    }
}
