import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { MODULES_DATA } from '../data/modules';
import { TableSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import {
  Plus,
  Edit3,
  Trash2,
  X,
  Check,
  Layers,
  BookOpen,
  User,
  Users,
  Copy,
} from 'lucide-react';

const labelStyle = { fontSize: '10px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' };

const getClassCode = (diploma, major, year) => {
  const dipPrefix = diploma === 'Technicien Spécialisé' ? 'TS' : (diploma === 'Technicien' ? 'T' : 'Q');
  let majorCode = '';
  if (major.toLowerCase().includes('développement')) majorCode = 'DI';
  else if (major.toLowerCase().includes('gestion informatisée')) majorCode = 'GI';
  else if (major.toLowerCase().includes('logistique')) majorCode = 'GTL';
  else if (major.toLowerCase().includes('entreprises')) majorCode = 'GE';
  else majorCode = major.split(' ').filter(w => w.length > 2).map(w => w[0]).join('').toUpperCase();
  const yearNum = year.match(/\d/)?.[0] || '';
  return `${dipPrefix}${majorCode}${yearNum}`;
};

const ModuleTestPage = () => {
  const { modules, addModule, updateModule, deleteModule, loading, confirmAction, teachers } = useApp();
  const { showToast } = useToast();

  const [viewMode, setViewMode] = useState('module'); // 'module' or 'teacher'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingKey, setEditingKey] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    coefficient: '1',
    semester: 'S1',
    targets: [] // Array of {diploma, major, year}
  });

  // All possible groups from MODULES_DATA
  const allPossibleGroups = useMemo(() => {
    const groups = [];
    Object.entries(MODULES_DATA).forEach(([diploma, majorMap]) => {
      Object.entries(majorMap).forEach(([major, yearMap]) => {
        Object.keys(yearMap).forEach(year => {
          groups.push({ diploma, major, year, code: getClassCode(diploma, major, year) });
        });
      });
    });
    return groups;
  }, []);

  // Grouped modules for display
  const groupedModules = useMemo(() => {
    const groups = {};
    modules.forEach(m => {
      const key = `${m.name.trim().toLowerCase()}_${m.coefficient}_${m.semester || 'S1'}`;
      if (!groups[key]) {
        groups[key] = { 
          name: m.name, 
          coefficient: m.coefficient, 
          semester: m.semester || 'S1',
          assignedGroups: [],
          ids: {} // groupKey -> docId
        };
      }
      const groupKey = `${m.diploma}||${m.major}||${m.year}`;
      groups[key].assignedGroups.push({ diploma: m.diploma, major: m.major, year: m.year, code: getClassCode(m.diploma, m.major, m.year) });
      groups[key].ids[groupKey] = m.id;
    });
    return Object.values(groups).sort((a, b) => a.name.localeCompare(b.name));
  }, [modules]);

  // Data for "View by Teacher"
  const teacherModules = useMemo(() => {
    return (teachers || []).map(t => {
      const assigned = modules.filter(m => 
        t.subjects.includes(m.name) && 
        t.diplomas.includes(m.diploma) && 
        t.groups.includes(m.major) && 
        t.years.includes(m.year)
      ).map(m => ({ ...m, code: getClassCode(m.diploma, m.major, m.year) }));

      return { ...t, assignedModules: assigned };
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [teachers, modules]);

  const resetForm = () => {
    setFormData({ name: '', coefficient: '1', semester: 'S1', targets: [] });
    setIsEditing(false);
    setEditingKey(null);
  };

  const toggleTarget = (group) => {
    const key = `${group.diploma}||${group.major}||${group.year}`;
    setFormData(prev => {
      const exists = prev.targets.some(t => `${t.diploma}||${t.major}||${t.year}` === key);
      if (exists) {
        return { ...prev, targets: prev.targets.filter(t => `${t.diploma}||${t.major}||${t.year}` !== key) };
      } else {
        return { ...prev, targets: [...prev.targets, { diploma: group.diploma, major: group.major, year: group.year }] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.coefficient || formData.targets.length === 0) {
      showToast('Veuillez remplir tous les champs et sélectionner au moins un groupe.', 'warning');
      return;
    }

    try {
      const trimmedName = formData.name.trim();
      const coeff = parseFloat(formData.coefficient);

      if (isEditing && editingKey) {
        const groupData = groupedModules.find(g => `${g.name.trim().toLowerCase()}_${g.coefficient}_${g.semester}` === editingKey);
        if (!groupData) return;
        const currentTargetKeys = new Set(Object.keys(groupData.ids));
        const newTargetKeys = new Set(formData.targets.map(t => `${t.diploma}||${t.major}||${t.year}`));

        for (const key of currentTargetKeys) {
          if (newTargetKeys.has(key)) {
            await updateModule(groupData.ids[key], { name: trimmedName, coefficient: coeff, semester: formData.semester });
          } else {
            await deleteModule(groupData.ids[key]);
          }
        }

        for (const target of formData.targets) {
          const key = `${target.diploma}||${target.major}||${target.year}`;
          if (!currentTargetKeys.has(key)) {
            await addModule({ ...target, name: trimmedName, coefficient: coeff, semester: formData.semester });
          }
        }
        showToast('Module mis à jour pour tous les groupes.', 'success');
      } else {
        for (const target of formData.targets) {
          await addModule({ ...target, name: trimmedName, coefficient: coeff, semester: formData.semester });
        }
        showToast(`Module ajouté à ${formData.targets.length} groupe(s).`, 'success');
      }
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      console.error(err);
      showToast('Erreur lors de l\'enregistrement.', 'error');
    }
  };

  const handleEdit = (groupData) => {
    setFormData({
      name: groupData.name,
      coefficient: groupData.coefficient.toString(),
      semester: groupData.semester,
      targets: groupData.assignedGroups.map(g => ({ diploma: g.diploma, major: g.major, year: g.year }))
    });
    setEditingKey(`${groupData.name.trim().toLowerCase()}_${groupData.coefficient}_${groupData.semester}`);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (groupData) => {
    if (await confirmAction({
      title: 'Supprimer ce module ?',
      message: `Voulez-vous supprimer "${groupData.name}" de TOUS les groupes affectés (${groupData.assignedGroups.length}) ?`,
      type: 'danger'
    })) {
      for (const id of Object.values(groupData.ids)) {
        await deleteModule(id);
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: '900', color: 'var(--text-primary)' }}>Gestion des Modules & Formateurs</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Gérez les modules, leurs assignations de groupes et les formateurs responsables.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ display: 'flex', background: 'var(--bg-subtle)', padding: '4px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
            <button onClick={() => setViewMode('module')} style={{ padding: '6px 12px', borderRadius: 'var(--radius-md)', fontSize: '12px', fontWeight: '800', border: 'none', cursor: 'pointer', background: viewMode === 'module' ? 'white' : 'transparent', color: viewMode === 'module' ? 'var(--primary)' : 'var(--text-muted)', boxShadow: viewMode === 'module' ? 'var(--shadow-xs)' : 'none' }}>
              <Layers size={14} style={{ marginRight: '6px' }} /> Par Module
            </button>
            <button onClick={() => setViewMode('teacher')} style={{ padding: '6px 12px', borderRadius: 'var(--radius-md)', fontSize: '12px', fontWeight: '800', border: 'none', cursor: 'pointer', background: viewMode === 'teacher' ? 'white' : 'transparent', color: viewMode === 'teacher' ? 'var(--primary)' : 'var(--text-muted)', boxShadow: viewMode === 'teacher' ? 'var(--shadow-xs)' : 'none' }}>
              <User size={14} style={{ marginRight: '6px' }} /> Par Formateur
            </button>
          </div>
          <button onClick={() => { resetForm(); setIsModalOpen(true); }} className="btn-modern primary">
            <Plus size={16} style={{ marginRight: 'var(--space-2)' }} /> Créer & Assigner
          </button>
        </div>
      </header>

      {loading ? (
        <div className="glass-card" style={{ padding: 'var(--space-4)' }}><TableSkeleton rows={10} /></div>
      ) : viewMode === 'module' ? (
        groupedModules.length === 0 ? (
          <EmptyState title="Aucun module" message="Commencez par ajouter un module." icon="book" />
        ) : (
          <div className="glass-card" style={{ overflow: 'hidden' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-light)' }}>
                  <th style={{ padding: '16px', fontSize: 'var(--text-xs)', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Module</th>
                  <th style={{ padding: '16px', fontSize: 'var(--text-xs)', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'center' }}>Sem.</th>
                  <th style={{ padding: '16px', fontSize: 'var(--text-xs)', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'center' }}>Coeff.</th>
                  <th style={{ padding: '16px', fontSize: 'var(--text-xs)', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Groupes Assignés</th>
                  <th style={{ padding: '16px', fontSize: 'var(--text-xs)', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Formateurs</th>
                  <th style={{ padding: '16px', fontSize: 'var(--text-xs)', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {groupedModules.map((m, idx) => {
                  const assignedTeachers = (teachers || []).filter(t => 
                    t.subjects.includes(m.name) && 
                    m.assignedGroups.some(g => t.diplomas.includes(g.diploma) && t.groups.includes(g.major) && t.years.includes(g.year))
                  );
                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '16px' }}><p style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: 'var(--text-sm)' }}>{m.name}</p></td>
                      <td style={{ padding: '16px', textAlign: 'center' }}><span style={{ fontWeight: '800', color: 'var(--primary)', fontSize: '12px', background: 'var(--primary-ultra-light)', padding: '4px 8px', borderRadius: '6px' }}>{m.semester}</span></td>
                      <td style={{ padding: '16px', textAlign: 'center' }}><span style={{ padding: '4px 10px', background: 'rgba(0,0,0,0.03)', color: 'var(--text-primary)', borderRadius: '8px', fontWeight: '800', fontSize: '12px' }}>{m.coefficient}</span></td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {m.assignedGroups.map((g, i) => (
                            <span key={i} title={`${g.major} - ${g.year}`} style={{ padding: '2px 8px', background: 'var(--bg-subtle)', borderRadius: '6px', fontSize: '10px', fontWeight: '800', color: 'var(--text-secondary)', border: '1px solid var(--border-light)' }}>{g.code}</span>
                          ))}
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {assignedTeachers.length > 0 ? assignedTeachers.map((t, i) => (
                            <span key={i} style={{ fontSize: '10px', fontWeight: '700', color: '#16a34a', background: 'rgba(22,163,74,0.1)', padding: '2px 8px', borderRadius: '6px' }}>{t.name.split(' ').pop()}</span>
                          )) : <span style={{ fontSize: '10px', color: 'var(--text-faint)' }}>Non assigné</span>}
                        </div>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button onClick={() => handleEdit(m)} className="btn-modern" style={{ padding: '6px 12px', fontSize: '11px', fontWeight: '800' }}><Edit3 size={12} style={{ marginRight: '4px' }} /> Modifier</button>
                          <button onClick={() => { setFormData({ name: m.name, coefficient: m.coefficient.toString(), semester: m.semester, targets: m.assignedGroups }); setIsEditing(false); setIsModalOpen(true); }} className="btn-modern" style={{ padding: '6px 12px', fontSize: '11px', fontWeight: '800', background: 'var(--bg-subtle)' }}><Copy size={12} style={{ marginRight: '4px' }} /> Dupliquer</button>
                          <button onClick={() => handleDelete(m)} className="btn-modern" style={{ padding: '6px 12px', fontSize: '11px', fontWeight: '800', color: '#dc2626', borderColor: 'rgba(220,38,38,0.2)' }}><Trash2 size={12} style={{ marginRight: '4px' }} /> Supprimer</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 'var(--space-6)' }}>
          {teacherModules.map((t, idx) => (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} key={t.id} className="glass-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', background: 'var(--primary-ultra-light)', color: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={20} /></div>
                  <div><h3 style={{ fontSize: '14px', fontWeight: '900', color: 'var(--text-primary)' }}>{t.name}</h3><p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t.assignedModules.length} module(s) assignés</p></div>
                </div>
                <button onClick={() => showToast('Gérez les habilitations via le profil formateur.', 'info')} className="btn-modern" style={{ padding: '6px', borderRadius: '50%' }}><Plus size={14} /></button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {t.assignedModules.length === 0 ? <p style={{ fontSize: '12px', fontStyle: 'italic', color: 'var(--text-faint)', textAlign: 'center', padding: '10px' }}>Aucun module correspondant.</p> : t.assignedModules.map((mod, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
                    <div><p style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-primary)' }}>{mod.name}</p><p style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{mod.code} · Coeff. {mod.coefficient}</p></div>
                    <span style={{ fontSize: '10px', fontWeight: '800', color: 'var(--primary)', background: 'white', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-light)' }}>{mod.semester}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(4px)' }} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="glass-premium" style={{ position: 'relative', width: '100%', maxWidth: '750px', padding: '32px', borderRadius: 'var(--radius-3xl)', boxShadow: 'var(--shadow-xl)', maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: '900' }}>{isEditing ? 'Modifier l\'Assignation' : 'Créer & Assigner Module'}</h2>
                <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}><label style={labelStyle}>Nom du Module</label><input className="input-premium" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required /></div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}><label style={labelStyle}>Coeff.</label><input className="input-premium" type="number" step="0.25" value={formData.coefficient} onChange={e => setFormData({ ...formData, coefficient: e.target.value })} required /></div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}><label style={labelStyle}>Sem.</label><select className="input-premium" value={formData.semester} onChange={e => setFormData({ ...formData, semester: e.target.value })}><option value="S1">S1</option><option value="S2">S2</option></select></div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <label style={labelStyle}>Assigner aux groupes ({formData.targets.length})</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button type="button" onClick={() => setFormData({ ...formData, targets: allPossibleGroups.map(g => ({ diploma: g.diploma, major: g.major, year: g.year })) })} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontSize: '10px', fontWeight: '800', cursor: 'pointer' }}>Tout sélectionner</button>
                      <button type="button" onClick={() => setFormData({ ...formData, targets: [] })} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '10px', fontWeight: '800', cursor: 'pointer' }}>Rien</button>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '8px' }}>
                    {allPossibleGroups.map(group => {
                      const key = `${group.diploma}||${group.major}||${group.year}`;
                      const isSelected = formData.targets.some(t => `${t.diploma}||${t.major}||${t.year}` === key);
                      return (
                        <button key={key} type="button" onClick={() => toggleTarget(group)} style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '10px', borderRadius: 'var(--radius-lg)', border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border-light)'}`, background: isSelected ? 'var(--primary-ultra-light)' : 'white', cursor: 'pointer', textAlign: 'left' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ fontSize: '12px', fontWeight: '800', color: isSelected ? 'var(--primary)' : 'var(--text-primary)' }}>{group.code}</span>{isSelected && <Check size={12} style={{ color: 'var(--primary)' }} />}</div>
                          <p style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{group.major} · {group.year}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn-modern" style={{ flex: 1 }}>Annuler</button>
                  <button type="submit" className="btn-modern primary" style={{ flex: 2 }}>{isEditing ? 'Enregistrer' : 'Assigner'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ModuleTestPage;
