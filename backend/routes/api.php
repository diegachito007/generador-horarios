<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\SuperAdminController;
use App\Http\Controllers\Api\InstitutionController;
use App\Http\Controllers\AuthController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Rutas del API para el Generador Inteligente de Horarios Educativos
|
*/

// ===== AUTENTICACIÓN =====
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/register', [AuthController::class, 'register']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    // ===== RUTAS SUPER ADMIN =====
    Route::middleware('role:superadmin')->prefix('admin')->group(function () {
        Route::get('/dashboard', [SuperAdminController::class, 'dashboard']);
        Route::get('/clients', [SuperAdminController::class, 'clients']);
        Route::get('/institutions', [SuperAdminController::class, 'allInstitutions']);
        Route::get('/licenses', [SuperAdminController::class, 'allLicenses']);
        
        Route::post('/licenses', [SuperAdminController::class, 'createLicense']);
        Route::post('/licenses/{licenseId}/assign/{userId}', [SuperAdminController::class, 'assignLicense']);
        Route::post('/licenses/{licenseId}/suspend', [SuperAdminController::class, 'suspendLicense']);
        Route::post('/licenses/{licenseId}/activate', [SuperAdminController::class, 'activateLicense']);
    });

    // ===== RUTAS DE USUARIO (COMPRADOR) =====
    Route::prefix('institutions')->group(function () {
        Route::get('/', [InstitutionController::class, 'index']);
        Route::post('/', [InstitutionController::class, 'store']);
        Route::get('/{institution}', [InstitutionController::class, 'show']);
        Route::delete('/{institution}', [InstitutionController::class, 'destroy']);

        // Niveles
        Route::get('/{institution}/levels', [InstitutionController::class, 'levels']);
        Route::post('/{institution}/levels', [InstitutionController::class, 'storeLevel']);
        Route::delete('/{institution}/levels/{level}', [InstitutionController::class, 'destroyLevel']);

        // Jornadas
        Route::get('/{institution}/jornadas', [InstitutionController::class, 'jornadas']);
        Route::post('/{institution}/jornadas', [InstitutionController::class, 'storeJornada']);

        // Materias
        Route::get('/{institution}/subjects', [InstitutionController::class, 'subjects']);
        Route::post('/{institution}/subjects', [InstitutionController::class, 'storeSubject']);

        // Cargas horarias
        Route::get('/{institution}/subject-loads', [InstitutionController::class, 'subjectLoads']);
        Route::post('/{institution}/subject-loads', [InstitutionController::class, 'storeSubjectLoad']);

        // Docentes
        Route::get('/{institution}/teachers', [InstitutionController::class, 'teachers']);
        Route::post('/{institution}/teachers', [InstitutionController::class, 'storeTeacher']);

        // Asignaciones
        Route::get('/{institution}/assignments', [InstitutionController::class, 'assignments']);
        Route::post('/{institution}/assignments', [InstitutionController::class, 'storeAssignment']);

        // Horarios
        Route::get('/{institution}/schedules', [InstitutionController::class, 'schedules']);
        Route::get('/{institution}/schedules/{schedule}', [InstitutionController::class, 'showSchedule']);
        Route::post('/{institution}/schedules/generate', [InstitutionController::class, 'generateSchedule']);
        Route::post('/{institution}/schedules/{schedule}/validate', [InstitutionController::class, 'validateSchedule']);

        // Reportes
        Route::get('/{institution}/reports/course/{levelId}', [InstitutionController::class, 'reportByCourse']);
        Route::get('/{institution}/reports/teacher/{teacherId}', [InstitutionController::class, 'reportByTeacher']);
    });
});
