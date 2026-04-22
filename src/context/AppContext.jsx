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
  getDocs
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
  const [loading, setLoading] = useState(true);

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('eco_auth') === 'true';
  });

  // Real-time listeners
  useEffect(() => {
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

    const q = query(collection(db, 'notifications'), orderBy('timestamp', 'desc'));
    const unsubNotifs = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNotifications(data);
    });

    const unsubStudentAttendance = onSnapshot(collection(db, 'attendance_stagiaires'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStudentAttendance(data);
    });

    const unsubTeacherAttendance = onSnapshot(collection(db, 'attendance_formateurs'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTeacherAttendance(data);
    });

    setLoading(false);

    return () => {
      unsubStudents();
      unsubTeachers();
      unsubGrades();
      unsubNotifs();
      unsubStudentAttendance();
      unsubTeacherAttendance();
    };
  }, []);

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

  const login = (password) => {
    if (password === 'admin123') {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => setIsAuthenticated(false);

  const addStudent = async (studentData) => {
    const token = `stu-${studentData.lastName.toLowerCase()}-${Math.random().toString(36).substr(2, 5)}`;
    const newStudent = { ...studentData, token, createdAt: serverTimestamp() };
    await addDoc(collection(db, 'students'), newStudent);
    addNotification(`Nouveau stagiaire ajouté : ${studentData.lastName}.`);
    return token;
  };

  const addTeacher = async (teacherData) => {
    const token = `prof-${teacherData.name.toLowerCase().replace(/\s+/g, '-')}-${Math.random().toString(36).substr(2, 5)}`;
    const newTeacher = { ...teacherData, token, createdAt: serverTimestamp() };
    await addDoc(collection(db, 'teachers'), newTeacher);
    addNotification(`Nouveau formateur ajouté : ${teacherData.name}.`);
    return token;
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

  const updateGrades = async (studentId, subject, gradeData) => {
    const gradeRef = doc(db, 'grades', studentId);
    await setDoc(gradeRef, {
      [subject]: gradeData
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
    // Unique ID per teacher per date
    const docId = `${teacherId}_${date}`;
    const data = {
      teacherId,
      date,
      status,
      hours: status === 'present' ? hours : 0,
      comment: comment || '',
      timestamp: serverTimestamp()
    };
    if (moduleId) data.moduleId = moduleId;
    
    await setDoc(doc(db, 'attendance_formateurs', docId), data, { merge: true });
  };

  return (
    <AppContext.Provider value={{
      students,
      teachers,
      grades,
      notifications,
      isAuthenticated,
      loading,
      login,
      logout,
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
      updateTeacherAttendance
    }}>
      {!loading && children}
    </AppContext.Provider>
  );
};
