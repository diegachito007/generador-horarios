<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Tipos de Licencias
    |--------------------------------------------------------------------------
    |
    | Configuración de los tipos de licencia disponibles para el software.
    |
    */

    'types' => [
        'basic' => [
            'name' => 'Básica',
            'price' => 20.00,
            'max_institutions' => 2,
            'is_lifetime' => false,
            'duration_months' => 12,
            'features' => [
                'Crear hasta 2 instituciones',
                'Generar horarios ilimitados',
                'Registrar docentes',
                'Registrar materias',
                'Registrar cursos',
                'Exportar horarios',
            ],
        ],

        'professional' => [
            'name' => 'Profesional',
            'price' => 100.00,
            'max_institutions' => 5,
            'is_lifetime' => true,
            'duration_months' => null,
            'features' => [
                'Crear hasta 5 instituciones',
                'Uso indefinido',
                'Generación ilimitada de horarios',
                'Todos los reportes',
                'Soporte prioritario',
            ],
        ],

        'consultant' => [
            'name' => 'Consultor',
            'price' => 150.00,
            'max_institutions' => 10,
            'is_lifetime' => true,
            'duration_months' => null,
            'features' => [
                'Crear hasta 10 instituciones',
                'Ideal para consultores',
                'Multi-institución',
                'Soporte dedicado',
                'Uso indefinido',
            ],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Configuración del Motor de Horarios
    |--------------------------------------------------------------------------
    */

    'schedule_generator' => [
        'max_iterations' => 5000,
        'max_consecutive_hours' => 2,
        'max_teacher_hours' => [24, 25, 26],
        'days_per_week' => 5, // Lunes a Viernes
    ],

    /*
    |--------------------------------------------------------------------------
    | Prioridades de Materias
    |--------------------------------------------------------------------------
    */

    'priorities' => [
        10 => ['Matemática', 'Lengua y Literatura'],
        8 => ['Ciencias Naturales', 'Física', 'Química'],
        7 => ['Inglés'],
        5 => ['Estudios Sociales', 'Historia', 'Filosofía'],
        3 => ['Educación Física', 'Educación Cultural y Artística', 'Emprendimiento'],
    ],

];
