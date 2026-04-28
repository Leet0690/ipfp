import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { FILIERES, MODULES_DATA } from '../data/modules';

const AddTeacher = () => {
  const { addTeacher } = useApp();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', diplomas: [], subjects: [], groups: [], years: [] });
  const [isSuccess, setIsSuccess] = useState(false);
  const [moduleSearch, setModuleSearch] = useState('');

  // All diplomas
  const allDiplomas = Object.keys(MODULES_DATA);

  const toggleDiploma = (dip) => {
    setFormData(prev => {
      const isSelected = prev.diplomas.includes(dip);
      const newDiplomas = isSelected ? prev.diplomas.filter(d => d !== dip) : [...prev.diplomas, dip];
      
      // If we add a diploma that is NOT Licence, we should ensure years can be selected.
      // If we only have Licence, and just removed the last non-Licence, we might set year to 1st year.
      return {
        ...prev,
        diplomas: newDiplomas,
        groups: newDiplomas.length === 0 ? [] : prev.groups,
        subjects: newDiplomas.length === 0 ? [] : prev.subjects,
        years: newDiplomas.length === 0 ? [] : prev.years
      };
    });
  };

  const toggleFiliereAllModules = (year, filiere, modules) => {
    const allSelected = modules.every(m => formData.subjects.includes(m));
    if (allSelected) {
      setFormData(prev => ({
        ...prev,
        subjects: prev.subjects.filter(s => !modules.includes(s))
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        subjects: [...new Set([...prev.subjects, ...modules])]
      }));
    }
  };

  const toggleSubject = (mod) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(mod) ? prev.subjects.filter(s => s !== mod) : [...prev.subjects, mod]
    }));
  };

  const toggleGroup = (filiere) => {
    setFormData(prev => ({
      ...prev,
      groups: prev.groups.includes(filiere) ? prev.groups.filter(g => g !== filiere) : [...prev.groups, filiere]
    }));
  };

  const toggleYear = (year) => {
    setFormData(prev => ({
      ...prev,
      years: prev.years.includes(year) ? prev.years.filter(y => y !== year) : [...prev.years, year]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.diplomas.length === 0) return alert('Sélectionnez au moins un diplôme.');
    if (formData.subjects.length === 0) return alert('Sélectionnez au moins un module.');
    if (formData.groups.length === 0) return alert('Sélectionnez au moins une filière.');
    if (formData.years.length === 0) return alert('Sélectionnez au moins un niveau.');
    addTeacher(formData);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      navigate('/admin/teachers');
    }, 1200);
  };

  const labelStyle = { fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', paddingLeft: '2px' };
  const subLabelStyle = { fontSize: '11px', fontWeight: '700', color: 'var(--text-tertiary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' };

  return (
    <div className="max-w-container section-padding" style={{ maxWidth: '900px' }}>
      <motion.button 
        initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate('/admin/teachers')}
        style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontWeight: '600', fontSize: '12px', background: 'transparent', border: 'none', cursor: 'pointer' }}
      >
        <i className="fa-solid fa-arrow-left" style={{ fontSize: '11px' }}></i> Retour à la liste
      </motion.button>

      <div style={{ marginBottom: '32px' }}>
        <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          style={{ fontSize: '28px', fontWeight: '800', letterSpacing: '-0.03em', color: 'var(--text-primary)', marginBottom: '6px' }}>
          Nouveau formateur
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          style={{ color: 'var(--text-tertiary)', fontSize: '15px' }}>
          Ajouter un enseignant avec ses modules et groupes assignés.
        </motion.p>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="glass-card" style={{ padding: '28px', marginBottom: '16px' }}>
        {isSuccess ? (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              style={{ width: '56px', height: '56px', background: '#16a34a', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 8px 24px rgba(22,163,74,0.2)' }}>
              <i className="fa-solid fa-check" style={{ fontSize: '24px' }}></i>
            </motion.div>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>Formateur ajouté</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Redirection en cours…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Nom & Tarif */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={labelStyle}>Nom complet</label>
                <input required className="input-premium" placeholder="Ex: Prof. Alami Mohamed"
                  value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={labelStyle}>Tarif horaire (DH)</label>
                <input type="number" required className="input-premium" placeholder="Ex: 100"
                  value={formData.hourlyRate || ''} onChange={(e) => setFormData({...formData, hourlyRate: parseFloat(e.target.value) || 0})} />
              </div>
            </div>

            {/* Step 0: Diplômes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={labelStyle}>0. Diplôme(s) préparé(s)</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {allDiplomas.map(dip => {
                  const isSelected = formData.diplomas.includes(dip);
                  return (
                    <button type="button" key={dip} onClick={() => toggleDiploma(dip)}
                      style={{
                        padding: '8px 16px', borderRadius: 'var(--radius-lg)', fontSize: '11px', fontWeight: '700',
                        border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                        background: isSelected ? 'var(--primary-ultra-light)' : 'white',
                        color: isSelected ? 'var(--primary)' : 'var(--text-muted)',
                        cursor: 'pointer', transition: 'all 0.15s'
                      }}>
                      {isSelected && <i className="fa-solid fa-check" style={{ marginRight: '6px', fontSize: '9px' }}></i>}
                      {dip}
                    </button>
                  );
                })}
              </div>
            </div>

            {formData.diplomas.length === 0 ? (
               <div style={{ textAlign: 'center', padding: '32px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-light)' }}>
                 <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Veuillez choisir au moins un diplôme pour continuer.</p>
               </div>
            ) : (
<>
            {/* Step 1: Niveaux */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={labelStyle}>1. Niveaux enseignés</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {['1ère année', '2ème année'].map(y => {
                  const isSelected = formData.years.includes(y);
                  return (
                    <button type="button" key={y} onClick={() => toggleYear(y)}
                      style={{
                        padding: '8px 16px', borderRadius: 'var(--radius-pill)', fontSize: '11px', fontWeight: '700',
                        border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                        background: isSelected ? 'var(--primary-ultra-light)' : 'white',
                        color: isSelected ? 'var(--primary)' : 'var(--text-muted)',
                        cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap',
                      }}>
                      {isSelected && <i className="fa-solid fa-check" style={{ marginRight: '6px', fontSize: '9px' }}></i>}
                      {y}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Filières (Filtered Union) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={labelStyle}>2. Filières assignées</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {Array.from(new Set(formData.diplomas.flatMap(d => Object.keys(MODULES_DATA[d] || {})))).map(f => {
                  const isSelected = formData.groups.includes(f);
                  return (
                    <button type="button" key={f} onClick={() => toggleGroup(f)}
                      style={{
                        padding: '6px 14px', borderRadius: 'var(--radius-pill)', fontSize: '11px', fontWeight: '600',
                        border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                        background: isSelected ? 'var(--primary-ultra-light)' : 'white',
                        color: isSelected ? 'var(--primary)' : 'var(--text-muted)',
                        cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap',
                      }}>
                      {isSelected && <i className="fa-solid fa-check" style={{ marginRight: '4px', fontSize: '9px' }}></i>}
                      {f}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Modules (Conditional & Filtered) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px', paddingTop: '20px', borderTop: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px' }}>
                <label style={labelStyle}>
                  3. Modules enseignés
                  <span style={{ fontWeight: '500', textTransform: 'none', letterSpacing: '0', marginLeft: '6px', color: 'var(--primary)' }}>
                    ({formData.subjects.length} sélectionné{formData.subjects.length > 1 ? 's' : ''})
                  </span>
                </label>
                {(formData.years.length > 0 && formData.groups.length > 0) && (
                  <div style={{ position: 'relative', width: '240px' }}>
                    <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)', fontSize: '11px' }}></i>
                    <input className="input-premium" style={{ paddingLeft: '34px', fontSize: '12px', height: '32px' }}
                      placeholder="Filtrer les modules…" value={moduleSearch} onChange={(e) => setModuleSearch(e.target.value)} />
                  </div>
                )}
              </div>

              {/* Selected tags */}
              {formData.subjects.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', background: 'var(--bg-subtle)', padding: '10px', borderRadius: 'var(--radius-lg)' }}>
                  {formData.subjects.map(s => (
                    <span key={s} onClick={() => toggleSubject(s)}
                      style={{ padding: '4px 10px', borderRadius: 'var(--radius-pill)', fontSize: '10px', fontWeight: '600', background: 'var(--primary)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {s} <i className="fa-solid fa-xmark" style={{ fontSize: '8px' }}></i>
                    </span>
                  ))}
                </div>
              )}

              {formData.years.length === 0 || formData.groups.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-xl)', border: '2px dashed var(--border)' }}>
                  <i className="fa-solid fa-layer-group" style={{ fontSize: '24px', color: 'var(--text-faint)', marginBottom: '12px', display: 'block' }}></i>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>
                    Veuillez d'abord choisir au moins un <b>Niveau</b> et une <b>Filière</b> pour afficher les modules.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '20px' }}>
                  {formData.years.sort().map(year => (
                    <div key={year} className="glass-card" style={{ padding: '16px', background: 'white', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-light)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--primary-ultra-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '800' }}>
                          {year[0]}
                        </div>
                        <h3 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>{year}</h3>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '400px', overflowY: 'auto', paddingRight: '4px' }}>
                        {formData.groups.map(filiere => {
                          // Union modules for this filiere+year across all selected diplomas
                          const modules = Array.from(new Set(formData.diplomas.flatMap(d => MODULES_DATA[d]?.[filiere]?.[year] || [])));
                          const filtered = moduleSearch 
                            ? modules.filter(m => m.toLowerCase().includes(moduleSearch.toLowerCase())) 
                            : modules;
                          
                          if (filtered.length === 0) return null;

                          const allSelected = filtered.every(m => formData.subjects.includes(m));

                          return (
                            <div key={filiere} style={{ borderLeft: '2px solid var(--primary-light)', paddingLeft: '12px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <h4 style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', maxWidth: '65%' }}>{filiere}</h4>
                                <button type="button" onClick={() => toggleFiliereAllModules(year, filiere, filtered)}
                                  style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontSize: '10px', fontWeight: '700', cursor: 'pointer' }}>
                                  {allSelected ? 'Désélectionner' : 'Tout sélectionner'}
                                </button>
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                {filtered.map(mod => {
                                  const isSelected = formData.subjects.includes(mod);
                                  return (
                                    <button type="button" key={mod} onClick={() => toggleSubject(mod)}
                                      style={{
                                        width: '100%', textAlign: 'left', padding: '6px 8px', borderRadius: 'var(--radius-md)',
                                        fontSize: '11px', fontWeight: '500', border: 'none', cursor: 'pointer', transition: 'all 0.1s',
                                        background: isSelected ? 'var(--primary-ultra-light)' : 'transparent',
                                        color: isSelected ? 'var(--primary)' : 'var(--text-secondary)',
                                        display: 'flex', alignItems: 'center', gap: '8px',
                                      }}>
                                      <i className={`fa-${isSelected ? 'solid fa-circle-check' : 'regular fa-circle'}`} style={{ fontSize: '11px', color: isSelected ? 'var(--primary)' : 'var(--text-faint)' }}></i>
                                      {mod}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
</>
            )}

            <button type="submit" className="btn-modern primary"
              style={{ width: '100%', justifyContent: 'center', padding: '14px', borderRadius: 'var(--radius-lg)', fontSize: '14px', fontWeight: '800', marginTop: '12px', boxShadow: 'var(--shadow-lg)' }}>
              Enregistrer le formateur <i className="fa-solid fa-cloud-arrow-up" style={{ marginLeft: '6px' }}></i>
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default AddTeacher;
