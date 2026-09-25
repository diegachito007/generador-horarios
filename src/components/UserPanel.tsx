import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { Institution, EducationLevel, BachilleratoModality, TeacherType } from '../types';
import { ScheduleGenerator } from './ScheduleGenerator';
import { ReportsView } from './ReportsView';

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
const SUBJECT_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316', '#6366F1', '#14B8A6'];

export function UserPanel() {
  const { currentUser, institutions, levels, jornadas, subjects, subjectLoads, teachers, assignments, schedules,
    createInstitution, deleteInstitution, setSelectedInstitution, selectedInstitution,
    createLevel, deleteLevel, createJornada, deleteJornada,
    createSubject, deleteSubject, createSubjectLoad, deleteSubjectLoad,
    createTeacher, deleteTeacher, createAssignment, deleteAssignment,
    saveSchedule, deleteSchedule, logout, loadDemoData } = useApp();

  const [activeSection, setActiveSection] = useState<'institutions' | 'levels' | 'jornadas' | 'subjects' | 'teachers' | 'assignments' | 'generator' | 'reports'>('institutions');
  const [showModal, setShowModal] = useState<string | null>(null);

  const userInstitutions = institutions.filter(i => i.userId === currentUser?.id);
  const maxInstitutions = currentUser?.license?.maxInstitutions || 0;
  const instId = selectedInstitution?.id || '';

  const instLevels = levels.filter(l => l.institutionId === instId);
  const instJornadas = jornadas.filter(j => j.institutionId === instId);
  const instSubjects = subjects.filter(s => s.institutionId === instId);
  const instSubjectLoads = subjectLoads.filter(sl => sl.institutionId === instId);
  const instTeachers = teachers.filter(t => t.institutionId === instId);
  const instAssignments = assignments.filter(a => a.institutionId === instId);
  const instSchedules = schedules.filter(s => s.institutionId === instId);

  if (!selectedInstitution) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">{currentUser?.name}</h1>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                    {currentUser?.license?.type === 'basic' ? 'Básica' : currentUser?.license?.type === 'professional' ? 'Profesional' : currentUser?.license?.type === 'consultant' ? 'Consultor' : 'Sin licencia'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {userInstitutions.length} / {maxInstitutions} instituciones
                  </span>
                </div>
              </div>
            </div>
            <button onClick={logout} className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg">Cerrar Sesión</button>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Mis Instituciones</h2>
              <p className="text-gray-500 mt-1">{userInstitutions.length} / {maxInstitutions} instituciones creadas</p>
            </div>
            <div className="flex gap-2">
              {userInstitutions.length === 0 && (
                <button onClick={loadDemoData} className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 text-sm font-medium">
                  🎯 Cargar Datos de Demostración
                </button>
              )}
              {userInstitutions.length < maxInstitutions && (
                <button onClick={() => setShowModal('newInst')} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium">
                  + Nueva Institución
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userInstitutions.map(inst => (
              <div key={inst.id} className="bg-white rounded-xl p-5 shadow-sm border hover:shadow-md transition-all cursor-pointer group" onClick={() => setSelectedInstitution(inst)}>
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">🏫</span>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); deleteInstitution(inst.id); }} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity">
                    ✕
                  </button>
                </div>
                <h3 className="font-semibold text-gray-900 mt-3">{inst.name}</h3>
                <p className="text-sm text-gray-500">Código: {inst.code}</p>
                <p className="text-sm text-gray-500">Año: {inst.academicYear}</p>
                <div className="mt-3 pt-3 border-t flex items-center justify-between">
                  <span className="text-xs text-gray-400">{levels.filter(l => l.institutionId === inst.id).length} cursos</span>
                  <span className="text-xs text-emerald-600 font-medium">Administrar →</span>
                </div>
              </div>
            ))}
            {userInstitutions.length === 0 && (
              <div className="col-span-full text-center py-12">
                <span className="text-5xl mb-4 block">🏫</span>
                <p className="text-gray-500">No hay instituciones creadas</p>
                <p className="text-sm text-gray-400 mt-1">Crea tu primera institución para comenzar</p>
              </div>
            )}
          </div>
        </div>

        {/* New Institution Modal */}
        {showModal === 'newInst' && <NewInstitutionModal onClose={() => setShowModal(null)} createInstitution={createInstitution} userId={currentUser!.id} />}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSelectedInstitution(null)} className="text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900">{selectedInstitution.name}</h1>
              <p className="text-xs text-gray-500">{selectedInstitution.code} • {selectedInstitution.academicYear}</p>
            </div>
          </div>
          <button onClick={logout} className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg">Salir</button>
        </div>
      </header>

      {/* Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-2">
            {[
              { key: 'levels', label: 'Cursos/Niveles', icon: '📚' },
              { key: 'jornadas', label: 'Jornadas', icon: '🕐' },
              { key: 'subjects', label: 'Materias', icon: '📖' },
              { key: 'teachers', label: 'Docentes', icon: '👨‍🏫' },
              { key: 'assignments', label: 'Asignaciones', icon: '📋' },
              { key: 'generator', label: 'Generar Horario', icon: '⚡' },
              { key: 'reports', label: 'Reportes', icon: '📊' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveSection(tab.key as any)}
                className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  activeSection === tab.key ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="mr-1">{tab.icon}</span>{tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeSection === 'levels' && (
          <LevelsSection
            levels={instLevels} jornadas={instJornadas}
            createLevel={createLevel} deleteLevel={deleteLevel}
            institutionId={instId}
          />
        )}
        {activeSection === 'jornadas' && (
          <JornadasSection jornadas={instJornadas} createJornada={createJornada} deleteJornada={deleteJornada} institutionId={instId} />
        )}
        {activeSection === 'subjects' && (
          <SubjectsSection subjects={instSubjects} subjectLoads={instSubjectLoads} levels={instLevels}
            createSubject={createSubject} deleteSubject={deleteSubject}
            createSubjectLoad={createSubjectLoad} deleteSubjectLoad={deleteSubjectLoad}
            institutionId={instId}
          />
        )}
        {activeSection === 'teachers' && (
          <TeachersSection teachers={instTeachers} createTeacher={createTeacher} deleteTeacher={deleteTeacher} institutionId={instId} />
        )}
        {activeSection === 'assignments' && (
          <AssignmentsSection assignments={instAssignments} teachers={instTeachers} subjects={instSubjects} levels={instLevels}
            createAssignment={createAssignment} deleteAssignment={deleteAssignment} institutionId={instId}
          />
        )}
        {activeSection === 'generator' && (
          <ScheduleGenerator
            institutionId={instId} levels={instLevels} jornadas={instJornadas}
            subjects={instSubjects} subjectLoads={instSubjectLoads}
            teachers={instTeachers} assignments={instAssignments}
            schedules={instSchedules} saveSchedule={saveSchedule} deleteSchedule={deleteSchedule}
          />
        )}
        {activeSection === 'reports' && (
          <ReportsView institutionId={instId} levels={instLevels} subjects={instSubjects} teachers={instTeachers} schedules={instSchedules} jornadas={instJornadas} />
        )}
      </div>
    </div>
  );
}

// ===== MODALS =====
function NewInstitutionModal({ onClose, createInstitution, userId }: { onClose: () => void; createInstitution: (i: any) => boolean; userId: string }) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [year, setYear] = useState('2025-2026');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) return;
    createInstitution({ userId, name, code, academicYear: year });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full">
        <h3 className="text-lg font-bold mb-4">Nueva Institución</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent" placeholder="Unidad Educativa..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Código</label>
            <input value={code} onChange={e => setCode(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent" placeholder="UE-001" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Año Lectivo</label>
            <input value={year} onChange={e => setYear(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="flex-1 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">Crear</button>
            <button type="button" onClick={onClose} className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ===== LEVELS SECTION =====
function LevelsSection({ levels, jornadas, createLevel, deleteLevel, institutionId }: any) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [level, setLevel] = useState<EducationLevel>('egb');
  const [modality, setModality] = useState<BachilleratoModality>('ciencias');
  const [specialty, setSpecialty] = useState('');
  const [parallel, setParallel] = useState('A');
  const [order, setOrder] = useState(1);

  const handleCreate = () => {
    createLevel({ institutionId, name, level, modality: level === 'bachillerato' ? modality : undefined, specialty: level === 'bachillerato' && modality === 'tecnico' ? specialty : undefined, parallel, order });
    setShowForm(false);
    setName('');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Cursos y Niveles</h2>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm">+ Agregar Curso</button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl p-5 shadow-sm border mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Ej: 1ro EGB" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nivel</label>
              <select value={level} onChange={e => setLevel(e.target.value as EducationLevel)} className="w-full px-3 py-2 border rounded-lg text-sm">
                <option value="egb">EGB</option>
                <option value="bachillerato">Bachillerato</option>
              </select>
            </div>
            {level === 'bachillerato' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Modalidad</label>
                  <select value={modality} onChange={e => setModality(e.target.value as BachilleratoModality)} className="w-full px-3 py-2 border rounded-lg text-sm">
                    <option value="ciencias">Ciencias</option>
                    <option value="tecnico">Técnico</option>
                  </select>
                </div>
                {modality === 'tecnico' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Especialidad</label>
                    <input value={specialty} onChange={e => setSpecialty(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Informática, Contabilidad..." />
                  </div>
                )}
              </>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Paralelo</label>
              <select value={parallel} onChange={e => setParallel(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
                {['A', 'B', 'C', 'D', 'E'].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Orden</label>
              <input type="number" value={order} onChange={e => setOrder(Number(e.target.value))} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
          </div>
          <button onClick={handleCreate} className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700">Guardar Curso</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {levels.map((l: any) => (
          <div key={l.id} className="bg-white rounded-xl p-4 shadow-sm border group">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">{l.name} {l.parallel}</p>
                <p className="text-xs text-gray-500">
                  {l.level === 'egb' ? 'EGB' : `Bachillerato ${l.modality === 'tecnico' ? `Técnico - ${l.specialty}` : 'Ciencias'}`}
                </p>
              </div>
              <button onClick={() => deleteLevel(l.id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 text-sm">✕</button>
            </div>
          </div>
        ))}
        {levels.length === 0 && <div className="col-span-full text-center py-8 text-gray-500">No hay cursos registrados. Agrega los cursos de tu institución.</div>}
      </div>
    </div>
  );
}

// ===== JORNADAS SECTION =====
function JornadasSection({ jornadas, createJornada, deleteJornada, institutionId }: any) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [startTime, setStartTime] = useState('07:00');
  const [endTime, setEndTime] = useState('12:00');
  const [blocks, setBlocks] = useState(6);

  const handleCreate = () => {
    createJornada({ institutionId, name, startTime, endTime, blocks, blockDuration: 45 });
    setShowForm(false);
    setName('');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Jornadas Académicas</h2>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm">+ Agregar Jornada</button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl p-5 shadow-sm border mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="EGB Matutina" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hora Inicio</label>
              <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hora Fin</label>
              <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bloques</label>
              <input type="number" value={blocks} onChange={e => setBlocks(Number(e.target.value))} className="w-full px-3 py-2 border rounded-lg text-sm" min={1} max={10} />
            </div>
          </div>
          <button onClick={handleCreate} className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700">Guardar Jornada</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {jornadas.map((j: any) => (
          <div key={j.id} className="bg-white rounded-xl p-5 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{j.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{j.startTime} - {j.endTime}</p>
                <p className="text-sm text-gray-500">{j.blocks} bloques pedagógicos</p>
              </div>
              <button onClick={() => deleteJornada(j.id)} className="text-red-400 hover:text-red-600">✕</button>
            </div>
          </div>
        ))}
        {jornadas.length === 0 && <div className="col-span-full text-center py-8 text-gray-500">No hay jornadas configuradas</div>}
      </div>
    </div>
  );
}

// ===== SUBJECTS SECTION =====
function SubjectsSection({ subjects, subjectLoads, levels, createSubject, deleteSubject, createSubjectLoad, deleteSubjectLoad, institutionId }: any) {
  const [showForm, setShowForm] = useState(false);
  const [showLoadForm, setShowLoadForm] = useState(false);
  const [name, setName] = useState('');
  const [priority, setPriority] = useState(5);
  const [isSpecialist, setIsSpecialist] = useState(false);
  const [loadSubjectId, setLoadSubjectId] = useState('');
  const [loadLevelId, setLoadLevelId] = useState('');
  const [loadHours, setLoadHours] = useState(4);

  const handleCreateSubject = () => {
    const color = SUBJECT_COLORS[subjects.length % SUBJECT_COLORS.length];
    createSubject({ institutionId, name, priority, isSpecialist, color });
    setShowForm(false);
    setName('');
  };

  const handleCreateLoad = () => {
    if (!loadSubjectId || !loadLevelId) return;
    createSubjectLoad({ institutionId, subjectId: loadSubjectId, levelId: loadLevelId, weeklyHours: loadHours });
    setShowLoadForm(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Materias</h2>
        <div className="flex gap-2">
          <button onClick={() => setShowLoadForm(!showLoadForm)} className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">+ Carga Horaria</button>
          <button onClick={() => setShowForm(!showForm)} className="px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm">+ Materia</button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl p-5 shadow-sm border mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Matemática" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad (1-10)</label>
              <input type="number" value={priority} onChange={e => setPriority(Number(e.target.value))} className="w-full px-3 py-2 border rounded-lg text-sm" min={1} max={10} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select value={isSpecialist ? 'specialist' : 'grado'} onChange={e => setIsSpecialist(e.target.value === 'specialist')} className="w-full px-3 py-2 border rounded-lg text-sm">
                <option value="grado">Docente de grado</option>
                <option value="specialist">Especialista</option>
              </select>
            </div>
          </div>
          <button onClick={handleCreateSubject} className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700">Guardar</button>
        </div>
      )}

      {showLoadForm && (
        <div className="bg-white rounded-xl p-5 shadow-sm border mb-4">
          <h3 className="font-semibold text-gray-900 mb-3">Definir Carga Horaria</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Materia</label>
              <select value={loadSubjectId} onChange={e => setLoadSubjectId(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
                <option value="">Seleccionar...</option>
                {subjects.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Curso</label>
              <select value={loadLevelId} onChange={e => setLoadLevelId(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
                <option value="">Seleccionar...</option>
                {levels.map((l: any) => <option key={l.id} value={l.id}>{l.name} {l.parallel}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Horas semanales</label>
              <input type="number" value={loadHours} onChange={e => setLoadHours(Number(e.target.value))} className="w-full px-3 py-2 border rounded-lg text-sm" min={1} max={10} />
            </div>
          </div>
          <button onClick={handleCreateLoad} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Guardar Carga</button>
        </div>
      )}

      {/* Subjects List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        {subjects.map((s: any) => (
          <div key={s.id} className="bg-white rounded-xl p-4 shadow-sm border group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: s.color }}></div>
                <div>
                  <p className="font-semibold text-gray-900">{s.name}</p>
                  <p className="text-xs text-gray-500">Prioridad: {s.priority} • {s.isSpecialist ? 'Especialista' : 'Grado'}</p>
                </div>
              </div>
              <button onClick={() => deleteSubject(s.id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600">✕</button>
            </div>
          </div>
        ))}
      </div>

      {/* Subject Loads */}
      {subjectLoads.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Cargas Horarias Definidas</h3>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Materia</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Curso</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Horas</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {subjectLoads.map((sl: any) => {
                  const subj = subjects.find((s: any) => s.id === sl.subjectId);
                  const lvl = levels.find((l: any) => l.id === sl.levelId);
                  return (
                    <tr key={sl.id}>
                      <td className="px-4 py-2 text-sm">{subj?.name || '-'}</td>
                      <td className="px-4 py-2 text-sm">{lvl?.name} {lvl?.parallel}</td>
                      <td className="px-4 py-2 text-sm font-medium">{sl.weeklyHours}h</td>
                      <td className="px-4 py-2"><button onClick={() => deleteSubjectLoad(sl.id)} className="text-red-400 hover:text-red-600 text-sm">✕</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== TEACHERS SECTION =====
function TeachersSection({ teachers, createTeacher, deleteTeacher, institutionId }: any) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [type, setType] = useState<TeacherType>('especialista');
  const [maxHours, setMaxHours] = useState(25);

  const handleCreate = () => {
    if (!name || !lastName) return;
    createTeacher({ institutionId, name, lastName, specialty, type, maxHours });
    setShowForm(false);
    setName(''); setLastName('');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Docentes</h2>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm">+ Agregar Docente</button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl p-5 shadow-sm border mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
              <input value={lastName} onChange={e => setLastName(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Especialidad</label>
              <input value={specialty} onChange={e => setSpecialty(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Matemática, Inglés..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select value={type} onChange={e => setType(e.target.value as TeacherType)} className="w-full px-3 py-2 border rounded-lg text-sm">
                <option value="grado">Docente de grado</option>
                <option value="especialista">Especialista</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Máx. Horas</label>
              <select value={maxHours} onChange={e => setMaxHours(Number(e.target.value))} className="w-full px-3 py-2 border rounded-lg text-sm">
                <option value={24}>24 horas</option>
                <option value={25}>25 horas</option>
                <option value={26}>26 horas</option>
              </select>
            </div>
          </div>
          <button onClick={handleCreate} className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700">Guardar</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {teachers.map((t: any) => (
          <div key={t.id} className="bg-white rounded-xl p-4 shadow-sm border group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-indigo-600 font-semibold text-sm">{t.name.charAt(0)}{t.lastName.charAt(0)}</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{t.name} {t.lastName}</p>
                  <p className="text-xs text-gray-500">{t.specialty} • {t.type === 'especialista' ? 'Especialista' : 'Grado'} • Máx {t.maxHours}h</p>
                </div>
              </div>
              <button onClick={() => deleteTeacher(t.id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600">✕</button>
            </div>
          </div>
        ))}
        {teachers.length === 0 && <div className="col-span-full text-center py-8 text-gray-500">No hay docentes registrados</div>}
      </div>
    </div>
  );
}

// ===== ASSIGNMENTS SECTION =====
function AssignmentsSection({ assignments, teachers, subjects, levels, createAssignment, deleteAssignment, institutionId }: any) {
  const [showForm, setShowForm] = useState(false);
  const [teacherId, setTeacherId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [levelId, setLevelId] = useState('');
  const [hours, setHours] = useState(4);

  const handleCreate = () => {
    if (!teacherId || !subjectId || !levelId) return;
    createAssignment({ institutionId, teacherId, subjectId, levelId, hours });
    setShowForm(false);
  };

  // Calculate teacher loads
  const teacherLoads = new Map<string, number>();
  assignments.forEach((a: any) => {
    teacherLoads.set(a.teacherId, (teacherLoads.get(a.teacherId) || 0) + a.hours);
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Asignaciones Docentes</h2>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm">+ Asignar</button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl p-5 shadow-sm border mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Docente</label>
              <select value={teacherId} onChange={e => setTeacherId(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
                <option value="">Seleccionar...</option>
                {teachers.map((t: any) => <option key={t.id} value={t.id}>{t.name} {t.lastName}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Materia</label>
              <select value={subjectId} onChange={e => setSubjectId(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
                <option value="">Seleccionar...</option>
                {subjects.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Curso</label>
              <select value={levelId} onChange={e => setLevelId(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
                <option value="">Seleccionar...</option>
                {levels.map((l: any) => <option key={l.id} value={l.id}>{l.name} {l.parallel}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Horas</label>
              <input type="number" value={hours} onChange={e => setHours(Number(e.target.value))} className="w-full px-3 py-2 border rounded-lg text-sm" min={1} max={10} />
            </div>
          </div>
          <button onClick={handleCreate} className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700">Asignar</button>
        </div>
      )}

      {/* Teacher Load Summary */}
      <div className="bg-white rounded-xl p-4 shadow-sm border mb-4">
        <h3 className="font-semibold text-gray-900 mb-3">Carga Docente Actual</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {teachers.map((t: any) => {
            const load = teacherLoads.get(t.id) || 0;
            const percentage = (load / t.maxHours) * 100;
            return (
              <div key={t.id} className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-900">{t.name} {t.lastName}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div className={`h-2 rounded-full ${percentage > 100 ? 'bg-red-500' : percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${Math.min(percentage, 100)}%` }}></div>
                  </div>
                  <span className="text-xs text-gray-600">{load}/{t.maxHours}h</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Assignments Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Docente</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Materia</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Curso</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Horas</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {assignments.map((a: any) => {
              const teacher = teachers.find((t: any) => t.id === a.teacherId);
              const subject = subjects.find((s: any) => s.id === a.subjectId);
              const level = levels.find((l: any) => l.id === a.levelId);
              return (
                <tr key={a.id}>
                  <td className="px-4 py-2 text-sm">{teacher ? `${teacher.name} ${teacher.lastName}` : '-'}</td>
                  <td className="px-4 py-2 text-sm">{subject?.name || '-'}</td>
                  <td className="px-4 py-2 text-sm">{level ? `${level.name} ${level.parallel}` : '-'}</td>
                  <td className="px-4 py-2 text-sm font-medium">{a.hours}h</td>
                  <td className="px-4 py-2"><button onClick={() => deleteAssignment(a.id)} className="text-red-400 hover:text-red-600 text-sm">✕</button></td>
                </tr>
              );
            })}
            {assignments.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">No hay asignaciones</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
