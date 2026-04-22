import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { FILIERES } from '../data/modules';

const AddStudent = () => {
  const { addStudent } = useApp();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', major: '', regNo: '',
    diploma: '', year: '',
  });
  const [isSuccess, setIsSuccess] = useState(false);

  const availableFilieres = formData.diploma ? (FILIERES[formData.diploma] || []) : [];

  const handleSubmit = (e) => {
    e.preventDefault();
    addStudent(formData);
    setIsSuccess(true);
    setTimeout(() => navigate('/'), 1200);
  };

  const labelStyle = {
    fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)',
    textTransform: 'uppercase', letterSpacing: '0.08em', paddingLeft: '2px',
  };

  const selectStyle = {
    cursor: 'pointer', appearance: 'none',
    backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2394a3b8\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")',
    backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center',
    backgroundSize: '16px', paddingRight: '36px',
  };

  return (
    <div className="max-w-container section-padding" style={{ maxWidth: '640px' }}>
      <motion.button 
        initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate('/')}
        style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontWeight: '600', fontSize: '12px', background: 'transparent', border: 'none', cursor: 'pointer' }}
      >
        <i className="fa-solid fa-arrow-left" style={{ fontSize: '11px' }}></i> Retour au Dashboard
      </motion.button>

      <div style={{ marginBottom: '32px' }}>
        <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          style={{ fontSize: '28px', fontWeight: '800', letterSpacing: '-0.03em', color: 'var(--text-primary)', marginBottom: '6px' }}>
          Nouvelle inscription
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          style={{ color: 'var(--text-tertiary)', fontSize: '15px' }}>
          Créer un nouveau dossier académique stagiaire.
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
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>Inscription réussie</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Redirection en cours…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Nom & Prénom */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={labelStyle}>Nom</label>
                <input required className="input-premium" placeholder="Nom de famille"
                  value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={labelStyle}>Prénom</label>
                <input required className="input-premium" placeholder="Prénom"
                  value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} />
              </div>
            </div>

            {/* Année */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={labelStyle}>Année d'études</label>
              <select required className="input-premium" style={selectStyle}
                value={formData.year} onChange={(e) => setFormData({...formData, year: e.target.value})}>
                <option value="">Sélectionner l'année</option>
                <option value="1ère année">1ère année</option>
                <option value="2ème année">2ème année</option>
              </select>
            </div>

            {/* Diplôme */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={labelStyle}>Niveau</label>
              <select required className="input-premium" style={selectStyle}
                value={formData.diploma}
                onChange={(e) => setFormData({...formData, diploma: e.target.value.trim(), major: ''})}>
                <option value="">Sélectionner le niveau</option>
                {Object.keys(FILIERES).map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {/* Filière (dépend du diplôme) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={labelStyle}>Filière</label>
              <select required className="input-premium" style={selectStyle}
                value={formData.major}
                onChange={(e) => setFormData({...formData, major: e.target.value.trim()})}
                disabled={!formData.diploma}>
                <option value="">{formData.diploma ? 'Sélectionner la filière' : 'Choisissez d\'abord un niveau'}</option>
                {availableFilieres.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>

            {/* Matricule */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={labelStyle}>Matricule</label>
              <input required className="input-premium"
                style={{ fontFamily: 'monospace', letterSpacing: '0.04em' }}
                placeholder="IPFP-2026-XXXX"
                value={formData.regNo} onChange={(e) => setFormData({...formData, regNo: e.target.value})} />
            </div>

            <button type="submit" className="btn-modern primary"
              style={{ width: '100%', justifyContent: 'center', padding: '12px', borderRadius: 'var(--radius-lg)', fontSize: '13px', fontWeight: '700', marginTop: '4px' }}>
              Inscrire le stagiaire <i className="fa-solid fa-cloud-arrow-up" style={{ marginLeft: '6px' }}></i>
            </button>
          </form>
        )}
      </motion.div>


    </div>
  );
};

export default AddStudent;
