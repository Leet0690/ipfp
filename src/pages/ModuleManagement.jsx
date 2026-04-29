import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { MODULES_DATA } from '../data/modules';

const ModuleManagement = () => {
  const { modules, addModule, updateModule, deleteModule, addNotification } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    coefficient: '1',
    diploma: 'Technicien Spécialisé',
    major: 'Développement Informatique',
    year: '1ère année',
    semester: 'S1'
  });

  const [filterDiploma, setFilterDiploma] = useState('');
  const [filterMajor, setFilterMajor] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterSemester, setFilterSemester] = useState('');
  
  const [page, setPage] = useState(1);
  const itemsPerPage = 15;

  // --- Helpers ---
  const diplomas = Object.keys(MODULES_DATA);
  const majors = filterDiploma ? Object.keys(MODULES_DATA[filterDiploma] || {}) : [];
  
  const groupedModules = useMemo(() => {
    const f = modules.filter(m => {
      if (filterDiploma && m.diploma !== filterDiploma) return false;
      if (filterMajor && m.major !== filterMajor) return false;
      if (filterYear && m.year !== filterYear) return false;
      const sem = m.semester || 'S1';
      if (filterSemester && sem !== filterSemester) return false;
      return true;
    });

    const groups = {};
    f.forEach(m => {
      const key = `${m.name}_${m.diploma}_${m.coefficient}_${m.semester || 'S1'}`;
      if (!groups[key]) {
        groups[key] = {
          ...m,
          allClasses: [],
          ids: []
        };
      }
      
      // Professional formatting: TS + DI + 1 = TSDI1
      const dipPrefix = m.diploma === 'Technicien Spécialisé' ? 'TS' : (m.diploma === 'Technicien' ? 'T' : 'Q');
      let majorCode = '';
      if (m.major.toLowerCase().includes('développement')) majorCode = 'DI';
      else if (m.major.toLowerCase().includes('gestion informatisée')) majorCode = 'GI';
      else if (m.major.toLowerCase().includes('logistique')) majorCode = 'GTL';
      else if (m.major.toLowerCase().includes('entreprises')) majorCode = 'GE';
      else majorCode = m.major.split(' ').filter(w => w.length > 2).map(w => w[0]).join('').toUpperCase();
      
      const yearNum = m.year.match(/\d/)?.[0] || '';
      const classCode = `${dipPrefix}${majorCode}${yearNum}`;
      
      if (!groups[key].allClasses.includes(classCode)) {
        groups[key].allClasses.push(classCode);
      }
      groups[key].ids.push(m.id);
    });
    return Object.values(groups);
  }, [modules, filterDiploma, filterMajor, filterYear, filterSemester]);

  const paginatedModules = useMemo(() => {
    return groupedModules.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  }, [groupedModules, page]);
  
  const totalPages = Math.ceil(groupedModules.length / itemsPerPage);

  const [selectedIds, setSelectedIds] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.coefficient) return;

    try {
      const trimmedName = formData.name.trim();
      if (isEditing) {
        // Update all modules in the group
        for (const id of selectedIds) {
          await updateModule(id, { ...formData, name: trimmedName, coefficient: parseFloat(formData.coefficient) });
        }
      } else {
        await addModule({ ...formData, name: trimmedName, coefficient: parseFloat(formData.coefficient) });
      }
      setIsModalOpen(false);
      resetForm();
    } catch (e) {
      alert("Erreur de sauvegarde.");
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      coefficient: '1',
      diploma: Object.keys(MODULES_DATA)[0],
      major: Object.keys(MODULES_DATA[Object.keys(MODULES_DATA)[0]])[0],
      year: '1ère année',
      semester: 'S1'
    });
    setIsEditing(false);
    setSelectedIds([]);
  };

  const handleEdit = (m) => {
    setFormData({
      name: m.name,
      coefficient: m.coefficient.toString(),
      diploma: m.diploma,
      major: m.major,
      year: m.year,
      semester: m.semester || 'S1'
    });
    setSelectedIds(m.ids || [m.id]);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (group) => {
    if (window.confirm(`Supprimer le module "${group.name}" pour toutes les classes associées ?`)) {
      for (const id of group.ids) {
        await deleteModule(id);
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '900', color: 'var(--text-primary)' }}>Gestion des Modules</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Configurez les matières et leurs coefficients pour chaque filière.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => { resetForm(); setIsModalOpen(true); }} className="btn-modern primary">
            <i className="fa-solid fa-plus" style={{ marginRight: '8px' }}></i> Ajouter Module
          </button>
        </div>
      </header>

      {/* --- Filters --- */}
      <div className="glass-card" style={{ padding: '20px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <select className="input-premium" style={{ flex: 1 }} value={filterYear} onChange={e => { setFilterYear(e.target.value); setPage(1); }}>
          <option value="" disabled>-- Choisir l'année --</option>
          <option value="1ère année">1ère année</option>
          <option value="2ème année">2ème année</option>
        </select>
        <select className="input-premium" style={{ flex: 1 }} value={filterDiploma} onChange={e => { setFilterDiploma(e.target.value); setPage(1); }}>
          <option value="" disabled>-- Choisir le niveau --</option>
          {diplomas.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select className="input-premium" style={{ flex: 1 }} value={filterMajor} onChange={e => { setFilterMajor(e.target.value); setPage(1); }}>
          <option value="" disabled>-- Choisir la filière --</option>
          {majors.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select className="input-premium" style={{ flex: 1, maxWidth: '160px' }} value={filterSemester} onChange={e => { setFilterSemester(e.target.value); setPage(1); }}>
          <option value="" disabled>-- Choisir le semestre --</option>
          <option value="S1">S1</option>
          <option value="S2">S2</option>
        </select>
      </div>

      {/* --- Modules Table --- */}
      {(!filterYear || !filterDiploma || !filterMajor || !filterSemester) ? (
        <div className="glass-card" style={{ padding: '64px', textAlign: 'center' }}>
          <i className="fa-solid fa-filter" style={{ fontSize: '36px', color: 'var(--border)', display: 'block', marginBottom: '12px' }}></i>
          <p style={{ color: 'var(--text-muted)', fontWeight: '500', fontSize: '14px' }}>Veuillez sélectionner l'année, le niveau, la filière et le semestre pour afficher la liste des modules.</p>
        </div>
      ) : (
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-light)' }}>
              <th style={{ padding: '16px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>Nom du Module</th>
              <th style={{ padding: '16px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>Niveau</th>
              <th style={{ padding: '16px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textAlign: 'center' }}>Sem.</th>
              <th style={{ padding: '16px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>Classes</th>
              <th style={{ padding: '16px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textAlign: 'center' }}>Coeff.</th>
              <th style={{ padding: '16px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedModules.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>Aucun module trouvé.</td>
              </tr>
            ) : paginatedModules.map((m, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '16px' }}>
                  <p style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '14px' }}>{m.name}</p>
                </td>
                <td style={{ padding: '16px' }}>
                  <p style={{ fontSize: '12px', fontWeight: '600' }}>{m.diploma}</p>
                </td>
                <td style={{ padding: '16px', textAlign: 'center' }}>
                  <span style={{ fontWeight: '700', color: 'var(--primary)', fontSize: '12px' }}>{m.semester || 'S1'}</span>
                </td>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {m.allClasses.map((c, i) => (
                      <span key={i} style={{ padding: '2px 8px', background: 'var(--bg-subtle)', borderRadius: '6px', fontSize: '10px', fontWeight: '700', color: 'var(--text-secondary)' }}>
                        {c}
                      </span>
                    ))}
                  </div>
                </td>
                <td style={{ padding: '16px', textAlign: 'center' }}>
                  <span style={{ padding: '4px 10px', background: 'var(--primary-ultra-light)', color: 'var(--primary)', borderRadius: '8px', fontWeight: '800', fontSize: '12px' }}>
                    {m.coefficient}
                  </span>
                </td>
                <td style={{ padding: '16px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button onClick={() => handleEdit(m)} className="btn-modern" style={{ padding: '6px', minWidth: '32px' }}><i className="fa-solid fa-pen-to-square"></i></button>
                    <button onClick={() => handleDelete(m)} className="btn-modern" style={{ padding: '6px', minWidth: '32px', color: '#ef4444' }}><i className="fa-solid fa-trash"></i></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '16px 0', borderTop: '1px solid var(--border-light)' }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-modern" style={{ padding: '6px 12px', fontSize: '11px', opacity: page === 1 ? 0.5 : 1, cursor: page === 1 ? 'not-allowed' : 'pointer' }}>
              <i className="fa-solid fa-chevron-left"></i> Précédent
            </button>
            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>
              Page <span style={{ color: 'var(--text-primary)' }}>{page}</span> sur {totalPages}
            </span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-modern" style={{ padding: '6px 12px', fontSize: '11px', opacity: page === totalPages ? 0.5 : 1, cursor: page === totalPages ? 'not-allowed' : 'pointer' }}>
              Suivant <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>
        )}
      </div>
      )}

      {/* --- Modal --- */}
      <AnimatePresence>
        {isModalOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }} />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="glass-premium" style={{ position: 'relative', width: '100%', maxWidth: '500px', padding: '32px', borderRadius: '24px', boxShadow: 'var(--shadow-xl)' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '900', marginBottom: '24px' }}>{isEditing ? 'Modifier Module' : 'Nouveau Module'}</h2>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>Nom du Module</label>
                  <input className="input-premium" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>Coefficient</label>
                    <input className="input-premium" type="number" step="0.25" min="0.25" value={formData.coefficient} onChange={e => setFormData({...formData, coefficient: e.target.value})} required />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>Semestre</label>
                    <select className="input-premium" value={formData.semester} onChange={e => setFormData({...formData, semester: e.target.value})}>
                      <option value="S1">S1</option>
                      <option value="S2">S2</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>Année</label>
                    <select className="input-premium" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})}>
                      <option value="1ère année">1ère année</option>
                      <option value="2ème année">2ème année</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>Niveau</label>
                    <select className="input-premium" value={formData.diploma} onChange={e => setFormData({...formData, diploma: e.target.value, major: Object.keys(MODULES_DATA[e.target.value] || {})[0] || ''})}>
                      {diplomas.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>Filière</label>
                  <select className="input-premium" value={formData.major} onChange={e => setFormData({...formData, major: e.target.value})}>
                    {Object.keys(MODULES_DATA[formData.diploma] || {}).map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn-modern" style={{ flex: 1 }}>Annuler</button>
                  <button type="submit" className="btn-modern primary" style={{ flex: 1 }}>{isEditing ? 'Enregistrer' : 'Ajouter'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ModuleManagement;
