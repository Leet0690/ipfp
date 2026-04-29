import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { FILIERES } from '../data/modules';
import { generateFicheSignature, generateFicheNotes, generateBulletinGlobal, generateNoteObtentionDiplome } from '../utils/pdfGenerator';

/* ── Styles & Constants ── */
const lbl = { fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' };
const thStyle = { padding: '10px 12px', fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid var(--border-light)', background: 'var(--bg-subtle)', whiteSpace: 'nowrap' };
const tdStyle = { padding: '10px 12px', borderBottom: '1px solid var(--border-light)' };
const selectStyle = { cursor: 'pointer', appearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2394a3b8\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px', paddingRight: '36px' };

/* ── Components ── */
const GradeInput = ({ value, onChange, placeholder = '—' }) => {
  const num = parseFloat(value);
  const isInvalid = value !== '' && value !== undefined && !isNaN(num) && (num < 0 || num > 20);
  return (
    <input type="number" step="0.25" className="input-premium"
      style={{ 
        width: '60px', textAlign: 'center', fontWeight: '600', padding: '5px 4px', fontSize: '13px', margin: '0 auto',
        border: isInvalid ? '2px solid #ef4444' : undefined,
        backgroundColor: isInvalid ? '#fef2f2' : undefined,
        color: isInvalid ? '#dc2626' : undefined
      }}
      placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
  );
};

const MiniStat = ({ label, value }) => (
  <div style={{ textAlign: 'center', padding: '6px 14px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-lg)' }}>
    <p style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)', lineHeight: 1 }}>{value}</p>
    <p style={{ fontSize: '9px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '2px' }}>{label}</p>
  </div>
);

const GradeManagement = () => {
  const { students = [], teachers = [], grades = {}, updateGrades, loading = false, modules: allModules = [] } = useApp() || {};
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [filterDiploma, setFilterDiploma] = useState('');
  const [filterMajor, setFilterMajor] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [saved, setSaved] = useState(false);

  // ── PDF States ──
  const [showDocPanel, setShowDocPanel] = useState(false);
  const [pdfModule, setPdfModule] = useState('');
  const [pdfCC, setPdfCC] = useState('1');

  const filteredStudents = useMemo(() => {
    return (students || []).filter(s => {
      if (filterDiploma && s.diploma !== filterDiploma) return false;
      if (filterMajor && s.major !== filterMajor) return false;
      if (filterYear && s.year !== filterYear) return false;
      return true;
    });
  }, [students, filterDiploma, filterMajor, filterYear]);

  const availableMajors = filterDiploma ? (FILIERES[filterDiploma] || []) : Array.from(new Set(students.map(s => s.major)));

  const selectedStudent = students.find(s => s.id === selectedStudentId);
  const studentModules = useMemo(() => {
    if (!selectedStudent) return [];
    return allModules.filter(m => 
      m.diploma === selectedStudent.diploma && 
      m.major === selectedStudent.major && 
      m.year === selectedStudent.year
    );
  }, [selectedStudent, allModules]);
  
  const modules = studentModules.map(m => m.name);
  const studentGrades = selectedStudent ? (grades[selectedStudent.id] || {}) : {};

  // Modules for PDF (based on filters, not selected student)
  const pdfModulesList = useMemo(() => {
    if (filterDiploma && filterMajor && filterYear) {
      return allModules.filter(m => 
        m.diploma === filterDiploma && 
        m.major === filterMajor && 
        m.year === filterYear
      );
    }
    return [];
  }, [filterDiploma, filterMajor, filterYear, allModules]);
  
  const pdfModules = pdfModulesList.map(m => m.name);

  // Students for PDF (filtered)
  const pdfStudents = useMemo(() => {
    return (students || []).filter(s => {
      if (filterDiploma && s.diploma !== filterDiploma) return false;
      if (filterMajor && s.major !== filterMajor) return false;
      if (filterYear && s.year !== filterYear) return false;
      return true;
    }).sort((a, b) => (a.regNo || '').localeCompare(b.regNo || ''));
  }, [students, filterDiploma, filterMajor, filterYear]);

  const handleGradeChange = (module, field, value) => {
    const current = studentGrades[module.replace(/\./g, '_')] || { c1: '', c2: '', c3: '', efcfp: '', efcft: '' };
    updateGrades(selectedStudentId, module, { ...current, [field]: value });
  };

  const handleSave = () => {
    let hasInvalid = false;
    Object.values(studentGrades).forEach(g => {
      ['c1', 'c2', 'c3', 'efcfp', 'efcft'].forEach(field => {
        if (g[field] !== '' && g[field] !== undefined) {
          const num = parseFloat(g[field]);
          if (num < 0 || num > 20) hasInvalid = true;
        }
      });
    });

    if (hasInvalid) {
      alert("Validation impossible : certaines notes sont invalides (doivent être entre 0 et 20). Veuillez corriger les cases en rouge.");
      return;
    }
    
    setSaved(true); 
    setTimeout(() => setSaved(false), 2500); 
  };

  const isValidGrade = (val) => {
    if (val === '' || val === undefined || val === null) return true;
    const num = parseFloat(val);
    return !isNaN(num) && num >= 0 && num <= 20;
  };

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

  const calcAvg = (g) => {
    if (!g) return null;
    if (!isValidGrade(g.c1) || !isValidGrade(g.c2) || !isValidGrade(g.c3) || !isValidGrade(g.efcfp) || !isValidGrade(g.efcft)) return null;
    
    const cc = calcMoyenneCC(g);
    if (cc === null) return null;
    if (g.efcfp === '' || g.efcft === '') return null;
    const efcfp = parseFloat(g.efcfp), efcft = parseFloat(g.efcft);
    if (isNaN(efcfp) || isNaN(efcft)) return null;
    // New Formula: ((CC*3) + (EFCFT*2) + (EFCFP*3)) / 8
    return (cc * 3 + efcft * 2 + efcfp * 3) / 8;
  };

  const isComplete = (g) => {
    if (!g || g.c1 === '' || g.c2 === '' || g.efcfp === '' || g.efcft === '') return false;
    return true;
  };

  const generalAvg = () => {
    let sumCC = 0, sumFT = 0, sumFP = 0, cnt = 0;
    studentModules.forEach(mod => {
      const g = studentGrades[mod.name.replace(/\./g, '_')];
      const cc = calcMoyenneCC(g);
      if (cc !== null && g.efcft !== '' && g.efcfp !== '') {
        sumCC += cc;
        sumFT += parseFloat(g.efcft);
        sumFP += parseFloat(g.efcfp);
        cnt++;
      }
    });
    if (cnt === 0) return '—';
    const mCC = sumCC / cnt;
    const mFT = sumFT / cnt;
    const mFP = sumFP / cnt;
    return (((mCC * 3) + (mFT * 2) + (mFP * 3)) / 8).toFixed(2);
  };

  const completedModules = modules.filter(mod => isComplete(studentGrades[mod.replace(/\./g, '_')])).length;

  // ── PDF Handlers ──
  const findFormateur = (moduleName) => {
    const t = teachers.find(t => (t.subjects || [t.subject]).includes(moduleName));
    return t ? t.name : '';
  };

  const handleFicheSignature = () => {
    if (!pdfModule || !pdfStudents.length) return;
    generateFicheSignature({
      students: pdfStudents,
      filiere: filterMajor,
      niveau: filterYear || '',
      module: pdfModule,
      ccNumber: pdfCC,
      formateur: findFormateur(pdfModule),
      allGrades: grades,
    });
  };

  const handleFicheNotes = () => {
    if (!pdfModule || !pdfStudents.length) return;
    generateFicheNotes({
      students: pdfStudents,
      filiere: filterMajor,
      classe: filterYear || '',
      anneeFormation: '2025-2026',
      module: pdfModule,
      formateur: findFormateur(pdfModule),
      allGrades: grades,
    });
  };

  const handleBulletinGlobal = () => {
    if (!selectedStudent) return;
    generateBulletinGlobal(selectedStudent, grades, modules);
  };

  const handleNoteObtentionDiplome = () => {
    if (!selectedStudent) return;
    generateNoteObtentionDiplome(selectedStudent, grades, modules);
  };

  if (loading && students.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="max-w-container section-padding">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', letterSpacing: '-0.03em', color: 'var(--text-primary)', marginBottom: '6px' }}>
          Gestion des notes
        </h1>
        <p style={{ color: 'var(--text-tertiary)', fontSize: '15px', marginBottom: '28px' }}>
          Saisissez C1, C2, C3 (optionnel), EFCFP et EFCFT pour chaque module.
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="glass-card" style={{ padding: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={lbl}>Niveau</label>
            <select className="input-premium" style={selectStyle} value={filterDiploma} onChange={(e) => { setFilterDiploma(e.target.value); setFilterMajor(''); setSelectedStudentId(''); setPdfModule(''); }}>
              <option value="" disabled>-- Choisir le niveau --</option>
              {Object.keys(FILIERES).map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={lbl}>Filière</label>
            <select className="input-premium" style={selectStyle} value={filterMajor} onChange={(e) => { setFilterMajor(e.target.value); setSelectedStudentId(''); setPdfModule(''); }}>
              <option value="" disabled>-- Choisir la filière --</option>
              {availableMajors.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={lbl}>Année</label>
            <select className="input-premium" style={selectStyle} value={filterYear} onChange={(e) => { setFilterYear(e.target.value); setSelectedStudentId(''); setPdfModule(''); }}>
              <option value="" disabled>-- Choisir l'année --</option>
              <option value="1ère année">1ère année</option>
              <option value="2ème année">2ème année</option>
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={lbl}>Stagiaire</label>
            <select className="input-premium" style={selectStyle} value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)}>
              <option value="">Sélectionner un stagiaire</option>
              {filteredStudents.map(s => <option key={s.id} value={s.id}>{s.lastName} {s.firstName} — {s.major}</option>)}
            </select>
          </div>
        </div>
      </motion.div>

      {/* ── Documents Section ── */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
        className="glass-card" style={{ marginBottom: '24px', overflow: 'hidden' }}>
        <button onClick={() => setShowDocPanel(!showDocPanel)}
          style={{ width: '100%', padding: '14px 20px', background: 'transparent', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-md)', background: 'var(--primary-ultra-light)', color: 'var(--primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px' }}>
              <i className="fa-solid fa-file-pdf"></i>
            </div>
            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>
              Documents à télécharger
            </span>
            <span style={{ fontSize: '10px', fontWeight: '600', color: 'var(--text-muted)', background: 'var(--bg-subtle)',
              padding: '2px 8px', borderRadius: 'var(--radius-pill)' }}>4 types</span>
          </div>
          <i className={`fa-solid fa-chevron-${showDocPanel ? 'up' : 'down'}`} style={{ color: 'var(--text-muted)', fontSize: '11px', transition: 'transform 0.2s' }}></i>
        </button>

        <AnimatePresence>
          {showDocPanel && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              style={{ overflow: 'hidden' }}>
              <div style={{ padding: '0 20px 20px', borderTop: '1px solid var(--border-light)' }}>
                
                {/* Module selector for fiches */}
                {filterDiploma && filterMajor && filterYear && pdfModules.length > 0 && (
                  <div style={{ marginTop: '16px', marginBottom: '16px' }}>
                    <label style={lbl}>Module (pour fiches)</label>
                    <select className="input-premium" style={{ ...selectStyle, marginTop: '6px' }} value={pdfModule} onChange={(e) => setPdfModule(e.target.value)}>
                      <option value="">Sélectionner un module</option>
                      {pdfModules.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginTop: '12px' }}>
                  
                  {/* 1. Fiche de Signature (CC) */}
                  <div style={{ border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '16px', background: 'white' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                      <i className="fa-solid fa-pen-fancy" style={{ color: 'var(--primary)', fontSize: '14px' }}></i>
                      <h4 style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)' }}>Fiche des Notes (CC)</h4>
                    </div>
                    <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '10px', lineHeight: 1.4 }}>
                      Par module / par CC — Liste des stagiaires avec colonne notes vide.
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                      <label style={{ fontSize: '10px', fontWeight: '600', color: 'var(--text-muted)' }}>CC N°</label>
                      <select className="input-premium" style={{ ...selectStyle, width: '70px', padding: '4px 28px 4px 8px', fontSize: '12px' }}
                        value={pdfCC} onChange={(e) => setPdfCC(e.target.value)}>
                        <option value="1">CC1</option>
                        <option value="2">CC2</option>
                        <option value="3">CC3</option>
                      </select>
                    </div>
                    <button onClick={handleFicheSignature}
                      disabled={!pdfModule || !pdfStudents.length}
                      className="btn-modern primary"
                      style={{ width: '100%', padding: '8px', fontSize: '11px', opacity: (!pdfModule || !pdfStudents.length) ? 0.4 : 1 }}>
                      <i className="fa-solid fa-download" style={{ marginRight: '6px' }}></i>Télécharger
                    </button>
                  </div>

                  {/* 2. Fiche des Notes (EFC) */}
                  <div style={{ border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '16px', background: 'white' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                      <i className="fa-solid fa-clipboard-list" style={{ color: '#d97706', fontSize: '14px' }}></i>
                      <h4 style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)' }}>Fiche des Notes (EFC)</h4>
                    </div>
                    <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '10px', lineHeight: 1.4 }}>
                      Par module — Colonnes EFCFP et EFCFT uniquement.
                    </p>
                    <div style={{ height: '36px' }}></div>
                    <button onClick={handleFicheNotes}
                      disabled={!pdfModule || !pdfStudents.length}
                      className="btn-modern primary"
                      style={{ width: '100%', padding: '8px', fontSize: '11px', background: '#d97706', borderColor: '#d97706',
                        opacity: (!pdfModule || !pdfStudents.length) ? 0.4 : 1 }}>
                      <i className="fa-solid fa-download" style={{ marginRight: '6px' }}></i>Télécharger
                    </button>
                  </div>

                  {/* 3. Bulletin Global */}
                  <div style={{ border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '16px', background: 'white' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                      <i className="fa-solid fa-graduation-cap" style={{ color: '#16a34a', fontSize: '14px' }}></i>
                      <h4 style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)' }}>Bulletin Global</h4>
                    </div>
                    <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '10px', lineHeight: 1.4 }}>
                      Toutes les notes d'un stagiaire dans tous ses modules.
                    </p>
                    <div style={{ height: '36px' }}></div>
                    <button onClick={handleBulletinGlobal}
                      disabled={!selectedStudent}
                      className="btn-modern primary"
                      style={{ width: '100%', padding: '8px', fontSize: '11px', background: '#16a34a', borderColor: '#16a34a',
                        opacity: !selectedStudent ? 0.4 : 1 }}>
                      <i className="fa-solid fa-download" style={{ marginRight: '6px' }}></i>
                      {selectedStudent ? 'Télécharger' : 'Sélectionner un stagiaire'}
                    </button>
                  </div>

                  {/* 4. Note d'Obtention de Diplôme */}
                  <div style={{ border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '16px', background: 'white', opacity: selectedStudent?.year === '1ère année' ? 0.6 : 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                      <i className="fa-solid fa-award" style={{ color: '#8b5cf6', fontSize: '14px' }}></i>
                      <h4 style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)' }}>Note d'Obtention de Diplôme</h4>
                    </div>
                    <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '10px', lineHeight: 1.4 }}>
                      {selectedStudent?.year === '1ère année' 
                        ? "Non disponible pour les stagiaires de 1ère année."
                        : "Attestation d'admission avec moyenne générale et décision du jury."}
                    </p>
                    <div style={{ height: '36px' }}></div>
                    <button onClick={handleNoteObtentionDiplome}
                      disabled={!selectedStudent || selectedStudent.year === '1ère année'}
                      className="btn-modern primary"
                      style={{ width: '100%', padding: '8px', fontSize: '11px', background: '#8b5cf6', borderColor: '#8b5cf6',
                        opacity: (!selectedStudent || selectedStudent.year === '1ère année') ? 0.4 : 1 }}>
                      <i className="fa-solid fa-download" style={{ marginRight: '6px' }}></i>
                      {selectedStudent ? 'Télécharger' : 'Sélectionner un stagiaire'}
                    </button>
                  </div>

                </div>

                {/* Hint */}
                {(!filterDiploma || !filterMajor || !filterYear) && (
                  <div style={{ marginTop: '14px', padding: '10px 14px', background: 'rgba(176,104,185,0.04)', borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(176,104,185,0.08)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="fa-solid fa-circle-info" style={{ color: 'var(--primary)', fontSize: '11px' }}></i>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Sélectionnez <strong>Niveau</strong>, <strong>Filière</strong> et <strong>Année</strong> pour activer les fiches par module.
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Student Content ── */}
      <AnimatePresence mode="wait">
        {selectedStudent ? (
          <motion.div key={selectedStudentId} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            {/* Student header */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'var(--primary-ultra-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '800', border: '1px solid var(--border-light)' }}>
                  {selectedStudent.lastName[0]}
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>{selectedStudent.lastName} {selectedStudent.firstName}</h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    <span style={{ fontWeight: '600' }}>{selectedStudent.major}</span> · {selectedStudent.year} · {selectedStudent.diploma}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <MiniStat label="Moyenne" value={generalAvg()} />
                <MiniStat label="Modules" value={`${completedModules}/${modules.length}`} />
                <button onClick={handleSave} className="btn-modern primary" style={{ padding: '10px 18px', fontSize: '13px' }}>
                  Enregistrer <i className="fa-solid fa-cloud-arrow-up" style={{ marginLeft: '4px', fontSize: '12px' }}></i>
                </button>
              </div>
            </div>

            <AnimatePresence>
              {saved && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  style={{ background: 'rgba(22,163,74,0.06)', border: '1px solid rgba(22,163,74,0.1)', borderRadius: 'var(--radius-lg)', padding: '10px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fa-solid fa-circle-check" style={{ color: '#16a34a' }}></i>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#16a34a' }}>Notes enregistrées.</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Notes 1ère Année & NSTI Section */}
            {selectedStudent.year === '2ème année' && (
              <div className="glass-card" style={{ padding: '16px', marginBottom: '16px', background: 'var(--primary-ultra-light)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                <h4 style={{ fontSize: '13px', fontWeight: '700', marginBottom: '12px', color: 'var(--primary)' }}>
                  <i className="fa-solid fa-clock-rotate-left" style={{ marginRight: '6px' }}></i>
                  Saisie des notes de la 1ère année et NSTI (Admin uniquement)
                </h4>
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={lbl}>Moy CC (1ère année)</label>
                    <GradeInput value={(studentGrades.firstYear || {}).moyCC || ''} onChange={(v) => handleGradeChange('firstYear', 'moyCC', v)} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={lbl}>Moy EFCFT (1ère année)</label>
                    <GradeInput value={(studentGrades.firstYear || {}).moyEFCFT || ''} onChange={(v) => handleGradeChange('firstYear', 'moyEFCFT', v)} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={lbl}>Moy EFCFP (1ère année)</label>
                    <GradeInput value={(studentGrades.firstYear || {}).moyEFCFP || ''} onChange={(v) => handleGradeChange('firstYear', 'moyEFCFP', v)} />
                  </div>
                  <div style={{ width: '1px', background: 'var(--border)', margin: '0 10px' }}></div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ ...lbl, color: '#d97706' }}>Note Globale NSTI</label>
                    <GradeInput value={(studentGrades.firstYear || {}).nsti || ''} onChange={(v) => handleGradeChange('firstYear', 'nsti', v)} />
                  </div>
                </div>
              </div>
            )}

            {/* Table */}
            {modules.length === 0 ? (
              <div className="glass-card" style={{ padding: '48px', textAlign: 'center' }}>
                <i className="fa-solid fa-book-open" style={{ fontSize: '36px', color: 'var(--border)', display: 'block', marginBottom: '12px' }}></i>
                <p style={{ color: 'var(--text-muted)', fontWeight: '500', fontSize: '14px' }}>Aucun module défini pour cette filière / année.</p>
              </div>
            ) : (
              <div style={{ background: 'white', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-light)', overflow: 'hidden', boxShadow: 'var(--shadow-xs)' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', minWidth: '950px' }}>
                    <thead>
                      <tr>
                        <th style={thStyle}>#</th>
                        <th style={thStyle}>Module</th>
                        <th style={{ ...thStyle, textAlign: 'center', width: '70px' }}>C1</th>
                        <th style={{ ...thStyle, textAlign: 'center', width: '70px' }}>C2</th>
                        <th style={{ ...thStyle, textAlign: 'center', width: '70px' }}>C3</th>
                        <th style={{ ...thStyle, textAlign: 'center', width: '70px', background: 'rgba(254,205,8,0.06)' }}>Moy CC</th>
                        <th style={{ ...thStyle, textAlign: 'center', width: '70px' }}>EFCFP</th>
                        <th style={{ ...thStyle, textAlign: 'center', width: '70px' }}>EFCFT</th>
                        <th style={{ ...thStyle, textAlign: 'center', width: '80px', background: 'rgba(176,104,185,0.04)' }}>Moyenne</th>
                        <th style={{ ...thStyle, textAlign: 'center', width: '90px' }}>Décision</th>
                      </tr>
                    </thead>
                    <tbody>
                      {modules.map((mod, idx) => {
                        const g = studentGrades[mod.replace(/\./g, '_')] || { c1: '', c2: '', c3: '', efcfp: '', efcft: '' };
                        const moyCC = calcMoyenneCC(g);
                        const avg = calcAvg(g);
                        const complete = isComplete(g);
                        const passed = avg !== null && avg >= 10;

                        return (
                          <motion.tr key={mod} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.02 }}
                            style={{ background: idx % 2 === 0 ? 'white' : 'rgba(248,249,251,0.5)' }}>
                            <td style={tdStyle}>
                              <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-faint)' }}>{idx + 1}</span>
                            </td>
                            <td style={tdStyle}>
                              <p style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '2px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{mod}</p>
                              <span style={{ fontSize: '9px', fontWeight: '600', color: complete ? '#16a34a' : 'var(--text-faint)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                <i className={`fa-${complete ? 'solid fa-circle-check' : 'regular fa-clock'}`} style={{ fontSize: '7px' }}></i>
                                {complete ? 'Complet' : 'En attente'}
                              </span>
                            </td>
                            <td style={{ ...tdStyle, textAlign: 'center' }}>
                              <GradeInput value={g.c1} onChange={(v) => handleGradeChange(mod, 'c1', v)} />
                            </td>
                            <td style={{ ...tdStyle, textAlign: 'center' }}>
                              <GradeInput value={g.c2} onChange={(v) => handleGradeChange(mod, 'c2', v)} />
                            </td>
                            <td style={{ ...tdStyle, textAlign: 'center' }}>
                              <GradeInput value={g.c3 || ''} onChange={(v) => handleGradeChange(mod, 'c3', v)} placeholder="opt." />
                            </td>
                            <td style={{ ...tdStyle, textAlign: 'center', background: 'rgba(254,205,8,0.03)' }}>
                              <span style={{ fontSize: '14px', fontWeight: '700', color: moyCC !== null ? 'var(--text-primary)' : 'var(--text-faint)' }}>
                                {moyCC !== null ? moyCC.toFixed(2) : '—'}
                              </span>
                            </td>
                            <td style={{ ...tdStyle, textAlign: 'center' }}>
                              <GradeInput value={g.efcfp} onChange={(v) => handleGradeChange(mod, 'efcfp', v)} />
                            </td>
                            <td style={{ ...tdStyle, textAlign: 'center' }}>
                              <GradeInput value={g.efcft} onChange={(v) => handleGradeChange(mod, 'efcft', v)} />
                            </td>
                            <td style={{ ...tdStyle, textAlign: 'center', background: 'rgba(176,104,185,0.02)' }}>
                              <span style={{ fontSize: '15px', fontWeight: '800', color: avg !== null ? (passed ? 'var(--primary)' : '#d97706') : 'var(--text-faint)' }}>
                                {avg !== null ? avg.toFixed(2) : '—'}
                              </span>
                            </td>
                            <td style={{ ...tdStyle, textAlign: 'center' }}>
                              {complete && avg !== null ? (
                                <span style={{ padding: '3px 8px', borderRadius: 'var(--radius-pill)', fontSize: '9px', fontWeight: '700', textTransform: 'uppercase',
                                  background: passed ? 'rgba(22,163,74,0.06)' : 'rgba(245,158,11,0.06)', color: passed ? '#16a34a' : '#d97706' }}>
                                  {passed ? 'Validé' : 'Faible'}
                                </span>
                              ) : <span style={{ fontSize: '10px', color: 'var(--text-faint)' }}>—</span>}
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
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '80px 0' }}>
            <i className="fa-solid fa-graduation-cap" style={{ fontSize: '48px', color: 'var(--border)', display: 'block', marginBottom: '16px' }}></i>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-tertiary)', marginBottom: '6px' }}>Sélectionnez un stagiaire</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Utilisez les filtres pour trouver un stagiaire et saisir ses notes.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GradeManagement;
