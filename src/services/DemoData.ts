import { User, License, Institution, Level, Jornada, Subject, SubjectLoad, Teacher, Assignment } from '../types';

export function seedDemoData(): {
  users: User[];
  licenses: License[];
  institutions: Institution[];
  levels: Level[];
  jornadas: Jornada[];
  subjects: Subject[];
  subjectLoads: SubjectLoad[];
  teachers: Teacher[];
  assignments: Assignment[];
} {
  const userId = 'demo-user-1';
  const instId = 'demo-inst-1';

  const license: License = {
    id: 'demo-license-1',
    type: 'professional',
    maxInstitutions: 5,
    status: 'active',
    purchaseDate: new Date().toISOString(),
    isLifetime: true,
    price: 100
  };

  const user: User = {
    id: userId,
    name: 'Carlos Mendoza',
    email: 'demo@horarios.com',
    password: 'demo123',
    role: 'user',
    license,
    createdAt: new Date().toISOString()
  };

  const institution: Institution = {
    id: instId,
    userId,
    name: 'Unidad Educativa "San Francisco de Quito"',
    code: 'UE-SFQ-001',
    academicYear: '2025-2026',
    address: 'Quito, Ecuador',
    createdAt: new Date().toISOString()
  };

  // Jornadas
  const jornadaEGB: Jornada = {
    id: 'jornada-egb-1',
    institutionId: instId,
    name: 'EGB Matutina',
    startTime: '07:00',
    endTime: '12:00',
    blocks: 6,
    blockDuration: 45
  };

  const jornadaBach: Jornada = {
    id: 'jornada-bach-1',
    institutionId: instId,
    name: 'Bachillerato Matutino',
    startTime: '07:00',
    endTime: '12:45',
    blocks: 7,
    blockDuration: 45
  };

  // Levels
  const levels: Level[] = [
    { id: 'level-1', institutionId: instId, name: '5to EGB', level: 'egb', parallel: 'A', order: 1 },
    { id: 'level-2', institutionId: instId, name: '6to EGB', level: 'egb', parallel: 'A', order: 2 },
    { id: 'level-3', institutionId: instId, name: '7mo EGB', level: 'egb', parallel: 'A', order: 3 },
    { id: 'level-4', institutionId: instId, name: '8vo EGB', level: 'egb', parallel: 'A', order: 4 },
    { id: 'level-5', institutionId: instId, name: '9no EGB', level: 'egb', parallel: 'A', order: 5 },
    { id: 'level-6', institutionId: instId, name: '1ro BC', level: 'bachillerato', modality: 'ciencias', parallel: 'A', order: 6 },
    { id: 'level-7', institutionId: instId, name: '2do BC', level: 'bachillerato', modality: 'ciencias', parallel: 'A', order: 7 },
    { id: 'level-8', institutionId: instId, name: '1ro BT', level: 'bachillerato', modality: 'tecnico', specialty: 'Informática', parallel: 'A', order: 8 },
  ];

  // Subjects
  const subjects: Subject[] = [
    { id: 'subj-1', institutionId: instId, name: 'Matemática', priority: 10, isSpecialist: false, color: '#3B82F6' },
    { id: 'subj-2', institutionId: instId, name: 'Lengua y Literatura', priority: 10, isSpecialist: false, color: '#10B981' },
    { id: 'subj-3', institutionId: instId, name: 'Ciencias Naturales', priority: 8, isSpecialist: false, color: '#F59E0B' },
    { id: 'subj-4', institutionId: instId, name: 'Estudios Sociales', priority: 7, isSpecialist: false, color: '#EF4444' },
    { id: 'subj-5', institutionId: instId, name: 'Inglés', priority: 7, isSpecialist: true, color: '#8B5CF6' },
    { id: 'subj-6', institutionId: instId, name: 'Educación Física', priority: 3, isSpecialist: true, color: '#EC4899' },
    { id: 'subj-7', institutionId: instId, name: 'Educación Cultural y Artística', priority: 3, isSpecialist: true, color: '#06B6D4' },
    { id: 'subj-8', institutionId: instId, name: 'Física', priority: 8, isSpecialist: true, color: '#F97316' },
    { id: 'subj-9', institutionId: instId, name: 'Química', priority: 8, isSpecialist: true, color: '#6366F1' },
    { id: 'subj-10', institutionId: instId, name: 'Informática', priority: 5, isSpecialist: true, color: '#14B8A6' },
  ];

  // Subject Loads
  const subjectLoads: SubjectLoad[] = [
    // 5to EGB
    { id: 'sl-1', institutionId: instId, subjectId: 'subj-1', levelId: 'level-1', weeklyHours: 5 },
    { id: 'sl-2', institutionId: instId, subjectId: 'subj-2', levelId: 'level-1', weeklyHours: 5 },
    { id: 'sl-3', institutionId: instId, subjectId: 'subj-3', levelId: 'level-1', weeklyHours: 4 },
    { id: 'sl-4', institutionId: instId, subjectId: 'subj-4', levelId: 'level-1', weeklyHours: 3 },
    { id: 'sl-5', institutionId: instId, subjectId: 'subj-5', levelId: 'level-1', weeklyHours: 4 },
    { id: 'sl-6', institutionId: instId, subjectId: 'subj-6', levelId: 'level-1', weeklyHours: 2 },
    { id: 'sl-7', institutionId: instId, subjectId: 'subj-7', levelId: 'level-1', weeklyHours: 2 },
    // 7mo EGB
    { id: 'sl-8', institutionId: instId, subjectId: 'subj-1', levelId: 'level-3', weeklyHours: 5 },
    { id: 'sl-9', institutionId: instId, subjectId: 'subj-2', levelId: 'level-3', weeklyHours: 4 },
    { id: 'sl-10', institutionId: instId, subjectId: 'subj-3', levelId: 'level-3', weeklyHours: 4 },
    { id: 'sl-11', institutionId: instId, subjectId: 'subj-5', levelId: 'level-3', weeklyHours: 5 },
    // 8vo EGB
    { id: 'sl-12', institutionId: instId, subjectId: 'subj-1', levelId: 'level-4', weeklyHours: 5 },
    { id: 'sl-13', institutionId: instId, subjectId: 'subj-2', levelId: 'level-4', weeklyHours: 4 },
    { id: 'sl-14', institutionId: instId, subjectId: 'subj-5', levelId: 'level-4', weeklyHours: 5 },
    // 1ro BC
    { id: 'sl-15', institutionId: instId, subjectId: 'subj-1', levelId: 'level-6', weeklyHours: 5 },
    { id: 'sl-16', institutionId: instId, subjectId: 'subj-2', levelId: 'level-6', weeklyHours: 4 },
    { id: 'sl-17', institutionId: instId, subjectId: 'subj-5', levelId: 'level-6', weeklyHours: 4 },
    { id: 'sl-18', institutionId: instId, subjectId: 'subj-8', levelId: 'level-6', weeklyHours: 4 },
    { id: 'sl-19', institutionId: instId, subjectId: 'subj-9', levelId: 'level-6', weeklyHours: 3 },
    // 2do BC
    { id: 'sl-20', institutionId: instId, subjectId: 'subj-1', levelId: 'level-7', weeklyHours: 5 },
    { id: 'sl-21', institutionId: instId, subjectId: 'subj-2', levelId: 'level-7', weeklyHours: 4 },
    { id: 'sl-22', institutionId: instId, subjectId: 'subj-5', levelId: 'level-7', weeklyHours: 4 },
    { id: 'sl-23', institutionId: instId, subjectId: 'subj-8', levelId: 'level-7', weeklyHours: 4 },
    // 1ro BT Informática
    { id: 'sl-24', institutionId: instId, subjectId: 'subj-1', levelId: 'level-8', weeklyHours: 4 },
    { id: 'sl-25', institutionId: instId, subjectId: 'subj-10', levelId: 'level-8', weeklyHours: 6 },
    { id: 'sl-26', institutionId: instId, subjectId: 'subj-5', levelId: 'level-8', weeklyHours: 4 },
  ];

  // Teachers
  const teachers: Teacher[] = [
    { id: 'teacher-1', institutionId: instId, name: 'María', lastName: 'González', specialty: 'Matemática', type: 'grado', maxHours: 25 },
    { id: 'teacher-2', institutionId: instId, name: 'Pedro', lastName: 'Ramírez', specialty: 'Lengua y Literatura', type: 'grado', maxHours: 25 },
    { id: 'teacher-3', institutionId: instId, name: 'Ana', lastName: 'Torres', specialty: 'Ciencias Naturales', type: 'grado', maxHours: 24 },
    { id: 'teacher-4', institutionId: instId, name: 'Luis', lastName: 'Vargas', specialty: 'Inglés', type: 'especialista', maxHours: 26 },
    { id: 'teacher-5', institutionId: instId, name: 'Carmen', lastName: 'Suárez', specialty: 'Educación Física', type: 'especialista', maxHours: 26 },
    { id: 'teacher-6', institutionId: instId, name: 'Roberto', lastName: 'Delgado', specialty: 'Física', type: 'especialista', maxHours: 25 },
    { id: 'teacher-7', institutionId: instId, name: 'Sandra', lastName: 'Mora', specialty: 'Química', type: 'especialista', maxHours: 25 },
    { id: 'teacher-8', institutionId: instId, name: 'Fernando', lastName: 'Acosta', specialty: 'Informática', type: 'especialista', maxHours: 25 },
    { id: 'teacher-9', institutionId: instId, name: 'Patricia', lastName: 'Herrera', specialty: 'Estudios Sociales', type: 'grado', maxHours: 25 },
    { id: 'teacher-10', institutionId: instId, name: 'Miguel', lastName: 'Cabrera', specialty: 'ECA', type: 'especialista', maxHours: 24 },
  ];

  // Assignments
  const assignments: Assignment[] = [
    // María González - Matemática
    { id: 'asg-1', institutionId: instId, teacherId: 'teacher-1', subjectId: 'subj-1', levelId: 'level-1', hours: 5 },
    { id: 'asg-2', institutionId: instId, teacherId: 'teacher-1', subjectId: 'subj-1', levelId: 'level-3', hours: 5 },
    { id: 'asg-3', institutionId: instId, teacherId: 'teacher-1', subjectId: 'subj-1', levelId: 'level-6', hours: 5 },
    { id: 'asg-4', institutionId: instId, teacherId: 'teacher-1', subjectId: 'subj-1', levelId: 'level-7', hours: 5 },
    { id: 'asg-5', institutionId: instId, teacherId: 'teacher-1', subjectId: 'subj-1', levelId: 'level-8', hours: 4 },
    // Pedro Ramírez - Lengua
    { id: 'asg-6', institutionId: instId, teacherId: 'teacher-2', subjectId: 'subj-2', levelId: 'level-1', hours: 5 },
    { id: 'asg-7', institutionId: instId, teacherId: 'teacher-2', subjectId: 'subj-2', levelId: 'level-3', hours: 4 },
    { id: 'asg-8', institutionId: instId, teacherId: 'teacher-2', subjectId: 'subj-2', levelId: 'level-4', hours: 4 },
    { id: 'asg-9', institutionId: instId, teacherId: 'teacher-2', subjectId: 'subj-2', levelId: 'level-6', hours: 4 },
    { id: 'asg-10', institutionId: instId, teacherId: 'teacher-2', subjectId: 'subj-2', levelId: 'level-7', hours: 4 },
    // Ana Torres - Ciencias
    { id: 'asg-11', institutionId: instId, teacherId: 'teacher-3', subjectId: 'subj-3', levelId: 'level-1', hours: 4 },
    { id: 'asg-12', institutionId: instId, teacherId: 'teacher-3', subjectId: 'subj-3', levelId: 'level-3', hours: 4 },
    // Luis Vargas - Inglés (especialista)
    { id: 'asg-13', institutionId: instId, teacherId: 'teacher-4', subjectId: 'subj-5', levelId: 'level-1', hours: 4 },
    { id: 'asg-14', institutionId: instId, teacherId: 'teacher-4', subjectId: 'subj-5', levelId: 'level-3', hours: 5 },
    { id: 'asg-15', institutionId: instId, teacherId: 'teacher-4', subjectId: 'subj-5', levelId: 'level-4', hours: 5 },
    { id: 'asg-16', institutionId: instId, teacherId: 'teacher-4', subjectId: 'subj-5', levelId: 'level-6', hours: 4 },
    { id: 'asg-17', institutionId: instId, teacherId: 'teacher-4', subjectId: 'subj-5', levelId: 'level-7', hours: 4 },
    { id: 'asg-18', institutionId: instId, teacherId: 'teacher-4', subjectId: 'subj-5', levelId: 'level-8', hours: 4 },
    // Carmen Suárez - Ed. Física
    { id: 'asg-19', institutionId: instId, teacherId: 'teacher-5', subjectId: 'subj-6', levelId: 'level-1', hours: 2 },
    // Roberto Delgado - Física
    { id: 'asg-20', institutionId: instId, teacherId: 'teacher-6', subjectId: 'subj-8', levelId: 'level-6', hours: 4 },
    { id: 'asg-21', institutionId: instId, teacherId: 'teacher-6', subjectId: 'subj-8', levelId: 'level-7', hours: 4 },
    // Sandra Mora - Química
    { id: 'asg-22', institutionId: instId, teacherId: 'teacher-7', subjectId: 'subj-9', levelId: 'level-6', hours: 3 },
    // Fernando Acosta - Informática
    { id: 'asg-23', institutionId: instId, teacherId: 'teacher-8', subjectId: 'subj-10', levelId: 'level-8', hours: 6 },
    // Patricia Herrera - Estudios Sociales
    { id: 'asg-24', institutionId: instId, teacherId: 'teacher-9', subjectId: 'subj-4', levelId: 'level-1', hours: 3 },
    // Miguel Cabrera - ECA
    { id: 'asg-25', institutionId: instId, teacherId: 'teacher-10', subjectId: 'subj-7', levelId: 'level-1', hours: 2 },
  ];

  return {
    users: [user],
    licenses: [license],
    institutions: [institution],
    levels,
    jornadas: [jornadaEGB, jornadaBach],
    subjects,
    subjectLoads,
    teachers,
    assignments
  };
}
