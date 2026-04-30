import React from 'react';
import { motion } from 'framer-motion';
import { Construction, Timer, Settings2, Sparkles } from 'lucide-react';

const Maintenance = () => {
  return (
    <div className="flex-center" style={{ minHeight: '100vh', background: 'var(--bg-main)', padding: 'var(--space-6)' }}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}
        className="glass-premium" style={{ padding: '64px 40px', maxWidth: '520px', textAlign: 'center', borderRadius: 'var(--radius-3xl)' }}>
        
        <div style={{ position: 'relative', width: '100px', height: '100px', margin: '0 auto 40px' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'var(--primary-ultra-light)', borderRadius: '50%', filter: 'blur(20px)', opacity: 0.5 }} />
          <div style={{ position: 'relative', width: '100%', height: '100%', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-light)' }}>
            <Construction size={48} />
          </div>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            style={{ position: 'absolute', top: '-10px', right: '-10px', color: 'var(--accent)' }}>
            <Settings2 size={24} />
          </motion.div>
        </div>
        
        <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '16px', letterSpacing: '-0.04em' }}>
          Maintenance Évolutive
        </h1>
        
        <p style={{ fontSize: '16px', color: 'var(--text-muted)', lineHeight: '1.7', marginBottom: '40px', fontWeight: '500' }}>
          Nous optimisons actuellement les systèmes LUX-CORE pour vous offrir une expérience plus fluide. 
          Le portail IPFP sera de retour dans quelques instants.
        </p>
        
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '10px 20px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-pill)', border: '1px solid var(--border-light)' }}>
          <Timer size={16} style={{ color: 'var(--primary)' }} />
          <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-secondary)' }}>Reprise estimée : <span style={{ color: 'var(--primary)' }}>Imminente</span></span>
        </div>

        <div style={{ marginTop: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--text-faint)' }}>
          <Sparkles size={14} />
          <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Propulsé par LUX-CORE V3</span>
        </div>
      </motion.div>
    </div>
  );
};

export default Maintenance;
