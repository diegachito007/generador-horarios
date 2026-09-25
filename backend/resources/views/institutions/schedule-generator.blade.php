@extends('layouts.app')

@section('title', 'Generar Horario - ' . $institution->name)

@section('content')
<div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
        <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div class="flex items-center gap-3">
                <a href="{{ route('institutions.index') }}" class="text-gray-400 hover:text-gray-600">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                    </svg>
                </a>
                <div>
                    <h1 class="text-lg font-bold text-gray-900">{{ $institution->name }}</h1>
                    <p class="text-xs text-gray-500">{{ $institution->code }} • {{ $institution->academic_year }}</p>
                </div>
            </div>
        </div>
    </header>

    <div class="max-w-7xl mx-auto px-4 py-6">
        <h2 class="text-xl font-bold text-gray-900 mb-6">Generador Inteligente de Horarios</h2>

        <!-- Generation Controls -->
        <div class="bg-white rounded-xl p-6 shadow-sm border mb-6">
            <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h3 class="font-semibold text-gray-900">Motor de Generación</h3>
                    <p class="text-sm text-gray-500 mt-1">
                        {{ $levels->count() }} cursos • {{ $teachers->count() }} docentes • {{ $assignments->count() }} asignaciones
                    </p>
                </div>
                <form method="POST" action="{{ route('institutions.schedules.generate', $institution) }}">
                    @csrf
                    <button
                        type="submit"
                        class="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 font-semibold shadow-lg hover:shadow-xl transition-all"
                    >
                        ⚡ GENERAR HORARIO INTELIGENTE
                    </button>
                </form>
            </div>

            <!-- Requirements Check -->
            <div class="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                <div class="p-3 rounded-lg {{ $levels->count() > 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200' }}">
                    <div class="flex items-center gap-2">
                        <span>{{ $levels->count() > 0 ? '✅' : '❌' }}</span>
                        <span class="text-sm font-medium text-gray-700">Cursos</span>
                    </div>
                    <p class="text-xs text-gray-500 mt-1 ml-6">{{ $levels->count() }} registrados</p>
                </div>

                <div class="p-3 rounded-lg {{ $jornadas->count() > 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200' }}">
                    <div class="flex items-center gap-2">
                        <span>{{ $jornadas->count() > 0 ? '✅' : '❌' }}</span>
                        <span class="text-sm font-medium text-gray-700">Jornadas</span>
                    </div>
                    <p class="text-xs text-gray-500 mt-1 ml-6">{{ $jornadas->count() }} configuradas</p>
                </div>

                <div class="p-3 rounded-lg {{ $teachers->count() > 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200' }}">
                    <div class="flex items-center gap-2">
                        <span>{{ $teachers->count() > 0 ? '✅' : '❌' }}</span>
                        <span class="text-sm font-medium text-gray-700">Docentes</span>
                    </div>
                    <p class="text-xs text-gray-500 mt-1 ml-6">{{ $teachers->count() }} registrados</p>
                </div>

                <div class="p-3 rounded-lg {{ $assignments->count() > 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200' }}">
                    <div class="flex items-center gap-2">
                        <span>{{ $assignments->count() > 0 ? '✅' : '❌' }}</span>
                        <span class="text-sm font-medium text-gray-700">Asignaciones</span>
                    </div>
                    <p class="text-xs text-gray-500 mt-1 ml-6">{{ $assignments->count() }} creadas</p>
                </div>
            </div>
        </div>

        @if(isset($schedule))
            <!-- Results -->
            <div class="space-y-4">
                <!-- Score and Validation -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="bg-white rounded-xl p-5 shadow-sm border">
                        <p class="text-sm text-gray-500">Puntuación</p>
                        <p class="text-3xl font-bold text-indigo-600">{{ $schedule->score }}</p>
                        <p class="text-xs text-gray-400 mt-1">puntos de calidad</p>
                    </div>
                    <div class="bg-white rounded-xl p-5 shadow-sm border">
                        <p class="text-sm text-gray-500">Estado</p>
                        <p class="text-3xl font-bold {{ $schedule->is_valid ? 'text-green-600' : 'text-red-600' }}">
                            {{ $schedule->is_valid ? '✓ Válido' : '✗ Con errores' }}
                        </p>
                        <p class="text-xs text-gray-400 mt-1">{{ $schedule->validation_errors_count }} problemas</p>
                    </div>
                    <div class="bg-white rounded-xl p-5 shadow-sm border">
                        <p class="text-sm text-gray-500">Bloques asignados</p>
                        <p class="text-3xl font-bold text-gray-900">{{ $schedule->slots_count }}</p>
                        <p class="text-xs text-gray-400 mt-1">de {{ $totalHours }} requeridos</p>
                    </div>
                </div>

                <!-- Validation Errors -->
                @if($schedule->validationErrors->count() > 0)
                    <div class="bg-red-50 rounded-xl p-4 border border-red-200">
                        <h4 class="font-semibold text-red-800 mb-2">Errores de Validación</h4>
                        <div class="space-y-1">
                            @foreach($schedule->validationErrors->take(10) as $error)
                                <p class="text-sm text-red-700">• {{ $error->getTypeLabel() }}: {{ $error->details }}</p>
                            @endforeach
                        </div>
                    </div>
                @endif

                <!-- Schedule Grid -->
                <div class="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <div class="p-4 border-b bg-gray-50 flex items-center justify-between">
                        <h3 class="font-bold text-gray-900">Horario Generado</h3>
                        <div class="flex gap-2">
                            <a href="{{ route('institutions.reports.course', [$institution, 'level' => $levels->first()->id]) }}" 
                               class="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                                📊 Ver Reportes
                            </a>
                            <a href="{{ route('institutions.reports.export', [$institution, $schedule]) }}" 
                               class="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">
                                📥 Exportar
                            </a>
                        </div>
                    </div>
                    
                    <!-- Schedule Table -->
                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead>
                                <tr class="bg-gray-50">
                                    <th class="px-3 py-2 text-xs font-medium text-gray-500 border-b w-24">Hora</th>
                                    @foreach(['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'] as $day)
                                        <th class="px-2 py-2 text-xs font-medium text-gray-500 border-b text-center">{{ $day }}</th>
                                    @endforeach
                                </tr>
                            </thead>
                            <tbody>
                                @php
                                    $jornada = $jornadas->first();
                                    $maxBlocks = $jornada ? $jornada->blocks : 6;
                                @endphp
                                @for($block = 1; $block <= $maxBlocks; $block++)
                                    <tr>
                                        <td class="px-3 py-2 text-xs text-gray-500 border-b bg-gray-50 font-medium text-center">
                                            <div class="font-semibold text-gray-700">{{ $jornada->getBlockStartTime($block) }}</div>
                                            <div class="text-gray-400">{{ $jornada->getBlockEndTime($block) }}</div>
                                        </td>
                                        @for($day = 1; $day <= 5; $day++)
                                            @php
                                                $slot = $schedule->slots->firstWhere(fn($s) => $s->day_of_week === $day && $s->block_number === $block && $s->level_id === $levels->first()->id);
                                            @endphp
                                            <td class="px-1 py-1 border-b">
                                                @if($slot)
                                                    <div class="rounded-lg p-2 text-center min-h-[50px] flex flex-col items-center justify-center"
                                                         style="background-color: {{ $slot->subject->color }}15; border-left: 3px solid {{ $slot->subject->color }}">
                                                        <p class="text-xs font-bold text-gray-900 leading-tight">{{ $slot->subject->name }}</p>
                                                        <p class="text-[10px] text-gray-500 mt-0.5">{{ $slot->teacher->full_name }}</p>
                                                    </div>
                                                @else
                                                    <div class="rounded-lg p-2 text-center bg-gray-50/50 min-h-[50px] flex items-center justify-center">
                                                        <p class="text-xs text-gray-300">—</p>
                                                    </div>
                                                @endif
                                            </td>
                                        @endfor
                                    </tr>
                                @endfor
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        @else
            <!-- No Schedule Generated Yet -->
            <div class="text-center py-12 bg-white rounded-xl border">
                <span class="text-5xl mb-4 block">⚡</span>
                <p class="text-gray-500">Presiona el botón para generar el horario inteligente</p>
                <p class="text-sm text-gray-400 mt-1">El motor analizará todas las restricciones y optimizará la distribución</p>
            </div>
        @endif
    </div>
</div>
@endsection
