import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  ListTodo, 
  Mail, 
  Lock, 
  Save, 
  History, 
  Settings as SettingsIcon,
  ShieldAlert
} from 'lucide-react';

const Settings = () => {
  return (
    <div className="max-w-container section-padding">
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: '900', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <SettingsIcon size={28} style={{ color: 'var(--primary)' }} /> Paramètres & Audit
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Gérez la sécurité de votre compte et consultez l'historique des actions.</p>
      </div>

      <div style={{ display: 'grid', gap: 'var(--space-6)', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))' }}>
        {/* Security Card */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ padding: '8px', background: 'var(--primary-ultra-light)', color: 'var(--primary)', borderRadius: 'var(--radius-lg)' }}>
              <ShieldCheck size={20} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: '800' }}>Sécurité Administrateur</h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={fGroup}>
              <label style={lbl}>Email de connexion</label>
              <div style={{ position: 'relative' }}>
                <Mail size={14} style={fIcon} />
                <input value="admin@ipfp.com" disabled className="input-premium" style={{ width: '100%', paddingLeft: '34px', background: 'var(--bg-subtle)', color: 'var(--text-faint)' }} />
              </div>
            </div>
            <div style={fGroup}>
              <label style={lbl}>Nouveau mot de passe</label>
              <div style={{ position: 'relative' }}>
                <Lock size={14} style={fIcon} />
                <input type="password" placeholder="••••••••" className="input-premium" style={{ width: '100%', paddingLeft: '34px' }} />
              </div>
            </div>
            <button className="btn-modern primary" style={{ marginTop: '8px', justifyContent: 'center' }}>
              <Save size={16} style={{ marginRight: '8px' }} /> Mettre à jour les accès
            </button>
          </div>
        </motion.div>

        {/* Audit Logs */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ padding: '8px', background: 'var(--bg-subtle)', color: 'var(--text-secondary)', borderRadius: 'var(--radius-lg)' }}>
              <History size={20} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: '800' }}>Journal d'Audit</h3>
          </div>

          <div style={{ background: 'var(--bg-subtle)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: 'rgba(0,0,0,0.02)' }}>
                  <th style={th}>Date & Heure</th>
                  <th style={th}>Action réalisée</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={td}>{new Date().toLocaleDateString()} · {new Date().toLocaleTimeString([], { hour: '2k', minute: '2k' })}</td>
                  <td style={{ ...td, fontWeight: '700', color: 'var(--text-primary)' }}>Authentification Admin</td>
                </tr>
                <tr>
                  <td style={td}>{new Date().toLocaleDateString()} · 10:42</td>
                  <td style={{ ...td, fontWeight: '700', color: 'var(--text-primary)' }}>Mise à jour Emploi du Temps</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: 'rgba(0,0,0,0.02)', borderRadius: 'var(--radius-lg)' }}>
            <ShieldAlert size={14} style={{ color: 'var(--text-faint)' }} />
            <p style={{ fontSize: '11px', color: 'var(--text-faint)', fontWeight: '600' }}>Les journaux sont conservés pendant 90 jours.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const fGroup = { display: 'flex', flexDirection: 'column', gap: '6px' };
const lbl = { fontSize: '10px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' };
const fIcon = { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' };
const th = { padding: '12px 16px', textAlign: 'left', fontSize: '10px', fontWeight: '800', color: 'var(--text-faint)', textTransform: 'uppercase' };
const td = { padding: '16px', color: 'var(--text-muted)' };

export default Settings;
