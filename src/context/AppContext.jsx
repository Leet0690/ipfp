import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [grades, setGrades] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [studentAttendance, setStudentAttendance] = useState([]);
  const [teacherAttendance, setTeacherAttendance] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [payments, setPayments] = useState([]);
  const [salaries, setSalaries] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

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
          // 1. Espace Admin: Chargement unique complet
          const [stuSnap, teaSnap, graSnap, schSnap, modSnap, attStuSnap, attTeaSnap, notSnap, paySnap, salSnap] = await Promise.all([
            getDocs(query(collection(db, 'students'), orderBy('createdAt', 'desc'))),
            getDocs(query(collection(db, 'teachers'), orderBy('createdAt', 'desc'))),
            getDocs(collection(db, 'grades')),
            getDocs(collection(db, 'schedules')),
            getDocs(query(collection(db, 'modules'), orderBy('name', 'asc'))),
            getDocs(collection(db, 'attendance_stagiaires')),
            getDocs(collection(db, 'attendance_formateurs')),
            getDocs(query(collection(db, 'notifications'), orderBy('timestamp', 'desc'), limit(100))),
            getDocs(query(collection(db, 'payments'), orderBy('createdAt', 'desc'), limit(100))),
            getDocs(query(collection(db, 'salaries'), orderBy('createdAt', 'desc'), limit(100)))
          ]);
          
          if (!isMounted) return;
          
          setStudents(stuSnap.docs.map(d => ({ id: d.id, ...d.data() })));
          setTeachers(teaSnap.docs.map(d => ({ id: d.id, ...d.data() })));
          const gradesData = {}; graSnap.docs.forEach(d => { gradesData[d.id] = d.data(); });
          setGrades(gradesData);
          setSchedules(schSnap.docs.map(d => ({ id: d.id, ...d.data() })));
          setModules(modSnap.docs.map(d => ({ id: d.id, ...d.data() })));
          setStudentAttendance(attStuSnap.docs.map(d => ({ id: d.id, ...d.data() })));
          setTeacherAttendance(attTeaSnap.docs.map(d => ({ id: d.id, ...d.data() })));
          setNotifications(notSnap.docs.map(d => ({ id: d.id, ...d.data() })));
          setPayments(paySnap.docs.map(d => ({ id: d.id, ...d.data() })));
          setSalaries(salSnap.docs.map(d => ({ id: d.id, ...d.data() })));

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
          setNotifications([]);
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

  useEffect(() => {
    localStorage.setItem('eco_auth', isAuthenticated);
  }, [isAuthenticated]);

  useEffect(() => {
    sessionStorage.setItem('ipfp_director_auth', isDirectorAuth);
  }, [isDirectorAuth]);

  const login = (password) => {
    if (password === 'admin123') { setIsAuthenticated(true); return true; }
    return false;
  };

  const loginDirector = (password) => {
    if (password === 'directrice2026') { setIsDirectorAuth(true); return true; }
    return false;
  };

  const logoutDirector = () => setIsDirectorAuth(false);
  const logout = () => setIsAuthenticated(false);

  const addNotification = async (message) => {
    const newNotif = { message, timestamp: new Date().toISOString(), read: false };
    const docRef = await addDoc(collection(db, 'notifications'), newNotif);
    setNotifications(prev => [{ id: docRef.id, ...newNotif }, ...prev]);
  };

  const markNotificationAsRead = async (id) => {
    await updateDoc(doc(db, 'notifications', id), { read: true });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearNotifications = async () => {
    const q = query(collection(db, 'notifications'));
    const snapshot = await getDocs(q);
    await Promise.all(snapshot.docs.map(d => deleteDoc(d.ref)));
    setNotifications([]);
  };

  // --- STAGIAIRES ---
  const addStudent = async (studentData) => {
    const token = Math.random().toString(36).substring(2, 11);
    const newStudent = { ...studentData, token, createdAt: serverTimestamp() };
    const docRef = await addDoc(collection(db, 'students'), newStudent);
    setStudents(prev => [{ id: docRef.id, ...newStudent }, ...prev]);
    addNotification(`Nouveau stagiaire ajouté : ${studentData.lastName}.`);
    return token;
  };

  const updateStudent = async (id, data) => {
    await updateDoc(doc(db, 'students', id), data);
    setStudents(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
    addNotification(`Profil stagiaire mis à jour.`);
  };

  const deleteStudent = async (id) => {
    await deleteDoc(doc(db, 'students', id));
    setStudents(prev => prev.filter(s => s.id !== id));
    addNotification(`Stagiaire supprimé.`);
  };

  // --- FORMATEURS ---
  const addTeacher = async (teacherData) => {
    const tokenGrades = Math.random().toString(36).substring(2, 11);
    const tokenAttendance = Math.random().toString(36).substring(2, 12);
    const newTeacher = { ...teacherData, tokenGrades, tokenAttendance, createdAt: serverTimestamp() };
    const docRef = await addDoc(collection(db, 'teachers'), newTeacher);
    setTeachers(prev => [{ id: docRef.id, ...newTeacher }, ...prev]);
    addNotification(`Nouveau formateur ajouté : ${teacherData.name}.`);
    return { tokenGrades, tokenAttendance };
  };

  const updateTeacher = async (id, data) => {
    await updateDoc(doc(db, 'teachers', id), data);
    setTeachers(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
    addNotification(`Profil formateur mis à jour.`);
  };

  const deleteTeacher = async (id) => {
    await deleteDoc(doc(db, 'teachers', id));
    setTeachers(prev => prev.filter(t => t.id !== id));
    addNotification(`Formateur supprimé.`);
  };

  const migrateTeacherTokens = async () => {
    const batch = [];
    const updatedTeachers = [];
    teachers.forEach(t => {
      if (!t.tokenGrades || !t.tokenAttendance) {
        const tokenGrades = Math.random().toString(36).substring(2, 11);
        const tokenAttendance = Math.random().toString(36).substring(2, 12);
        batch.push(updateDoc(doc(db, 'teachers', t.id), { tokenGrades, tokenAttendance }));
        updatedTeachers.push({ ...t, tokenGrades, tokenAttendance });
      } else {
        updatedTeachers.push(t);
      }
    });
    if (batch.length > 0) {
      await Promise.all(batch);
      setTeachers(updatedTeachers);
      addNotification(`${batch.length} formateurs mis à jour avec de nouveaux jetons.`);
    }
  };

  // --- EMPLOI DU TEMPS ---
  const addSchedule = async (scheduleData) => {
    const newSchedule = { ...scheduleData, createdAt: serverTimestamp() };
    const docRef = await addDoc(collection(db, 'schedules'), newSchedule);
    setSchedules(prev => [{ id: docRef.id, ...newSchedule }, ...prev]);
    addNotification(`Séance de ${scheduleData.module} ajoutée.`);
  };

  const deleteSchedule = async (id) => {
    await deleteDoc(doc(db, 'schedules', id));
    setSchedules(prev => prev.filter(s => s.id !== id));
    addNotification(`Séance supprimée.`);
  };

  const clearAllSchedules = async () => {
    const snapshot = await getDocs(query(collection(db, 'schedules')));
    await Promise.all(snapshot.docs.map(d => deleteDoc(d.ref)));
    setSchedules([]);
    addNotification(`Emploi du temps vidé.`);
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

  const loadAttendanceForSession = async (moduleId, date) => {
    try {
      const q = query(collection(db, 'attendance_stagiaires'), where('moduleId', '==', moduleId), where('date', '==', date));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setStudentAttendance(prev => {
        const existingIds = new Set(prev.map(a => a.id));
        const newRecords = data.filter(a => !existingIds.has(a.id));
        const updatedExisting = prev.map(a => {
          const fresh = data.find(d => d.id === a.id);
          return fresh || a;
        });
        return [...updatedExisting, ...newRecords];
      });
    } catch (e) {
      console.error("Error loading session attendance:", e);
    }
  };

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
  };

  // --- FINANCES ---
  const addPayment = async (paymentData) => {
    const newPayment = { ...paymentData, createdAt: serverTimestamp() };
    const docRef = await addDoc(collection(db, 'payments'), newPayment);
    setPayments(prev => [{ id: docRef.id, ...newPayment }, ...prev]);
  };

  const updatePayment = async (id, data) => {
    await updateDoc(doc(db, 'payments', id), data);
    setPayments(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
  };

  const deletePayment = async (id) => {
    await deleteDoc(doc(db, 'payments', id));
    setPayments(prev => prev.filter(p => p.id !== id));
  };

  const addSalary = async (salaryData) => {
    const newSalary = { ...salaryData, createdAt: serverTimestamp() };
    const docRef = await addDoc(collection(db, 'salaries'), newSalary);
    setSalaries(prev => [{ id: docRef.id, ...newSalary }, ...prev]);
  };

  const updateSalary = async (id, data) => {
    await updateDoc(doc(db, 'salaries', id), data);
    setSalaries(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
  };

  const deleteSalary = async (id) => {
    await deleteDoc(doc(db, 'salaries', id));
    setSalaries(prev => prev.filter(s => s.id !== id));
  };

  // --- MODULES ---
  const addModule = async (moduleData) => {
    const newModule = { ...moduleData, createdAt: serverTimestamp() };
    const docRef = await addDoc(collection(db, 'modules'), newModule);
    setModules(prev => [{ id: docRef.id, ...newModule }, ...prev]);
    addNotification(`Nouveau module ajouté : ${moduleData.name}.`);
  };

  const updateModule = async (id, data) => {
    await updateDoc(doc(db, 'modules', id), data);
    setModules(prev => prev.map(m => m.id === id ? { ...m, ...data } : m));
    addNotification(`Module mis à jour.`);
  };

  const deleteModule = async (id) => {
    await deleteDoc(doc(db, 'modules', id));
    setModules(prev => prev.filter(m => m.id !== id));
    addNotification(`Module supprimé.`);
  };

  return (
    <AppContext.Provider value={{
      students, teachers, grades, notifications, isAuthenticated, isDirectorAuth, loading,
      login, logout, loginDirector, logoutDirector,
      addStudent, addTeacher, updateStudent, updateTeacher, deleteStudent, deleteTeacher, updateGrades,
      addNotification, markNotificationAsRead, clearNotifications,
      studentAttendance, teacherAttendance, updateStudentAttendance, updateTeacherAttendance, loadAttendanceForSession,
      schedules, addSchedule, deleteSchedule, clearAllSchedules, migrateTeacherTokens,
      payments, salaries, addPayment, updatePayment, deletePayment, addSalary, updateSalary, deleteSalary,
      modules, addModule, updateModule, deleteModule
    }}>
      {children}
    </AppContext.Provider>
  );
};
