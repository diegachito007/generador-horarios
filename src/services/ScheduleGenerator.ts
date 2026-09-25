import { Level, Jornada, Subject, SubjectLoad, Teacher, Assignment, ScheduleSlot, GeneratedSchedule, ValidationError } from '../types';

interface GenerationContext {
  institutionId: string;
  levels: Level[];
  jornadas: Jornada[];
  subjects: Subject[];
  subjectLoads: SubjectLoad[];
  teachers: Teacher[];
  assignments: Assignment[];
}

interface CandidateSlot {
  levelId: string;
  dayOfWeek: number;
  blockNumber: number;
  teacherId: string;
  subjectId: string;
  hours: number;
}

const DAYS = [1, 2, 3, 4, 5]; // Lunes a Viernes
const MAX_ITERATIONS = 5000;
const MAX_CONSECUTIVE = 2;

function getJornadaForLevel(level: Level, jornadas: Jornada[]): Jornada | undefined {
  let jornada: Jornada | undefined;
  if (level.level === 'egb') {
    jornada = jornadas.find(j => j.name.toLowerCase().includes('egb') || j.name.toLowerCase().includes('básic'));
  } else {
    jornada = jornadas.find(j => j.name.toLowerCase().includes('bach') || j.name.toLowerCase().includes('medio'));
  }
  return jornada || jornadas[0];
}

function checkTeacherConflict(
  slots: ScheduleSlot[],
  teacherId: string,
  dayOfWeek: number,
  blockNumber: number
): boolean {
  return slots.some(s =>
    s.teacherId === teacherId &&
    s.dayOfWeek === dayOfWeek &&
    s.blockNumber === blockNumber
  );
}

function checkCourseConflict(
  slots: ScheduleSlot[],
  levelId: string,
  dayOfWeek: number,
  blockNumber: number
): boolean {
  return slots.some(s =>
    s.levelId === levelId &&
    s.dayOfWeek === dayOfWeek &&
    s.blockNumber === blockNumber
  );
}

function getConsecutiveHours(
  slots: ScheduleSlot[],
  levelId: string,
  subjectId: string,
  dayOfWeek: number
): number {
  const daySlots = slots
    .filter(s => s.levelId === levelId && s.dayOfWeek === dayOfWeek && s.subjectId === subjectId)
    .map(s => s.blockNumber)
    .sort((a, b) => a - b);
  
  if (daySlots.length === 0) return 0;
  return daySlots.length;
}

function calculateScore(slots: ScheduleSlot[], ctx: GenerationContext): number {
  let score = 0;

  // +10 Materias prioritarias correctamente ubicadas
  const highPrioritySubjects = ctx.subjects.filter(s => s.priority >= 8);
  highPrioritySubjects.forEach(subj => {
    const subjSlots = slots.filter(s => s.subjectId === subj.id);
    if (subjSlots.length > 0) {
      // Check if distributed across different days
      const days = new Set(subjSlots.map(s => s.dayOfWeek));
      if (days.size >= 2) score += 10;
    }
  });

  // +10 Buena distribución semanal
  const levelGroups = ctx.levels;
  levelGroups.forEach(level => {
    const levelAssignments = ctx.assignments.filter(a => a.levelId === level.id);
    levelAssignments.forEach(assignment => {
      const subjSlots = slots.filter(s => s.subjectId === assignment.subjectId && s.levelId === level.id);
      if (subjSlots.length > 0) {
        const days = new Set(subjSlots.map(s => s.dayOfWeek));
        const distribution = subjSlots.length / Math.max(days.size, 1);
        if (distribution <= MAX_CONSECUTIVE) score += 2;
      }
    });
  });

  // +5 Docentes equilibrados
  const teacherSlots = new Map<string, number>();
  slots.forEach(s => {
    teacherSlots.set(s.teacherId, (teacherSlots.get(s.teacherId) || 0) + 1);
  });
  teacherSlots.forEach((count, teacherId) => {
    const teacher = ctx.teachers.find(t => t.id === teacherId);
    if (teacher && count <= teacher.maxHours) score += 3;
  });

  // +5 Menos espacios libres
  const totalSlots = levelGroups.length * DAYS.length * 6; // approx
  const filledSlots = slots.length;
  const fillRate = filledSlots / Math.max(totalSlots, 1);
  score += Math.round(fillRate * 5);

  // -50 Cruce docente
  for (let i = 0; i < slots.length; i++) {
    for (let j = i + 1; j < slots.length; j++) {
      if (slots[i].teacherId === slots[j].teacherId &&
          slots[i].dayOfWeek === slots[j].dayOfWeek &&
          slots[i].blockNumber === slots[j].blockNumber) {
        score -= 50;
      }
    }
  }

  // -50 Cruce curso
  for (let i = 0; i < slots.length; i++) {
    for (let j = i + 1; j < slots.length; j++) {
      if (slots[i].levelId === slots[j].levelId &&
          slots[i].dayOfWeek === slots[j].dayOfWeek &&
          slots[i].blockNumber === slots[j].blockNumber) {
        score -= 50;
      }
    }
  }

  // -20 Materias concentradas
  levelGroups.forEach(level => {
    DAYS.forEach(day => {
      const daySlots = slots.filter(s => s.levelId === level.id && s.dayOfWeek === day);
      const subjectCounts = new Map<string, number>();
      daySlots.forEach(s => {
        subjectCounts.set(s.subjectId, (subjectCounts.get(s.subjectId) || 0) + 1);
      });
      subjectCounts.forEach(count => {
        if (count > MAX_CONSECUTIVE) score -= 20;
      });
    });
  });

  // -15 Exceso de horas consecutivas
  levelGroups.forEach(level => {
    DAYS.forEach(day => {
      const daySlots = slots
        .filter(s => s.levelId === level.id && s.dayOfWeek === day)
        .sort((a, b) => a.blockNumber - b.blockNumber);
      
      for (let i = 0; i < daySlots.length - 1; i++) {
        if (daySlots[i].subjectId === daySlots[i + 1].subjectId &&
            daySlots[i].blockNumber + 1 === daySlots[i + 1].blockNumber) {
          // Check if there are 3+ consecutive
          let consecutive = 1;
          for (let j = i + 1; j < daySlots.length; j++) {
            if (daySlots[j].subjectId === daySlots[i].subjectId &&
                daySlots[j].blockNumber === daySlots[j - 1].blockNumber + 1) {
              consecutive++;
            } else break;
          }
          if (consecutive > MAX_CONSECUTIVE) score -= 15;
        }
      }
    });
  });

  return score;
}

function validateSchedule(slots: ScheduleSlot[], ctx: GenerationContext): ValidationError[] {
  const errors: ValidationError[] = [];

  // Check teacher conflicts
  for (let i = 0; i < slots.length; i++) {
    for (let j = i + 1; j < slots.length; j++) {
      if (slots[i].teacherId === slots[j].teacherId &&
          slots[i].dayOfWeek === slots[j].dayOfWeek &&
          slots[i].blockNumber === slots[j].blockNumber) {
        const teacher = ctx.teachers.find(t => t.id === slots[i].teacherId);
        errors.push({
          type: 'teacher_conflict',
          message: 'Cruce de docente',
          details: `${teacher?.name || 'Docente'} asignado en dos lugares simultáneamente`
        });
      }
    }
  }

  // Check course conflicts
  for (let i = 0; i < slots.length; i++) {
    for (let j = i + 1; j < slots.length; j++) {
      if (slots[i].levelId === slots[j].levelId &&
          slots[i].dayOfWeek === slots[j].dayOfWeek &&
          slots[i].blockNumber === slots[j].blockNumber) {
        const level = ctx.levels.find(l => l.id === slots[i].levelId);
        errors.push({
          type: 'course_conflict',
          message: 'Cruce de curso',
          details: `${level?.name || 'Curso'} tiene dos materias en el mismo horario`
        });
      }
    }
  }

  // Check missing hours
  ctx.assignments.forEach(assignment => {
    const assignedSlots = slots.filter(s =>
      s.teacherId === assignment.teacherId &&
      s.subjectId === assignment.subjectId &&
      s.levelId === assignment.levelId
    );
    if (assignedSlots.length < assignment.hours) {
      const teacher = ctx.teachers.find(t => t.id === assignment.teacherId);
      const subject = ctx.subjects.find(s => s.id === assignment.subjectId);
      const level = ctx.levels.find(l => l.id === assignment.levelId);
      errors.push({
        type: 'missing_hours',
        message: 'Horas incompletas',
        details: `Faltan ${assignment.hours - assignedSlots.length} horas de ${subject?.name} para ${teacher?.name} en ${level?.name}`
      });
    }
  });

  // Check teacher overload
  const teacherHours = new Map<string, number>();
  slots.forEach(s => {
    teacherHours.set(s.teacherId, (teacherHours.get(s.teacherId) || 0) + 1);
  });
  teacherHours.forEach((hours, teacherId) => {
    const teacher = ctx.teachers.find(t => t.id === teacherId);
    if (teacher && hours > teacher.maxHours) {
      errors.push({
        type: 'overload',
        message: 'Sobrecarga docente',
        details: `${teacher.name} tiene ${hours} horas (máximo ${teacher.maxHours})`
      });
    }
  });

  // Check consecutive hours
  ctx.levels.forEach(level => {
    DAYS.forEach(day => {
      const daySlots = slots
        .filter(s => s.levelId === level.id && s.dayOfWeek === day)
        .sort((a, b) => a.blockNumber - b.blockNumber);
      
      let consecutive = 1;
      for (let i = 1; i < daySlots.length; i++) {
        if (daySlots[i].subjectId === daySlots[i - 1].subjectId &&
            daySlots[i].blockNumber === daySlots[i - 1].blockNumber + 1) {
          consecutive++;
          if (consecutive > MAX_CONSECUTIVE) {
            const subject = ctx.subjects.find(s => s.id === daySlots[i].subjectId);
            errors.push({
              type: 'bad_distribution',
              message: 'Materias mal distribuidas',
              details: `${subject?.name} tiene ${consecutive} horas consecutivas en ${level.name}`
            });
            break;
          }
        } else {
          consecutive = 1;
        }
      }
    });
  });

  return errors;
}

function generateSchedule(ctx: GenerationContext): GeneratedSchedule {
  let bestSlots: ScheduleSlot[] = [];
  let bestScore = -Infinity;

  // Build list of all assignments to place
  const toPlace: CandidateSlot[] = [];
  
  ctx.assignments.forEach(assignment => {
    const level = ctx.levels.find(l => l.id === assignment.levelId);
    if (!level) return;
    
    const jornada = getJornadaForLevel(level, ctx.jornadas);
    if (!jornada) return;

    for (let hour = 0; hour < assignment.hours; hour++) {
      toPlace.push({
        levelId: assignment.levelId,
        dayOfWeek: 0, // Will be assigned
        blockNumber: 0, // Will be assigned
        teacherId: assignment.teacherId,
        subjectId: assignment.subjectId,
        hours: assignment.hours
      });
    }
  });

  // Sort by priority (higher priority first)
  toPlace.sort((a, b) => {
    const subjA = ctx.subjects.find(s => s.id === a.subjectId);
    const subjB = ctx.subjects.find(s => s.id === b.subjectId);
    return (subjB?.priority || 0) - (subjA?.priority || 0);
  });

  // Try multiple random strategies
  for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
    const currentSlots: ScheduleSlot[] = [];
    let valid = true;

    // Shuffle toPlace for variety
    const shuffled = [...toPlace];
    if (iteration > 0) {
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
    }

    for (const candidate of shuffled) {
      const level = ctx.levels.find(l => l.id === candidate.levelId);
      if (!level) continue;

      const jornada = getJornadaForLevel(level, ctx.jornadas);
      if (!jornada) continue;

      // Try to find a valid slot
      const possibleSlots: { day: number; block: number }[] = [];
      
      for (const day of DAYS) {
        for (let block = 1; block <= jornada.blocks; block++) {
          if (!checkTeacherConflict(currentSlots, candidate.teacherId, day, block) &&
              !checkCourseConflict(currentSlots, candidate.levelId, day, block)) {
            
            // Check consecutive constraint
            const consecutive = getConsecutiveHours(currentSlots, candidate.levelId, candidate.subjectId, day);
            const sameBlockExists = currentSlots.some(s => 
              s.levelId === candidate.levelId && 
              s.subjectId === candidate.subjectId && 
              s.dayOfWeek === day && 
              s.blockNumber === block - 1
            );
            
            if (sameBlockExists && consecutive >= MAX_CONSECUTIVE) continue;
            
            possibleSlots.push({ day, block });
          }
        }
      }

      if (possibleSlots.length === 0) {
        valid = false;
        break;
      }

      // Prefer distribution across days
      const dayCounts = new Map<number, number>();
      currentSlots
        .filter(s => s.levelId === candidate.levelId && s.subjectId === candidate.subjectId)
        .forEach(s => dayCounts.set(s.dayOfWeek, (dayCounts.get(s.dayOfWeek) || 0) + 1));

      // Sort possible slots by least used day
      possibleSlots.sort((a, b) => {
        const countA = dayCounts.get(a.day) || 0;
        const countB = dayCounts.get(b.day) || 0;
        if (countA !== countB) return countA - countB;
        return Math.random() - 0.5;
      });

      // Pick with some randomness
      const pickIndex = iteration === 0 ? 0 : Math.floor(Math.random() * Math.min(3, possibleSlots.length));
      const chosen = possibleSlots[pickIndex];

      currentSlots.push({
        id: `slot-${Date.now()}-${Math.random()}`,
        institutionId: ctx.institutionId,
        levelId: candidate.levelId,
        dayOfWeek: chosen.day,
        blockNumber: chosen.block,
        teacherId: candidate.teacherId,
        subjectId: candidate.subjectId
      });
    }

    if (valid) {
      const score = calculateScore(currentSlots, ctx);
      if (score > bestScore) {
        bestScore = score;
        bestSlots = [...currentSlots];
      }
    }
  }

  const validationErrors = validateSchedule(bestSlots, ctx);

  return {
    id: `schedule-${Date.now()}`,
    institutionId: ctx.institutionId,
    createdAt: new Date().toISOString(),
    score: bestScore,
    slots: bestSlots,
    isValid: validationErrors.length === 0,
    validationErrors
  };
}

export function generateIntelligentSchedule(ctx: GenerationContext): GeneratedSchedule {
  return generateSchedule(ctx);
}

export function validateGeneratedSchedule(slots: ScheduleSlot[], ctx: GenerationContext): ValidationError[] {
  return validateSchedule(slots, ctx);
}
