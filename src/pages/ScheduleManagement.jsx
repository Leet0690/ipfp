import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { FILIERES, MODULES_DATA } from '../data/modules';
import EmptyState from '../components/EmptyState';
import { 
  CalendarDays, 
  Plus, 
  Trash2, 
  Clock, 
  User, 
  MapPin, 
  Filter, 
  ChevronRight, 
  X,
  BookOpen,
  Layout,
  Layers
} from 'lucide-react';

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

const ScheduleManagement = () => {
  const { teachers, schedules, addSchedule, deleteSchedule, modules: allModules, confirmAction } = useApp();
  const { showToast } = useToast();
  
  const allFilieres = useMemo(() => Array.from(new Set(Object.values(FILIERES).flat())), []);
  const allAnnees = ['1ère année', '2ème année'];
  
  const [filiere, setFiliere] = useState(allFilieres.includes('Développement Informatique') ? 'Développement Informatique' : allFilieres[0]);
  const [annee, setAnnee] = useState(allAnnees[0]);
  const groupLabel = useMemo(() => getGroupAbbreviation(filiere, annee), [filiere, annee]);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    day: 'Lundi',
    time: '08:30-10:30',
    module: '',
    teacherId: '',
    room: '',
    type: 'Cours'
  });

  const currentModules = useMemo(() => {
    return allModules.filter(m => m.major === filiere && m.year === annee).map(m => m.name);
  }, [filiere, annee, allModules]);

  const filteredSchedules = schedules.filter(s => s.filiere === filiere && s.annee === annee);
  const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.module || !formData.teacherId) return showToast('Veuillez remplir tous les champs', 'warning');
    addSchedule({ ...formData, filiere, annee });
    showToast('Séance ajoutée au planning', 'success');
    setShowAddModal(false);
    setFormData({ ...formData, module: '', room: '' });
  };

  const handleDelete = async (id) => {
    if (await confirmAction({ title: "Supprimer séance ?", message: "Voulez-vous retirer cette séance de l'emploi du temps ?", type: "danger" })) {
      deleteSchedule(id);
      showToast('Séance supprimée', 'success');
    }
  };

  return (
    <div className="max-w-container section-padding">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-8)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: '900', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <CalendarDays size={28} style={{ color: 'var(--primary)' }} /> Emplois du Temps
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Plannings hebdomadaires par filière et groupe.</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-modern primary">
          <Plus size={18} style={{ marginRight: '8px' }} /> Ajouter une séance
        </button>
      </div>

      <div className="glass-card" style={{ padding: 'var(--space-5)', marginBottom: 'var(--space-6)', display: 'flex', gap: 'var(--space-4)', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flex: 1, minWidth: '280px' }}>
          <div style={{ padding: '8px', background: 'var(--primary-ultra-light)', color: 'var(--primary)', borderRadius: 'var(--radius-lg)' }}><Filter size={18} /></div>
          <select className="input-premium" style={{ flex: 1 }} value={filiere} onChange={(e) => setFiliere(e.target.value)}>
            {allFilieres.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', width: '200px' }}>
          <Layers size={18} style={{ color: 'var(--text-faint)' }} />
          <select className="input-premium" style={{ width: '100%' }} value={annee} onChange={(e) => setAnnee(e.target.value)}>
            {allAnnees.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div className="badge-status primary" style={{ height: '40px', display: 'flex', alignItems: 'center', padding: '0 16px', borderRadius: 'var(--radius-lg)' }}>
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: '800' }}>Groupe : {groupLabel}</span>
        </div>
      </div>

      <div style={{ width: '100%', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', paddingBottom: 'var(--space-6)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${days.length}, minmax(160px, 1fr))`, gap: 'var(--space-1)', minWidth: 'fit-content' }}>
            {days.map(day => (
              <div key={day} style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-2xl)', padding: '6px', border: '1px solid var(--border-light)' }}>
                <div style={{ textAlign: 'center', fontWeight: '900', fontSize: '12px', color: 'var(--text-primary)', textTransform: 'uppercase', marginBottom: 'var(--space-2)', padding: '6px', background: 'white', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xs)' }}>
                  {day}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                  {(() => {
                    const daySessions = filteredSchedules.filter(s => s.day === day).sort((a,b) => a.time.localeCompare(b.time));
                    if (daySessions.length === 0) return (
                      <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', color: 'var(--text-faint)', fontSize: '11px', fontWeight: '700', padding: '32px 0' }}>
                        LIBRE
                      </div>
                    );
                    return daySessions.map((session) => {
                      const teacher = teachers.find(t => t.id === session.teacherId);
                      return (
                        <motion.div key={session.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                          style={{ position: 'relative', background: 'white', padding: '8px', minHeight: '90px', display: 'flex', flexDirection: 'column', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-light)', borderLeft: `4px solid ${session.type === 'TP' ? 'var(--primary)' : 'var(--accent)'}` }}>
                          <button onClick={() => handleDelete(session.id)} 
                            style={{ position: 'absolute', top: '6px', right: '6px', background: 'transparent', color: 'var(--text-faint)', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: 'var(--radius-md)' }} 
                            onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-faint)'}>
                            <Trash2 size={12} />
                          </button>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '8px' }}>
                            <Clock size={10} /> {session.time}
                          </div>
                          <div style={{ 
                            fontSize: 'var(--text-xs)', 
                            fontWeight: '800', 
                            color: 'var(--text-primary)', 
                            lineHeight: '1.3', 
                            marginBottom: '8px',
                            wordBreak: 'break-word'
                          }}>{session.module}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', fontWeight: '700', color: 'var(--text-secondary)' }}>
                            <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <User size={10} />
                            </div>
                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>
                              {teacher ? teacher.name : 'N/A'}
                            </span>
                          </div>
                        </motion.div>
                      );
                    });
                  })()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showAddModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-6)' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.1)', backdropFilter: 'blur(8px)' }} onClick={() => setShowAddModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 16 }} 
              className="glass-premium" style={{ width: '100%', maxWidth: '500px', padding: '32px', position: 'relative', zIndex: 101, borderRadius: 'var(--radius-3xl)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: '900' }}>Ajouter une séance</h3>
                <button onClick={() => setShowAddModal(false)} className="action-btn"><X size={20} /></button>
              </div>
              
              <div className="badge-status primary" style={{ marginBottom: '24px', justifyContent: 'flex-start', padding: '12px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Layout size={14} />
                  <span style={{ fontSize: 'var(--text-sm)', fontWeight: '800' }}>{filiere} — {annee}</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={labelStyle}>Jour</label>
                    <select className="input-premium" style={{ width: '100%', marginTop: '6px' }} value={formData.day} onChange={e => setFormData({...formData, day: e.target.value})}>
                      {days.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Horaire</label>
                    <input type="text" className="input-premium" style={{ width: '100%', marginTop: '6px' }} placeholder="Ex: 08:30-10:30" required value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Intervenant</label>
                  <select className="input-premium" style={{ width: '100%', marginTop: '6px' }} required value={formData.teacherId} onChange={e => {
                    const teacher = teachers.find(t => t.id === e.target.value);
                    setFormData({...formData, teacherId: e.target.value, module: teacher?.subjects?.[0] || ''});
                  }}>
                    <option value="">Sélectionner un formateur...</option>
                    {(() => {
                      const filteredTeachers = teachers.filter(t => 
                        (t.groups || []).includes(filiere) && 
                        (t.years || []).includes(annee)
                      );
                      
                      if (filteredTeachers.length === 0) return <option disabled>Aucun formateur assigné à cette filière/année</option>;
                      
                      return filteredTeachers.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ));
                    })()}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Module / Matière</label>
                  <select className="input-premium" style={{ width: '100%', marginTop: '6px' }} required value={formData.module} onChange={e => setFormData({...formData, module: e.target.value})}>
                    <option value="">Sélectionner un module...</option>
                    {(() => {
                      const teacher = teachers.find(t => t.id === formData.teacherId);
                      if (!teacher) return <option disabled>Veuillez sélectionner un formateur d'abord</option>;
                      
                      const teacherModules = teacher.subjects || (teacher.subject ? [teacher.subject] : []);
                      const filtered = currentModules.filter(m => teacherModules.includes(m));
                      
                      if (filtered.length === 0) return <option disabled>Aucun module de cette filière n'est assigné à ce formateur</option>;
                      
                      return filtered.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ));
                    })()}
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                  <button type="button" onClick={() => setShowAddModal(false)} className="btn-modern" style={{ flex: 1, justifyContent: 'center' }}>Annuler</button>
                  <button type="submit" className="btn-modern primary" style={{ flex: 2, justifyContent: 'center' }}>Valider la séance</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const labelStyle = { fontSize: '10px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' };

export default ScheduleManagement;
