import React from 'react';
import { motion } from 'framer-motion';

const Reports = () => {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '8px' }}>Reports & Analytics</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
        Tableaux de bord d'analyse en cours de construction.
      </p>
      <div style={{ background: 'white', padding: '32px', borderRadius: '16px', border: '1px solid var(--border-light)', textAlign: 'center' }}>
        <i className="fa-solid fa-chart-line" style={{ fontSize: '48px', color: 'var(--primary)', opacity: 0.5, marginBottom: '16px' }}></i>
        <h3 style={{ fontSize: '16px', color: 'var(--text-primary)', fontWeight: '600' }}>Module Analytics & Performance Tracking</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Prochaine mise à jour.</p>
      </div>
    </motion.div>
  );
};

export default Reports;
