import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { FILIERES, MODULES_DATA } from '../data/modules';

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
  const { teachers, schedules, addSchedule, deleteSchedule } = useApp();
  
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

  const modules = useMemo(() => {
    for (const dip in MODULES_DATA) {
      if (MODULES_DATA[dip][filiere] && MODULES_DATA[dip][filiere][annee]) {
        return MODULES_DATA[dip][filiere][annee];
      }
    }
    return [];
  }, [filiere, annee]);

  // Filter schedules that belong to selected filiere and annee
  const filteredSchedules = schedules.filter(s => s.filiere === filiere && s.annee === annee);
  
  const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const timeSlots = ['08h30 - 10h30', '10h30 - 12h30', '14h00 - 16h00', '16h00 - 18h00'];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.module || !formData.teacherId) return alert('Veuillez remplir tous les champs');
    
    addSchedule({
      ...formData,
      filiere,
      annee
    });
    
    setShowAddModal(false);
    setFormData({ ...formData, module: '', room: '' });
  };

  return (
    <div className="max-w-container section-padding" style={{ paddingTop: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '4px' }}>
            Gestion des Emplois du Temps
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>
            Planifiez les séances pour chaque filière et année
          </p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-modern primary" style={{ padding: '10px 16px', fontSize: '13px' }}>
          <i className="fa-solid fa-plus"></i> Ajouter une séance
        </button>
      </div>

      <div className="glass-card" style={{ padding: '16px', marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Filtres :</span>
        <select className="input-premium" style={{ fontSize: '13px', padding: '8px 14px', minWidth: '250px' }} value={filiere} onChange={(e) => setFiliere(e.target.value)}>
          {allFilieres.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
        <select className="input-premium" style={{ fontSize: '13px', padding: '8px 14px', width: '140px' }} value={annee} onChange={(e) => setAnnee(e.target.value)}>
          {allAnnees.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      <div style={{ width: '100%', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', paddingBottom: '16px' }} className="no-scrollbar">
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${days.length}, minmax(130px, 1fr))`, gap: '8px', minWidth: '100%' }}>
          {days.map(day => (
            <div key={day} style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-xl)', padding: '16px', border: '1px solid var(--border-light)' }}>
              <div style={{ textAlign: 'center', fontWeight: '800', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
                {day}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                {(() => {
                  const daySessions = filteredSchedules.filter(s => s.day === day).sort((a,b) => a.time.localeCompare(b.time));
                  if (daySessions.length === 0) return <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', color: 'var(--text-faint)', fontSize: '13px', fontWeight: '600' }}>Libre</div>;
                  return daySessions.map((session) => {
                     const teacher = teachers.find(t => t.id === session.teacherId);
                     return (
                      <div key={session.id} style={{ position: 'relative', background: 'var(--bg-page)', padding: '14px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xs)', border: '1px solid var(--border-light)', borderLeft: `3px solid ${session.type === 'TP' ? 'var(--primary)' : 'var(--accent)'}`, transition: 'transform 0.2s' }} className="group">
                        <button onClick={() => deleteSchedule(session.id)} style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: 0, transition: 'opacity 0.2s' }} className="group-hover-show">
                           <i className="fa-solid fa-xmark" style={{ fontSize: '10px' }}></i>
                        </button>
                        <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '6px' }}><i className="fa-regular fa-clock" style={{marginRight: '4px'}}></i> {session.time}</div>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', lineHeight: '1.3', marginBottom: '8px' }}>{session.module}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                           <i className="fa-solid fa-user-tie"></i> {teacher ? teacher.name : 'Inconnu'}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '10px', background: 'var(--primary-ultra-light)', padding: '2px 6px', borderRadius: '4px', fontWeight: '800', color: 'var(--primary)', border: '1px solid rgba(139, 92, 246, 0.1)' }}>{groupLabel}</span>
                        </div>
                      </div>
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
           <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(4px)' }} onClick={() => setShowAddModal(false)}></motion.div>
             <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 16 }} className="glass-card" style={{ width: '100%', maxWidth: '500px', padding: '32px', position: 'relative', zIndex: 101 }}>
               <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '24px', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>Ajouter une séance</h3>
               
               <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--primary)', marginBottom: '16px', background: 'var(--primary-ultra-light)', padding: '8px 12px', borderRadius: 'var(--radius-md)' }}>
                 Filière : {filiere} ({annee})
               </p>

               <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                 
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                   <div>
                     <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '6px' }}>Jour</label>
                     <select className="input-premium" style={{ width: '100%' }} value={formData.day} onChange={e => setFormData({...formData, day: e.target.value})}>
                        {days.map(d => <option key={d} value={d}>{d}</option>)}
                     </select>
                   </div>
                   <div>
                     <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '6px' }}>Heure</label>
                     <input type="text" className="input-premium" style={{ width: '100%' }} placeholder="hh:mm-hh:mm (Ex: 08:30-10:30)" required value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
                   </div>
                 </div>

                 <div>
                   <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '6px' }}>Professeur</label>
                   <select className="input-premium" style={{ width: '100%' }} required value={formData.teacherId} onChange={e => {
                     const teacher = teachers.find(t => t.id === e.target.value);
                     setFormData({...formData, teacherId: e.target.value, module: teacher?.subjects?.[0] || ''});
                   }}>
                      <option value="">Sélectionner un formateur...</option>
                      {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                   </select>
                 </div>

                 <div>
                   <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '6px' }}>Module / Matière</label>
                   <select className="input-premium" style={{ width: '100%' }} required value={formData.module} onChange={e => setFormData({...formData, module: e.target.value})}>
                      <option value="">Sélectionner un module...</option>
                      {(() => {
                        const teacher = teachers.find(t => t.id === formData.teacherId);
                        const teacherModules = teacher ? (teacher.subjects || [teacher.subject]) : [];
                        // Filter academic modules to only show what the teacher teaches
                        return teacherModules.filter(m => modules.includes(m)).map(m => <option key={m} value={m}>{m}</option>);
                      })()}
                      {/* If the teacher teaches something NOT in the curriculum selection for this filiere/year, we show it anyway as fallback */}
                      {(() => {
                        const teacher = teachers.find(t => t.id === formData.teacherId);
                        const teacherModules = teacher ? (teacher.subjects || [teacher.subject]) : [];
                        return teacherModules.filter(m => !modules.includes(m)).map(m => <option key={m} value={m}>{m} (Hors prog.)</option>);
                      })()}
                   </select>
                 </div>

                 <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                   <button type="button" onClick={() => setShowAddModal(false)} className="btn-modern" style={{ color: 'var(--text-muted)' }}>Annuler</button>
                   <button type="submit" className="btn-modern primary">Ajouter</button>
                 </div>
               </form>
             </motion.div>
           </div>
        )}
      </AnimatePresence>
      <style>{`
        .group-hover-show { opacity: 0; }
        .group:hover .group-hover-show { opacity: 1; }
      `}</style>
    </div>
  );
};

export default ScheduleManagement;
