<?php

namespace App\Services;

use App\Models\Institution;
use App\Models\Level;
use App\Models\Jornada;
use App\Models\Subject;
use App\Models\SubjectLoad;
use App\Models\Teacher;
use App\Models\Assignment;
use App\Models\Schedule;
use App\Models\ScheduleSlot;
use App\Models\ValidationError;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * ScheduleGeneratorService
 * 
 * Motor inteligente de generación de horarios educativos.
 * Utiliza backtracking con sistema de puntuación y restricciones.
 * 
 * Restricciones implementadas:
 * 1. Un docente no puede estar en dos lugares al mismo tiempo
 * 2. Un curso no puede tener dos materias simultáneamente
 * 3. Cumplir exactamente la carga semanal
 * 4. Distribución inteligente de materias
 * 5. Evitar exceso de horas consecutivas (máx 2)
 * 6. Docentes especialistas con varias materias y niveles
 */
class ScheduleGeneratorService
{
    private const MAX_ITERATIONS = 5000;
    private const MAX_CONSECUTIVE = 2;
    private const DAYS = [1, 2, 3, 4, 5]; // Lunes a Viernes

    private Institution $institution;
    private Collection $levels;
    private Collection $jornadas;
    private Collection $subjects;
    private Collection $subjectLoads;
    private Collection $teachers;
    private Collection $assignments;

    private array $bestSlots = [];
    private int $bestScore = PHP_INT_MIN;

    /**
     * Genera un horario inteligente para la institución dada
     */
    public function generate(Institution $institution): Schedule
    {
        $this->institution = $institution;
        $this->loadData();

        Log::info("Iniciando generación de horario para institución: {$institution->name}");
        Log::info("Niveles: {$this->levels->count()}, Docentes: {$this->teachers->count()}, Asignaciones: {$this->assignments->count()}");

        // Generar múltiples intentos y seleccionar el mejor
        $this->bestSlots = [];
        $this->bestScore = PHP_INT_MIN;

        for ($iteration = 0; $iteration < self::MAX_ITERATIONS; $iteration++) {
            $currentSlots = $this->attemptGeneration($iteration);
            
            if ($currentSlots !== null) {
                $score = $this->calculateScore($currentSlots);
                
                if ($score > $this->bestScore) {
                    $this->bestScore = $score;
                    $this->bestSlots = $currentSlots;
                    
                    Log::debug("Iteración {$iteration}: Nuevo mejor score = {$score}");
                }
            }
        }

        // Guardar el mejor horario encontrado
        return $this->saveSchedule();
    }

    /**
     * Carga todos los datos necesarios para la generación
     */
    private function loadData(): void
    {
        $instId = $this->institution->id;

        $this->levels = Level::where('institution_id', $instId)
            ->orderBy('sort_order')
            ->get();

        $this->jornadas = Jornada::where('institution_id', $instId)->get();

        $this->subjects = Subject::where('institution_id', $instId)->get();

        $this->subjectLoads = SubjectLoad::where('institution_id', $instId)->get();

        $this->teachers = Teacher::where('institution_id', $instId)
            ->where('is_active', true)
            ->get();

        $this->assignments = Assignment::where('institution_id', $instId)->get();
    }

    /**
     * Intenta generar un horario completo
     */
    private function attemptGeneration(int $iteration): ?array
    {
        $slots = [];
        $toPlace = $this->buildPlacementList();

        // Ordenar por prioridad (mayor prioridad primero)
        usort($toPlace, function($a, $b) {
            $subjA = $this->getSubject($a['subject_id']);
            $subjB = $this->getSubject($b['subject_id']);
            return ($subjB['priority'] ?? 0) - ($subjA['priority'] ?? 0);
        });

        // Mezclar para variedad (excepto primera iteración)
        if ($iteration > 0) {
            shuffle($toPlace);
        }

        foreach ($toPlace as $candidate) {
            $placed = $this->placeSlot($slots, $candidate, $iteration);
            if (!$placed) {
                return null; // No se pudo colocar, intento fallido
            }
        }

        return $slots;
    }

    /**
     * Construye la lista de slots a colocar
     */
    private function buildPlacementList(): array
    {
        $toPlace = [];

        foreach ($this->assignments as $assignment) {
            for ($hour = 0; $hour < $assignment->hours; $hour++) {
                $toPlace[] = [
                    'level_id' => $assignment->level_id,
                    'teacher_id' => $assignment->teacher_id,
                    'subject_id' => $assignment->subject_id,
                    'hours' => $assignment->hours,
                ];
            }
        }

        return $toPlace;
    }

    /**
     * Intenta colocar un slot en una posición válida
     */
    private function placeSlot(array &$slots, array $candidate, int $iteration): bool
    {
        $level = $this->getLevel($candidate['level_id']);
        if (!$level) return false;

        $jornada = $this->getJornadaForLevel($level);
        if (!$jornada) return false;

        $possibleSlots = [];

        foreach (self::DAYS as $day) {
            for ($block = 1; $block <= $jornada->blocks; $block++) {
                // Verificar conflictos
                if ($this->hasTeacherConflict($slots, $candidate['teacher_id'], $day, $block)) {
                    continue;
                }
                if ($this->hasCourseConflict($slots, $candidate['level_id'], $day, $block)) {
                    continue;
                }

                // Verificar horas consecutivas
                $consecutive = $this->getConsecutiveHours($slots, $candidate['level_id'], $candidate['subject_id'], $day);
                $sameBlockBefore = $this->hasSlotAt($slots, $candidate['level_id'], $candidate['subject_id'], $day, $block - 1);
                
                if ($sameBlockBefore && $consecutive >= self::MAX_CONSECUTIVE) {
                    continue;
                }

                $possibleSlots[] = ['day' => $day, 'block' => $block];
            }
        }

        if (empty($possibleSlots)) {
            return false;
        }

        // Ordenar por distribución (preferir días menos usados)
        $dayCounts = $this->getDayCounts($slots, $candidate['level_id'], $candidate['subject_id']);
        usort($possibleSlots, function($a, $b) use ($dayCounts) {
            $countA = $dayCounts[$a['day']] ?? 0;
            $countB = $dayCounts[$b['day']] ?? 0;
            if ($countA !== $countB) return $countA - $countB;
            return rand(-1, 1); // Aleatorio para variedad
        });

        // Seleccionar posición
        $pickIndex = $iteration === 0 ? 0 : rand(0, min(2, count($possibleSlots) - 1));
        $chosen = $possibleSlots[$pickIndex];

        $slots[] = [
            'level_id' => $candidate['level_id'],
            'day_of_week' => $chosen['day'],
            'block_number' => $chosen['block'],
            'teacher_id' => $candidate['teacher_id'],
            'subject_id' => $candidate['subject_id'],
        ];

        return true;
    }

    /**
     * Calcula la puntuación de un horario
     */
    private function calculateScore(array $slots): int
    {
        $score = 0;

        // +10 Materias prioritarias correctamente ubicadas
        $highPrioritySubjects = $this->subjects->filter(fn($s) => $s->priority >= 8);
        foreach ($highPrioritySubjects as $subject) {
            $subjSlots = array_filter($slots, fn($s) => $s['subject_id'] === $subject->id);
            if (count($subjSlots) > 0) {
                $days = array_unique(array_column($subjSlots, 'day_of_week'));
                if (count($days) >= 2) $score += 10;
            }
        }

        // +10 Buena distribución semanal
        foreach ($this->levels as $level) {
            $levelAssignments = $this->assignments->where('level_id', $level->id);
            foreach ($levelAssignments as $assignment) {
                $subjSlots = array_filter($slots, fn($s) => 
                    $s['subject_id'] === $assignment->subject_id && 
                    $s['level_id'] === $assignment->level_id
                );
                if (count($subjSlots) > 0) {
                    $days = array_unique(array_column($subjSlots, 'day_of_week'));
                    $distribution = count($subjSlots) / max(count($days), 1);
                    if ($distribution <= self::MAX_CONSECUTIVE) $score += 2;
                }
            }
        }

        // +5 Docentes equilibrados
        $teacherSlots = [];
        foreach ($slots as $slot) {
            $teacherSlots[$slot['teacher_id']] = ($teacherSlots[$slot['teacher_id']] ?? 0) + 1;
        }
        foreach ($teacherSlots as $teacherId => $count) {
            $teacher = $this->getTeacher($teacherId);
            if ($teacher && $count <= $teacher->max_hours) $score += 3;
        }

        // +5 Menos espacios libres
        $totalSlots = $this->levels->count() * count(self::DAYS) * 6;
        $filledSlots = count($slots);
        $fillRate = $filledSlots / max($totalSlots, 1);
        $score += round($fillRate * 5);

        // -50 Cruce docente
        for ($i = 0; $i < count($slots); $i++) {
            for ($j = $i + 1; $j < count($slots); $j++) {
                if ($slots[$i]['teacher_id'] === $slots[$j]['teacher_id'] &&
                    $slots[$i]['day_of_week'] === $slots[$j]['day_of_week'] &&
                    $slots[$i]['block_number'] === $slots[$j]['block_number']) {
                    $score -= 50;
                }
            }
        }

        // -50 Cruce curso
        for ($i = 0; $i < count($slots); $i++) {
            for ($j = $i + 1; $j < count($slots); $j++) {
                if ($slots[$i]['level_id'] === $slots[$j]['level_id'] &&
                    $slots[$i]['day_of_week'] === $slots[$j]['day_of_week'] &&
                    $slots[$i]['block_number'] === $slots[$j]['block_number']) {
                    $score -= 50;
                }
            }
        }

        // -20 Materias concentradas
        foreach ($this->levels as $level) {
            foreach (self::DAYS as $day) {
                $daySlots = array_filter($slots, fn($s) => $s['level_id'] === $level->id && $s['day_of_week'] === $day);
                $subjectCounts = [];
                foreach ($daySlots as $slot) {
                    $subjectCounts[$slot['subject_id']] = ($subjectCounts[$slot['subject_id']] ?? 0) + 1;
                }
                foreach ($subjectCounts as $count) {
                    if ($count > self::MAX_CONSECUTIVE) $score -= 20;
                }
            }
        }

        // -15 Exceso de horas consecutivas
        foreach ($this->levels as $level) {
            foreach (self::DAYS as $day) {
                $daySlots = array_filter($slots, fn($s) => $s['level_id'] === $level->id && $s['day_of_week'] === $day);
                usort($daySlots, fn($a, $b) => $a['block_number'] - $b['block_number']);
                
                $daySlots = array_values($daySlots);
                $consecutive = 1;
                for ($i = 1; $i < count($daySlots); $i++) {
                    if ($daySlots[$i]['subject_id'] === $daySlots[$i-1]['subject_id'] &&
                        $daySlots[$i]['block_number'] === $daySlots[$i-1]['block_number'] + 1) {
                        $consecutive++;
                        if ($consecutive > self::MAX_CONSECUTIVE) {
                            $score -= 15;
                            break;
                        }
                    } else {
                        $consecutive = 1;
                    }
                }
            }
        }

        return $score;
    }

    /**
     * Guarda el mejor horario generado en la base de datos
     */
    private function saveSchedule(): Schedule
    {
        return DB::transaction(function() {
            $errors = $this->validateSlots($this->bestSlots);

            $schedule = Schedule::create([
                'institution_id' => $this->institution->id,
                'name' => 'Horario Generado ' . date('Y-m-d H:i:s'),
                'score' => $this->bestScore,
                'is_valid' => empty($errors),
                'is_active' => true,
                'generated_at' => now(),
            ]);

            // Guardar slots
            foreach ($this->bestSlots as $slot) {
                ScheduleSlot::create([
                    'schedule_id' => $schedule->id,
                    'institution_id' => $this->institution->id,
                    'level_id' => $slot['level_id'],
                    'day_of_week' => $slot['day_of_week'],
                    'block_number' => $slot['block_number'],
                    'teacher_id' => $slot['teacher_id'],
                    'subject_id' => $slot['subject_id'],
                ]);
            }

            // Guardar errores de validación
            foreach ($errors as $error) {
                ValidationError::create([
                    'schedule_id' => $schedule->id,
                    'error_type' => $error['type'],
                    'message' => $error['message'],
                    'details' => $error['details'],
                ]);
            }

            // Desactivar horarios anteriores
            Schedule::where('institution_id', $this->institution->id)
                ->where('id', '!=', $schedule->id)
                ->update(['is_active' => false]);

            Log::info("Horario guardado. Score: {$this->bestScore}, Válido: " . (empty($errors) ? 'Sí' : 'No'));

            return $schedule;
        });
    }

    /**
     * Valida los slots generados
     */
    public function validateSlots(array $slots): array
    {
        $errors = [];

        // Cruces de docente
        for ($i = 0; $i < count($slots); $i++) {
            for ($j = $i + 1; $j < count($slots); $j++) {
                if ($slots[$i]['teacher_id'] === $slots[$j]['teacher_id'] &&
                    $slots[$i]['day_of_week'] === $slots[$j]['day_of_week'] &&
                    $slots[$i]['block_number'] === $slots[$j]['block_number']) {
                    $teacher = $this->getTeacher($slots[$i]['teacher_id']);
                    $errors[] = [
                        'type' => 'teacher_conflict',
                        'message' => 'Cruce de docente',
                        'details' => ($teacher ? $teacher->full_name : 'Docente') . ' asignado en dos lugares simultáneamente',
                    ];
                }
            }
        }

        // Cruces de curso
        for ($i = 0; $i < count($slots); $i++) {
            for ($j = $i + 1; $j < count($slots); $j++) {
                if ($slots[$i]['level_id'] === $slots[$j]['level_id'] &&
                    $slots[$i]['day_of_week'] === $slots[$j]['day_of_week'] &&
                    $slots[$i]['block_number'] === $slots[$j]['block_number']) {
                    $level = $this->getLevel($slots[$i]['level_id']);
                    $errors[] = [
                        'type' => 'course_conflict',
                        'message' => 'Cruce de curso',
                        'details' => ($level ? $level->full_name : 'Curso') . ' tiene dos materias en el mismo horario',
                    ];
                }
            }
        }

        // Horas incompletas
        foreach ($this->assignments as $assignment) {
            $assignedSlots = array_filter($slots, fn($s) =>
                $s['teacher_id'] === $assignment->teacher_id &&
                $s['subject_id'] === $assignment->subject_id &&
                $s['level_id'] === $assignment->level_id
            );
            if (count($assignedSlots) < $assignment->hours) {
                $teacher = $this->getTeacher($assignment->teacher_id);
                $subject = $this->getSubject($assignment->subject_id);
                $level = $this->getLevel($assignment->level_id);
                $errors[] = [
                    'type' => 'missing_hours',
                    'message' => 'Horas incompletas',
                    'details' => "Faltan {$assignment->hours} - " . count($assignedSlots) . " horas de " . ($subject->name ?? '') . " para " . ($teacher->full_name ?? '') . " en " . ($level->full_name ?? ''),
                ];
            }
        }

        // Sobrecarga docente
        $teacherHours = [];
        foreach ($slots as $slot) {
            $teacherHours[$slot['teacher_id']] = ($teacherHours[$slot['teacher_id']] ?? 0) + 1;
        }
        foreach ($teacherHours as $teacherId => $hours) {
            $teacher = $this->getTeacher($teacherId);
            if ($teacher && $hours > $teacher->max_hours) {
                $errors[] = [
                    'type' => 'overload',
                    'message' => 'Sobrecarga docente',
                    'details' => "{$teacher->full_name} tiene {$hours} horas (máximo {$teacher->max_hours})",
                ];
            }
        }

        return $errors;
    }

    // ===== MÉTODOS AUXILIARES =====

    private function getJornadaForLevel(array $level): ?Jornada
    {
        if ($level['level'] === 'egb') {
            return $this->jornadas->first(fn($j) => 
                str_contains(strtolower($j->name), 'egb') || 
                str_contains(strtolower($j->name), 'básic')
            ) ?? $this->jornadas->first();
        }
        
        return $this->jornadas->first(fn($j) => 
            str_contains(strtolower($j->name), 'bach') || 
            str_contains(strtolower($j->name), 'medio')
        ) ?? $this->jornadas->first();
    }

    private function hasTeacherConflict(array $slots, int $teacherId, int $day, int $block): bool
    {
        foreach ($slots as $slot) {
            if ($slot['teacher_id'] === $teacherId &&
                $slot['day_of_week'] === $day &&
                $slot['block_number'] === $block) {
                return true;
            }
        }
        return false;
    }

    private function hasCourseConflict(array $slots, int $levelId, int $day, int $block): bool
    {
        foreach ($slots as $slot) {
            if ($slot['level_id'] === $levelId &&
                $slot['day_of_week'] === $day &&
                $slot['block_number'] === $block) {
                return true;
            }
        }
        return false;
    }

    private function hasSlotAt(array $slots, int $levelId, int $subjectId, int $day, int $block): bool
    {
        if ($block < 1) return false;
        foreach ($slots as $slot) {
            if ($slot['level_id'] === $levelId &&
                $slot['subject_id'] === $subjectId &&
                $slot['day_of_week'] === $day &&
                $slot['block_number'] === $block) {
                return true;
            }
        }
        return false;
    }

    private function getConsecutiveHours(array $slots, int $levelId, int $subjectId, int $day): int
    {
        $daySlots = array_filter($slots, fn($s) => 
            $s['level_id'] === $levelId && 
            $s['subject_id'] === $subjectId && 
            $s['day_of_week'] === $day
        );
        return count($daySlots);
    }

    private function getDayCounts(array $slots, int $levelId, int $subjectId): array
    {
        $counts = [];
        foreach ($slots as $slot) {
            if ($slot['level_id'] === $levelId && $slot['subject_id'] === $subjectId) {
                $counts[$slot['day_of_week']] = ($counts[$slot['day_of_week']] ?? 0) + 1;
            }
        }
        return $counts;
    }

    private function getLevel(int $levelId): ?object
    {
        return $this->levels->firstWhere('id', $levelId);
    }

    private function getSubject(int $subjectId): ?object
    {
        return $this->subjects->firstWhere('id', $subjectId);
    }

    private function getTeacher(int $teacherId): ?Teacher
    {
        return $this->teachers->firstWhere('id', $teacherId);
    }
}
