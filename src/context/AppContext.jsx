import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  setDoc,
  serverTimestamp,
  query,
  orderBy,
  getDocs,
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

  // Real-time listeners
  useEffect(() => {
    // 1. Données Publiques / Essentielles (Chargées pour tout le monde pour le portail formateur)
    const unsubStudents = onSnapshot(query(collection(db, 'students'), orderBy('createdAt', 'desc')), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStudents(data);
    });

    const unsubTeachers = onSnapshot(query(collection(db, 'teachers'), orderBy('createdAt', 'desc')), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTeachers(data);
    });

    const unsubGrades = onSnapshot(collection(db, 'grades'), (snapshot) => {
      const data = {};
      snapshot.docs.forEach(doc => {
        data[doc.id] = doc.data();
      });
      setGrades(data);
    });

    const unsubStudentAttendance = onSnapshot(collection(db, 'attendance_stagiaires'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStudentAttendance(data);
    });

    const unsubSchedules = onSnapshot(collection(db, 'schedules'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSchedules(data);
    });

    let unsubNotifs, unsubTeacherAttendance, unsubPayments, unsubSalaries, unsubModules;

    // 2. Données Admin Sensibles & Lourdes (Chargées UNIQUEMENT si l'admin/directrice est connecté)
    if (isAuthenticated || isDirectorAuth) {
      const qNotifs = query(collection(db, 'notifications'), orderBy('timestamp', 'desc'), limit(100));
      unsubNotifs = onSnapshot(qNotifs, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setNotifications(data);
      });

      unsubTeacherAttendance = onSnapshot(collection(db, 'attendance_formateurs'), (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTeacherAttendance(data);
      });

      const qPayments = query(collection(db, 'payments'), orderBy('createdAt', 'desc'), limit(100));
      unsubPayments = onSnapshot(qPayments, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPayments(data);
      });

      const qSalaries = query(collection(db, 'salaries'), orderBy('createdAt', 'desc'), limit(100));
      unsubSalaries = onSnapshot(qSalaries, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSalaries(data);
      });

      const qModules = query(collection(db, 'modules'), orderBy('name', 'asc'));
      unsubModules = onSnapshot(qModules, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setModules(data);
      });
    } else {
      // Vider les données si déconnecté pour libérer la mémoire
      setNotifications([]);
      setTeacherAttendance([]);
      setPayments([]);
      setSalaries([]);
      setModules([]);
    }

    setLoading(false);

    return () => {
      unsubStudents();
      unsubTeachers();
      unsubGrades();
      unsubStudentAttendance();
      unsubSchedules();
      
      if (unsubNotifs) unsubNotifs();
      if (unsubTeacherAttendance) unsubTeacherAttendance();
      if (unsubPayments) unsubPayments();
      if (unsubSalaries) unsubSalaries();
      if (unsubModules) unsubModules();
    };
  }, [isAuthenticated, isDirectorAuth]);

  // Data Migration (Local -> Firestore)
  useEffect(() => {
    const migrateData = async () => {
      try {
        const studentsSnapshot = await getDocs(collection(db, 'students'));
        if (studentsSnapshot.empty) {
          const localStudents = JSON.parse(localStorage.getItem('eco_students') || '[]');
          for (const s of localStudents) {
            const { id, ...rest } = s;
            await addDoc(collection(db, 'students'), rest);
          }
        }

        const teachersSnapshot = await getDocs(collection(db, 'teachers'));
        if (teachersSnapshot.empty) {
          const localTeachers = JSON.parse(localStorage.getItem('eco_teachers') || '[]');
          for (const t of localTeachers) {
            const { id, ...rest } = t;
            await addDoc(collection(db, 'teachers'), rest);
          }
        }

        const gradesSnapshot = await getDocs(collection(db, 'grades'));
        if (gradesSnapshot.empty) {
          const localGrades = JSON.parse(localStorage.getItem('eco_grades') || '{}');
          for (const studentId in localGrades) {
            await setDoc(doc(db, 'grades', studentId), localGrades[studentId]);
          }
        }
      } catch (err) {
        // Silently fail migration if it errors (e.g. partial writes)
      }
    };

    migrateData();
  }, []);

  useEffect(() => {
    localStorage.setItem('eco_auth', isAuthenticated);
  }, [isAuthenticated]);

  useEffect(() => {
    sessionStorage.setItem('ipfp_director_auth', isDirectorAuth);
  }, [isDirectorAuth]);

  const login = (password) => {
    if (password === 'admin123') {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const loginDirector = (password) => {
    if (password === 'directrice2026') {
      setIsDirectorAuth(true);
      return true;
    }
    return false;
  };

  const logoutDirector = () => setIsDirectorAuth(false);

  const logout = () => setIsAuthenticated(false);

  const addStudent = async (studentData) => {
    const token = Math.random().toString(36).substring(2, 11);
    const newStudent = { ...studentData, token, createdAt: serverTimestamp() };
    await addDoc(collection(db, 'students'), newStudent);
    addNotification(`Nouveau stagiaire ajouté : ${studentData.lastName}.`);
    return token;
  };

  const addTeacher = async (teacherData) => {
    const tokenGrades = Math.random().toString(36).substring(2, 11);
    const tokenAttendance = Math.random().toString(36).substring(2, 12);
    const newTeacher = { ...teacherData, tokenGrades, tokenAttendance, createdAt: serverTimestamp() };
    await addDoc(collection(db, 'teachers'), newTeacher);
    addNotification(`Nouveau formateur ajouté : ${teacherData.name}.`);
    return { tokenGrades, tokenAttendance };
  };

  const updateStudent = async (id, data) => {
    await updateDoc(doc(db, 'students', id), data);
    addNotification(`Profil stagiaire mis à jour : ${data.lastName || 'Identité'}.`);
  };

  const updateTeacher = async (id, data) => {
    await updateDoc(doc(db, 'teachers', id), data);
    addNotification(`Profil formateur mis à jour : ${data.name || 'Identité'}.`);
  };

  const deleteStudent = async (id) => {
    await deleteDoc(doc(db, 'students', id));
    addNotification(`Stagiaire supprimé de la base.`);
  };

  const deleteTeacher = async (id) => {
    await deleteDoc(doc(db, 'teachers', id));
    addNotification(`Formateur supprimé de la base.`);
  };

  const migrateTeacherTokens = async () => {
    const batch = [];
    teachers.forEach(t => {
      if (!t.tokenGrades || !t.tokenAttendance) {
        const tokenGrades = Math.random().toString(36).substring(2, 11);
        const tokenAttendance = Math.random().toString(36).substring(2, 12);
        batch.push(updateDoc(doc(db, 'teachers', t.id), { tokenGrades, tokenAttendance }));
      }
    });
    if (batch.length > 0) {
      await Promise.all(batch);
      addNotification(`${batch.length} formateur(s) mis à jour avec de nouveaux jetons.`);
    } else {
      addNotification("Tous les formateurs ont déjà leurs jetons.");
    }
  };

  const addSchedule = async (scheduleData) => {
    await addDoc(collection(db, 'schedules'), { ...scheduleData, createdAt: serverTimestamp() });
    addNotification(`Séance de ${scheduleData.module} ajoutée.`);
  };

  const deleteSchedule = async (id) => {
    await deleteDoc(doc(db, 'schedules', id));
    addNotification(`Séance supprimée.`);
  };

  const clearAllSchedules = async () => {
    const q = query(collection(db, 'schedules'));
    const snapshot = await getDocs(q);
    const batch = snapshot.docs.map(d => deleteDoc(d.ref));
    await Promise.all(batch);
    addNotification(`Emploi du temps vidé.`);
  };

  const updateGrades = async (studentId, subject, gradeData) => {
    const gradeRef = doc(db, 'grades', studentId);
    await setDoc(gradeRef, {
      [subject.replace(/\./g, '_')]: gradeData
    }, { merge: true });
  };

  const addNotification = async (message) => {
    await addDoc(collection(db, 'notifications'), {
      message,
      timestamp: new Date().toISOString(),
      read: false
    });
  };

  const markNotificationAsRead = async (id) => {
    await updateDoc(doc(db, 'notifications', id), { read: true });
  };

  const clearNotifications = async () => {
    const q = query(collection(db, 'notifications'));
    const snapshot = await getDocs(q);
    const batch = snapshot.docs.map(d => deleteDoc(d.ref));
    await Promise.all(batch);
  };

  const updateStudentAttendance = async (studentId, moduleId, date, status, comment, formateurId = 'admin') => {
    // Unique ID per student per module per date
    const docId = `${studentId}_${moduleId.replace(/[^a-zA-Z0-9]/g, '_')}_${date}`;
    await setDoc(doc(db, 'attendance_stagiaires', docId), {
      studentId,
      moduleId,
      date,
      status,
      comment: comment || '',
      formateurId,
      timestamp: serverTimestamp()
    }, { merge: true });
  };

  const updateTeacherAttendance = async (teacherId, date, status, comment, hours = 0, moduleId = '') => {
    // Unique ID per teacher per module per date (allows per-session tracking)
    const safeModule = (moduleId || 'global').replace(/[^a-zA-Z0-9]/g, '_');
    const docId = `${teacherId}_${safeModule}_${date}`;
    const data = {
      teacherId,
      date,
      status,
      hours: status === 'present' ? hours : 0,
      comment: comment || '',
      moduleId: moduleId || '',
      timestamp: serverTimestamp()
    };
    
    await setDoc(doc(db, 'attendance_formateurs', docId), data, { merge: true });
  };

  // ── Finance Functions ──
  const addPayment = async (paymentData) => {
    await addDoc(collection(db, 'payments'), { ...paymentData, createdAt: serverTimestamp() });
  };

  const updatePayment = async (id, data) => {
    await updateDoc(doc(db, 'payments', id), data);
  };

  const deletePayment = async (id) => {
    await deleteDoc(doc(db, 'payments', id));
  };

  const addSalary = async (salaryData) => {
    await addDoc(collection(db, 'salaries'), { ...salaryData, createdAt: serverTimestamp() });
  };

  const updateSalary = async (id, data) => {
    await updateDoc(doc(db, 'salaries', id), data);
  };

  const deleteSalary = async (id) => {
    await deleteDoc(doc(db, 'salaries', id));
  };

  const addModule = async (moduleData) => {
    await addDoc(collection(db, 'modules'), { ...moduleData, createdAt: serverTimestamp() });
    addNotification(`Nouveau module ajouté : ${moduleData.name}.`);
  };

  const updateModule = async (id, data) => {
    await updateDoc(doc(db, 'modules', id), data);
    addNotification(`Module mis à jour : ${data.name || 'Identité'}.`);
  };

  const deleteModule = async (id) => {
    await deleteDoc(doc(db, 'modules', id));
    addNotification(`Module supprimé de la base.`);
  };

  return (
    <AppContext.Provider value={{
      students,
      teachers,
      grades,
      notifications,
      isAuthenticated,
      isDirectorAuth,
      loading,
      login,
      logout,
      loginDirector,
      logoutDirector,
      addStudent,
      addTeacher,
      updateStudent,
      updateTeacher,
      deleteStudent,
      deleteTeacher,
      updateGrades,
      addNotification,
      markNotificationAsRead,
      clearNotifications,
      studentAttendance,
      teacherAttendance,
      updateStudentAttendance,
      updateTeacherAttendance,
      schedules,
      addSchedule,
      deleteSchedule,
      clearAllSchedules,
      migrateTeacherTokens,
      payments,
      salaries,
      addPayment,
      updatePayment,
      deletePayment,
      addSalary,
      updateSalary,
      deleteSalary,
      modules,
      addModule,
      updateModule,
      deleteModule
    }}>
      {!loading && children}
    </AppContext.Provider>
  );
};
