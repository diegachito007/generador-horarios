import React, { useState } from 'react';
import { Level, Subject, Teacher, GeneratedSchedule, Jornada } from '../types';

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

interface Props {
  institutionId: string;
  levels: Level[];
  subjects: Subject[];
  teachers: Teacher[];
  schedules: GeneratedSchedule[];
  jornadas: Jornada[];
}

export function ReportsView({ institutionId, levels, subjects, teachers, schedules, jornadas }: Props) {
  const [reportType, setReportType] = useState<'course' | 'teacher' | 'institutional'>('course');
  const [selectedLevelId, setSelectedLevelId] = useState<string>(levels[0]?.id || '');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(teachers[0]?.id || '');

  const latestSchedule = schedules[schedules.length - 1];

  const getSubjectName = (id: string) => subjects.find(s => s.id === id)?.name || '';
  const getSubjectColor = (id: string) => subjects.find(s => s.id === id)?.color || '#6B7280';
  const getTeacherName = (id: string) => {
    const t = teachers.find(t => t.id === id);
    return t ? `${t.name} ${t.lastName}` : '';
  };
  const getLevelName = (id: string) => {
    const l = levels.find(l => l.id === id);
    return l ? `${l.name} ${l.parallel}` : '';
  };

  const exportToCSV = () => {
    if (!latestSchedule) return;
    
    let csv = 'Dia,Bloque,Materia,Docente,Curso\n';
    
    if (reportType === 'course') {
      const slots = latestSchedule.slots.filter(s => s.levelId === selectedLevelId);
      slots.forEach(slot => {
        csv += `${DAYS[slot.dayOfWeek - 1]},Bloque ${slot.blockNumber},${getSubjectName(slot.subjectId)},${getTeacherName(slot.teacherId)},${getLevelName(slot.levelId)}\n`;
      });
    } else if (reportType === 'teacher') {
      const slots = latestSchedule.slots.filter(s => s.teacherId === selectedTeacherId);
      slots.forEach(slot => {
        csv += `${DAYS[slot.dayOfWeek - 1]},Bloque ${slot.blockNumber},${getSubjectName(slot.subjectId)},${getTeacherName(slot.teacherId)},${getLevelName(slot.levelId)}\n`;
      });
    } else {
      latestSchedule.slots.forEach(slot => {
        csv += `${DAYS[slot.dayOfWeek - 1]},Bloque ${slot.blockNumber},${getSubjectName(slot.subjectId)},${getTeacherName(slot.teacherId)},${getLevelName(slot.levelId)}\n`;
      });
    }

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `horario_${reportType}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const printReport = () => {
    window.print();
  };

  if (!latestSchedule) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border">
        <span className="text-5xl mb-4 block">📊</span>
        <p className="text-gray-500">No hay horarios generados para mostrar reportes</p>
        <p className="text-sm text-gray-400 mt-1">Genera un horario primero en la sección "Generar Horario"</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Reportes de Horario</h2>
        <div className="flex gap-2">
          <button onClick={exportToCSV} className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium">
            📥 Exportar CSV/Excel
          </button>
          <button onClick={printReport} className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
            🖨️ Imprimir/PDF
          </button>
        </div>
      </div>

      {/* Report Type Selection */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setReportType('course')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${reportType === 'course' ? 'bg-indigo-100 text-indigo-700' : 'bg-white text-gray-600 border'}`}
        >
          📚 Horario por Curso
        </button>
        <button
          onClick={() => setReportType('teacher')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${reportType === 'teacher' ? 'bg-indigo-100 text-indigo-700' : 'bg-white text-gray-600 border'}`}
        >
          👨‍🏫 Horario por Docente
        </button>
        <button
          onClick={() => setReportType('institutional')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${reportType === 'institutional' ? 'bg-indigo-100 text-indigo-700' : 'bg-white text-gray-600 border'}`}
        >
          🏫 Horario Institucional
        </button>
      </div>

      {/* Course Report */}
      {reportType === 'course' && (
        <div>
          <select
            value={selectedLevelId}
            onChange={e => setSelectedLevelId(e.target.value)}
            className="mb-4 px-3 py-2 border rounded-lg text-sm"
          >
            {levels.map(l => <option key={l.id} value={l.id}>{l.name} {l.parallel}</option>)}
          </select>
          
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden print:shadow-none">
            <div className="p-4 border-b bg-gray-50">
              <h3 className="font-bold text-gray-900">HORARIO SEMANAL - {getLevelName(selectedLevelId)}</h3>
              <p className="text-xs text-gray-500">Generado: {new Date(latestSchedule.createdAt).toLocaleString()}</p>
            </div>
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-3 py-2 text-xs font-medium text-gray-500 border-b w-20">Hora</th>
                  {DAYS.map(day => (
                    <th key={day} className="px-2 py-2 text-xs font-medium text-gray-500 border-b text-center">{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: jornadas[0]?.blocks || 6 }, (_, i) => i + 1).map(block => {
                  const jornada = jornadas[0];
                  const startTime = jornada ? getBlockTime(jornada.startTime, block - 1, jornada.blockDuration) : '';
                  const endTime = jornada ? getBlockTime(jornada.startTime, block, jornada.blockDuration) : '';
                  return (
                    <tr key={block}>
                      <td className="px-3 py-2 text-xs text-gray-500 border-b bg-gray-50 font-medium">
                        <div>{startTime}</div>
                        <div>{endTime}</div>
                      </td>
                      {DAYS.map((_, dayIdx) => {
                        const slot = latestSchedule.slots.find(s =>
                          s.levelId === selectedLevelId && s.dayOfWeek === dayIdx + 1 && s.blockNumber === block
                        );
                        return (
                          <td key={dayIdx} className="px-1 py-1 border-b">
                            {slot ? (
                              <div
                                className="rounded-lg p-2 text-center"
                                style={{ backgroundColor: getSubjectColor(slot.subjectId) + '20', borderLeft: `3px solid ${getSubjectColor(slot.subjectId)}` }}
                              >
                                <p className="text-xs font-bold text-gray-900">{getSubjectName(slot.subjectId)}</p>
                                <p className="text-[10px] text-gray-500">{getTeacherName(slot.teacherId)}</p>
                              </div>
                            ) : (
                              <div className="rounded-lg p-2 text-center bg-gray-50">
                                <p className="text-xs text-gray-300">-</p>
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
        </div>
      )}

      {/* Teacher Report */}
      {reportType === 'teacher' && (
        <div>
          <select
            value={selectedTeacherId}
            onChange={e => setSelectedTeacherId(e.target.value)}
            className="mb-4 px-3 py-2 border rounded-lg text-sm"
          >
            {teachers.map(t => <option key={t.id} value={t.id}>{t.name} {t.lastName}</option>)}
          </select>
          
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden print:shadow-none">
            <div className="p-4 border-b bg-gray-50">
              <h3 className="font-bold text-gray-900">HORARIO DOCENTE - {getTeacherName(selectedTeacherId)}</h3>
              <p className="text-xs text-gray-500">
                Total horas: {latestSchedule.slots.filter(s => s.teacherId === selectedTeacherId).length}
              </p>
            </div>
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-3 py-2 text-xs font-medium text-gray-500 border-b w-20">Hora</th>
                  {DAYS.map(day => (
                    <th key={day} className="px-2 py-2 text-xs font-medium text-gray-500 border-b text-center">{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: jornadas[0]?.blocks || 6 }, (_, i) => i + 1).map(block => {
                  const jornada = jornadas[0];
                  const startTime = jornada ? getBlockTime(jornada.startTime, block - 1, jornada.blockDuration) : '';
                  const endTime = jornada ? getBlockTime(jornada.startTime, block, jornada.blockDuration) : '';
                  return (
                    <tr key={block}>
                      <td className="px-3 py-2 text-xs text-gray-500 border-b bg-gray-50 font-medium">
                        <div>{startTime}</div>
                        <div>{endTime}</div>
                      </td>
                      {DAYS.map((_, dayIdx) => {
                        const slot = latestSchedule.slots.find(s =>
                          s.teacherId === selectedTeacherId && s.dayOfWeek === dayIdx + 1 && s.blockNumber === block
                        );
                        return (
                          <td key={dayIdx} className="px-1 py-1 border-b">
                            {slot ? (
                              <div
                                className="rounded-lg p-2 text-center"
                                style={{ backgroundColor: getSubjectColor(slot.subjectId) + '20', borderLeft: `3px solid ${getSubjectColor(slot.subjectId)}` }}
                              >
                                <p className="text-xs font-bold text-gray-900">{getSubjectName(slot.subjectId)}</p>
                                <p className="text-[10px] text-gray-500">{getLevelName(slot.levelId)}</p>
                              </div>
                            ) : (
                              <div className="rounded-lg p-2 text-center bg-gray-50">
                                <p className="text-xs text-gray-300">-</p>
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
        </div>
      )}

      {/* Institutional Report */}
      {reportType === 'institutional' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-5 shadow-sm border">
            <h3 className="font-bold text-gray-900 mb-3">Resumen Institucional</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-700">{levels.length}</p>
                <p className="text-xs text-blue-600">Cursos</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-700">{teachers.length}</p>
                <p className="text-xs text-green-600">Docentes</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-700">{latestSchedule.slots.length}</p>
                <p className="text-xs text-purple-600">Bloques asignados</p>
              </div>
              <div className="p-3 bg-indigo-50 rounded-lg">
                <p className="text-2xl font-bold text-indigo-700">{latestSchedule.score}</p>
                <p className="text-xs text-indigo-600">Puntuación</p>
              </div>
            </div>
          </div>

          {/* All courses summary */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <h3 className="font-bold text-gray-900">Vista General - Todos los Cursos</h3>
            </div>
            {levels.map(level => {
              const levelSlots = latestSchedule.slots.filter(s => s.levelId === level.id);
              return (
                <div key={level.id} className="border-b last:border-b-0 p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">{level.name} {level.parallel}</h4>
                  <div className="grid grid-cols-5 gap-2">
                    {DAYS.map((day, dayIdx) => {
                      const daySlots = levelSlots.filter(s => s.dayOfWeek === dayIdx + 1).sort((a, b) => a.blockNumber - b.blockNumber);
                      return (
                        <div key={day} className="text-center">
                          <p className="text-[10px] font-medium text-gray-500 mb-1">{day}</p>
                          {daySlots.map(slot => (
                            <div key={slot.id} className="text-[10px] p-1 rounded mb-0.5" style={{ backgroundColor: getSubjectColor(slot.subjectId) + '20' }}>
                              {getSubjectName(slot.subjectId)}
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
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
