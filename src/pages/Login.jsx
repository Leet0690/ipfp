import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const Login = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useApp();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (login(password)) {
      navigate('/');
    } else {
      setError('Clé de sécurité non valide');
      setPassword('');
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', position: 'relative', overflow: 'hidden', background: 'var(--bg-page)',
    }}>
      <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '50%', height: '50%', background: 'rgba(176, 104, 185, 0.04)', filter: 'blur(100px)', borderRadius: '50%' }}></div>
      <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '50%', height: '50%', background: 'rgba(254, 205, 8, 0.03)', filter: 'blur(100px)', borderRadius: '50%' }}></div>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: '100%', maxWidth: '380px', position: 'relative', zIndex: 10 }}>
        
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.15 }}
            style={{ width: '56px', height: '56px', background: 'var(--primary)', boxShadow: 'var(--shadow-glow)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'white', fontSize: '22px' }}>
            <i className="fa-solid fa-school"></i>
          </motion.div>
          <h1 style={{ fontSize: '22px', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--text-primary)', marginBottom: '4px' }}>
            IPFP MANAGER
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '400' }}>
            Connectez-vous à votre espace administrateur
          </p>
        </div>

        {/* Card */}
        <div className="glass-premium" style={{ padding: '28px', borderRadius: '24px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', paddingLeft: '2px' }}>
                Mot de passe
              </label>
              <div style={{ position: 'relative' }}>
                <i className="fa-solid fa-lock" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)', fontSize: '13px' }}></i>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="input-premium" style={{ width: '100%', paddingLeft: '42px', paddingTop: '12px', paddingBottom: '12px' }}
                  placeholder="••••••••" required />
              </div>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                style={{ background: 'rgba(239,68,68,0.06)', color: '#dc2626', fontWeight: '600', padding: '10px 14px', borderRadius: 'var(--radius-lg)', fontSize: '12px', textAlign: 'center', border: '1px solid rgba(239,68,68,0.08)' }}>
                <i className="fa-solid fa-circle-exclamation" style={{ marginRight: '6px' }}></i> {error}
              </motion.div>
            )}

            <button type="submit" className="btn-modern primary"
              style={{ width: '100%', justifyContent: 'center', padding: '12px', borderRadius: 'var(--radius-lg)', fontSize: '13px', fontWeight: '700', letterSpacing: '0.02em' }}>
              Se connecter <i className="fa-solid fa-arrow-right" style={{ fontSize: '11px', marginLeft: '6px' }}></i>
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: '10px', fontWeight: '600', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '28px', lineHeight: '1.6' }}>
          Institut Polytechnique de la Formation Professionnelle
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
