import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Institution, License, Level, Jornada, Subject, SubjectLoad, Teacher, Assignment, GeneratedSchedule } from '../types';
import { seedDemoData } from '../services/DemoData';

interface AppState {
  currentUser: User | null;
  users: User[];
  licenses: License[];
  institutions: Institution[];
  levels: Level[];
  jornadas: Jornada[];
  subjects: Subject[];
  subjectLoads: SubjectLoad[];
  teachers: Teacher[];
  assignments: Assignment[];
  schedules: GeneratedSchedule[];
  selectedInstitution: Institution | null;
}

interface AppContextType extends AppState {
  login: (email: string, password: string) => boolean;
  logout: () => void;
  loadDemoData: () => void;
  loginDemo: () => void;
  registerUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
  createLicense: (license: Omit<License, 'id'>) => void;
  updateLicense: (id: string, updates: Partial<License>) => void;
  suspendLicense: (id: string) => void;
  activateLicense: (id: string) => void;
  assignLicense: (userId: string, licenseId: string) => void;
  createInstitution: (inst: Omit<Institution, 'id' | 'createdAt'>) => boolean;
  deleteInstitution: (id: string) => void;
  setSelectedInstitution: (inst: Institution | null) => void;
  createLevel: (level: Omit<Level, 'id'>) => void;
  deleteLevel: (id: string) => void;
  createJornada: (j: Omit<Jornada, 'id'>) => void;
  deleteJornada: (id: string) => void;
  createSubject: (s: Omit<Subject, 'id'>) => void;
  deleteSubject: (id: string) => void;
  createSubjectLoad: (sl: Omit<SubjectLoad, 'id'>) => void;
  deleteSubjectLoad: (id: string) => void;
  createTeacher: (t: Omit<Teacher, 'id'>) => void;
  deleteTeacher: (id: string) => void;
  createAssignment: (a: Omit<Assignment, 'id'>) => void;
  deleteAssignment: (id: string) => void;
  saveSchedule: (s: GeneratedSchedule) => void;
  deleteSchedule: (id: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEY = 'schedule_generator_data';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function loadData(): AppState {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error loading data:', e);
  }
  // Default data with superadmin
  return {
    currentUser: null,
    users: [
      {
        id: 'superadmin-1',
        name: 'Super Administrador',
        email: 'admin@horarios.com',
        password: 'admin123',
        role: 'superadmin',
        createdAt: new Date().toISOString()
      }
    ],
    licenses: [],
    institutions: [],
    levels: [],
    jornadas: [],
    subjects: [],
    subjectLoads: [],
    teachers: [],
    assignments: [],
    schedules: [],
    selectedInstitution: null
  };
}

function saveData(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Error saving data:', e);
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(loadData);

  useEffect(() => {
    saveData(state);
  }, [state]);

  const login = (email: string, password: string): boolean => {
    const user = state.users.find(u => u.email === email && u.password === password);
    if (user) {
      setState(prev => ({ ...prev, currentUser: user }));
      return true;
    }
    return false;
  };

  const logout = () => {
    setState(prev => ({ ...prev, currentUser: null, selectedInstitution: null }));
  };

  const loadDemoData = () => {
    const demo = seedDemoData();
    setState(prev => ({
      ...prev,
      users: [...prev.users.filter(u => u.role === 'superadmin'), ...demo.users],
      licenses: [...prev.licenses, ...demo.licenses],
      institutions: [...prev.institutions, ...demo.institutions],
      levels: [...prev.levels, ...demo.levels],
      jornadas: [...prev.jornadas, ...demo.jornadas],
      subjects: [...prev.subjects, ...demo.subjects],
      subjectLoads: [...prev.subjectLoads, ...demo.subjectLoads],
      teachers: [...prev.teachers, ...demo.teachers],
      assignments: [...prev.assignments, ...demo.assignments],
    }));
  };

  const loginDemo = () => {
    const demo = seedDemoData();
    const demoUser = demo.users[0];
    setState(prev => ({
      ...prev,
      users: [...prev.users.filter(u => u.role === 'superadmin'), ...demo.users],
      licenses: [...prev.licenses, ...demo.licenses],
      institutions: [...prev.institutions, ...demo.institutions],
      levels: [...prev.levels, ...demo.levels],
      jornadas: [...prev.jornadas, ...demo.jornadas],
      subjects: [...prev.subjects, ...demo.subjects],
      subjectLoads: [...prev.subjectLoads, ...demo.subjectLoads],
      teachers: [...prev.teachers, ...demo.teachers],
      assignments: [...prev.assignments, ...demo.assignments],
      currentUser: demoUser
    }));
  };

  const registerUser = (userData: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...userData,
      id: generateId(),
      createdAt: new Date().toISOString()
    };
    setState(prev => ({ ...prev, users: [...prev.users, newUser] }));
  };

  const createLicense = (license: Omit<License, 'id'>) => {
    const newLicense: License = { ...license, id: generateId() };
    setState(prev => ({ ...prev, licenses: [...prev.licenses, newLicense] }));
  };

  const updateLicense = (id: string, updates: Partial<License>) => {
    setState(prev => ({
      ...prev,
      licenses: prev.licenses.map(l => l.id === id ? { ...l, ...updates } : l)
    }));
  };

  const suspendLicense = (id: string) => updateLicense(id, { status: 'suspended' });
  const activateLicense = (id: string) => updateLicense(id, { status: 'active' });

  const assignLicense = (userId: string, licenseId: string) => {
    const license = state.licenses.find(l => l.id === licenseId);
    if (!license) return;
    setState(prev => ({
      ...prev,
      users: prev.users.map(u => u.id === userId ? { ...u, license } : u)
    }));
  };

  const createInstitution = (inst: Omit<Institution, 'id' | 'createdAt'>): boolean => {
    const user = state.currentUser;
    if (!user || user.role !== 'user') return false;
    const userLicense = user.license;
    if (!userLicense) return false;
    
    const userInstitutions = state.institutions.filter(i => i.userId === user.id);
    if (userInstitutions.length >= userLicense.maxInstitutions) return false;

    const newInst: Institution = {
      ...inst,
      id: generateId(),
      createdAt: new Date().toISOString()
    };
    setState(prev => ({ ...prev, institutions: [...prev.institutions, newInst] }));
    return true;
  };

  const deleteInstitution = (id: string) => {
    setState(prev => ({
      ...prev,
      institutions: prev.institutions.filter(i => i.id !== id),
      levels: prev.levels.filter(l => l.institutionId !== id),
      jornadas: prev.jornadas.filter(j => j.institutionId !== id),
      subjects: prev.subjects.filter(s => s.institutionId !== id),
      subjectLoads: prev.subjectLoads.filter(sl => sl.institutionId !== id),
      teachers: prev.teachers.filter(t => t.institutionId !== id),
      assignments: prev.assignments.filter(a => a.institutionId !== id),
      schedules: prev.schedules.filter(s => s.institutionId !== id)
    }));
  };

  const setSelectedInstitution = (inst: Institution | null) => {
    setState(prev => ({ ...prev, selectedInstitution: inst }));
  };

  const createLevel = (level: Omit<Level, 'id'>) => {
    const newLevel: Level = { ...level, id: generateId() };
    setState(prev => ({ ...prev, levels: [...prev.levels, newLevel] }));
  };

  const deleteLevel = (id: string) => {
    setState(prev => ({
      ...prev,
      levels: prev.levels.filter(l => l.id !== id),
      subjectLoads: prev.subjectLoads.filter(sl => sl.levelId !== id),
      assignments: prev.assignments.filter(a => a.levelId !== id)
    }));
  };

  const createJornada = (j: Omit<Jornada, 'id'>) => {
    const newJ: Jornada = { ...j, id: generateId() };
    setState(prev => ({ ...prev, jornadas: [...prev.jornadas, newJ] }));
  };

  const deleteJornada = (id: string) => {
    setState(prev => ({ ...prev, jornadas: prev.jornadas.filter(j => j.id !== id) }));
  };

  const createSubject = (s: Omit<Subject, 'id'>) => {
    const newS: Subject = { ...s, id: generateId() };
    setState(prev => ({ ...prev, subjects: [...prev.subjects, newS] }));
  };

  const deleteSubject = (id: string) => {
    setState(prev => ({
      ...prev,
      subjects: prev.subjects.filter(s => s.id !== id),
      subjectLoads: prev.subjectLoads.filter(sl => sl.subjectId !== id),
      assignments: prev.assignments.filter(a => a.subjectId !== id)
    }));
  };

  const createSubjectLoad = (sl: Omit<SubjectLoad, 'id'>) => {
    const newSL: SubjectLoad = { ...sl, id: generateId() };
    setState(prev => ({ ...prev, subjectLoads: [...prev.subjectLoads, newSL] }));
  };

  const deleteSubjectLoad = (id: string) => {
    setState(prev => ({ ...prev, subjectLoads: prev.subjectLoads.filter(sl => sl.id !== id) }));
  };

  const createTeacher = (t: Omit<Teacher, 'id'>) => {
    const newT: Teacher = { ...t, id: generateId() };
    setState(prev => ({ ...prev, teachers: [...prev.teachers, newT] }));
  };

  const deleteTeacher = (id: string) => {
    setState(prev => ({
      ...prev,
      teachers: prev.teachers.filter(t => t.id !== id),
      assignments: prev.assignments.filter(a => a.teacherId !== id)
    }));
  };

  const createAssignment = (a: Omit<Assignment, 'id'>) => {
    const newA: Assignment = { ...a, id: generateId() };
    setState(prev => ({ ...prev, assignments: [...prev.assignments, newA] }));
  };

  const deleteAssignment = (id: string) => {
    setState(prev => ({ ...prev, assignments: prev.assignments.filter(a => a.id !== id) }));
  };

  const saveSchedule = (s: GeneratedSchedule) => {
    setState(prev => ({ ...prev, schedules: [...prev.schedules, s] }));
  };

  const deleteSchedule = (id: string) => {
    setState(prev => ({ ...prev, schedules: prev.schedules.filter(s => s.id !== id) }));
  };

  return (
    <AppContext.Provider value={{
      ...state,
      login, logout, loadDemoData, loginDemo, registerUser,
      createLicense, updateLicense, suspendLicense, activateLicense, assignLicense,
      createInstitution, deleteInstitution, setSelectedInstitution,
      createLevel, deleteLevel,
      createJornada, deleteJornada,
      createSubject, deleteSubject,
      createSubjectLoad, deleteSubjectLoad,
      createTeacher, deleteTeacher,
      createAssignment, deleteAssignment,
      saveSchedule, deleteSchedule
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
