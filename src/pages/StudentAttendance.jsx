import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { FILIERES, getModulesForFiliere } from '../data/modules';
import { TableSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import { 
  UserCheck, 
  FileSpreadsheet, 
  Search, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Users, 
  Filter,
  MousePointer2,
  Download,
  MoreVertical
} from 'lucide-react';

const StudentAttendance = () => {
  const { students, studentAttendance, updateStudentAttendance, loadAttendanceForSession, loading, schedules } = useApp();
  const { showToast } = useToast();
  const [filterDiploma, setFilterDiploma] = useState('');
  const [filterMajor, setFilterMajor] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterModule, setFilterModule] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');

  const dayOfWeek = useMemo(() => {
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    return days[new Date(selectedDate).getDay()];
  }, [selectedDate]);

  const filteredStudents = useMemo(() => {
    return (students || []).filter(s => {
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
      const scheduledModules = (schedules || [])
        .filter(sc => sc.filiere === filterMajor && sc.annee === filterYear && sc.day === dayOfWeek)
        .map(sc => sc.module);
      
      if (scheduledModules.length > 0) return Array.from(new Set(scheduledModules));
      if (filterDiploma) return getModulesForFiliere(filterDiploma, filterMajor, filterYear);
    }
    return [];
  }, [filterDiploma, filterMajor, filterYear, schedules, dayOfWeek]);

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

  React.useEffect(() => {
    if (filterModule && selectedDate) {
      loadAttendanceForSession(filterModule, selectedDate);
    }
  }, [filterModule, selectedDate, loadAttendanceForSession]);

  const handleStatusChange = async (studentId, status) => {
    if (!filterModule) {
      showToast("Veuillez d'abord sélectionner un module.", 'warning');
      return;
    }
    try {
      const docId = `${studentId}_${(filterModule).replace(/[^a-zA-Z0-9]/g, '_')}_${selectedDate}`;
      const record = studentAttendance.find(a => a.id === docId);
      await updateStudentAttendance(studentId, filterModule, selectedDate, status, record?.comment || '', 'admin');
    } catch (error) {
      showToast("Erreur lors de l'enregistrement.", 'error');
    }
  };

  const handleCommentChange = async (studentId, comment) => {
    if (!filterModule) return;
    const docId = `${studentId}_${(filterModule).replace(/[^a-zA-Z0-9]/g, '_')}_${selectedDate}`;
    let record = studentAttendance.find(a => a.id === docId);
    let status = record ? record.status : 'present'; 
    await updateStudentAttendance(studentId, filterModule, selectedDate, status, comment, 'admin');
  };

  const exportCSV = () => {
    if (!filteredStudents.length) return showToast('Aucune donnée.', 'info');
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: '900', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <UserCheck size={28} style={{ color: 'var(--primary)' }} /> Absences Stagiaires
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Feuilles d'appel et suivi quotidien par module.</p>
        </div>
        <button onClick={exportCSV} className="btn-modern secondary">
          <Download size={16} style={{ marginRight: '8px' }} /> Exporter (CSV)
        </button>
      </div>

      {/* Filters */}
      <div className="glass-card" style={{ padding: 'var(--space-5)', marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-4)' }}>
          <div style={filterGroupStyle}>
            <label style={labelStyle}>Date de l'appel</label>
            <div style={{ position: 'relative' }}>
              <Calendar size={14} style={filterIconStyle} />
              <input type="date" className="input-premium" style={{ width: '100%', paddingLeft: '34px' }} value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
            </div>
          </div>
          <div style={filterGroupStyle}>
            <label style={labelStyle}>Niveau</label>
            <select className="input-premium" value={filterDiploma} onChange={(e) => { setFilterDiploma(e.target.value); setFilterMajor(''); setFilterModule(''); }}>
              <option value="" disabled>-- Choisir niveau --</option>
              {Object.keys(FILIERES).map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div style={filterGroupStyle}>
            <label style={labelStyle}>Filière</label>
            <select className="input-premium" value={filterMajor} onChange={(e) => { setFilterMajor(e.target.value); setFilterModule(''); }}>
              <option value="" disabled>-- Choisir filière --</option>
              {availableMajors.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div style={filterGroupStyle}>
            <label style={labelStyle}>Année</label>
            <select className="input-premium" value={filterYear} onChange={(e) => { setFilterYear(e.target.value); setFilterModule(''); }}>
              <option value="" disabled>-- Année --</option>
              <option value="1ère année">1ère année</option>
              <option value="2ème année">2ème année</option>
            </select>
          </div>
          <div style={filterGroupStyle}>
            <label style={labelStyle}>Module</label>
            <select className="input-premium" value={filterModule} onChange={(e) => setFilterModule(e.target.value)}>
              <option value="">(Module requis)</option>
              {availableModules.map(m => <option key={m} value={m}>{m}</option>)}
              {availableModules.length === 0 && <option value="global">Général</option>}
            </select>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      {filteredStudents.length > 0 && filterModule && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
          <MiniStat label="Effectif" value={stats.total} />
          <MiniStat label="Présents" value={stats.presents} />
          <MiniStat label="Absents" value={stats.absents} />
          <MiniStat label="Taux" value={stats.total > 0 ? `${Math.round((stats.presents / stats.total) * 100)}%` : '—'} />
        </motion.div>
      )}

      {/* Main Table Area */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        {loading ? <TableSkeleton rows={10} /> : (
          !filterDiploma || !filterMajor || !filterYear ? (
            <EmptyState title="Filtres requis" message="Sélectionnez le niveau, la filière et l'année pour voir les stagiaires." icon="filter" />
          ) : !filterModule ? (
            <EmptyState title="Module manquant" message="Veuillez sélectionner un module pour lancer l'appel." icon="mouse-pointer" />
          ) : filteredStudents.length === 0 ? (
            <EmptyState title="Aucun cours aujourd'hui" message={`Aucun cours n'est programmé le ${dayOfWeek} pour ce groupe.`} icon="calendar" />
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', minWidth: '750px' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-subtle)' }}>
                    <th style={{ ...thStyle, textAlign: 'center', width: '60px' }}>#</th>
                    <th style={thStyle}>Stagiaire</th>
                    <th style={{ ...thStyle, textAlign: 'center', width: '260px' }}>Pointage</th>
                    <th style={thStyle}>Commentaire / Motif</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student, idx) => {
                    const docId = `${student.id}_${(filterModule).replace(/[^a-zA-Z0-9]/g, '_')}_${selectedDate}`;
                    const record = studentAttendance.find(a => a.id === docId);
                    const status = record?.status || '';
                    const comment = record?.comment || '';

                    return (
                      <tr key={student.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ ...tdStyle, textAlign: 'center' }}>
                          <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-faint)' }}>{idx + 1}</span>
                        </td>
                        <td style={tdStyle}>
                          <p style={{ fontSize: 'var(--text-sm)', fontWeight: '700', color: 'var(--text-primary)' }}>{student.lastName} {student.firstName}</p>
                          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Matricule: {student.regNo}</p>
                        </td>
                        <td style={{ ...tdStyle, textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-xl)', padding: '4px' }}>
                            <StatusBtn active={status === 'present'} color="var(--success)" onClick={() => handleStatusChange(student.id, 'present')}>Présent</StatusBtn>
                            <StatusBtn active={status === 'absent'} color="var(--danger)" onClick={() => handleStatusChange(student.id, 'absent')}>Absent</StatusBtn>
                            <StatusBtn active={status === 'retard'} color="var(--warning)" onClick={() => handleStatusChange(student.id, 'retard')}>Retard</StatusBtn>
                          </div>
                        </td>
                        <td style={tdStyle}>
                          <input type="text" className="input-premium" placeholder="Note d'absence..." 
                            style={{ width: '100%', fontSize: '12px', background: 'transparent', border: '1px solid transparent' }}
                            value={comment} onChange={(e) => handleCommentChange(student.id, e.target.value)} />
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
const filterGroupStyle = { display: 'flex', flexDirection: 'column' };
const filterIconStyle = { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' };
const thStyle = { padding: '16px', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' };
const tdStyle = { padding: '16px' };

export default StudentAttendance;
