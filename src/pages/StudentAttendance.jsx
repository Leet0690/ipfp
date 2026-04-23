import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { FILIERES, getModulesForFiliere } from '../data/modules';

const lbl = { fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' };
const thStyle = { padding: '10px 12px', fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid var(--border-light)', background: 'var(--bg-subtle)', whiteSpace: 'nowrap' };
const tdStyle = { padding: '10px 12px', borderBottom: '1px solid var(--border-light)' };
const selectStyle = { cursor: 'pointer', appearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2394a3b8\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px', paddingRight: '36px' };

const MiniStat = ({ label, value }) => (
  <div style={{ textAlign: 'center', padding: '10px 14px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-lg)' }}>
    <p style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)', lineHeight: 1 }}>{value}</p>
    <p style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '4px' }}>{label}</p>
  </div>
);

const StudentAttendance = () => {
  const { students, studentAttendance, updateStudentAttendance, addNotification, loading, schedules } = useApp();
  const [filterDiploma, setFilterDiploma] = useState('');
  const [filterMajor, setFilterMajor] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterModule, setFilterModule] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [success, setSuccess] = useState('');

  const dayOfWeek = useMemo(() => {
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    return days[new Date(selectedDate).getDay()];
  }, [selectedDate]);

  const filteredStudents = useMemo(() => {
    return (students || []).filter(s => {
      // Find if this student's group has a class today
      const hasClassToday = (schedules || []).some(sc => sc.filiere === s.major && sc.annee === s.year && sc.day === dayOfWeek);
      if (!hasClassToday) return false;

      if (filterDiploma && s.diploma !== filterDiploma) return false;
      if (filterMajor && s.major !== filterMajor) return false;
      if (filterYear && s.year !== filterYear) return false;
      if (searchTerm) {
        const full = `${s.lastName} ${s.firstName}`.toLowerCase();
        if (!full.includes(searchTerm.toLowerCase())) return false;
      }
      return true;
    }).sort((a, b) => (a.lastName || '').localeCompare(b.lastName || ''));
  }, [students, filterDiploma, filterMajor, filterYear, searchTerm, schedules, dayOfWeek]);

  const availableMajors = filterDiploma ? (FILIERES[filterDiploma] || []) : Array.from(new Set(students.map(s => s.major)));
  
  const availableModules = useMemo(() => {
    if (filterMajor && filterYear) {
      // Show modules actually scheduled for this group on this day
      const scheduledModules = (schedules || [])
        .filter(sc => sc.filiere === filterMajor && sc.annee === filterYear && sc.day === dayOfWeek)
        .map(sc => sc.module);
      
      if (scheduledModules.length > 0) return Array.from(new Set(scheduledModules));
      
      // Fallback to academic curriculum if no specific schedule found (though filtering above might hide students anyway)
      if (filterDiploma) return getModulesForFiliere(filterDiploma, filterMajor, filterYear);
    }
    return [];
  }, [filterDiploma, filterMajor, filterYear, schedules, dayOfWeek]);

  // Statistics for currently filtered students and current date/module
  const stats = useMemo(() => {
    let presents = 0, absents = 0, retards = 0;
    filteredStudents.forEach(s => {
      const docId = `${s.id}_${(filterModule || 'global').replace(/[^a-zA-Z0-9]/g, '_')}_${selectedDate}`;
      const record = studentAttendance.find(a => a.id === docId);
      if (record) {
        if (record.status === 'present') presents++;
        else if (record.status === 'absent') absents++;
        else if (record.status === 'retard') retards++;
      }
    });
    return { presents, absents, retards, total: filteredStudents.length };
  }, [filteredStudents, studentAttendance, filterModule, selectedDate]);

  const handleStatusChange = async (studentId, status) => {
    if (!filterModule) {
      alert("Veuillez d'abord sélectionner un module ou indiquer 'Général' s'il n'y a pas de sélection (nécessite l'adaptation du module).");
      return;
    }
    try {
      // Find existing comment
      const docId = `${studentId}_${(filterModule).replace(/[^a-zA-Z0-9]/g, '_')}_${selectedDate}`;
      const record = studentAttendance.find(a => a.id === docId);
      await updateStudentAttendance(studentId, filterModule, selectedDate, status, record?.comment || '', 'admin');
    } catch (error) {
      console.error(error);
      addNotification("Erreur lors de l'enregistrement de l'absence.");
    }
  };

  const handleCommentChange = async (studentId, comment) => {
    if (!filterModule) return;
    const docId = `${studentId}_${(filterModule).replace(/[^a-zA-Z0-9]/g, '_')}_${selectedDate}`;
    let record = studentAttendance.find(a => a.id === docId);
    let status = record ? record.status : 'present'; // default 
    await updateStudentAttendance(studentId, filterModule, selectedDate, status, comment, 'admin');
  };

  const exportCSV = () => {
    if (!filteredStudents.length) return alert('Aucune donnée à exporter.');
    const headers = "\uFEFFStagiaire,Matricule,Module,Date,Statut,Commentaire\n";
    const rows = filteredStudents.map(s => {
      const docId = `${s.id}_${(filterModule || 'global').replace(/[^a-zA-Z0-9]/g, '_')}_${selectedDate}`;
      const r = studentAttendance.find(a => a.id === docId) || {};
      return `"${s.lastName} ${s.firstName}","${s.regNo}","${filterModule}","${selectedDate}","${r.status || 'non défini'}","${r.comment || ''}"`;
    }).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a'); link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `Absences_Stagiaires_${selectedDate}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  return (
    <div className="max-w-container section-padding">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', letterSpacing: '-0.03em', color: 'var(--text-primary)', marginBottom: '6px' }}>
            Absences Stagiaires
          </h1>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '15px', marginBottom: '28px' }}>
            Enregistrement et suivi des présences par date et module.
          </p>
        </div>
        <button onClick={exportCSV} className="btn-modern secondary" style={{ padding: '8px 16px', fontSize: '12px' }}>
          <i className="fa-solid fa-file-csv" style={{ marginRight: '6px' }}></i> Exporter (CSV)
        </button>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card" style={{ padding: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={lbl}>Date</label>
            <input type="date" className="input-premium" style={{ width: '100%', padding: '7px 12px', fontSize: '13px', cursor: 'pointer' }}
              value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={lbl}>Niveau</label>
            <select className="input-premium" style={selectStyle} value={filterDiploma} onChange={(e) => { setFilterDiploma(e.target.value); setFilterMajor(''); setFilterModule(''); }}>
              <option value="">Tous</option>
              {Object.keys(FILIERES).map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={lbl}>Filière</label>
            <select className="input-premium" style={selectStyle} value={filterMajor} onChange={(e) => { setFilterMajor(e.target.value); setFilterModule(''); }}>
              <option value="">Toutes</option>
              {availableMajors.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={lbl}>Année</label>
            <select className="input-premium" style={selectStyle} value={filterYear} onChange={(e) => { setFilterYear(e.target.value); setFilterModule(''); }}>
              <option value="">Toutes</option>
              <option value="1ère année">1ère année</option>
              <option value="2ème année">2ème année</option>
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={lbl}>Module</label>
            <select className="input-premium" style={selectStyle} value={filterModule} onChange={(e) => setFilterModule(e.target.value)}>
              <option value="">(Sélectionnez un module)</option>
              {availableModules.map(m => <option key={m} value={m}>{m}</option>)}
              {availableModules.length === 0 && <option value="global">Global / Toute la journée</option>}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={lbl}>Recherche</label>
            <div style={{ position: 'relative' }}>
               <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)', fontSize: '12px' }}></i>
               <input type="text" className="input-premium" style={{ width: '100%', paddingLeft: '30px' }} placeholder="Nom ou prénom..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Summary */}
      {filteredStudents.length > 0 && filterModule && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <MiniStat label="Effectif" value={stats.total} />
          <MiniStat label="Présents" value={stats.presents} />
          <MiniStat label="Absents" value={stats.absents} />
          <MiniStat label="Retards" value={stats.retards} />
          <MiniStat label="Taux Présence" value={stats.total > 0 ? `${Math.round((stats.presents / stats.total) * 100)}%` : '—'} />
        </motion.div>
      )}

      {/* Table */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
        {filteredStudents.length === 0 ? (
          <div className="glass-card" style={{ padding: '64px', textAlign: 'center' }}>
            <i className="fa-solid fa-users" style={{ fontSize: '36px', color: 'var(--border)', display: 'block', marginBottom: '12px' }}></i>
            <p style={{ color: 'var(--text-muted)', fontWeight: '500', fontSize: '14px' }}>Aucun stagiaire trouvé.</p>
          </div>
        ) : !filterModule ? (
          <div className="glass-card" style={{ padding: '64px', textAlign: 'center' }}>
            <i className="fa-solid fa-hand-pointer" style={{ fontSize: '36px', color: 'var(--border)', display: 'block', marginBottom: '12px' }}></i>
            <p style={{ color: 'var(--text-muted)', fontWeight: '500', fontSize: '14px' }}>Veuillez sélectionner un module pour afficher la liste d'appel.</p>
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-light)', overflow: 'hidden', boxShadow: 'var(--shadow-xs)' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', minWidth: '700px' }}>
                <thead>
                  <tr>
                    <th style={{ ...thStyle, width: '40px', textAlign: 'center' }}>#</th>
                    <th style={thStyle}>Stagiaire</th>
                    <th style={thStyle}>Filière</th>
                    <th style={{ ...thStyle, textAlign: 'center', width: '220px' }}>Statut</th>
                    <th style={thStyle}>Motif / Commentaire</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student, idx) => {
                    const docId = `${student.id}_${(filterModule).replace(/[^a-zA-Z0-9]/g, '_')}_${selectedDate}`;
                    const record = studentAttendance.find(a => a.id === docId);
                    const status = record?.status || '';
                    const comment = record?.comment || '';

                    return (
                      <motion.tr key={student.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: Math.min(idx * 0.02, 0.3) }}
                        style={{ background: idx % 2 === 0 ? 'white' : 'rgba(248,249,251,0.5)' }}>
                        <td style={{ ...tdStyle, textAlign: 'center' }}>
                          <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-faint)' }}>{idx + 1}</span>
                        </td>
                        <td style={tdStyle}>
                          <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{student.lastName} {student.firstName}</p>
                          <p style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Matricule: {student.regNo}</p>
                        </td>
                        <td style={tdStyle}>
                          <span style={{ fontSize: '11px', fontWeight: '500', color: 'var(--text-secondary)' }}>{student.major}</span>
                        </td>
                        <td style={{ ...tdStyle, textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', padding: '3px' }}>
                            <button onClick={() => handleStatusChange(student.id, 'present')}
                              style={{ padding: '6px 12px', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '11px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s',
                                background: status === 'present' ? '#16a34a' : 'transparent', color: status === 'present' ? 'white' : 'var(--text-muted)' }}>
                              Présent
                            </button>
                            <button onClick={() => handleStatusChange(student.id, 'absent')}
                              style={{ padding: '6px 12px', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '11px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s',
                                background: status === 'absent' ? '#dc2626' : 'transparent', color: status === 'absent' ? 'white' : 'var(--text-muted)' }}>
                              Absent
                            </button>
                            <button onClick={() => handleStatusChange(student.id, 'retard')}
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
                            onChange={(e) => handleCommentChange(student.id, e.target.value)} />
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default StudentAttendance;
