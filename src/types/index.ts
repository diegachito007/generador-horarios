// ===== LICENCIAS =====
export type LicenseType = 'basic' | 'professional' | 'consultant';

export interface License {
  id: string;
  type: LicenseType;
  maxInstitutions: number;
  status: 'active' | 'suspended' | 'expired';
  purchaseDate: string;
  expiryDate?: string;
  price: number;
  isLifetime: boolean;
}

// ===== USUARIOS =====
export type UserRole = 'superadmin' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  license?: License;
  createdAt: string;
}

// ===== INSTITUCIONES =====
export interface Institution {
  id: string;
  userId: string;
  name: string;
  code: string;
  logo?: string;
  academicYear: string;
  address?: string;
  createdAt: string;
}

// ===== NIVELES Y MODALIDADES =====
export type EducationLevel = 'egb' | 'bachillerato';
export type BachilleratoModality = 'ciencias' | 'tecnico';

export interface Level {
  id: string;
  institutionId: string;
  name: string; // "1ro EGB", "2do BC", etc.
  level: EducationLevel;
  modality?: BachilleratoModality;
  specialty?: string; // Para BT
  parallel?: string; // A, B, C
  order: number;
}

// ===== JORNADAS =====
export interface Jornada {
  id: string;
  institutionId: string;
  name: string;
  startTime: string; // "07:00"
  endTime: string; // "12:00"
  blocks: number; // cantidad de bloques pedagógicos
  blockDuration: number; // minutos por bloque
}

export interface Block {
  id: string;
  jornadaId: string;
  number: number;
  startTime: string;
  endTime: string;
}

// ===== MATERIAS =====
export interface Subject {
  id: string;
  institutionId: string;
  name: string;
  priority: number; // 1-10
  isSpecialist: boolean;
  color: string;
}

export interface SubjectLoad {
  id: string;
  institutionId: string;
  subjectId: string;
  levelId: string;
  weeklyHours: number;
}

// ===== DOCENTES =====
export type TeacherType = 'grado' | 'especialista';

export interface Teacher {
  id: string;
  institutionId: string;
  name: string;
  lastName: string;
  specialty: string;
  type: TeacherType;
  maxHours: number; // 24, 25, 26
  email?: string;
}

// ===== ASIGNACIONES =====
export interface Assignment {
  id: string;
  institutionId: string;
  teacherId: string;
  subjectId: string;
  levelId: string;
  hours: number;
}

// ===== HORARIO =====
export interface ScheduleSlot {
  id: string;
  institutionId: string;
  levelId: string;
  dayOfWeek: number; // 1=Lunes ... 5=Viernes
  blockNumber: number;
  teacherId: string;
  subjectId: string;
}

export interface GeneratedSchedule {
  id: string;
  institutionId: string;
  createdAt: string;
  score: number;
  slots: ScheduleSlot[];
  isValid: boolean;
  validationErrors: ValidationError[];
}

export interface ValidationError {
  type: 'teacher_conflict' | 'course_conflict' | 'missing_hours' | 'overload' | 'bad_distribution' | 'wrong_block';
  message: string;
  details: string;
}

// ===== DASHBOARD =====
export interface DashboardStats {
  totalClients: number;
  activeLicenses: number;
  expiredLicenses: number;
  totalInstitutions: number;
  totalTeachers: number;
  totalSubjects: number;
}
