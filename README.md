# Generador Inteligente de Horarios Educativos

## 📋 Descripción

Sistema profesional de generación automática de horarios académicos para instituciones educativas ecuatorianas. Desarrollado bajo un modelo comercial de licenciamiento.

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)               │
│              Tailwind CSS • PWA • Capacitor              │
└──────────────────────┬──────────────────────────────────┘
                       │ API REST (JSON)
┌──────────────────────▼──────────────────────────────────┐
│              BACKEND (Laravel 11 + PHP 8+)               │
│         Sanctum Auth • Middleware Roles • Services        │
└──────────────────────┬──────────────────────────────────┘
                       │ Eloquent ORM
┌──────────────────────▼──────────────────────────────────┐
│                   MySQL 8 Database                        │
│          Migraciones • Relaciones • Índices              │
└─────────────────────────────────────────────────────────┘
```

## 🎯 Características Principales

### Modelo Comercial
- **Licencia Básica** ($20/año): 2 instituciones
- **Licencia Profesional** ($100 único): 5 instituciones
- **Licencia Consultor** ($150 único): 10 instituciones

### Roles del Sistema
- **Super Administrador**: Control total de licencias, clientes e instituciones
- **Usuario Comprador**: Gestiona sus instituciones y genera horarios

### Estructura Educativa (Ecuador)
- Educación General Básica (EGB): 1ro a 10mo
- Bachillerato en Ciencias (BC): 1ro a 3ro
- Bachillerato Técnico (BT): Con especialidades

### Motor Inteligente
- Backtracking con 5000 iteraciones
- Sistema de puntuación
- Restricciones pedagógicas
- Validación automática

## 🚀 Instalación

### Requisitos
- PHP 8.1+
- Composer
- MySQL 8
- Node.js 18+
- NPM o Yarn

### Backend (Laravel)

```bash
cd backend

# Instalar dependencias
composer install

# Configurar entorno
cp .env.example .env
php artisan key:generate

# Configurar base de datos en .env
# DB_DATABASE=schedule_generator
# DB_USERNAME=root
# DB_PASSWORD=

# Ejecutar migraciones
mysql -u root -p < database/migrations/001_create_all_tables.sql

# Crear super admin
php artisan db:seed --class=SuperAdminSeeder

# Iniciar servidor
php artisan serve
```

### Frontend (React)

```bash
# Instalar dependencias
npm install

# Configurar API URL
# Editar src/services/ApiService.ts con la URL del backend

# Desarrollo
npm run dev

# Producción
npm run build
```

### PWA (Progressive Web App)

La aplicación ya está configurada como PWA. Para instalarla:
1. Abrir en Chrome/Edge
2. Clic en el ícono de instalación en la barra de direcciones
3. La app se instala como aplicación de escritorio

### App Android (Capacitor)

```bash
# Instalar Capacitor
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android

# Inicializar
npx cap init

# Agregar plataforma Android
npx cap add android

# Construir y sincronizar
npm run build
npx cap sync

# Abrir en Android Studio
npx cap open android
```

## 📂 Estructura del Proyecto

```
├── backend/                    # Laravel Backend
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/Api/
│   │   │   │   ├── SuperAdminController.php
│   │   │   │   └── InstitutionController.php
│   │   │   └── Middleware/
│   │   │       └── EnsureUserRole.php
│   │   ├── Models/
│   │   │   ├── User.php
│   │   │   ├── License.php
│   │   │   ├── Institution.php
│   │   │   ├── Level.php
│   │   │   ├── Jornada.php
│   │   │   ├── Subject.php
│   │   │   ├── SubjectLoad.php
│   │   │   ├── Teacher.php
│   │   │   ├── Assignment.php
│   │   │   ├── Schedule.php
│   │   │   ├── ScheduleSlot.php
│   │   │   └── ValidationError.php
│   │   └── Services/
│   │       └── ScheduleGeneratorService.php
│   ├── config/
│   │   └── licenses.php
│   ├── database/
│   │   └── migrations/
│   │       └── 001_create_all_tables.sql
│   └── routes/
│       └── api.php
│
├── src/                        # React Frontend
│   ├── components/
│   │   ├── LoginPage.tsx
│   │   ├── SuperAdminPanel.tsx
│   │   ├── UserPanel.tsx
│   │   ├── ScheduleGenerator.tsx
│   │   └── ReportsView.tsx
│   ├── services/
│   │   ├── ScheduleGenerator.ts
│   │   └── DemoData.ts
│   ├── store/
│   │   └── AppContext.tsx
│   ├── types/
│   │   └── index.ts
│   └── App.tsx
│
├── public/
│   ├── manifest.json          # PWA Manifest
│   └── sw.js                  # Service Worker
│
├── capacitor.config.json      # Capacitor Config
└── README.md
```

## 🔐 Usuarios de Prueba

### Super Administrador
- **Email**: admin@horarios.com
- **Password**: admin123
- **Funciones**: Gestionar licencias, clientes, instituciones

### Usuario Demo
- **Email**: demo@horarios.com
- **Password**: demo123
- **Licencia**: Profesional (5 instituciones)
- **Funciones**: Administrar institución, generar horarios

## 📊 API Endpoints

### Autenticación
```
POST /api/auth/login
POST /api/auth/register
POST /api/auth/logout
GET  /api/auth/me
```

### Super Admin
```
GET  /api/admin/dashboard
GET  /api/admin/clients
GET  /api/admin/institutions
GET  /api/admin/licenses
POST /api/admin/licenses
POST /api/admin/licenses/{id}/assign/{userId}
POST /api/admin/licenses/{id}/suspend
POST /api/admin/licenses/{id}/activate
```

### Instituciones
```
GET    /api/institutions
POST   /api/institutions
GET    /api/institutions/{id}
DELETE /api/institutions/{id}
```

### Gestión Académica
```
GET/POST   /api/institutions/{id}/levels
GET/POST   /api/institutions/{id}/jornadas
GET/POST   /api/institutions/{id}/subjects
GET/POST   /api/institutions/{id}/subject-loads
GET/POST   /api/institutions/{id}/teachers
GET/POST   /api/institutions/{id}/assignments
```

### Horarios
```
GET  /api/institutions/{id}/schedules
GET  /api/institutions/{id}/schedules/{scheduleId}
POST /api/institutions/{id}/schedules/generate
POST /api/institutions/{id}/schedules/{scheduleId}/validate
```

### Reportes
```
GET /api/institutions/{id}/reports/course/{levelId}
GET /api/institutions/{id}/reports/teacher/{teacherId}
```

## 🎓 Restricciones del Motor

1. **Cruce de Docente**: Un docente no puede estar en dos lugares al mismo tiempo
2. **Cruce de Curso**: Un curso no puede tener dos materias simultáneamente
3. **Carga Semanal**: Cumplir exactamente las horas asignadas
4. **Distribución**: Evitar concentración de materias (máx 2 horas consecutivas)
5. **Jornadas**: Respetar bloques disponibles según nivel
6. **Prioridades**: Materias prioritarias en mejores horarios

## 📈 Puntuación del Horario

### Suma
- +10: Materias prioritarias bien ubicadas
- +10: Buena distribución semanal
- +5: Docentes equilibrados
- +5: Menos espacios libres

### Resta
- -50: Cruce de docente
- -50: Cruce de curso
- -20: Materias concentradas
- -15: Exceso de horas consecutivas

## 🛠️ Tecnologías

- **Backend**: PHP 8.1+, Laravel 11, MySQL 8
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Autenticación**: Laravel Sanctum
- **PWA**: Service Worker, Manifest
- **Mobile**: Capacitor (Android)

## 📝 Licencia

Software comercial propietario. Todos los derechos reservados.

## 👥 Soporte

Para soporte técnico o consultas comerciales:
- Email: soporte@horarios.com
- Documentación: https://docs.horarios.com

---

**Generador Inteligente de Horarios Educativos** © 2025
