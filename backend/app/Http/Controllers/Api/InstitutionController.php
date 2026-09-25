<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Institution;
use App\Models\Level;
use App\Models\Jornada;
use App\Models\Subject;
use App\Models\SubjectLoad;
use App\Models\Teacher;
use App\Models\Assignment;
use App\Models\Schedule;
use App\Models\ScheduleSlot;
use App\Services\ScheduleGeneratorService;
use Illuminate\Http\Request;

class InstitutionController extends Controller
{
    /**
     * Listar instituciones del usuario autenticado
     */
    public function index(Request $request)
    {
        $institutions = Institution::where('user_id', $request->user()->id)
            ->withCount(['levels', 'teachers', 'subjects', 'schedules'])
            ->get();

        return response()->json($institutions);
    }

    /**
     * Crear nueva institución
     */
    public function store(Request $request)
    {
        $user = $request->user();

        if (!$user->canCreateInstitution()) {
            return response()->json([
                'message' => 'No puede crear más instituciones. Límite de licencia alcanzado.',
            ], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50',
            'academic_year' => 'required|string|max:50',
            'address' => 'nullable|string',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email',
        ]);

        $institution = Institution::create([
            'user_id' => $user->id,
            ...$validated,
        ]);

        return response()->json($institution, 201);
    }

    /**
     * Mostrar detalle de institución
     */
    public function show(Request $request, Institution $institution)
    {
        $this->authorizeInstitution($request, $institution);

        $institution->loadCount(['levels', 'teachers', 'subjects', 'schedules', 'assignments']);

        return response()->json($institution);
    }

    /**
     * Eliminar institución
     */
    public function destroy(Request $request, Institution $institution)
    {
        $this->authorizeInstitution($request, $institution);
        $institution->delete();

        return response()->json(['message' => 'Institución eliminada']);
    }

    // ===== NIVELES =====

    public function levels(Request $request, Institution $institution)
    {
        $this->authorizeInstitution($request, $institution);
        return response()->json($institution->levels()->orderBy('sort_order')->get());
    }

    public function storeLevel(Request $request, Institution $institution)
    {
        $this->authorizeInstitution($request, $institution);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'level' => 'required|in:egb,bachillerato',
            'modality' => 'nullable|in:ciencias,tecnico',
            'specialty' => 'nullable|string|max:255',
            'parallel' => 'required|string|max:10',
            'jornada_id' => 'nullable|exists:jornadas,id',
            'sort_order' => 'nullable|integer',
        ]);

        $level = $institution->levels()->create($validated);
        return response()->json($level, 201);
    }

    public function destroyLevel(Request $request, Institution $institution, Level $level)
    {
        $this->authorizeInstitution($request, $institution);
        $level->delete();
        return response()->json(['message' => 'Nivel eliminado']);
    }

    // ===== JORNADAS =====

    public function jornadas(Request $request, Institution $institution)
    {
        $this->authorizeInstitution($request, $institution);
        return response()->json($institution->jornadas);
    }

    public function storeJornada(Request $request, Institution $institution)
    {
        $this->authorizeInstitution($request, $institution);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i',
            'blocks' => 'required|integer|min:1|max:10',
            'block_duration' => 'required|integer|min:15|max:90',
        ]);

        $jornada = $institution->jornadas()->create($validated);
        return response()->json($jornada, 201);
    }

    // ===== MATERIAS =====

    public function subjects(Request $request, Institution $institution)
    {
        $this->authorizeInstitution($request, $institution);
        return response()->json($institution->subjects()->orderByDesc('priority')->get());
    }

    public function storeSubject(Request $request, Institution $institution)
    {
        $this->authorizeInstitution($request, $institution);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'priority' => 'required|integer|min:1|max:10',
            'is_specialist' => 'boolean',
            'color' => 'required|string|max:7',
        ]);

        $subject = $institution->subjects()->create($validated);
        return response()->json($subject, 201);
    }

    // ===== CARGA HORARIA =====

    public function subjectLoads(Request $request, Institution $institution)
    {
        $this->authorizeInstitution($request, $institution);
        return response()->json($institution->subjectLoads()->with(['subject', 'level'])->get());
    }

    public function storeSubjectLoad(Request $request, Institution $institution)
    {
        $this->authorizeInstitution($request, $institution);

        $validated = $request->validate([
            'subject_id' => 'required|exists:subjects,id',
            'level_id' => 'required|exists:levels,id',
            'weekly_hours' => 'required|integer|min:1|max:10',
        ]);

        $load = $institution->subjectLoads()->create($validated);
        return response()->json($load->load(['subject', 'level']), 201);
    }

    // ===== DOCENTES =====

    public function teachers(Request $request, Institution $institution)
    {
        $this->authorizeInstitution($request, $institution);
        
        $teachers = $institution->teachers()->withCount('assignments as assigned_hours')
            ->get()
            ->map(function($teacher) {
                $teacher->assigned_hours = $teacher->assignments()->sum('hours');
                return $teacher;
            });

        return response()->json($teachers);
    }

    public function storeTeacher(Request $request, Institution $institution)
    {
        $this->authorizeInstitution($request, $institution);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'specialty' => 'nullable|string|max:255',
            'type' => 'required|in:grado,especialista',
            'max_hours' => 'required|integer|in:24,25,26',
            'email' => 'nullable|email',
        ]);

        $teacher = $institution->teachers()->create($validated);
        return response()->json($teacher, 201);
    }

    // ===== ASIGNACIONES =====

    public function assignments(Request $request, Institution $institution)
    {
        $this->authorizeInstitution($request, $institution);
        return response()->json($institution->assignments()->with(['teacher', 'subject', 'level'])->get());
    }

    public function storeAssignment(Request $request, Institution $institution)
    {
        $this->authorizeInstitution($request, $institution);

        $validated = $request->validate([
            'teacher_id' => 'required|exists:teachers,id',
            'subject_id' => 'required|exists:subjects,id',
            'level_id' => 'required|exists:levels,id',
            'hours' => 'required|integer|min:1|max:10',
        ]);

        $assignment = $institution->assignments()->create($validated);
        return response()->json($assignment->load(['teacher', 'subject', 'level']), 201);
    }

    // ===== GENERACIÓN DE HORARIO =====

    public function generateSchedule(Request $request, Institution $institution)
    {
        $this->authorizeInstitution($request, $institution);

        $generator = new ScheduleGeneratorService();
        $schedule = $generator->generate($institution);

        $schedule->load(['slots.teacher', 'slots.subject', 'slots.level', 'validationErrors']);

        return response()->json([
            'schedule' => $schedule,
            'message' => $schedule->is_valid ? 'Horario generado exitosamente' : 'Horario generado con advertencias',
        ]);
    }

    /**
     * Validar horario existente
     */
    public function validateSchedule(Request $request, Institution $institution, Schedule $schedule)
    {
        $this->authorizeInstitution($request, $institution);

        $slots = $schedule->slots->map(fn($s) => [
            'level_id' => $s->level_id,
            'day_of_week' => $s->day_of_week,
            'block_number' => $s->block_number,
            'teacher_id' => $s->teacher_id,
            'subject_id' => $s->subject_id,
        ])->toArray();

        $generator = new ScheduleGeneratorService();
        $errors = $generator->validateSlots($slots);

        return response()->json([
            'is_valid' => empty($errors),
            'errors' => $errors,
            'errors_count' => count($errors),
        ]);
    }

    /**
     * Obtener horarios de la institución
     */
    public function schedules(Request $request, Institution $institution)
    {
        $this->authorizeInstitution($request, $institution);
        return response()->json($institution->schedules()->withCount('slots')->orderByDesc('created_at')->get());
    }

    /**
     * Obtener detalle de un horario
     */
    public function showSchedule(Request $request, Institution $institution, Schedule $schedule)
    {
        $this->authorizeInstitution($request, $institution);
        $schedule->load(['slots.teacher', 'slots.subject', 'slots.level', 'validationErrors']);
        return response()->json($schedule);
    }

    // ===== REPORTES =====

    public function reportByCourse(Request $request, Institution $institution, int $levelId)
    {
        $this->authorizeInstitution($request, $institution);
        
        $schedule = $institution->getActiveSchedule();
        if (!$schedule) return response()->json(['message' => 'No hay horario activo'], 404);

        $slots = $schedule->slots()
            ->where('level_id', $levelId)
            ->with(['teacher', 'subject'])
            ->get();

        return response()->json([
            'level' => Level::findOrFail($levelId),
            'slots' => $slots,
            'schedule' => $schedule,
        ]);
    }

    public function reportByTeacher(Request $request, Institution $institution, int $teacherId)
    {
        $this->authorizeInstitution($request, $institution);
        
        $schedule = $institution->getActiveSchedule();
        if (!$schedule) return response()->json(['message' => 'No hay horario activo'], 404);

        $slots = $schedule->slots()
            ->where('teacher_id', $teacherId)
            ->with(['subject', 'level'])
            ->get();

        return response()->json([
            'teacher' => Teacher::findOrFail($teacherId),
            'slots' => $slots,
            'schedule' => $schedule,
        ]);
    }

    // ===== AUTORIZACIÓN =====

    private function authorizeInstitution(Request $request, Institution $institution): void
    {
        if ($institution->user_id !== $request->user()->id) {
            abort(403, 'No autorizado para acceder a esta institución');
        }
    }
}
