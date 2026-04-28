import React from 'react';
import { motion } from 'framer-motion';

const Maintenance = () => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: 'var(--bg-main)',
      padding: '24px',
      textAlign: 'center'
    }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card" 
        style={{ padding: '64px 48px', maxWidth: '500px', borderRadius: '32px' }}
      >
        <div style={{ 
          width: '100px', 
          height: '100px', 
          background: 'var(--primary-ultra-light)', 
          color: 'var(--primary)', 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          fontSize: '48px', 
          margin: '0 auto 32px',
          boxShadow: '0 0 40px rgba(139, 92, 246, 0.1)'
        }}>
          <i className="fa-solid fa-screwdriver-wrench"></i>
        </div>
        
        <h1 style={{ fontSize: '32px', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '16px', letterSpacing: '-0.02em' }}>
          Maintenance en cours
        </h1>
        
        <p style={{ fontSize: '16px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '32px' }}>
          Nous effectuons actuellement des mises à jour pour améliorer votre expérience. 
          Le portail IPFP sera de retour très prochainement.
        </p>
        
        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '8px', 
          padding: '8px 16px', 
          background: 'var(--bg-subtle)', 
          borderRadius: 'var(--radius-pill)',
          fontSize: '13px',
          fontWeight: '600',
          color: 'var(--text-secondary)'
        }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b', animation: 'pulse 2s infinite' }}></span>
          Retour estimé : Quelques minutes
        </div>
        
        <style>{`
          @keyframes pulse {
            0% { transform: scale(0.95); opacity: 0.5; }
            50% { transform: scale(1.1); opacity: 1; }
            100% { transform: scale(0.95); opacity: 0.5; }
          }
        `}</style>
      </motion.div>
    </div>
  );
};

export default Maintenance;
