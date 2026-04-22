import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';

const thStyle = { padding: '10px 12px', fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid var(--border-light)', background: 'var(--bg-subtle)', whiteSpace: 'nowrap' };
const tdStyle = { padding: '10px 12px', borderBottom: '1px solid var(--border-light)' };
const lbl = { fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' };

const MiniStat = ({ label, value }) => (
  <div style={{ textAlign: 'center', padding: '10px 14px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-lg)' }}>
    <p style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)', lineHeight: 1 }}>{value}</p>
    <p style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '4px' }}>{label}</p>
  </div>
);

const TeacherAttendance = () => {
  const { teachers, teacherAttendance, updateTeacherAttendance, addNotification } = useApp();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTeachers = useMemo(() => {
    return (teachers || []).filter(t => {
      if (searchTerm) {
        if (!t.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      }
      return true;
    }).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [teachers, searchTerm]);

  // Statistics
  const stats = useMemo(() => {
    let presents = 0, absents = 0, totalHours = 0;
    filteredTeachers.forEach(t => {
      const docId = `${t.id}_${selectedDate}`;
      const record = teacherAttendance.find(a => a.id === docId);
      if (record) {
        if (record.status === 'present') {
          presents++;
          // record.hours should be the numeric value (1.5, 2, 3.5, 4)
          totalHours += (record.hours || 0);
        }
        else if (record.status === 'absent') absents++;
      }
    });
    return { presents, absents, totalHours, total: filteredTeachers.length };
  }, [filteredTeachers, teacherAttendance, selectedDate]);

  const handleStatusChange = async (teacherId, status) => {
    try {
      const docId = `${teacherId}_${selectedDate}`;
      const record = teacherAttendance.find(a => a.id === docId);
      let hours = status === 'present' ? (record?.hours || 1.5) : 0; // Default to 1.5h (1h30)
      const moduleId = record?.moduleId || (teachers.find(t => t.id === teacherId)?.subjects?.[0] || '');
      await updateTeacherAttendance(teacherId, selectedDate, status, record?.comment || '', hours, moduleId);
    } catch (error) {
      console.error(error);
      addNotification("Erreur lors de l'enregistrement.");
    }
  };

  const handleModuleChange = async (teacherId, moduleId) => {
    try {
      const docId = `${teacherId}_selectedDate`; // Note: This doesn't match firestore ID, just logic check
      const record = teacherAttendance.find(a => a.id === `${teacherId}_${selectedDate}`);
      let status = record ? record.status : 'present';
      await updateTeacherAttendance(teacherId, selectedDate, status, record?.comment || '', record?.hours || 1.5, moduleId);
    } catch (error) {
      console.error(error);
    }
  };

  const handleHoursChange = async (teacherId, hours) => {
    try {
      const docId = `${teacherId}_${selectedDate}`;
      const record = teacherAttendance.find(a => a.id === docId);
      if (record?.status === 'present') {
        await updateTeacherAttendance(teacherId, selectedDate, 'present', record?.comment || '', hours, record?.moduleId || '');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCommentChange = async (teacherId, comment) => {
    const docId = `${teacherId}_${selectedDate}`;
    let record = teacherAttendance.find(a => a.id === docId);
    let status = record ? record.status : 'present'; 
    await updateTeacherAttendance(teacherId, selectedDate, status, comment, record?.hours || 1.5, record?.moduleId || '');
  };

  const exportCSV = () => {
    if (!filteredTeachers.length) return alert('Aucune donnée à exporter.');
    const headers = "\uFEFFFormateur,Module Enseigné,Date,Statut,Heures,Commentaire\n";
    const rows = filteredTeachers.map(t => {
      const docId = `${t.id}_${selectedDate}`;
      const r = teacherAttendance.find(a => a.id === docId) || {};
      const module = r.moduleId || (t.subjects || [t.subject])[0] || '';
      const hours = r.status === 'present' ? (r.hours || 0) : 0;
      return `"${t.name}","${module}","${selectedDate}","${r.status || 'non défini'}","${hours}","${r.comment || ''}"`;
    }).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a'); link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `Présences_Formateurs_${selectedDate}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  return (
    <div className="max-w-container section-padding">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', letterSpacing: '-0.03em', color: 'var(--text-primary)', marginBottom: '6px' }}>
            Présences Formateurs
          </h1>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '15px', marginBottom: '28px' }}>
            Suivi journalier du corps enseignant.
          </p>
        </div>
        <button onClick={exportCSV} className="btn-modern secondary" style={{ padding: '8px 16px', fontSize: '12px' }}>
          <i className="fa-solid fa-file-csv" style={{ marginRight: '6px' }}></i> Exporter (CSV)
        </button>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card" style={{ padding: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={lbl}>Date d'appel</label>
            <input type="date" className="input-premium" style={{ width: '100%', padding: '7px 12px', fontSize: '13px', cursor: 'pointer' }}
              value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={lbl}>Recherche</label>
            <div style={{ position: 'relative' }}>
               <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)', fontSize: '12px' }}></i>
               <input type="text" className="input-premium" style={{ width: '100%', paddingLeft: '30px' }} placeholder="Nom du formateur..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Summary */}
      {filteredTeachers.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <MiniStat label="Effectif Total" value={stats.total} />
          <MiniStat label="Présents" value={stats.presents} />
          <MiniStat label="Absents" value={stats.absents} />
          <MiniStat label="Total Heures" value={(() => {
            const h = Math.floor(stats.totalHours);
            const m = Math.round((stats.totalHours - h) * 60);
            return m > 0 ? `${h}h${m}min` : `${h}h`;
          })()} />
          <MiniStat label="Taux Présence" value={stats.total > 0 ? `${Math.round((stats.presents / stats.total) * 100)}%` : '—'} />
        </motion.div>
      )}

      {/* Table */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
        {filteredTeachers.length === 0 ? (
          <div className="glass-card" style={{ padding: '64px', textAlign: 'center' }}>
            <i className="fa-solid fa-chalkboard-user" style={{ fontSize: '36px', color: 'var(--border)', display: 'block', marginBottom: '12px' }}></i>
            <p style={{ color: 'var(--text-muted)', fontWeight: '500', fontSize: '14px' }}>Aucun formateur trouvé.</p>
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-light)', overflow: 'hidden', boxShadow: 'var(--shadow-xs)' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', minWidth: '600px' }}>
                <thead>
                  <tr>
                    <th style={{ ...thStyle, width: '40px', textAlign: 'center' }}>#</th>
                    <th style={thStyle}>Formateur</th>
                    <th style={thStyle}>Module de la Séance</th>
                    <th style={{ ...thStyle, textAlign: 'center', width: '150px' }}>Statut</th>
                    <th style={{ ...thStyle, textAlign: 'center', width: '130px' }}>Durée</th>
                    <th style={thStyle}>Remarque</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTeachers.map((teacher, idx) => {
                    const docId = `${teacher.id}_${selectedDate}`;
                    const record = teacherAttendance.find(a => a.id === docId);
                    const status = record?.status || '';
                    const comment = record?.comment || '';

                    return (
                      <motion.tr key={teacher.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: Math.min(idx * 0.02, 0.3) }}
                        style={{ background: idx % 2 === 0 ? 'white' : 'rgba(248,249,251,0.5)' }}>
                        <td style={{ ...tdStyle, textAlign: 'center' }}>
                          <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-faint)' }}>{idx + 1}</span>
                        </td>
                        <td style={tdStyle}>
                          <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{teacher.name}</p>
                        </td>
                        <td style={tdStyle}>
                          <select className="input-premium" 
                            style={{ fontSize: '11px', padding: '4px 8px', width: '100%', cursor: 'pointer', appearance: 'auto' }}
                            value={record?.moduleId || teacher.subjects?.[0] || ''}
                            onChange={(e) => handleModuleChange(teacher.id, e.target.value)}>
                            {(teacher.subjects || [teacher.subject]).map(sub => (
                              <option key={sub} value={sub}>{sub}</option>
                            ))}
                          </select>
                        </td>
                        <td style={{ ...tdStyle, textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', padding: '3px' }}>
                            <button onClick={() => handleStatusChange(teacher.id, 'present')}
                              style={{ padding: '6px 12px', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '11px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s',
                                background: status === 'present' ? '#16a34a' : 'transparent', color: status === 'present' ? 'white' : 'var(--text-muted)' }}>
                              Présent
                            </button>
                            <button onClick={() => handleStatusChange(teacher.id, 'absent')}
                              style={{ padding: '6px 12px', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '11px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s',
                                background: status === 'absent' ? '#dc2626' : 'transparent', color: status === 'absent' ? 'white' : 'var(--text-muted)' }}>
                              Absent
                            </button>
                          </div>
                        </td>
                        <td style={{ ...tdStyle, textAlign: 'center' }}>
                          {status === 'present' ? (
                            <div style={{ display: 'flex', gap: '4px', justifyItems: 'center' }}>
                              {[
                                { label: '1h30', val: 1.5 },
                                { label: '2h', val: 2 },
                                { label: '3h30', val: 3.5 },
                                { label: '4h', val: 4 }
                              ].map(h => (
                                <button key={h.label} onClick={() => handleHoursChange(teacher.id, h.val)}
                                  style={{ padding: '3px 6px', borderRadius: 'var(--radius-sm)', border: `1px solid ${record?.hours === h.val ? 'var(--primary)' : 'var(--border)'}`, 
                                    background: record?.hours === h.val ? 'var(--primary-ultra-light)' : 'white', 
                                    color: record?.hours === h.val ? 'var(--primary)' : 'var(--text-muted)', 
                                    fontSize: '10px', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                                  {h.label}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <span style={{ fontSize: '11px', color: 'var(--text-faint)' }}>—</span>
                          )}
                        </td>
                        <td style={tdStyle}>
                          <input type="text" className="input-premium" placeholder="Optionnel..." 
                            style={{ width: '100%', fontSize: '12px', padding: '6px 10px', background: 'transparent' }}
                            value={comment}
                            onChange={(e) => handleCommentChange(teacher.id, e.target.value)} />
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

export default TeacherAttendance;
