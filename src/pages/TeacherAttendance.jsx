import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { MODULES_DATA } from '../data/modules';
import { TableSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import { 
  Users, 
  Calendar, 
  Search, 
  Download, 
  Clock, 
  UserCheck, 
  X, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  FileSpreadsheet,
  GraduationCap
} from 'lucide-react';

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
  } catch { return 0; }
};

const formatHours = (h) => {
  if (!h || h === 0) return '0h';
  const hrs = Math.floor(h);
  const mins = Math.round((h - hrs) * 60);
  return mins > 0 ? `${hrs}h${mins}m` : `${hrs}h`;
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
  const { teachers, teacherAttendance, updateTeacherAttendance, loadTeacherAttendanceForDate, schedules, loading } = useApp();
  const { showToast } = useToast();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');

  const dayOfWeek = useMemo(() => {
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    return days[new Date(selectedDate).getDay()];
  }, [selectedDate]);

  const sessionRows = useMemo(() => {
    const todaySessions = (schedules || []).filter(s => s.day === dayOfWeek);
    const slotsMap = new Map();
    
    todaySessions.forEach(session => {
      const teacher = (teachers || []).find(t => t.id === session.teacherId);
      if (!teacher) return;
      
      const normalizedTime = (session.time || '').replace(/[^0-9]/g, '');
      const safeTeacherName = (teacher.name || 'inconnu').toLowerCase().trim();
      const slotKey = `${safeTeacherName}_${normalizedTime}`;
      const abbr = getGroupAbbreviation(session.filiere, session.annee);

      if (slotsMap.has(slotKey)) {
        const existingRow = slotsMap.get(slotKey);
        if (!existingRow.groups.includes(abbr)) existingRow.groups.push(abbr);
        return;
      }
      
      if (searchTerm && !teacher.name.toLowerCase().includes(searchTerm.toLowerCase())) return;

      const duration = calcDuration(session.time);
      const safeModule = (session.module || 'global').replace(/[^a-zA-Z0-9]/g, '_');
      const safeTime = (session.time || '').replace(/[^0-9]/g, '') || 'x';
      const docId = `${teacher.id}_${safeModule}_${safeTime}_${selectedDate}`;
      
      slotsMap.set(slotKey, {
        key: slotKey,
        session, teacher, duration, docId,
        module: session.module, time: session.time, groups: [abbr],
      });
    });

    const rows = Array.from(slotsMap.values());
    rows.sort((a, b) => (a.teacher.name || '').localeCompare(b.teacher.name || '') || (a.time || '').localeCompare(b.time || ''));
    return rows;
  }, [schedules, teachers, dayOfWeek, searchTerm, selectedDate]);

  const stats = useMemo(() => {
    let presents = 0, absents = 0, totalHours = 0;
    sessionRows.forEach(row => {
      const record = teacherAttendance.find(a => a.id === row.docId);
      if (record) {
        if (record.status === 'present') { presents++; totalHours += (record.hours || 0); }
        else if (record.status === 'absent') { absents++; }
      }
    });
    return { presents, absents, totalHours, total: sessionRows.length };
  }, [sessionRows, teacherAttendance]);

  React.useEffect(() => {
    loadTeacherAttendanceForDate(selectedDate);
  }, [selectedDate, loadTeacherAttendanceForDate]);

  const handleStatusChange = async (row, status) => {
    try {
      const hours = status === 'present' ? row.duration : 0;
      await updateTeacherAttendance(row.teacher.id, selectedDate, status, '', hours, row.module, row.time);
    } catch (error) {
      showToast("Erreur lors de l'enregistrement.", 'error');
    }
  };

  const handleHoursChange = async (row, hours) => {
    try {
      const record = teacherAttendance.find(a => a.id === row.docId);
      const status = record?.status || 'present';
      await updateTeacherAttendance(row.teacher.id, selectedDate, status, record?.comment || '', hours, row.module, row.time);
    } catch (error) { console.error(error); }
  };

  const exportCSV = () => {
    if (!sessionRows.length) return showToast('Aucune donnée.', 'info');
    const headers = "\uFEFFFormateur,Module,Horaire,Groupes,Date,Statut,Heures\n";
    const rows = sessionRows.map(row => {
      const r = teacherAttendance.find(a => a.id === row.docId) || {};
      const hours = r.status === 'present' ? (r.hours || 0) : 0;
      return `"${row.teacher.name}","${row.module}","${row.time}","${row.groups.join(', ')}","${selectedDate}","${r.status || 'non défini'}","${hours}"`;
    }).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a'); link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `Presences_Formateurs_${selectedDate}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  return (
    <div className="max-w-container section-padding">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: '900', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <UserCheck size={28} style={{ color: 'var(--primary)' }} /> Présences Formateurs
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Suivi des vacations et pointage des séances de cours.</p>
        </div>
        <button onClick={exportCSV} className="btn-modern secondary">
          <FileSpreadsheet size={16} style={{ marginRight: '8px' }} /> Exporter (CSV)
        </button>
      </div>

      {/* Filters */}
      <div className="glass-card" style={{ padding: 'var(--space-5)', marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
          <div style={fGroup}>
            <label style={labelStyle}>Date d'appel</label>
            <div style={{ position: 'relative' }}>
              <Calendar size={14} style={fIcon} />
              <input type="date" className="input-premium" style={{ width: '100%', paddingLeft: '34px' }} value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
            </div>
          </div>
          <div style={fGroup}>
            <label style={labelStyle}>Jour de semaine</label>
            <div className="input-premium" style={{ background: 'var(--bg-subtle)', fontWeight: '800', color: 'var(--primary)', textAlign: 'center' }}>{dayOfWeek}</div>
          </div>
          <div style={fGroup}>
            <label style={labelStyle}>Recherche Formateur</label>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={fIcon} />
              <input type="text" className="input-premium" style={{ width: '100%', paddingLeft: '34px' }} placeholder="Nom..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      {sessionRows.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
          <MiniStat label="Séances" value={stats.total} />
          <MiniStat label="Présents" value={stats.presents} />
          <MiniStat label="Total Heures" value={formatHours(stats.totalHours)} />
          <MiniStat label="Taux" value={stats.total > 0 ? `${Math.round((stats.presents / stats.total) * 100)}%` : '—'} />
        </motion.div>
      )}

      {/* Main Area */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        {loading ? <TableSkeleton rows={8} /> : (
          sessionRows.length === 0 ? (
            <EmptyState title="Aucune séance" message={`Aucun cours n'est programmé dans l'emploi du temps pour ce ${dayOfWeek}.`} icon="calendar" />
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', minWidth: '850px' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-subtle)' }}>
                    <th style={{ ...thStyle, width: '50px', textAlign: 'center' }}>#</th>
                    <th style={thStyle}>Formateur</th>
                    <th style={thStyle}>Module & Horaire</th>
                    <th style={thStyle}>Groupes</th>
                    <th style={{ ...thStyle, textAlign: 'center', width: '100px' }}>Heures</th>
                    <th style={{ ...thStyle, textAlign: 'center', width: '220px' }}>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {sessionRows.map((row, idx) => {
                    const record = teacherAttendance.find(a => a.id === row.docId);
                    const status = record?.status || '';

                    return (
                      <tr key={row.key} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ ...tdStyle, textAlign: 'center' }}>
                          <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-faint)' }}>{idx + 1}</span>
                        </td>
                        <td style={tdStyle}><span style={{ fontWeight: '700' }}>{row.teacher.name}</span></td>
                        <td style={tdStyle}>
                          <p style={{ fontSize: 'var(--text-sm)', fontWeight: '700' }}>{row.module}</p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', marginTop: '2px' }}>
                            <Clock size={10} />
                            <span style={{ fontSize: '11px', fontWeight: '800' }}>{row.time}</span>
                          </div>
                        </td>
                        <td style={tdStyle}>
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            {row.groups.map(g => <span key={g} className="badge-status primary" style={{ fontSize: '9px', padding: '2px 6px' }}>{g}</span>)}
                          </div>
                        </td>
                        <td style={{ ...tdStyle, textAlign: 'center' }}>
                          <input type="number" step="0.5" className="input-premium" 
                            style={{ width: '64px', textAlign: 'center', padding: '4px', fontSize: '12px', fontWeight: '900' }}
                            value={record?.hours !== undefined ? record.hours : row.duration}
                            onChange={(e) => handleHoursChange(row, parseFloat(e.target.value) || 0)} />
                        </td>
                        <td style={{ ...tdStyle, textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-xl)', padding: '4px', gap: '2px' }}>
                            <StatusBtn active={status === 'present'} color="var(--success)" onClick={() => handleStatusChange(row, 'present')}>Présent</StatusBtn>
                            <StatusBtn active={status === 'absent'} color="var(--danger)" onClick={() => handleStatusChange(row, 'absent')}>Absent</StatusBtn>
                            {status && <button onClick={() => handleStatusChange(row, '')} className="action-btn" style={{ padding: '0 8px' }}><X size={14} /></button>}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
};

const StatusBtn = ({ active, color, children, onClick }) => (
  <button onClick={onClick}
    style={{ padding: '6px 14px', border: 'none', borderRadius: 'var(--radius-lg)', fontSize: '11px', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s',
      background: active ? color : 'transparent', color: active ? 'white' : 'var(--text-muted)' }}>
    {children}
  </button>
);

const MiniStat = ({ label, value }) => (
  <div style={{ padding: '12px 20px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-xl)', minWidth: '100px', textAlign: 'center' }}>
    <p style={{ fontSize: 'var(--text-xl)', fontWeight: '900', lineHeight: 1 }}>{value}</p>
    <p style={{ fontSize: '9px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '4px' }}>{label}</p>
  </div>
);

const labelStyle = { fontSize: '10px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px', display: 'block' };
const fGroup = { display: 'flex', flexDirection: 'column' };
const fIcon = { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' };
const thStyle = { padding: '16px', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' };
const tdStyle = { padding: '16px' };

export default TeacherAttendance;
