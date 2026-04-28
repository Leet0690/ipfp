import React from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';


/* ── Styles ── */
const thStyle = { padding: '10px 12px', fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid var(--border-light)', background: 'var(--bg-subtle)', whiteSpace: 'nowrap' };
const tdStyle = { padding: '10px 12px', borderBottom: '1px solid var(--border-light)' };

const StudentResults = () => {
  const { studentId } = useParams();
  const { students = [], grades = {}, loading = false, modules: allModules = [] } = useApp() || {};
  
  const student = students.find(s => {
    if (!s) return false;
    const sToken = String(s.token || '');
    const sId = String(s.id || '');
    const urlId = String(studentId || '');
    
    const clean = (str) => {
      if (!str) return '';
      try {
        return decodeURIComponent(str).toLowerCase().replace(/[^a-z0-9-]/g, '');
      } catch(e) {
        return String(str).toLowerCase().replace(/[^a-z0-9-]/g, '');
      }
    };
    
    return clean(sToken) === clean(urlId) || clean(sId) === clean(urlId);
  });
  
  if (loading && students.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!student) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', padding: '32px' }}>
        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="glass-card" style={{ padding: '48px', textAlign: 'center', maxWidth: '420px' }}>
           <i className="fa-solid fa-lock" style={{ color: '#f87171', fontSize: '40px', display: 'block', marginBottom: '16px' }}></i>
           <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '8px' }}>Accès non autorisé</h2>
           <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Le lien est invalide ou a expiré.</p>
        </motion.div>
      </div>
    );
  }

  const studentGrades = grades[student.id] || {};
  const studentModules = (allModules || []).filter(m => 
    m && student &&
    m.diploma === student.diploma && 
    m.major === student.major && 
    m.year === student.year
  );
  const modules = studentModules.map(m => m.name || '');

  const isValidGrade = (val) => {
    if (val === '' || val === undefined || val === null) return true;
    const num = parseFloat(val);
    return !isNaN(num) && num >= 0 && num <= 20;
  };

  // Moyenne CC: if C3 exists → (C1+C2+C3)/3, else (C1+C2)/2
  const calcMoyenneCC = (g) => {
    if (!g || g.c1 === '' || g.c2 === '') return null;
    if (!isValidGrade(g.c1) || !isValidGrade(g.c2) || !isValidGrade(g.c3)) return null;
    
    const c1 = parseFloat(g.c1), c2 = parseFloat(g.c2);
    if (isNaN(c1) || isNaN(c2)) return null;
    if (g.c3 !== '' && g.c3 !== undefined && g.c3 !== null) {
      const c3 = parseFloat(g.c3);
      if (!isNaN(c3)) return (c1 + c2 + c3) / 3;
    }
    return (c1 + c2) / 2;
  };

  const hasC3 = (g) => g && g.c3 !== '' && g.c3 !== undefined && g.c3 !== null && !isNaN(parseFloat(g.c3));

  // General average (CC*0.4 + EFC*0.6 for complete modules)
  let weightedSum = 0, totalCoeff = 0;
  studentModules.forEach(mod => {
    const g = studentGrades[mod.name.replace(/\./g, '_')];
    const cc = calcMoyenneCC(g);
    if (cc === null || !g || g.efcfp === '' || g.efcft === '') return;
    if (!isValidGrade(g.c1) || !isValidGrade(g.c2) || !isValidGrade(g.c3) || !isValidGrade(g.efcfp) || !isValidGrade(g.efcft)) return;

    const efcfp = parseFloat(g.efcfp), efcft = parseFloat(g.efcft);
    if (isNaN(efcfp) || isNaN(efcft)) return;
    const efc = (efcfp + efcft) / 2;
    const coeff = mod.coefficient || 1;
    weightedSum += (cc * 0.4 + efc * 0.6) * coeff;
    totalCoeff += coeff;
  });
  const generalAvg = totalCoeff > 0 ? (weightedSum / totalCoeff).toFixed(2) : '—';
  const completedModules = modules.filter(mod => {
    const g = studentGrades[mod.replace(/\./g, '_')];
    return g && g.c1 !== '' && g.c2 !== '' && g.efcfp !== '' && g.efcft !== '';
  }).length;

  return (
    <div className="max-w-container section-padding">
      {/* ── Student Header ── */}
      <motion.div 
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ borderRadius: 'var(--radius-2xl)', overflow: 'hidden', marginBottom: '32px', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-light)' }}
      >
        {/* Top section */}
        <div style={{ background: 'var(--text-primary)', padding: 'clamp(24px, 4vw, 40px)', color: 'white', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: '-40px', top: '-40px', fontSize: '200px', opacity: 0.03 }}>
            <i className="fa-solid fa-graduation-cap"></i>
          </div>
          
          <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
            <div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.06)',
                padding: '4px 12px', borderRadius: 'var(--radius-pill)', marginBottom: '16px',
                fontSize: '10px', fontWeight: '700', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em',
              }}>
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--accent)' }}></span>
                {student.major}
              </div>
              <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: '800', letterSpacing: '-0.03em', marginBottom: '6px', lineHeight: 1.1 }}>
                {student.lastName} <span style={{ color: 'var(--primary-light)' }}>{student.firstName}</span>
              </h1>
              <p style={{ fontSize: '11px', fontWeight: '600', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Matricule : {student.regNo} · {student.diploma} · {student.year}
              </p>
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1px', background: 'var(--border-light)' }}>
          {[
            { label: 'Modules notés', value: `${completedModules}/${modules.length}`, icon: 'fa-check-double' },
            { label: 'Année', value: student.year || '—', icon: 'fa-calendar-check' },
            { label: 'Niveau', value: student.diploma || '—', icon: 'fa-award' },
          ].map((m, i) => (
            <div key={i} style={{ background: 'white', padding: '16px', textAlign: 'center', transition: 'background 0.15s', cursor: 'default' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-md)', background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '13px', margin: '0 auto 8px' }}>
                <i className={`fa-solid ${m.icon}`}></i>
              </div>
              <p style={{ fontSize: '10px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>{m.label}</p>
              <p style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{m.value}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Grades Section ── */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', flexShrink: 0 }}>Relevé de notes</h3>
          <div style={{ height: '1px', flex: 1, background: 'var(--border-light)' }}></div>
          <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-faint)' }}>{modules.length} modules</span>
        </div>
        
        {modules.length === 0 ? (
          <div className="glass-card" style={{ padding: '64px', textAlign: 'center' }}>
            <i className="fa-solid fa-inbox" style={{ fontSize: '36px', color: 'var(--border)', display: 'block', marginBottom: '12px' }}></i>
            <p style={{ color: 'var(--text-muted)', fontWeight: '500', fontSize: '14px' }}>Aucun module défini pour cette filière / année.</p>
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-light)', overflow: 'hidden', boxShadow: 'var(--shadow-xs)' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', minWidth: '750px' }}>
                <thead>
                  <tr>
                    <th style={thStyle}>#</th>
                    <th style={thStyle}>Module</th>
                    <th style={{ ...thStyle, textAlign: 'center', width: '65px' }}>C1</th>
                    <th style={{ ...thStyle, textAlign: 'center', width: '65px' }}>C2</th>
                    <th style={{ ...thStyle, textAlign: 'center', width: '65px' }}>C3</th>
                    <th style={{ ...thStyle, textAlign: 'center', width: '80px', background: 'rgba(254,205,8,0.06)' }}>Moy CC</th>
                    <th style={{ ...thStyle, textAlign: 'center', width: '65px' }}>EFCFP</th>
                    <th style={{ ...thStyle, textAlign: 'center', width: '65px' }}>EFCFT</th>
                  </tr>
                </thead>
                <tbody>
                  {modules.map((mod, idx) => {
                    const g = studentGrades[mod] || { c1: '', c2: '', c3: '', efcfp: '', efcft: '' };
                    const moyCC = calcMoyenneCC(g);

                    return (
                      <motion.tr key={mod} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.02 }}
                        style={{ background: idx % 2 === 0 ? 'white' : 'rgba(248,249,251,0.5)' }}>
                        <td style={tdStyle}>
                          <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-faint)' }}>{idx + 1}</span>
                        </td>
                        <td style={tdStyle}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '30px', height: '30px', borderRadius: 'var(--radius-md)', background: 'var(--primary-ultra-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', flexShrink: 0 }}>
                              <i className="fa-solid fa-book"></i>
                            </div>
                            <div>
                              <p style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{mod}</p>
                              <span style={{ fontSize: '9px', fontWeight: '600', color: hasC3(g) ? 'var(--primary)' : 'var(--text-faint)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                {hasC3(g) ? '3 contrôles' : '2 contrôles'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td style={{ ...tdStyle, textAlign: 'center' }}>
                          <span style={{ fontSize: '14px', fontWeight: '600', color: g.c1 ? 'var(--text-primary)' : 'var(--text-faint)' }}>{g.c1 || '—'}</span>
                        </td>
                        <td style={{ ...tdStyle, textAlign: 'center' }}>
                          <span style={{ fontSize: '14px', fontWeight: '600', color: g.c2 ? 'var(--text-primary)' : 'var(--text-faint)' }}>{g.c2 || '—'}</span>
                        </td>
                        <td style={{ ...tdStyle, textAlign: 'center' }}>
                          <span style={{ fontSize: '14px', fontWeight: '600', color: hasC3(g) ? 'var(--text-primary)' : 'var(--text-faint)' }}>{hasC3(g) ? g.c3 : '—'}</span>
                        </td>
                        <td style={{ ...tdStyle, textAlign: 'center', background: 'rgba(254,205,8,0.03)' }}>
                          <span style={{ fontSize: '15px', fontWeight: '800', color: moyCC !== null ? 'var(--text-primary)' : 'var(--text-faint)' }}>
                            {moyCC !== null ? moyCC.toFixed(2) : '—'}
                          </span>
                        </td>
                        <td style={{ ...tdStyle, textAlign: 'center' }}>
                          <span style={{ fontSize: '14px', fontWeight: '600', color: g.efcfp ? 'var(--text-primary)' : 'var(--text-faint)' }}>{g.efcfp || '—'}</span>
                        </td>
                        <td style={{ ...tdStyle, textAlign: 'center' }}>
                          <span style={{ fontSize: '14px', fontWeight: '600', color: g.efcft ? 'var(--text-primary)' : 'var(--text-faint)' }}>{g.efcft || '—'}</span>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* General Average */}
      {validCount > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card" style={{ padding: '24px', textAlign: 'center', marginBottom: '32px' }}>
          <p style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Moyenne Générale</p>
          <p style={{ fontSize: '36px', fontWeight: '900', color: parseFloat(generalAvg) >= 10 ? 'var(--primary)' : '#d97706', letterSpacing: '-0.02em' }}>
            {generalAvg}<span style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-muted)' }}> / 20</span>
          </p>
          <span style={{ padding: '4px 12px', borderRadius: 'var(--radius-pill)', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase',
            background: parseFloat(generalAvg) >= 10 ? 'rgba(22,163,74,0.06)' : 'rgba(245,158,11,0.06)',
            color: parseFloat(generalAvg) >= 10 ? '#16a34a' : '#d97706', marginTop: '8px', display: 'inline-block' }}>
            {parseFloat(generalAvg) >= 10 ? 'Admis' : 'Non admis'}
          </span>
        </motion.div>
      )}

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '20px 0', opacity: 0.3 }}>
        <p style={{ fontSize: '10px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
          IPFP · Relevé de notes officiel
        </p>
      </div>
    </div>
  );
};

export default StudentResults;
