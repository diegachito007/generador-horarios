import React, { useState } from 'react';
import { Level, Jornada, Subject, SubjectLoad, Teacher, Assignment, GeneratedSchedule } from '../types';
import { generateIntelligentSchedule, validateGeneratedSchedule } from '../services/ScheduleGenerator';

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

interface Props {
  institutionId: string;
  levels: Level[];
  jornadas: Jornada[];
  subjects: Subject[];
  subjectLoads: SubjectLoad[];
  teachers: Teacher[];
  assignments: Assignment[];
  schedules: GeneratedSchedule[];
  saveSchedule: (s: GeneratedSchedule) => void;
  deleteSchedule: (id: string) => void;
}

export function ScheduleGenerator({
  institutionId, levels, jornadas, subjects, subjectLoads, teachers, assignments, schedules, saveSchedule, deleteSchedule
}: Props) {
  const [generating, setGenerating] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState<GeneratedSchedule | null>(null);
  const [viewMode, setViewMode] = useState<'course' | 'teacher'>('course');
  const [selectedLevelId, setSelectedLevelId] = useState<string>(levels[0]?.id || '');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(teachers[0]?.id || '');

  const handleGenerate = async () => {
    if (levels.length === 0 || assignments.length === 0) {
      alert('Debe registrar cursos y asignaciones antes de generar el horario');
      return;
    }
    if (jornadas.length === 0) {
      alert('Debe configurar al menos una jornada');
      return;
    }

    setGenerating(true);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500));

    const ctx = {
      institutionId,
      levels,
      jornadas,
      subjects,
      subjectLoads,
      teachers,
      assignments
    };

    const schedule = generateIntelligentSchedule(ctx);
    setCurrentSchedule(schedule);
    saveSchedule(schedule);
    setGenerating(false);
  };

  const handleValidate = () => {
    if (!currentSchedule) return;
    const ctx = { institutionId, levels, jornadas, subjects, subjectLoads, teachers, assignments };
    const errors = validateGeneratedSchedule(currentSchedule.slots, ctx);
    setCurrentSchedule({ ...currentSchedule, validationErrors: errors, isValid: errors.length === 0 });
  };

  const getSubjectColor = (subjectId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject?.color || '#6B7280';
  };

  const getSubjectName = (subjectId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject?.name || '';
  };

  const getTeacherName = (teacherId: string) => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? `${teacher.name} ${teacher.lastName}` : '';
  };

  // Build schedule grid for course view
  const getCourseSlots = (levelId: string) => {
    if (!currentSchedule) return [];
    return currentSchedule.slots.filter(s => s.levelId === levelId);
  };

  // Build schedule grid for teacher view
  const getTeacherSlots = (teacherId: string) => {
    if (!currentSchedule) return [];
    return currentSchedule.slots.filter(s => s.teacherId === teacherId);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Generador Inteligente de Horarios</h2>
      </div>

      {/* Generation Controls */}
      <div className="bg-white rounded-xl p-6 shadow-sm border mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-gray-900">Motor de Generación</h3>
            <p className="text-sm text-gray-500 mt-1">
              {levels.length} cursos • {teachers.length} docentes • {assignments.length} asignaciones • {jornadas.length} jornadas
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generating ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generando...
                </span>
              ) : '⚡ GENERAR HORARIO INTELIGENTE'}
            </button>
            {currentSchedule && (
              <button onClick={handleValidate} className="px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-medium">
                ✓ VALIDAR
              </button>
            )}
          </div>
        </div>

        {/* Requirements Check */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          <CheckItem label="Cursos registrados" ok={levels.length > 0} count={levels.length} />
          <CheckItem label="Jornadas configuradas" ok={jornadas.length > 0} count={jornadas.length} />
          <CheckItem label="Docentes registrados" ok={teachers.length > 0} count={teachers.length} />
          <CheckItem label="Asignaciones creadas" ok={assignments.length > 0} count={assignments.length} />
        </div>
      </div>

      {/* Results */}
      {currentSchedule && (
        <div className="space-y-4">
          {/* Score and Validation */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-5 shadow-sm border">
              <p className="text-sm text-gray-500">Puntuación</p>
              <p className="text-3xl font-bold text-indigo-600">{currentSchedule.score}</p>
              <p className="text-xs text-gray-400 mt-1">puntos de calidad</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border">
              <p className="text-sm text-gray-500">Estado</p>
              <p className={`text-3xl font-bold ${currentSchedule.isValid ? 'text-green-600' : 'text-red-600'}`}>
                {currentSchedule.isValid ? '✓ Válido' : '✗ Con errores'}
              </p>
              <p className="text-xs text-gray-400 mt-1">{currentSchedule.validationErrors.length} problemas detectados</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border">
              <p className="text-sm text-gray-500">Bloques asignados</p>
              <p className="text-3xl font-bold text-gray-900">{currentSchedule.slots.length}</p>
              <p className="text-xs text-gray-400 mt-1">de {assignments.reduce((acc, a) => acc + a.hours, 0)} requeridos</p>
            </div>
          </div>

          {/* Validation Errors */}
          {currentSchedule.validationErrors.length > 0 && (
            <div className="bg-red-50 rounded-xl p-4 border border-red-200">
              <h4 className="font-semibold text-red-800 mb-2">Errores de Validación</h4>
              <div className="space-y-1">
                {currentSchedule.validationErrors.slice(0, 10).map((err, i) => (
                  <p key={i} className="text-sm text-red-700">• {err.message}: {err.details}</p>
                ))}
                {currentSchedule.validationErrors.length > 10 && (
                  <p className="text-sm text-red-600">... y {currentSchedule.validationErrors.length - 10} errores más</p>
                )}
              </div>
            </div>
          )}

          {/* View Mode Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('course')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${viewMode === 'course' ? 'bg-indigo-100 text-indigo-700' : 'bg-white text-gray-600 border'}`}
            >
              📚 Por Curso
            </button>
            <button
              onClick={() => setViewMode('teacher')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${viewMode === 'teacher' ? 'bg-indigo-100 text-indigo-700' : 'bg-white text-gray-600 border'}`}
            >
              👨‍🏫 Por Docente
            </button>
          </div>

          {/* Schedule Grid - Course View */}
          {viewMode === 'course' && (
            <div>
              <select
                value={selectedLevelId}
                onChange={e => setSelectedLevelId(e.target.value)}
                className="mb-4 px-3 py-2 border rounded-lg text-sm"
              >
                {levels.map(l => <option key={l.id} value={l.id}>{l.name} {l.parallel}</option>)}
              </select>
              <ScheduleGrid
                slots={getCourseSlots(selectedLevelId)}
                getSubjectName={getSubjectName}
                getTeacherName={getTeacherName}
                getSubjectColor={getSubjectColor}
                jornadas={jornadas}
                levels={levels}
                selectedLevelId={selectedLevelId}
              />
            </div>
          )}

          {/* Schedule Grid - Teacher View */}
          {viewMode === 'teacher' && (
            <div>
              <select
                value={selectedTeacherId}
                onChange={e => setSelectedTeacherId(e.target.value)}
                className="mb-4 px-3 py-2 border rounded-lg text-sm"
              >
                {teachers.map(t => <option key={t.id} value={t.id}>{t.name} {t.lastName}</option>)}
              </select>
              <ScheduleGrid
                slots={getTeacherSlots(selectedTeacherId)}
                getSubjectName={getSubjectName}
                getTeacherName={getTeacherName}
                getSubjectColor={getSubjectColor}
                jornadas={jornadas}
                levels={levels}
                selectedLevelId=""
                isTeacherView={true}
              />
            </div>
          )}
        </div>
      )}

      {/* Previous Schedules */}
      {schedules.length > 1 && (
        <div className="mt-6">
          <h3 className="font-semibold text-gray-900 mb-3">Horarios Generados Anteriormente</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {schedules.filter(s => s.id !== currentSchedule?.id).slice(-6).map(s => (
              <div key={s.id} className="bg-white rounded-xl p-4 shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Horario #{s.id.slice(-4)}</p>
                    <p className="text-xs text-gray-500">{new Date(s.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${s.isValid ? 'text-green-600' : 'text-red-600'}`}>{s.score}</p>
                    <button onClick={() => deleteSchedule(s.id)} className="text-xs text-red-400 hover:text-red-600">Eliminar</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!currentSchedule && schedules.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border">
          <span className="text-5xl mb-4 block">⚡</span>
          <p className="text-gray-500">Presiona el botón para generar el horario inteligente</p>
          <p className="text-sm text-gray-400 mt-1">El motor analizará todas las restricciones y optimizará la distribución</p>
        </div>
      )}
    </div>
  );
}

function CheckItem({ label, ok, count }: { label: string; ok: boolean; count: number }) {
  return (
    <div className={`p-3 rounded-lg ${ok ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
      <div className="flex items-center gap-2">
        <span>{ok ? '✅' : '❌'}</span>
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </div>
      <p className="text-xs text-gray-500 mt-1 ml-6">{count} registrado{count !== 1 ? 's' : ''}</p>
    </div>
  );
}

function getBlockTime(startTime: string, blockIndex: number, blockDuration: number): string {
  const [hours, minutes] = startTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + blockIndex * blockDuration;
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

function ScheduleGrid({ slots, getSubjectName, getTeacherName, getSubjectColor, jornadas, levels, selectedLevelId, isTeacherView = false }: {
  slots: any[];
  getSubjectName: (id: string) => string;
  getTeacherName: (id: string) => string;
  getSubjectColor: (id: string) => string;
  jornadas: Jornada[];
  levels: Level[];
  selectedLevelId: string;
  isTeacherView?: boolean;
}) {
  const jornada = jornadas[0];
  const maxBlocks = jornada?.blocks || 6;
  const blockDuration = jornada?.blockDuration || 45;
  const startTime = jornada?.startTime || '07:00';

  const getSlotAt = (day: number, block: number) => {
    return slots.find(s => s.dayOfWeek === day && s.blockNumber === block);
  };

  const getLevelName = (levelId: string) => {
    const level = levels.find(l => l.id === levelId);
    return level ? `${level.name} ${level.parallel}` : '';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
      <table className="w-full min-w-[700px]">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-3 py-2 text-xs font-medium text-gray-500 border-b w-24">Hora</th>
            {DAYS.map(day => (
              <th key={day} className="px-2 py-2 text-xs font-medium text-gray-500 border-b text-center">{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: maxBlocks }, (_, i) => i + 1).map(block => {
            const blockStart = getBlockTime(startTime, block - 1, blockDuration);
            const blockEnd = getBlockTime(startTime, block, blockDuration);
            return (
              <tr key={block}>
                <td className="px-3 py-2 text-xs text-gray-500 border-b bg-gray-50 font-medium">
                  <div className="text-center">
                    <div className="font-semibold text-gray-700">{blockStart}</div>
                    <div className="text-gray-400">{blockEnd}</div>
                  </div>
                </td>
                {DAYS.map((_, dayIdx) => {
                  const slot = getSlotAt(dayIdx + 1, block);
                  return (
                    <td key={dayIdx} className="px-1 py-1 border-b">
                      {slot ? (
                        <div
                          className="rounded-lg p-2 text-center min-h-[50px] flex flex-col items-center justify-center"
                          style={{ backgroundColor: getSubjectColor(slot.subjectId) + '15', borderLeft: `3px solid ${getSubjectColor(slot.subjectId)}` }}
                        >
                          <p className="text-xs font-bold text-gray-900 leading-tight">{getSubjectName(slot.subjectId)}</p>
                          <p className="text-[10px] text-gray-500 mt-0.5">
                            {isTeacherView ? getLevelName(slot.levelId) : getTeacherName(slot.teacherId)}
                          </p>
                        </div>
                      ) : (
                        <div className="rounded-lg p-2 text-center bg-gray-50/50 min-h-[50px] flex items-center justify-center">
                          <p className="text-xs text-gray-300">—</p>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
