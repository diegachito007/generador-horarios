<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Login de usuario
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Las credenciales proporcionadas son incorrectas.'],
            ]);
        }

        // Verificar licencia si no es superadmin
        if ($user->role !== 'superadmin') {
            if (!$user->license) {
                return response()->json([
                    'message' => 'No tiene una licencia asignada. Contacte al administrador.',
                ], 403);
            }

            if ($user->license->status !== 'active') {
                return response()->json([
                    'message' => 'Su licencia está ' . $user->license->status . '. Contacte al administrador.',
                ], 403);
            }
        }

        // Crear token
        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'license' => $user->license ? [
                    'id' => $user->license->id,
                    'type' => $user->license->type,
                    'type_name' => $user->license->type_name,
                    'max_institutions' => $user->license->max_institutions,
                    'status' => $user->license->status,
                ] : null,
            ],
            'token' => $token,
        ]);
    }

    /**
     * Registro de usuario
     */
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:6|confirmed',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'user',
        ]);

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
            'token' => $token,
            'message' => 'Usuario registrado exitosamente. Solicite una licencia al administrador.',
        ], 201);
    }

    /**
     * Logout
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Sesión cerrada']);
    }

    /**
     * Obtener usuario actual
     */
    public function me(Request $request)
    {
        $user = $request->user()->load('license');

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'license' => $user->license ? [
                'id' => $user->license->id,
                'type' => $user->license->type,
                'type_name' => $user->license->type_name,
                'max_institutions' => $user->license->max_institutions,
                'status' => $user->license->status,
            ] : null,
            'institutions_count' => $user->institutions()->count(),
        ]);
    }
}
