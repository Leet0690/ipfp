import React from 'react';
import { motion } from 'framer-motion';

const Settings = () => {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '8px' }}>Paramètres & Journal d'Audit</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
        Configurez votre compte administrateur et consultez les journaux d'actions (Audit logs).
      </p>

      <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: '1fr' }}>
        {/* Settings Card */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: '16px', color: 'var(--text-primary)', fontWeight: '700', marginBottom: '16px' }}>
            <i className="fa-solid fa-user-shield" style={{ marginRight: '8px', color: 'var(--primary)' }}></i>
            Sécurité du Compte
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '400px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>Email Administrateur</label>
              <input value="admin@ipfp.com" disabled className="input-premium" style={{ width: '100%', background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>Nouveau Mot de passe</label>
              <input type="password" placeholder="********" className="input-premium" style={{ width: '100%' }} />
            </div>
            <button style={{ padding: '10px 16px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', marginTop: '8px' }}>Mettre à jour</button>
          </div>
        </div>

        {/* Audit Logs Placeholder */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: '16px', color: 'var(--text-primary)', fontWeight: '700', marginBottom: '16px' }}>
            <i className="fa-solid fa-list-check" style={{ marginRight: '8px', color: 'var(--primary)' }}></i>
            Journal d'Audit (Audit Logging)
          </h3>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Date</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Action</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Entité</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '12px 8px' }}>{new Date().toLocaleString()}</td>
                  <td style={{ padding: '12px 8px', fontWeight: '500', color: 'var(--text-primary)' }}>Création d'un lien d'accès</td>
                  <td style={{ padding: '12px 8px' }}>Formateur X</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Settings;
