-- ============================================================
-- GENERADOR INTELIGENTE DE HORARIOS EDUCATIVOS
-- Base de Datos: MySQL 8
-- ============================================================

CREATE DATABASE IF NOT EXISTS schedule_generator CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE schedule_generator;

-- ============================================================
-- TABLA: users (Usuarios del sistema)
-- ============================================================
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    email_verified_at TIMESTAMP NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('superadmin', 'user') NOT NULL DEFAULT 'user',
    license_id BIGINT UNSIGNED NULL,
    remember_token VARCHAR(100) NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_role (role),
    INDEX idx_users_email (email)
) ENGINE=InnoDB;

-- ============================================================
-- TABLA: licenses (Licencias del software)
-- ============================================================
CREATE TABLE licenses (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    type ENUM('basic', 'professional', 'consultant') NOT NULL,
    license_key VARCHAR(100) NOT NULL UNIQUE,
    max_institutions INT NOT NULL DEFAULT 2,
    status ENUM('active', 'suspended', 'expired') NOT NULL DEFAULT 'active',
    price DECIMAL(10,2) NOT NULL,
    is_lifetime BOOLEAN NOT NULL DEFAULT FALSE,
    purchase_date DATE NOT NULL,
    expiry_date DATE NULL,
    notes TEXT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_licenses_status (status),
    INDEX idx_licenses_type (type)
) ENGINE=InnoDB;

-- ============================================================
-- TABLA: institutions (Instituciones educativas)
-- ============================================================
CREATE TABLE institutions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    logo VARCHAR(500) NULL,
    academic_year VARCHAR(50) NOT NULL,
    address TEXT NULL,
    phone VARCHAR(20) NULL,
    email VARCHAR(255) NULL,
    website VARCHAR(255) NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_institutions_user (user_id),
    UNIQUE INDEX idx_institutions_code (code, user_id)
) ENGINE=InnoDB;

-- ============================================================
-- TABLA: jornadas (Jornadas académicas)
-- ============================================================
CREATE TABLE jornadas (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    institution_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(255) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    blocks INT NOT NULL DEFAULT 6,
    block_duration INT NOT NULL DEFAULT 45,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (institution_id) REFERENCES institutions(id) ON DELETE CASCADE,
    INDEX idx_jornadas_institution (institution_id)
) ENGINE=InnoDB;

-- ============================================================
-- TABLA: levels (Niveles/Cursos educativos)
-- ============================================================
CREATE TABLE levels (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    institution_id BIGINT UNSIGNED NOT NULL,
    jornada_id BIGINT UNSIGNED NULL,
    name VARCHAR(255) NOT NULL,
    level ENUM('egb', 'bachillerato') NOT NULL,
    modality ENUM('ciencias', 'tecnico') NULL,
    specialty VARCHAR(255) NULL,
    parallel VARCHAR(10) NOT NULL DEFAULT 'A',
    section VARCHAR(50) NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (institution_id) REFERENCES institutions(id) ON DELETE CASCADE,
    FOREIGN KEY (jornada_id) REFERENCES jornadas(id) ON DELETE SET NULL,
    INDEX idx_levels_institution (institution_id),
    INDEX idx_levels_jornada (jornada_id)
) ENGINE=InnoDB;

-- ============================================================
-- TABLA: subjects (Materias)
-- ============================================================
CREATE TABLE subjects (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    institution_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NULL,
    priority TINYINT NOT NULL DEFAULT 5,
    is_specialist BOOLEAN NOT NULL DEFAULT FALSE,
    color VARCHAR(7) NOT NULL DEFAULT '#3B82F6',
    description TEXT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (institution_id) REFERENCES institutions(id) ON DELETE CASCADE,
    INDEX idx_subjects_institution (institution_id),
    INDEX idx_subjects_priority (priority)
) ENGINE=InnoDB;

-- ============================================================
-- TABLA: subject_loads (Carga horaria por materia y curso)
-- ============================================================
CREATE TABLE subject_loads (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    institution_id BIGINT UNSIGNED NOT NULL,
    subject_id BIGINT UNSIGNED NOT NULL,
    level_id BIGINT UNSIGNED NOT NULL,
    weekly_hours INT NOT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (institution_id) REFERENCES institutions(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (level_id) REFERENCES levels(id) ON DELETE CASCADE,
    UNIQUE INDEX idx_subject_load_unique (subject_id, level_id),
    INDEX idx_subject_loads_institution (institution_id)
) ENGINE=InnoDB;

-- ============================================================
-- TABLA: teachers (Docentes)
-- ============================================================
CREATE TABLE teachers (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    institution_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    specialty VARCHAR(255) NULL,
    type ENUM('grado', 'especialista') NOT NULL DEFAULT 'especialista',
    max_hours TINYINT NOT NULL DEFAULT 25,
    email VARCHAR(255) NULL,
    phone VARCHAR(20) NULL,
    identification VARCHAR(20) NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (institution_id) REFERENCES institutions(id) ON DELETE CASCADE,
    INDEX idx_teachers_institution (institution_id),
    INDEX idx_teachers_type (type)
) ENGINE=InnoDB;

-- ============================================================
-- TABLA: assignments (Asignaciones docente-materia-curso)
-- ============================================================
CREATE TABLE assignments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    institution_id BIGINT UNSIGNED NOT NULL,
    teacher_id BIGINT UNSIGNED NOT NULL,
    subject_id BIGINT UNSIGNED NOT NULL,
    level_id BIGINT UNSIGNED NOT NULL,
    hours INT NOT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (institution_id) REFERENCES institutions(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (level_id) REFERENCES levels(id) ON DELETE CASCADE,
    INDEX idx_assignments_institution (institution_id),
    INDEX idx_assignments_teacher (teacher_id),
    INDEX idx_assignments_level (level_id)
) ENGINE=InnoDB;

-- ============================================================
-- TABLA: schedules (Horarios generados)
-- ============================================================
CREATE TABLE schedules (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    institution_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(255) NULL,
    score INT NOT NULL DEFAULT 0,
    is_valid BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    generated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (institution_id) REFERENCES institutions(id) ON DELETE CASCADE,
    INDEX idx_schedules_institution (institution_id),
    INDEX idx_schedules_active (is_active)
) ENGINE=InnoDB;

-- ============================================================
-- TABLA: schedule_slots (Bloques del horario)
-- ============================================================
CREATE TABLE schedule_slots (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    schedule_id BIGINT UNSIGNED NOT NULL,
    institution_id BIGINT UNSIGNED NOT NULL,
    level_id BIGINT UNSIGNED NOT NULL,
    day_of_week TINYINT NOT NULL COMMENT '1=Lunes, 2=Martes, ..., 5=Viernes',
    block_number TINYINT NOT NULL,
    teacher_id BIGINT UNSIGNED NOT NULL,
    subject_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (schedule_id) REFERENCES schedules(id) ON DELETE CASCADE,
    FOREIGN KEY (institution_id) REFERENCES institutions(id) ON DELETE CASCADE,
    FOREIGN KEY (level_id) REFERENCES levels(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    INDEX idx_slots_schedule (schedule_id),
    INDEX idx_slots_level_day (level_id, day_of_week),
    INDEX idx_slots_teacher_day (teacher_id, day_of_week, block_number)
) ENGINE=InnoDB;

-- ============================================================
-- TABLA: validation_errors (Errores de validación)
-- ============================================================
CREATE TABLE validation_errors (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    schedule_id BIGINT UNSIGNED NOT NULL,
    error_type ENUM('teacher_conflict', 'course_conflict', 'missing_hours', 'overload', 'bad_distribution', 'wrong_block') NOT NULL,
    message VARCHAR(255) NOT NULL,
    details TEXT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (schedule_id) REFERENCES schedules(id) ON DELETE CASCADE,
    INDEX idx_validation_schedule (schedule_id)
) ENGINE=InnoDB;

-- ============================================================
-- TABLA: subject_priorities (Prioridades configurables)
-- ============================================================
CREATE TABLE subject_priorities (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    subject_name VARCHAR(255) NOT NULL,
    priority TINYINT NOT NULL DEFAULT 5,
    description VARCHAR(255) NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Insertar prioridades por defecto
INSERT INTO subject_priorities (subject_name, priority, description) VALUES
('Matemática', 10, 'Prioridad máxima'),
('Lengua y Literatura', 10, 'Prioridad máxima'),
('Ciencias Naturales', 8, 'Alta prioridad'),
('Física', 8, 'Alta prioridad'),
('Química', 8, 'Alta prioridad'),
('Inglés', 7, 'Prioridad media-alta'),
('Estudios Sociales', 5, 'Prioridad media'),
('Historia', 5, 'Prioridad media'),
('Filosofía', 5, 'Prioridad media'),
('Educación Física', 3, 'Prioridad baja'),
('Educación Cultural y Artística', 3, 'Prioridad baja'),
('Emprendimiento', 3, 'Prioridad baja');

-- ============================================================
-- USUARIO SUPERADMIN POR DEFECTO
-- ============================================================
-- Password: admin123 (bcrypt hash)
INSERT INTO users (name, email, password, role, created_at) VALUES
('Super Administrador', 'admin@horarios.com', '$2y$12$YOUR_BCRYPT_HASH_HERE', 'superadmin', NOW());

-- ============================================================
-- LICENCIAS POR DEFECTO
-- ============================================================
INSERT INTO licenses (type, license_key, max_institutions, status, price, is_lifetime, purchase_date) VALUES
('basic', 'LIC-BASIC-001', 2, 'active', 20.00, FALSE, CURDATE()),
('professional', 'LIC-PRO-001', 5, 'active', 100.00, TRUE, CURDATE()),
('consultant', 'LIC-CONS-001', 10, 'active', 150.00, TRUE, CURDATE());
