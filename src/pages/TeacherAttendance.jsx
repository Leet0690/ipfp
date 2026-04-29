import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { MODULES_DATA } from '../data/modules';

const thStyle = { padding: '10px 12px', fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid var(--border-light)', background: 'var(--bg-subtle)', whiteSpace: 'nowrap' };
const tdStyle = { padding: '10px 12px', borderBottom: '1px solid var(--border-light)' };
const lbl = { fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' };

const MiniStat = ({ label, value }) => (
  <div style={{ textAlign: 'center', padding: '10px 14px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-lg)' }}>
    <p style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)', lineHeight: 1 }}>{value}</p>
    <p style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '4px' }}>{label}</p>
  </div>
);

// Calculate duration in hours from a time range string like "08:00-11:30" or "08h30-11h30"
const calcDuration = (timeStr) => {
  if (!timeStr) return 0;
  const match = timeStr.match(/(\d{1,2})[h:]?(\d{2})?\s*[-–—]\s*(\d{1,2})[h:]?(\d{2})?/i);
  if (!match) return 0;
  try {
    const h1 = parseInt(match[1] || 0, 10);
    const m1 = parseInt(match[2] || 0, 10);
    const h2 = parseInt(match[3] || 0, 10);
    const m2 = parseInt(match[4] || 0, 10);
    const diffMinutes = (h2 * 60 + m2) - (h1 * 60 + m1);
    return Math.max(0, Math.round((diffMinutes / 60) * 100) / 100);
  } catch {
    return 0;
  }
};

// Format hours for display
const formatHours = (h) => {
  if (!h || h === 0) return '0h';
  const hrs = Math.floor(h);
  const mins = Math.round((h - hrs) * 60);
  return mins > 0 ? `${hrs}h${mins}min` : `${hrs}h`;
};

const getGroupAbbreviation = (filiere, annee) => {
  let diplomaAbbr = "";
  let majorAbbr = "";
  for (const dip in MODULES_DATA) {
    if (MODULES_DATA[dip][filiere]) {
      diplomaAbbr = dip.includes('Spécialisé') ? "TS" : "T";
      break;
    }
  }
  if (filiere.includes('Développement')) majorAbbr = "DI";
  else if (filiere.includes('Gestion Informatisée')) majorAbbr = "GI";
  else if (filiere.includes('Logistique')) majorAbbr = "GTL";
  else if (filiere.includes('Entreprises')) majorAbbr = "GE";
  else majorAbbr = filiere.split(' ').map(w => w[0]).join('').toUpperCase();
  const yearNum = annee.includes('1') ? "1" : "2";
  return diplomaAbbr + majorAbbr + yearNum;
};

const TeacherAttendance = () => {
  const { teachers, teacherAttendance, updateTeacherAttendance, addNotification, schedules } = useApp();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');

  const dayOfWeek = useMemo(() => {
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    return days[new Date(selectedDate).getDay()];
  }, [selectedDate]);

  // Build a flat list of rows: one per unique (teacher × time) for this day
  const sessionRows = useMemo(() => {
    const todaySessions = (schedules || []).filter(s => s.day === dayOfWeek);
    const slotsMap = new Map(); // teacherId_normalizedTime -> row object
    
    todaySessions.forEach(session => {
      const teacher = (teachers || []).find(t => t.id === session.teacherId);
      if (!teacher) return;
      
      const normalizedTime = (session.time || '').replace(/[^0-9]/g, '');
      const safeTeacherName = (teacher.name || 'inconnu').toLowerCase().trim();
      const slotKey = `${safeTeacherName}_${normalizedTime}`;
      
      const abbr = getGroupAbbreviation(session.filiere, session.annee);

      if (slotsMap.has(slotKey)) {
        const existingRow = slotsMap.get(slotKey);
        if (!existingRow.groups.includes(abbr)) {
          existingRow.groups.push(abbr);
        }
        return;
      }
      
      // Search filter
      if (searchTerm && !teacher.name.toLowerCase().includes(searchTerm.toLowerCase())) return;

      const duration = calcDuration(session.time);
      const safeModule = (session.module || 'global').replace(/[^a-zA-Z0-9]/g, '_');
      const safeTime = (session.time || '').replace(/[^0-9]/g, '') || 'x';
      const docId = `${teacher.id}_${safeModule}_${safeTime}_${selectedDate}`;
      
      slotsMap.set(slotKey, {
        key: slotKey,
        session,
        teacher,
        duration,
        docId,
        module: session.module,
        time: session.time,
        groups: [abbr],
      });
    });

    const rows = Array.from(slotsMap.values());

    // Sort by teacher name, then by time
    rows.sort((a, b) => {
      const nameComp = (a.teacher.name || '').localeCompare(b.teacher.name || '');
      if (nameComp !== 0) return nameComp;
      return (a.time || '').localeCompare(b.time || '');
    });

    return rows;
  }, [schedules, teachers, dayOfWeek, searchTerm, selectedDate]);

  // Statistics
  const stats = useMemo(() => {
    let presents = 0, absents = 0, totalHours = 0, total = sessionRows.length;
    sessionRows.forEach(row => {
      const record = teacherAttendance.find(a => a.id === row.docId);
      if (record) {
        if (record.status === 'present') {
          presents++;
          totalHours += (record.hours || 0);
        } else if (record.status === 'absent') {
          absents++;
        }
      }
    });
    return { presents, absents, totalHours, total };
  }, [sessionRows, teacherAttendance]);

  const handleStatusChange = async (row, status) => {
    try {
      const hours = status === 'present' ? row.duration : 0;
      await updateTeacherAttendance(row.teacher.id, selectedDate, status, '', hours, row.module, row.time);
    } catch (error) {
      console.error(error);
      addNotification("Erreur lors de l'enregistrement.");
    }
  };

  const handleHoursChange = async (row, hours) => {
    try {
      const record = teacherAttendance.find(a => a.id === row.docId);
      const status = record?.status || 'present';
      await updateTeacherAttendance(row.teacher.id, selectedDate, status, record?.comment || '', hours, row.module, row.time);
    } catch (error) {
      console.error(error);
    }
  };

  const exportCSV = () => {
    if (!sessionRows.length) return alert('Aucune donnée à exporter.');
    const headers = "\uFEFFFormateur,Module,Horaire,Filière,Année,Date,Statut,Heures\n";
    const rows = sessionRows.map(row => {
      const r = teacherAttendance.find(a => a.id === row.docId) || {};
      const hours = r.status === 'present' ? (r.hours || 0) : 0;
      return `"${row.teacher.name}","${row.module}","${row.time}","${row.filiere}","${row.annee}","${selectedDate}","${r.status || 'non défini'}","${hours}"`;
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
            Suivi journalier par séance — chaque module est suivi indépendamment.
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
            <label style={lbl}>Jour</label>
            <div className="input-premium" style={{ padding: '7px 12px', fontSize: '13px', background: 'var(--bg-subtle)', fontWeight: '700', color: 'var(--primary)' }}>
              {dayOfWeek}
            </div>
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
      {sessionRows.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <MiniStat label="Séances" value={stats.total} />
          <MiniStat label="Présents" value={stats.presents} />
          <MiniStat label="Absents" value={stats.absents} />
          <MiniStat label="Total Heures" value={formatHours(stats.totalHours)} />
          <MiniStat label="Taux Présence" value={stats.total > 0 ? `${Math.round((stats.presents / stats.total) * 100)}%` : '—'} />
        </motion.div>
      )}

      {/* Table */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
        {sessionRows.length === 0 ? (
          <div className="glass-card" style={{ padding: '64px', textAlign: 'center' }}>
            <i className="fa-solid fa-chalkboard-user" style={{ fontSize: '36px', color: 'var(--border)', display: 'block', marginBottom: '12px' }}></i>
            <p style={{ color: 'var(--text-muted)', fontWeight: '500', fontSize: '14px' }}>Aucune séance planifiée pour {dayOfWeek}.</p>
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-light)', overflow: 'hidden', boxShadow: 'var(--shadow-xs)' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', minWidth: '700px' }}>
                <thead>
                  <tr>
                    <th style={{ ...thStyle, width: '40px', textAlign: 'center' }}>#</th>
                    <th style={thStyle}>Formateur</th>
                    <th style={thStyle}>Module</th>
                    <th style={thStyle}>Horaire</th>
                    <th style={thStyle}>Groupe</th>
                    <th style={{ ...thStyle, textAlign: 'center', width: '90px' }}>Durée</th>
                    <th style={{ ...thStyle, textAlign: 'center', width: '150px' }}>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {sessionRows.map((row, idx) => {
                    const record = teacherAttendance.find(a => a.id === row.docId);
                    const status = record?.status || '';

                    return (
                      <motion.tr key={row.key} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: Math.min(idx * 0.02, 0.3) }}
                        style={{ background: idx % 2 === 0 ? 'white' : 'rgba(248,249,251,0.5)' }}>
                        <td style={{ ...tdStyle, textAlign: 'center' }}>
                          <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-faint)' }}>{idx + 1}</span>
                        </td>
                        <td style={tdStyle}>
                          <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{row.teacher.name}</p>
                        </td>
                        <td style={tdStyle}>
                          <p style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)' }}>{row.module}</p>
                        </td>
                        <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>
                          <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--primary)', background: 'var(--primary-ultra-light)', padding: '3px 8px', borderRadius: 'var(--radius-sm)' }}>
                            <i className="fa-regular fa-clock" style={{ marginRight: '4px', fontSize: '10px' }}></i>
                            {row.time?.replace(/\s/g, '').replace(/h/gi, ':')}
                          </span>
                        </td>
                        <td style={tdStyle}>
                          <span style={{ fontSize: '11px', fontWeight: '500', color: 'var(--text-secondary)' }}>
                            {row.groups.join(', ')}
                          </span>
                        </td>
                        <td style={{ ...tdStyle, textAlign: 'center' }}>
                          <input 
                            type="number" 
                            min="0" max="12" step="0.5" 
                            className="input-premium"
                            style={{ width: '60px', textAlign: 'center', fontSize: '12px', fontWeight: '800', padding: '4px', margin: '0 auto', display: 'block' }}
                            value={record?.hours !== undefined ? record.hours : row.duration}
                            onChange={(e) => handleHoursChange(row, parseFloat(e.target.value) || 0)}
                          />
                        </td>
                        <td style={{ ...tdStyle, textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', padding: '3px' }}>
                            <button onClick={() => handleStatusChange(row, 'present')}
                              style={{ padding: '6px 12px', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '11px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s',
                                background: status === 'present' ? '#16a34a' : 'transparent', color: status === 'present' ? 'white' : 'var(--text-muted)' }}>
                              Présent
                            </button>
                            <button onClick={() => handleStatusChange(row, 'absent')}
                              style={{ padding: '6px 12px', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '11px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s',
                                background: status === 'absent' ? '#dc2626' : 'transparent', color: status === 'absent' ? 'white' : 'var(--text-muted)' }}>
                              Absent
                            </button>
                          </div>
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
