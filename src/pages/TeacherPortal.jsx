import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { getModulesForStudent } from '../data/modules';

/* ── Styles & Constants ── */
const thStyle = { padding: '12px 16px', fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid var(--border-light)', background: 'var(--bg-subtle)' };
const tdStyle = { padding: '12px 16px', borderBottom: '1px solid var(--border-light)' };
const selectStyle = { cursor: 'pointer', appearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2394a3b8\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px', paddingRight: '36px' };
const lblStyle = { fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' };

/* ── Components ── */
const GradeInput = ({ value, onChange, placeholder = '—' }) => (
  <input type="number" min="0" max="20" step="0.25" className="input-premium"
    style={{ width: '60px', textAlign: 'center', fontWeight: '600', padding: '5px 4px', fontSize: '13px', margin: '0 auto' }}
    placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
);

const TeacherPortal = () => {
  const { teacherId } = useParams();
  const navigate = useNavigate();
  const { teachers, students, updateGrades, grades, addNotification, loading, studentAttendance, updateStudentAttendance, schedules, updateTeacherAttendance } = useApp();
  
  const teacher = useMemo(() => {
    return teachers.find(t => t.tokenGrades === teacherId || t.tokenAttendance === teacherId || t.id === teacherId);
  }, [teachers, teacherId]);

  const accessMode = useMemo(() => {
    if (!teacher) return null;
    if (teacher.tokenAttendance === teacherId) return 'attendance';
    if (teacher.tokenGrades === teacherId) return 'grades';
    return 'full'; // For admin or internal navigation
  }, [teacher, teacherId]);

  // Lock tab based on token
  React.useEffect(() => {
    if (accessMode === 'attendance') setActiveTab('attendance');
    if (accessMode === 'grades') setActiveTab('grades');
  }, [accessMode]);
  
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedDiploma, setSelectedDiploma] = useState('');
  const [filterYear, setFilterYear] = useState('1ère année');
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('attendance'); // Default to attendance as requested
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceSuccess, setAttendanceSuccess] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const dayOfWeek = useMemo(() => {
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    return days[new Date(selectedDate).getDay()];
  }, [selectedDate]);

  // Find all scheduled sessions for this teacher today
  const todaysSessions = useMemo(() => {
    if (!teacher) return [];
    return (schedules || []).filter(s => s.teacherId === teacher.id && s.day === dayOfWeek);
  }, [teacher, schedules, dayOfWeek]);

  const [selectedSessionId, setSelectedSessionId] = useState('');
  
  const currentSession = useMemo(() => {
    if (selectedSessionId) return todaysSessions.find(s => s.id === selectedSessionId);
    return todaysSessions[0];
  }, [todaysSessions, selectedSessionId]);

  // Sync group/module when session changes
  React.useEffect(() => {
    if (currentSession) {
      setSelectedGroup(currentSession.filiere);
      setSelectedSubject(currentSession.module);
      setFilterYear(currentSession.annee);
    }
  }, [currentSession]);

  // Initialize selections once teacher is loaded
  React.useEffect(() => {
    if (teacher) {
      const diplomas = teacher.diplomas || (teacher.diploma ? [teacher.diploma] : []);
      if (diplomas.length > 0 && !selectedDiploma) {
        setSelectedDiploma(diplomas[0]);
      }
      if ((teacher.subjects || [teacher.subject]) && (teacher.subjects || [teacher.subject]).length > 0 && !selectedSubject) {
        setSelectedSubject((teacher.subjects || [teacher.subject])[0]);
      }
      if (teacher.groups && teacher.groups.length > 0 && !selectedGroup) {
        setSelectedGroup(teacher.groups[0]);
      }
      if (teacher.years && teacher.years.length > 0 && filterYear === '1ère année' && !teacher.years.includes('1ère année')) {
        setFilterYear(teacher.years[0]);
      }
    }
  }, [teacher, selectedSubject, selectedGroup, filterYear, selectedDiploma]);

  // Filter students based on selected group AND year AND diploma AND module
  const relevantStudents = useMemo(() => {
    return students.filter(s => {
      const groupMatch = s.major === selectedGroup;
      const yearMatch = s.year === filterYear;
      const diplomaMatch = !selectedDiploma || s.diploma === selectedDiploma;
      
      const studentModules = getModulesForStudent(s);
      const moduleMatch = !selectedSubject || studentModules.includes(selectedSubject);
      
      return groupMatch && yearMatch && diplomaMatch && moduleMatch;
    });
  }, [students, selectedGroup, filterYear, selectedDiploma, selectedSubject]);

  const allAttended = useMemo(() => {
    if (!relevantStudents || relevantStudents.length === 0 || !selectedSubject) return true;
    return relevantStudents.every(s => {
      const docId = `${s.id}_${selectedSubject.replace(/[^a-zA-Z0-9]/g, '_')}_${selectedDate}`;
      const record = studentAttendance.find(a => a.id === docId);
      return record && ['present', 'absent', 'retard'].includes(record.status);
    });
  }, [relevantStudents, selectedSubject, selectedDate, studentAttendance]);

  // Prevent closing the page if attendance is incomplete
  React.useEffect(() => {
    if (activeTab === 'attendance' && !allAttended) {
      const handleBeforeUnload = (e) => {
        e.preventDefault();
        e.returnValue = "Veuillez terminer l'appel pour tous les stagiaires avant de quitter.";
      };
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }
  }, [activeTab, allAttended]);

  // Loading state
  const isLoadingOrNoTeacher = loading && teachers.length === 0;

  if (isLoadingOrNoTeacher) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: '32px' }}>
        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="glass-card" style={{ padding: '48px', textAlign: 'center', maxWidth: '400px' }}>
           <i className="fa-solid fa-triangle-exclamation" style={{ color: '#f87171', fontSize: '40px', display: 'block', marginBottom: '16px' }}></i>
           <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '8px' }}>Accès refusé</h2>
           <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Identifiants invalides ou lien expiré.</p>
           <button onClick={() => navigate('/')} className="btn-modern primary" style={{ marginTop: '24px' }}>Retour</button>
        </motion.div>
      </div>
    );
  }

  const handleValidateAttendance = async () => {
    if (allAttended) {
      setAttendanceSuccess(true);
      
      // Automatically mark teacher as present when they validate the students' attendance
      try {
        await updateTeacherAttendance(
          teacher.id, 
          selectedDate, 
          'present', 
          `Appel validé pour le module: ${selectedSubject}`,
          4, // Default session hours
          selectedSubject
        );
      } catch (e) {
        console.error("Error updating teacher presence:", e);
      }

      addNotification("Appel enregistré et votre présence a été validée.");
      
      // Attempt to close the window after 1.5 seconds.
      setTimeout(() => {
        setIsFinished(true); // Show the success message in case window.close() is blocked
        try {
          window.close();
        } catch (e) {
          console.log("window.close() blocked by browser.");
        }
      }, 1500);
    } else {
      addNotification("Veuillez marquer l'état de présence de tous les stagiaires.");
    }
  };

  const handleGradeChange = (studentId, field, value) => {
    if (!selectedSubject) return;
    const current = grades[studentId]?.[selectedSubject] || { c1: '', c2: '', c3: '', efcfp: '', efcft: '' };
    updateGrades(studentId, selectedSubject, { ...current, [field]: value });
  };

  const handleSave = () => {
    setSuccess(true);
    addNotification(`Saisie synchronisée : ${teacher.name} — ${selectedSubject}.`);
    setTimeout(() => setSuccess(false), 2500);
  };

  const handleAttendanceChange = async (studentId, status) => {
    if (!selectedSubject) return;
    try {
      const docId = `${studentId}_${selectedSubject.replace(/[^a-zA-Z0-9]/g, '_')}_${selectedDate}`;
      const record = studentAttendance.find(a => a.id === docId);
      await updateStudentAttendance(studentId, selectedSubject, selectedDate, status, record?.comment || '', teacher.id);
    } catch (e) {
      console.error(e);
      addNotification("Erreur de sauvegarde.");
    }
  };

  const handleAttendanceComment = async (studentId, comment) => {
    if (!selectedSubject) return;
    try {
      const docId = `${studentId}_${selectedSubject.replace(/[^a-zA-Z0-9]/g, '_')}_${selectedDate}`;
      let record = studentAttendance.find(a => a.id === docId);
      let status = record ? record.status : 'present';
      await updateStudentAttendance(studentId, selectedSubject, selectedDate, status, comment, teacher.id);
    } catch (e) {}
  };

  const calcMoyenneCC = (g) => {
    if (!g || g.c1 === '' || g.c2 === '') return null;
    const c1 = parseFloat(g.c1), c2 = parseFloat(g.c2);
    if (isNaN(c1) || isNaN(c2)) return null;
    if (g.c3 !== '' && g.c3 !== undefined && g.c3 !== null) {
      const c3 = parseFloat(g.c3);
      if (!isNaN(c3)) return (c1 + c2 + c3) / 3;
    }
    return (c1 + c2) / 2;
  };

  if (isFinished) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-main)' }}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card" style={{ padding: '64px 48px', textAlign: 'center', maxWidth: '420px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '80px', height: '80px', background: '#16a34a', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', boxShadow: '0 8px 30px rgba(22, 163, 74, 0.3)' }}>
            <i className="fa-solid fa-check"></i>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)' }}>Appel Validé</h1>
          <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            L'appel pour la séance d'aujourd'hui a été enregistré avec succès.
          </p>
          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', fontWeight: '600' }}>
            Vous pouvez fermer cette fenêtre.
          </p>
          <button onClick={() => window.close()} className="btn-modern" style={{ marginTop: '12px', width: '100%', padding: '12px', fontSize: '13px' }}>
            Fermer <i className="fa-solid fa-xmark" style={{ marginLeft: '6px' }}></i>
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-container section-padding">
      {/* ── Context Info (New) ── */}
      {activeTab === 'attendance' && currentSession && (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
          className="glass-card" 
          style={{ padding: '16px 24px', marginBottom: '24px', background: 'var(--primary-ultra-light)', border: '1px solid rgba(139, 92, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          
          <div style={{ display: 'flex', gap: '32px' }}>
            <div>
              <label style={{ ...lblStyle, color: 'var(--primary)' }}>Date</label>
              <p style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)' }}>{selectedDate}</p>
            </div>
            <div>
              <label style={{ ...lblStyle, color: 'var(--primary)' }}>Heure</label>
              <p style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)' }}><i className="fa-regular fa-clock" style={{ marginRight: '6px' }}></i>{currentSession.time}</p>
            </div>
            <div>
              <label style={{ ...lblStyle, color: 'var(--primary)' }}>Groupe</label>
              <p style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)' }}>{currentSession.filiere} ({currentSession.annee})</p>
            </div>
            <div>
              <label style={{ ...lblStyle, color: 'var(--primary)' }}>Module</label>
              <p style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)' }}>{currentSession.module}</p>
            </div>
          </div>

          {todaysSessions.length > 1 && (
            <div style={{ minWidth: '200px' }}>
              <label style={lblStyle}>Changer de séance</label>
              <select className="input-premium" style={{ ...selectStyle, width: '100%', background: 'white' }} value={selectedSessionId || currentSession.id} onChange={(e) => setSelectedSessionId(e.target.value)}>
                {todaysSessions.map(s => <option key={s.id} value={s.id}>{s.time} - {s.module}</option>)}
              </select>
            </div>
          )}
        </motion.div>
      )}

      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
        className="glass-card"
        style={{ padding: '24px', marginBottom: '24px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-xl)', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', boxShadow: 'var(--shadow-glow)' }}>
            <i className="fa-solid fa-chalkboard-user"></i>
          </div>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', lineHeight: 1.2 }}>Bonjour, {teacher.name}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              <span className="badge-status success"><i className="fa-solid fa-wifi" style={{ fontSize: '8px' }}></i> Session en direct</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
          {accessMode === 'full' && (
            <div className="modern-tabs-container" style={{ marginBottom: '8px' }}>
              <button onClick={() => setActiveTab('attendance')} className={`modern-tab ${activeTab === 'attendance' ? 'active' : ''}`}>
                Saisie des Absences
              </button>
              <button onClick={() => setActiveTab('grades')} className={`modern-tab ${activeTab === 'grades' ? 'active' : ''}`}>
                Saisie des Notes
              </button>
            </div>
          )}
          
          {accessMode !== 'full' && (
             <div style={{ marginBottom: '8px' }}>
                <span className="badge-status" style={{ background: 'var(--primary-ultra-light)', color: 'var(--primary)', fontWeight: '800', fontSize: '11px', padding: '6px 12px' }}>
                   {activeTab === 'attendance' ? 'MODÈLE ABSENCES' : 'MODÈLE NOTES'}
                </span>
             </div>
          )}
          
          {activeTab === 'grades' && (
            <>
              <button onClick={handleSave} className="btn-modern primary" style={{ padding: '10px 20px', fontSize: '13px' }}>
                Enregistrer <i className="fa-solid fa-cloud-arrow-up" style={{ marginLeft: '4px', fontSize: '12px' }}></i>
              </button>
            </>
          )}

          {activeTab === 'attendance' && (
            <>
              <button 
                onClick={handleValidateAttendance} 
                className={`btn-modern ${allAttended ? 'primary' : ''}`} 
                style={{ padding: '10px 20px', fontSize: '13px', opacity: allAttended ? 1 : 0.6, cursor: allAttended ? 'pointer' : 'not-allowed' }}
              >
                Valider l'appel <i className="fa-solid fa-check" style={{ marginLeft: '4px', fontSize: '12px' }}></i>
              </button>
              <AnimatePresence>
                {attendanceSuccess && (
                  <motion.span initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    style={{ fontSize: '11px', fontWeight: '600', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <i className="fa-solid fa-circle-check"></i> Validé
                  </motion.span>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </motion.div>

      {/* ── Controls ── */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="glass-card" style={{ padding: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={lblStyle}>Date du jour</label>
            <input type="date" className="input-premium" style={{ width: '100%', padding: '7px 12px', fontSize: '13px', cursor: 'not-allowed', background: 'var(--bg-subtle)' }}
              value={selectedDate} disabled />
          </div>
          
          {activeTab === 'grades' && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={lblStyle}>Diplôme</label>
                <select className="input-premium" style={selectStyle} value={selectedDiploma} onChange={(e) => setSelectedDiploma(e.target.value)}>
                  {(teacher.diplomas || (teacher.diploma ? [teacher.diploma] : [])).map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={lblStyle}>Module</label>
                <select className="input-premium" style={selectStyle} value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
                  {(teacher.subjects || [teacher.subject]).map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={lblStyle}>Groupe (Filière)</label>
                <select className="input-premium" style={selectStyle} value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)}>
                  {(teacher.groups || []).map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={lblStyle}>Année</label>
                <select className="input-premium" style={selectStyle} value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
                  {(teacher.years && teacher.years.length > 0 ? teacher.years : ['1ère année', '2ème année']).map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {activeTab === 'attendance' && !currentSession && (
             <div style={{ gridColumn: 'span 2', padding: '12px', background: 'rgba(239, 68, 68, 0.05)', border: '1px dashed #f87171', borderRadius: 'var(--radius-md)', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ fontSize: '13px', color: '#dc2626', fontWeight: '600' }}>
                  <i className="fa-solid fa-calendar-xmark" style={{ marginRight: '8px' }}></i>
                  Aucune séance planifiée pour ce jour ({dayOfWeek}).
                </p>
             </div>
          )}
        </div>
      </motion.div>

      {/* ── Table Area ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        style={{ background: 'white', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-light)', overflow: 'hidden', boxShadow: 'var(--shadow-xs)' }}
      >
        {relevantStudents.length === 0 ? (
          <div style={{ padding: '64px', textAlign: 'center' }}>
            <i className="fa-solid fa-users-slash" style={{ fontSize: '42px', color: 'var(--border)', display: 'block', marginBottom: '16px', opacity: 0.5 }}></i>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '4px' }}>Liste vide</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Aucun stagiaire ne correspond aux critères actuels.</p>
          </div>
        ) : !selectedSubject ? (
          <div style={{ padding: '64px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', fontWeight: '500', fontSize: '14px' }}>Veuillez sélectionner un module pour continuer.</p>
          </div>
        ) : activeTab === 'grades' ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', minWidth: '850px' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Stagiaire</th>
                  <th style={{ ...thStyle, textAlign: 'center', width: '75px' }}>C1</th>
                  <th style={{ ...thStyle, textAlign: 'center', width: '75px' }}>C2</th>
                  <th style={{ ...thStyle, textAlign: 'center', width: '75px' }}>C3</th>
                  <th style={{ ...thStyle, textAlign: 'center', width: '85px', background: 'rgba(254,205,8,0.06)' }}>Moy CC</th>
                  <th style={{ ...thStyle, textAlign: 'center', width: '75px' }}>EFCFP</th>
                  <th style={{ ...thStyle, textAlign: 'center', width: '75px' }}>EFCFT</th>
                </tr>
              </thead>
              <tbody>
                {relevantStudents.map((student, idx) => {
                  const g = grades[student.id]?.[selectedSubject] || { c1: '', c2: '', c3: '', efcfp: '', efcft: '' };
                  const moyCC = calcMoyenneCC(g);

                  return (
                    <motion.tr key={student.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.02 }}
                      style={{ background: idx % 2 === 0 ? 'white' : 'rgba(248,249,251,0.5)' }}>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary-ultra-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700' }}>
                            {student.lastName[0]}
                          </div>
                          <div>
                            <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{student.lastName} {student.firstName}</p>
                            <p style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Matricule: {student.regNo} · {student.year}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'center' }}>
                        <GradeInput value={g.c1} onChange={(v) => handleGradeChange(student.id, 'c1', v)} />
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'center' }}>
                        <GradeInput value={g.c2} onChange={(v) => handleGradeChange(student.id, 'c2', v)} />
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'center' }}>
                        <GradeInput value={g.c3 || ''} onChange={(v) => handleGradeChange(student.id, 'c3', v)} placeholder="opt." />
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'center', background: 'rgba(254,205,8,0.03)' }}>
                        <span style={{ fontSize: '14px', fontWeight: '700', color: moyCC !== null ? 'var(--text-primary)' : 'var(--text-faint)' }}>
                          {moyCC !== null ? moyCC.toFixed(2) : '—'}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'center' }}>
                        <GradeInput value={g.efcfp} onChange={(v) => handleGradeChange(student.id, 'efcfp', v)} />
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'center' }}>
                        <GradeInput value={g.efcft} onChange={(v) => handleGradeChange(student.id, 'efcft', v)} />
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', minWidth: '700px' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Stagiaire</th>
                  <th style={{ ...thStyle, textAlign: 'center', width: '220px' }}>Statut</th>
                  <th style={thStyle}>Motif / Commentaire</th>
                </tr>
              </thead>
              <tbody>
                {relevantStudents.map((student, idx) => {
                  const docId = `${student.id}_${selectedSubject.replace(/[^a-zA-Z0-9]/g, '_')}_${selectedDate}`;
                  const record = studentAttendance.find(a => a.id === docId);
                  const status = record?.status || '';
                  const comment = record?.comment || '';

                  return (
                    <motion.tr key={student.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: Math.min(idx * 0.02, 0.3) }}
                      style={{ background: idx % 2 === 0 ? 'white' : 'rgba(248,249,251,0.5)' }}>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary-ultra-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700' }}>
                            {student.lastName[0]}
                          </div>
                          <div>
                            <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{student.lastName} {student.firstName}</p>
                            <p style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Matricule: {student.regNo}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', padding: '3px' }}>
                          <button onClick={() => handleAttendanceChange(student.id, 'present')}
                            style={{ padding: '6px 12px', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '11px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s',
                              background: status === 'present' ? '#16a34a' : 'transparent', color: status === 'present' ? 'white' : 'var(--text-muted)' }}>
                            Présent
                          </button>
                          <button onClick={() => handleAttendanceChange(student.id, 'absent')}
                            style={{ padding: '6px 12px', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '11px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s',
                              background: status === 'absent' ? '#dc2626' : 'transparent', color: status === 'absent' ? 'white' : 'var(--text-muted)' }}>
                            Absent
                          </button>
                          <button onClick={() => handleAttendanceChange(student.id, 'retard')}
                            style={{ padding: '6px 12px', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '11px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s',
                              background: status === 'retard' ? '#d97706' : 'transparent', color: status === 'retard' ? 'white' : 'var(--text-muted)' }}>
                            Retard
                          </button>
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <input type="text" className="input-premium" placeholder="Optionnel..." 
                          style={{ width: '100%', fontSize: '12px', padding: '6px 10px', background: 'transparent' }}
                          value={comment}
                          onChange={(e) => handleAttendanceComment(student.id, e.target.value)} />
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default TeacherPortal;
