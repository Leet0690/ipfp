import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  setDoc,
  serverTimestamp,
  query,
  orderBy,
  getDocs,
  getDoc,
  where,
  limit
} from 'firebase/firestore';
import { db } from '../firebase';
import ConfirmModal from '../components/ConfirmModal';
import { useToast } from './ToastContext';

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

// ──────────────────────────────────────────────────────────
// Cache sessionStorage (TTL 30 min)
// ──────────────────────────────────────────────────────────
const CORE_CACHE_KEY = 'ipfp_v2_core_cache';
const FINANCE_CACHE_KEY = 'ipfp_v2_finance_cache';
const CORE_CACHE_TTL = 6 * 60 * 60 * 1000;
const FINANCE_CACHE_TTL = 15 * 60 * 1000;
const pendingLoads = new Map();
const makeToken = (length = 32) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = new Uint32Array(length);
  crypto.getRandomValues(values);
  return Array.from(values, (v) => chars[v % chars.length]).join('');
};
const readCache = (key, ttl) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.ts > ttl) return null;
    return parsed.data;
  } catch { return null; }
};
const writeCache = (key, data) => {
  try { localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data })); } catch (e) { }
};
const mergeById = (current, incoming) => {
  const map = new Map((current || []).map(item => [item.id, item]));
  incoming.forEach(item => map.set(item.id, item));
  return Array.from(map.values());
};

const getMonthBounds = (monthIndex, year) => {
  const start = new Date(year, monthIndex, 1);
  const end = new Date(year, monthIndex + 1, 0);
  const pad = (value) => String(value).padStart(2, '0');
  const toISO = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  return { start: toISO(start), end: toISO(end) };
};

export const AppProvider = ({ children }) => {
  const { showToast } = useToast();
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [grades, setGrades] = useState({});
  const [studentAttendance, setStudentAttendance] = useState([]);
  const [teacherAttendance, setTeacherAttendance] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [payments, setPayments] = useState([]);
  const [salaries, setSalaries] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const studentAttendanceKeysRef = useRef(new Set());
  const teacherAttendanceKeysRef = useRef(new Set());
  const financeLoadedRef = useRef(false);

  // Modal de confirmation global
  const [confirmState, setConfirmState] = useState({ 
    isOpen: false, title: '', message: '', type: 'danger', resolve: null 
  });

  const confirmAction = (options) => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        title: options.title || 'Confirmation',
        message: options.message || 'Êtes-vous sûr de vouloir continuer ?',
        type: options.type || 'danger',
        resolve
      });
    });
  };

  const handleConfirm = () => {
    if (confirmState.resolve) confirmState.resolve(true);
    setConfirmState(prev => ({ ...prev, isOpen: false }));
  };

  const handleCancel = () => {
    if (confirmState.resolve) confirmState.resolve(false);
    setConfirmState(prev => ({ ...prev, isOpen: false }));
  };

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('eco_auth') === 'true';
  });

  const [isDirectorAuth, setIsDirectorAuth] = useState(() => {
    return sessionStorage.getItem('ipfp_director_auth') === 'true';
  });

  // ──────────────────────────────────────────────────────────
  // OPTIMISATION FIREBASE (QUOTA) : Chargement ciblé et unique
  // Remplacement des `onSnapshot` par `getDocs` pour réduire drastiquement
  // les lectures de documents facturées par Firebase.
  // ──────────────────────────────────────────────────────────
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const path = window.location.pathname;
        const isTeacherPortal = path.startsWith('/portal/') || path.startsWith('/teacher/');
        const isStudentPortal = path.startsWith('/results/');

        if (isAuthenticated || isDirectorAuth) {
          // 1. Tentative de restauration depuis le cache local (0 lecture Firestore)
          const cached = readCache(CORE_CACHE_KEY, CORE_CACHE_TTL);
          if (cached && isMounted && Array.isArray(cached.students)) {
            setStudents(cached.students || []);
            setTeachers(cached.teachers || []);
            setGrades(cached.grades || {});
            setSchedules(cached.schedules || []);
            setModules(cached.modules || []);
            setLoading(false);
            return;
          }

          // 2. Core admin load only: no attendance or finance reads here.
          const coreLoadKey = 'admin-core';
          if (!pendingLoads.has(coreLoadKey)) {
            pendingLoads.set(coreLoadKey, Promise.all([
              getDocs(query(collection(db, 'students'), orderBy('createdAt', 'desc'))),
              getDocs(query(collection(db, 'teachers'), orderBy('createdAt', 'desc'))),
              getDocs(query(collection(db, 'grades'), limit(500))),
              getDocs(query(collection(db, 'schedules'), orderBy('createdAt', 'desc'), limit(500))),
              getDocs(query(collection(db, 'modules'), orderBy('name', 'asc')))
            ]).then(([stuSnap, teaSnap, graSnap, schSnap, modSnap]) => {
              const gradesData = {}; graSnap.docs.forEach(d => { gradesData[d.id] = d.data(); });
              const data = {
                students: stuSnap.docs.map(d => ({ id: d.id, ...d.data() })),
                teachers: teaSnap.docs.map(d => ({ id: d.id, ...d.data() })),
                grades: gradesData,
                schedules: schSnap.docs.map(d => ({ id: d.id, ...d.data() })),
                modules: modSnap.docs.map(d => ({ id: d.id, ...d.data() }))
              };
              writeCache(CORE_CACHE_KEY, data);
              return data;
            }).finally(() => {
              setTimeout(() => pendingLoads.delete(coreLoadKey), 5000);
            }));
          }

          const coreData = await pendingLoads.get(coreLoadKey);
          
          if (!isMounted) return;

          setStudents(coreData.students || []);
          setTeachers(coreData.teachers || []);
          setGrades(coreData.grades || {});
          setSchedules(coreData.schedules || []);
          setModules(coreData.modules || []);

        } else if (isStudentPortal) {
          // 2. Portail Stagiaire: Chargement EXCLUSIF des données de ce stagiaire
          const token = path.split('/').pop();
          const stuQuery = query(collection(db, 'students'), where('token', '==', token));
          const stuSnap = await getDocs(stuQuery);
          let studentDoc = stuSnap.docs[0];
          
          if (!studentDoc) {
            const docSnap = await getDoc(doc(db, 'students', token));
            if (docSnap.exists()) studentDoc = docSnap;
          }

          if (studentDoc && isMounted) {
            const studentData = studentDoc.data();
            setStudents([{ id: studentDoc.id, ...studentData }]);
            const gradeSnap = await getDoc(doc(db, 'grades', studentDoc.id));
            if (gradeSnap.exists()) {
              setGrades({ [studentDoc.id]: gradeSnap.data() });
            }
            // Modules: filter by student's diploma + major (much fewer reads)
            let modQuery;
            if (studentData.diploma && studentData.major) {
              modQuery = query(collection(db, 'modules'), 
                where('diploma', '==', studentData.diploma),
                where('major', '==', studentData.major));
            } else {
              modQuery = query(collection(db, 'modules'), orderBy('name', 'asc'));
            }
            const modSnap = await getDocs(modQuery);
            setModules(modSnap.docs.map(d => ({ id: d.id, ...d.data() })));
          }
        } else if (isTeacherPortal) {
          // 3. Portail Formateur: Chargement ciblé pour le formateur
          const token = path.split('/').pop();
          const [tSnap1, tSnap2] = await Promise.all([
            getDocs(query(collection(db, 'teachers'), where('tokenGrades', '==', token))),
            getDocs(query(collection(db, 'teachers'), where('tokenAttendance', '==', token)))
          ]);
          
          let teacherDoc = tSnap1.docs[0] || tSnap2.docs[0];
          if (!teacherDoc) {
              const docSnap = await getDoc(doc(db, 'teachers', token));
              if (docSnap.exists()) teacherDoc = docSnap;
          }

          if (teacherDoc && isMounted) {
            const teacherData = teacherDoc.data();
            setTeachers([{ id: teacherDoc.id, ...teacherData }]);
            
            // Schedules: only this teacher's sessions
            const schSnap = await getDocs(query(collection(db, 'schedules'), where('teacherId', '==', teacherDoc.id)));
            setSchedules(schSnap.docs.map(d => ({ id: d.id, ...d.data() })));

            // Students: only from the teacher's assigned groups
            const groups = teacherData.groups || [];
            let allStudents = [];
            if (groups.length > 0) {
              // Firestore 'in' supports max 10 values, batch if needed
              for (let i = 0; i < groups.length; i += 10) {
                const batch = groups.slice(i, i + 10);
                const stuSnap = await getDocs(query(collection(db, 'students'), where('major', 'in', batch)));
                allStudents = allStudents.concat(stuSnap.docs.map(d => ({ id: d.id, ...d.data() })));
              }
            }
            setStudents(allStudents);

            // Grades: only for the loaded students
            const gradesData = {};
            if (allStudents.length > 0) {
              const studentIds = allStudents.map(s => s.id);
              for (let i = 0; i < studentIds.length; i += 10) {
                const batch = studentIds.slice(i, i + 10);
                const graSnap = await getDocs(query(collection(db, 'grades'), where('__name__', 'in', batch)));
                graSnap.docs.forEach(d => { gradesData[d.id] = d.data(); });
              }
            }
            setGrades(gradesData);

            // Modules: load all (small collection, needed for grade display)
            const modSnap = await getDocs(query(collection(db, 'modules'), orderBy('name', 'asc')));
            setModules(modSnap.docs.map(d => ({ id: d.id, ...d.data() })));
          }
        } else {
          // Déconnecté (Page de login)
          setTeacherAttendance([]);
          setPayments([]);
          setSalaries([]);
          setStudentAttendance([]);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    return () => { isMounted = false; };
  }, [isAuthenticated, isDirectorAuth]);

  // Sync cache on mutations
  useEffect(() => {
    if (loading || !(isAuthenticated || isDirectorAuth)) return;
    writeCache(CORE_CACHE_KEY, {
      students, teachers, grades, schedules, modules
    });
  }, [students, teachers, grades, schedules, modules, loading, isAuthenticated, isDirectorAuth]);

  // Keep the core cache after logout until TTL; clear only runtime financial access.
  useEffect(() => {
    if (!isAuthenticated && !isDirectorAuth) {
      localStorage.removeItem(FINANCE_CACHE_KEY);
      financeLoadedRef.current = false;
    }
  }, [isAuthenticated, isDirectorAuth]);

  useEffect(() => {
    localStorage.setItem('eco_auth', isAuthenticated);
  }, [isAuthenticated]);

  useEffect(() => {
    sessionStorage.setItem('ipfp_director_auth', isDirectorAuth);
  }, [isDirectorAuth]);

  const login = (password) => {
    if (password === import.meta.env.VITE_ADMIN_PASSWORD) { 
      setIsAuthenticated(true); 
      showToast('Connexion réussie', 'success');
      return true; 
    }
    showToast('Mot de passe incorrect', 'error');
    return false;
  };

  const loginDirector = (password) => {
    if (password === import.meta.env.VITE_DIRECTOR_PASSWORD) { 
      setIsDirectorAuth(true); 
      showToast('Connexion direction réussie', 'success');
      return true; 
    }
    showToast('Mot de passe incorrect', 'error');
    return false;
  };

  const logoutDirector = () => {
    setIsDirectorAuth(false);
    showToast('Déconnexion direction effectuée');
  };
  
  const logout = () => {
    setIsAuthenticated(false);
    showToast('Déconnexion effectuée');
  };

  // --- STAGIAIRES ---
  const addStudent = async (studentData) => {
    const token = makeToken(32);
    const newStudent = { ...studentData, token, createdAt: serverTimestamp() };
    const docRef = await addDoc(collection(db, 'students'), newStudent);
    setStudents(prev => [{ id: docRef.id, ...newStudent }, ...prev]);
    showToast(`Nouveau stagiaire ajouté : ${studentData.lastName}.`, 'success');
    return token;
  };

  const updateStudent = async (id, data) => {
    await updateDoc(doc(db, 'students', id), data);
    setStudents(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
    showToast(`Profil stagiaire mis à jour.`, 'success');
  };

  const deleteStudent = async (id) => {
    await deleteDoc(doc(db, 'students', id));
    setStudents(prev => prev.filter(s => s.id !== id));
    showToast(`Stagiaire supprimé.`, 'warning');
  };

  // --- FORMATEURS ---
  const addTeacher = async (teacherData) => {
    const tokenGrades = makeToken(32);
    const tokenAttendance = makeToken(32);
    const newTeacher = { ...teacherData, tokenGrades, tokenAttendance, createdAt: serverTimestamp() };
    const docRef = await addDoc(collection(db, 'teachers'), newTeacher);
    setTeachers(prev => [{ id: docRef.id, ...newTeacher }, ...prev]);
    showToast(`Nouveau formateur ajouté : ${teacherData.name}.`, 'success');
    return { tokenGrades, tokenAttendance };
  };

  const updateTeacher = async (id, data) => {
    await updateDoc(doc(db, 'teachers', id), data);
    setTeachers(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
    showToast(`Profil formateur mis à jour.`, 'success');
  };

  const deleteTeacher = async (id) => {
    await deleteDoc(doc(db, 'teachers', id));
    setTeachers(prev => prev.filter(t => t.id !== id));
    showToast(`Formateur supprimé.`, 'warning');
  };

  const migrateTeacherTokens = async () => {
    const batch = [];
    const updatedTeachers = [];
    teachers.forEach(t => {
      if (!t.tokenGrades || !t.tokenAttendance) {
        const tokenGrades = makeToken(32);
        const tokenAttendance = makeToken(32);
        batch.push(updateDoc(doc(db, 'teachers', t.id), { tokenGrades, tokenAttendance }));
        updatedTeachers.push({ ...t, tokenGrades, tokenAttendance });
      } else {
        updatedTeachers.push(t);
      }
    });
    if (batch.length > 0) {
      await Promise.all(batch);
      setTeachers(updatedTeachers);
      showToast(`${batch.length} formateurs mis à jour avec de nouveaux jetons.`, 'success');
    }
  };

  // --- EMPLOI DU TEMPS ---
  const addSchedule = async (scheduleData) => {
    const newSchedule = { ...scheduleData, createdAt: serverTimestamp() };
    const docRef = await addDoc(collection(db, 'schedules'), newSchedule);
    setSchedules(prev => [{ id: docRef.id, ...newSchedule }, ...prev]);
    showToast(`Séance de ${scheduleData.module} ajoutée.`, 'success');
  };

  const deleteSchedule = async (id) => {
    await deleteDoc(doc(db, 'schedules', id));
    setSchedules(prev => prev.filter(s => s.id !== id));
    showToast(`Séance supprimée.`, 'warning');
  };

  const clearAllSchedules = async () => {
    const snapshot = await getDocs(query(collection(db, 'schedules')));
    await Promise.all(snapshot.docs.map(d => deleteDoc(d.ref)));
    setSchedules([]);
    showToast(`Emploi du temps vidé.`, 'warning');
  };

  // --- NOTES ---
  const updateGrades = async (studentId, subject, gradeData) => {
    const safeSubject = subject.replace(/\./g, '_');
    const gradeRef = doc(db, 'grades', studentId);
    await setDoc(gradeRef, { [safeSubject]: gradeData }, { merge: true });
    
    setGrades(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [safeSubject]: gradeData
      }
    }));
    showToast('Notes enregistrées', 'success');
  };

  // --- PRESENCES ---
  const updateStudentAttendance = async (studentId, moduleId, date, status, comment, formateurId = 'admin') => {
    const safeModule = moduleId.replace(/[^a-zA-Z0-9]/g, '_');
    const docId = `${studentId}_${safeModule}_${date}`;
    const newRecord = { studentId, moduleId, date, status, comment: comment || '', formateurId, timestamp: serverTimestamp() };
    
    await setDoc(doc(db, 'attendance_stagiaires', docId), newRecord, { merge: true });

    setStudentAttendance(prev => {
      const existingIdx = prev.findIndex(a => a.id === docId);
      const updatedRecord = { id: docId, ...newRecord };
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = updatedRecord;
        return updated;
      }
      return [...prev, updatedRecord];
    });
  };

  const loadAttendanceForSession = useCallback(async (moduleId, date) => {
    if (!moduleId || !date) return;
    const cacheKey = `${moduleId}:${date}`;
    if (studentAttendanceKeysRef.current.has(cacheKey)) return;
    try {
      const q = query(collection(db, 'attendance_stagiaires'), where('moduleId', '==', moduleId), where('date', '==', date));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setStudentAttendance(prev => mergeById(prev, data));
      studentAttendanceKeysRef.current.add(cacheKey);
    } catch (e) {
      console.error("Error loading session attendance:", e);
      showToast('Erreur de chargement des présences', 'error');
    }
  }, [showToast]);

  const loadStudentAttendanceForMonth = useCallback(async (monthIndex, year) => {
    const { start, end } = getMonthBounds(monthIndex, year);
    const cacheKey = `student-month:${year}-${monthIndex}`;
    if (studentAttendanceKeysRef.current.has(cacheKey)) return;
    try {
      const snapshot = await getDocs(query(
        collection(db, 'attendance_stagiaires'),
        where('date', '>=', start),
        where('date', '<=', end)
      ));
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setStudentAttendance(prev => mergeById(prev, data));
      studentAttendanceKeysRef.current.add(cacheKey);
    } catch (e) {
      console.error("Error loading monthly student attendance:", e);
      showToast('Erreur de chargement des présences mensuelles', 'error');
    }
  }, [showToast]);

  const loadTeacherAttendanceForDate = useCallback(async (date) => {
    if (!date) return;
    const cacheKey = `date:${date}`;
    if (teacherAttendanceKeysRef.current.has(cacheKey)) return;

    try {
      const snapshot = await getDocs(query(collection(db, 'attendance_formateurs'), where('date', '==', date)));
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setTeacherAttendance(prev => mergeById(prev, data));
      teacherAttendanceKeysRef.current.add(cacheKey);
    } catch (e) {
      console.error("Error loading teacher attendance:", e);
      showToast('Erreur de chargement des présences formateurs', 'error');
    }
  }, [showToast]);

  const loadTeacherAttendanceForMonth = useCallback(async (monthIndex, year) => {
    const { start, end } = getMonthBounds(monthIndex, year);
    const cacheKey = `month:${year}-${monthIndex}`;
    if (teacherAttendanceKeysRef.current.has(cacheKey)) return;

    try {
      const snapshot = await getDocs(query(
        collection(db, 'attendance_formateurs'),
        where('date', '>=', start),
        where('date', '<=', end)
      ));
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setTeacherAttendance(prev => mergeById(prev, data));
      teacherAttendanceKeysRef.current.add(cacheKey);
    } catch (e) {
      console.error("Error loading monthly teacher attendance:", e);
      showToast('Erreur de chargement des vacations mensuelles', 'error');
    }
  }, [showToast]);

  const updateTeacherAttendance = async (teacherId, date, status, comment, hours = 0, moduleId = '', timeSlot = '') => {
    const safeModule = (moduleId || 'global').replace(/[^a-zA-Z0-9]/g, '_');
    const safeTime = (timeSlot || '').replace(/[^0-9]/g, '') || 'x';
    const docId = `${teacherId}_${safeModule}_${safeTime}_${date}`;
    const data = { teacherId, date, status, hours: status === 'present' ? hours : 0, comment: comment || '', moduleId: moduleId || '', timeSlot: timeSlot || '', timestamp: serverTimestamp() };
    
    await setDoc(doc(db, 'attendance_formateurs', docId), data, { merge: true });
    
    setTeacherAttendance(prev => {
      const existingIdx = prev.findIndex(a => a.id === docId);
      const updatedRecord = { id: docId, ...data };
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = updatedRecord;
        return updated;
      }
      return [...prev, updatedRecord];
    });
    showToast('Présence formateur enregistrée', 'success');
  };

  // --- FINANCES ---
  const loadFinancialData = useCallback(async ({ force = false } = {}) => {
    if (financeLoadedRef.current && !force) return;

    const cached = readCache(FINANCE_CACHE_KEY, FINANCE_CACHE_TTL);
    if (cached && !force) {
      setPayments(cached.payments || []);
      setSalaries(cached.salaries || []);
      financeLoadedRef.current = true;
      return;
    }

    const financeLoadKey = 'finance';
    if (!pendingLoads.has(financeLoadKey)) {
      pendingLoads.set(financeLoadKey, Promise.all([
        getDocs(query(collection(db, 'payments'), orderBy('createdAt', 'desc'), limit(200))),
        getDocs(query(collection(db, 'salaries'), orderBy('createdAt', 'desc'), limit(200)))
      ]).then(([paySnap, salSnap]) => {
        const data = {
          payments: paySnap.docs.map(d => ({ id: d.id, ...d.data() })),
          salaries: salSnap.docs.map(d => ({ id: d.id, ...d.data() }))
        };
        writeCache(FINANCE_CACHE_KEY, data);
        return data;
      }).finally(() => {
        setTimeout(() => pendingLoads.delete(financeLoadKey), 5000);
      }));
    }

    try {
      const data = await pendingLoads.get(financeLoadKey);
      setPayments(data.payments || []);
      setSalaries(data.salaries || []);
      financeLoadedRef.current = true;
    } catch (e) {
      console.error("Error loading finance data:", e);
      showToast('Erreur de chargement financier', 'error');
    }
  }, [showToast]);

  const addPayment = async (paymentData) => {
    const newPayment = { ...paymentData, createdAt: serverTimestamp() };
    const docRef = await addDoc(collection(db, 'payments'), newPayment);
    setPayments(prev => [{ id: docRef.id, ...newPayment }, ...prev]);
    localStorage.removeItem(FINANCE_CACHE_KEY);
    showToast('Paiement enregistré', 'success');
  };

  const updatePayment = async (id, data) => {
    await updateDoc(doc(db, 'payments', id), data);
    setPayments(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
    localStorage.removeItem(FINANCE_CACHE_KEY);
    showToast('Paiement mis à jour', 'success');
  };

  const deletePayment = async (id) => {
    await deleteDoc(doc(db, 'payments', id));
    setPayments(prev => prev.filter(p => p.id !== id));
    localStorage.removeItem(FINANCE_CACHE_KEY);
    showToast('Paiement supprimé', 'warning');
  };

  const addSalary = async (salaryData) => {
    const newSalary = { ...salaryData, createdAt: serverTimestamp() };
    const docRef = await addDoc(collection(db, 'salaries'), newSalary);
    setSalaries(prev => [{ id: docRef.id, ...newSalary }, ...prev]);
    localStorage.removeItem(FINANCE_CACHE_KEY);
    showToast('Salaire enregistré', 'success');
  };

  const updateSalary = async (id, data) => {
    await updateDoc(doc(db, 'salaries', id), data);
    setSalaries(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
    localStorage.removeItem(FINANCE_CACHE_KEY);
    showToast('Salaire mis à jour', 'success');
  };

  const deleteSalary = async (id) => {
    await deleteDoc(doc(db, 'salaries', id));
    setSalaries(prev => prev.filter(s => s.id !== id));
    localStorage.removeItem(FINANCE_CACHE_KEY);
    showToast('Salaire supprimé', 'warning');
  };

  // --- MODULES ---
  const addModule = async (moduleData) => {
    const newModule = { ...moduleData, createdAt: serverTimestamp() };
    const docRef = await addDoc(collection(db, 'modules'), newModule);
    setModules(prev => [{ id: docRef.id, ...newModule }, ...prev]);
    showToast(`Nouveau module ajouté : ${moduleData.name}.`, 'success');
  };

  const updateModule = async (id, data) => {
    await updateDoc(doc(db, 'modules', id), data);
    setModules(prev => prev.map(m => m.id === id ? { ...m, ...data } : m));
    showToast(`Module mis à jour.`, 'success');
  };

  const deleteModule = async (id) => {
    await deleteDoc(doc(db, 'modules', id));
    setModules(prev => prev.filter(m => m.id !== id));
    showToast(`Module supprimé.`, 'warning');
  };

  return (
    <AppContext.Provider value={{
      students, teachers, grades, isAuthenticated, isDirectorAuth, loading,
      login, logout, loginDirector, logoutDirector,
      addStudent, addTeacher, updateStudent, updateTeacher, deleteStudent, deleteTeacher, updateGrades,
      studentAttendance, teacherAttendance, updateStudentAttendance, updateTeacherAttendance,
      loadAttendanceForSession, loadStudentAttendanceForMonth, loadTeacherAttendanceForDate, loadTeacherAttendanceForMonth,
      schedules, addSchedule, deleteSchedule, clearAllSchedules, migrateTeacherTokens,
      payments, salaries, loadFinancialData, addPayment, updatePayment, deletePayment, addSalary, updateSalary, deleteSalary,
      modules, addModule, updateModule, deleteModule,
      confirmAction
    }}>
      {children}
      <ConfirmModal 
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        type={confirmState.type}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </AppContext.Provider>
  );
};
