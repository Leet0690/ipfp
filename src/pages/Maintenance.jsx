import React from 'react';
import { motion } from 'framer-motion';

const Maintenance = () => {
  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      background: 'linear-gradient(135deg, #f8f9fc 0%, #eef2f7 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: "'Inter', sans-serif"
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="glass-card"
        style={{
          maxWidth: '500px',
          width: '100%',
          padding: '48px',
          textAlign: 'center',
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(20px)',
          borderRadius: '32px',
          border: '1px solid rgba(255, 255, 255, 0.8)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.05)'
        }}
      >
        <div style={{
          width: '80px',
          height: '80px',
          background: 'var(--primary-ultra-light)',
          color: 'var(--primary)',
          borderRadius: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '32px',
          margin: '0 auto 32px',
          boxShadow: '0 10px 20px -5px rgba(176, 104, 185, 0.2)'
        }}>
          <i className="fa-solid fa-screwdriver-wrench"></i>
        </div>

        <h1 style={{
          fontSize: '32px',
          fontWeight: '900',
          color: 'var(--text-primary)',
          letterSpacing: '-0.04em',
          marginBottom: '16px',
          lineHeight: 1.1
        }}>
          Site en <span style={{ color: 'var(--primary)' }}>Maintenance</span>
        </h1>

        <p style={{
          fontSize: '16px',
          color: 'var(--text-muted)',
          lineHeight: 1.6,
          marginBottom: '32px',
          fontWeight: '500'
        }}>
          Nous mettons à jour notre plateforme pour vous offrir une meilleure expérience. Le site sera de retour très prochainement.
        </p>

        <div style={{
          padding: '20px',
          background: 'rgba(176, 104, 185, 0.05)',
          borderRadius: '20px',
          border: '1px solid rgba(176, 104, 185, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', animation: 'pulse 2s infinite' }}></span>
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Mise à jour en cours</span>
          </div>
          <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-tertiary)' }}>
            Institution Polytechnique de la Formation Professionnelle
          </p>
        </div>

        <div style={{ marginTop: '40px', fontSize: '12px', color: 'var(--text-faint)', fontWeight: '600' }}>
          &copy; 2026 IPFP Manager · Tous droits réservés
        </div>
      </motion.div>

      <style>{`
        @keyframes pulse {
          0% { transform: scale(0.95); opacity: 0.5; }
          50% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default Maintenance;
