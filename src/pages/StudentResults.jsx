import React from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { TableSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import { 
  GraduationCap, 
  Award, 
  CalendarCheck, 
  CheckCircle, 
  BookOpen, 
  Lock, 
  ChevronRight, 
  FileText, 
  TrendingUp, 
  TrendingDown,
  Activity
} from 'lucide-react';

const StudentResults = () => {
  const { studentId } = useParams();
  const { students = [], grades = {}, loading = false, modules: allModules = [] } = useApp() || {};
  
  const student = students.find(s => {
    if (!s) return false;
    const clean = (str) => String(str || '').toLowerCase().replace(/[^a-z0-9-]/g, '');
    return clean(s.token) === clean(studentId) || clean(s.id) === clean(studentId);
  });
  
  if (loading && students.length === 0) {
    return (
      <div className="max-w-container section-padding">
        <TableSkeleton rows={10} />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex-center" style={{ minHeight: '80vh', padding: 'var(--space-6)' }}>
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-premium" style={{ padding: '64px', textAlign: 'center', maxWidth: '440px' }}>
           <Lock size={64} style={{ color: 'var(--danger)', marginBottom: '24px' }} />
           <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: '900', marginBottom: '12px' }}>Lien Invalide</h2>
           <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>L'accès à ce relevé est protégé ou le lien a expiré.</p>
        </motion.div>
      </div>
    );
  }

  const studentGrades = grades[student.id] || {};
  const studentModules = (allModules || []).filter(m => m.diploma === student.diploma && m.major === student.major && m.year === student.year);
  const modules = studentModules.map(m => m.name || '');
  const sanitize = (name) => name.replace(/\./g, '_');

  const calcMoyenneCC = (g) => {
    if (!g || g.c1 === '' || g.c2 === '') return null;
    const c1 = parseFloat(g.c1), c2 = parseFloat(g.c2);
    if (g.c3 !== '' && g.c3 !== undefined && g.c3 !== null) {
      const c3 = parseFloat(g.c3);
      if (!isNaN(c3)) return (c1 + c2 + c3) / 3;
    }
    return (c1 + c2) / 2;
  };

  let sumCC = 0, sumFT = 0, sumFP = 0, cnt = 0;
  studentModules.forEach(mod => {
    const g = studentGrades[sanitize(mod.name)];
    const cc = calcMoyenneCC(g);
    if (cc === null || !g || g.efcfp === '' || g.efcft === '') return;
    sumCC += cc; sumFT += parseFloat(g.efcft); sumFP += parseFloat(g.efcfp); cnt++;
  });
  
  const generalAvgNum = cnt > 0 ? (((sumCC / cnt) * 3) + ((sumFT / cnt) * 2) + ((sumFP / cnt) * 3)) / 8 : 0;
  const generalAvg = cnt > 0 ? generalAvgNum.toFixed(2) : '—';
  const completedModules = modules.filter(mod => {
    const g = studentGrades[sanitize(mod)];
    return g && g.c1 !== '' && g.c2 !== '' && g.efcfp !== '' && g.efcft !== '';
  }).length;

  return (
    <div className="max-w-container section-padding">
      {/* ── Profile Header ── */}
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ borderRadius: 'var(--radius-3xl)', overflow: 'hidden', marginBottom: 'var(--space-8)', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ background: 'var(--text-primary)', padding: 'clamp(32px, 5vw, 48px)', color: 'white', position: 'relative' }}>
          <div style={{ position: 'absolute', right: '-32px', bottom: '-32px', opacity: 0.05 }}><GraduationCap size={240} /></div>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div className="badge-status primary" style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--primary-light)', padding: '6px 16px', marginBottom: '20px' }}>
              <span style={{ fontSize: '11px', fontWeight: '800' }}>{student.major}</span>
            </div>
            <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 3rem)', fontWeight: '900', letterSpacing: '-0.04em', lineHeight: 1 }}>
              {student.lastName} <span style={{ color: 'var(--primary-light)' }}>{student.firstName}</span>
            </h1>
            <p style={{ fontSize: '11px', fontWeight: '800', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '12px' }}>
              Matricule: {student.regNo} · {student.diploma} · {student.year}
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1px', background: 'var(--border-light)' }}>
          <Metric icon={CheckCircle} label="Modules validés" value={`${completedModules}/${modules.length}`} />
          <Metric icon={CalendarCheck} label="Année d'étude" value={student.year} />
          <Metric icon={Award} label="Qualification" value={student.diploma === 'Technicien Spécialisé' ? 'TS' : 'T'} />
          <Metric icon={Activity} label="Statut" value="En cours" />
        </div>
      </motion.div>

      {/* ── Table Area ── */}
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
          <h3 style={{ fontSize: '11px', fontWeight: '900', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Relevé de Notes Détaillé</h3>
          <div style={{ height: '1px', flex: 1, background: 'var(--border-light)' }} />
          <div className="badge-status" style={{ background: 'var(--bg-subtle)', color: 'var(--text-muted)' }}>{modules.length} Modules</div>
        </div>
        
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          {modules.length === 0 ? (
            <EmptyState title="Aucune donnée" message="Les modules ne sont pas encore configurés pour votre filière." icon="book-open" />
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', minWidth: '850px' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-subtle)' }}>
                    <th style={{ ...th, width: '40px', textAlign: 'center' }}>#</th>
                    <th style={th}>Libellé du Module</th>
                    <th style={thCenter}>C1</th>
                    <th style={thCenter}>C2</th>
                    <th style={thCenter}>C3</th>
                    <th style={{ ...thCenter, background: 'rgba(0,0,0,0.02)' }}>Moy CC</th>
                    <th style={thCenter}>EFC FP</th>
                    <th style={thCenter}>EFC FT</th>
                  </tr>
                </thead>
                <tbody>
                  {modules.map((mod, idx) => {
                    const g = studentGrades[sanitize(mod)] || {};
                    const moyCC = calcMoyenneCC(g);
                    return (
                      <tr key={mod} style={{ borderBottom: '1px solid var(--border-light)', background: idx % 2 === 0 ? 'white' : 'var(--bg-subtle)' }}>
                        <td style={{ ...td, textAlign: 'center' }}><span style={{ color: 'var(--text-faint)', fontWeight: '800', fontSize: '11px' }}>{idx + 1}</span></td>
                        <td style={td}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-lg)', background: 'var(--primary-ultra-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <BookOpen size={14} />
                            </div>
                            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>{mod}</span>
                          </div>
                        </td>
                        <td style={tdCenter}><Grade val={g.c1} /></td>
                        <td style={tdCenter}><Grade val={g.c2} /></td>
                        <td style={tdCenter}><Grade val={g.c3} /></td>
                        <td style={{ ...tdCenter, background: 'rgba(0,0,0,0.01)' }}><span style={{ fontWeight: '900', color: 'var(--text-primary)' }}>{moyCC !== null ? moyCC.toFixed(2) : '—'}</span></td>
                        <td style={tdCenter}><Grade val={g.efcfp} /></td>
                        <td style={tdCenter}><Grade val={g.efcft} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Summary Card ── */}
      {cnt > 0 && (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="glass-premium" style={{ padding: '40px', textAlign: 'center', border: '1px solid var(--primary-light)' }}>
          <p style={{ fontSize: '11px', fontWeight: '900', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '12px' }}>Résultat Global de l'Année</p>
          <h2 style={{ fontSize: '48px', fontWeight: '900', color: 'var(--text-primary)', letterSpacing: '-0.04em', lineHeight: 1 }}>
            {generalAvg}<span style={{ fontSize: '18px', color: 'var(--text-faint)', fontWeight: '600' }}> / 20</span>
          </h2>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 24px', borderRadius: 'var(--radius-pill)', marginTop: '24px', background: parseFloat(generalAvg) >= 10 ? 'var(--success-ultra-light)' : 'var(--danger-ultra-light)', color: parseFloat(generalAvg) >= 10 ? 'var(--success)' : 'var(--danger)', fontWeight: '900', fontSize: '14px', textTransform: 'uppercase' }}>
            {parseFloat(generalAvg) >= 10 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
            {parseFloat(generalAvg) >= 10 ? 'Admis' : 'Non admis'}
          </div>
        </motion.div>
      )}

      <div style={{ textAlign: 'center', marginTop: 'var(--space-12)', opacity: 0.4 }}>
        <p style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Document généré par le système LUX-CORE · IPFP</p>
      </div>
    </div>
  );
};

const Metric = ({ icon: Icon, label, value }) => (
  <div style={{ background: 'white', padding: '24px', textAlign: 'center' }}>
    <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-xl)', background: 'var(--bg-subtle)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
      <Icon size={18} />
    </div>
    <p style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-faint)', textTransform: 'uppercase', marginBottom: '4px' }}>{label}</p>
    <p style={{ fontSize: '18px', fontWeight: '900', color: 'var(--text-primary)' }}>{value}</p>
  </div>
);

const Grade = ({ val }) => (
  <span style={{ fontSize: '14px', fontWeight: '700', color: val ? 'var(--text-primary)' : 'var(--text-faint)' }}>{val || '—'}</span>
);

const th = { padding: '16px', fontSize: '11px', fontWeight: '900', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' };
const thCenter = { ...th, textAlign: 'center' };
const td = { padding: '16px' };
const tdCenter = { ...td, textAlign: 'center' };

export default StudentResults;
