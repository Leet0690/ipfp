import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdminAuth } from '../context/AdminAuthContext';
import Logo from '../components/Logo';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  LogIn, 
  AlertCircle, 
  Loader2,
  CheckCircle2,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const { login } = useAdminAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      setLoading(false);
      return;
    }

    const result = await login(email, password);

    if (result.success) {
      if (rememberMe) {
        localStorage.setItem('admin_email', email);
      } else {
        localStorage.removeItem('admin_email');
      }
      navigate('/admin/dashboard');
    } else {
      setError(result.error || 'Identifiants incorrects');
    }

    setLoading(false);
  };

  React.useEffect(() => {
    const savedEmail = localStorage.getItem('admin_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  return (
    <div className="flex-center" style={{ minHeight: '100vh', background: 'var(--bg-main)', padding: 'var(--space-6)' }}>
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '10%', left: '15%', width: '300px', height: '300px', background: 'var(--primary)', filter: 'blur(150px)', opacity: 0.05 }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '15%', width: '300px', height: '300px', background: 'var(--accent)', filter: 'blur(150px)', opacity: 0.05 }} />
      </div>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
        className="glass-premium" style={{ width: '100%', maxWidth: '440px', padding: '48px 40px', borderRadius: 'var(--radius-3xl)', position: 'relative', zIndex: 10 }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '40px' }}>
          <Logo size={48} />
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: '900', color: 'var(--text-primary)', letterSpacing: '-0.04em' }}>IPFP MANAGER</h1>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '4px' }}>
              <ShieldCheck size={12} style={{ color: 'var(--primary)' }} />
              <span style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Portail Administratif</span>
            </div>
          </div>
        </div>

        <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: '900', textAlign: 'center', marginBottom: '32px', letterSpacing: '-0.04em' }}>Connexion Admin</h2>

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              style={{ background: 'var(--danger-ultra-light)', border: '1px solid var(--danger-light)', borderRadius: 'var(--radius-xl)', padding: '12px 16px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertCircle size={18} style={{ color: 'var(--danger)', flexShrink: 0 }} />
              <p style={{ fontSize: '13px', color: 'var(--danger)', fontWeight: '600' }}>{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={fGroup}>
            <label style={lbl}>Adresse Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={fIcon} />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-premium" style={{ width: '100%', paddingLeft: '40px' }} placeholder="admin@ipfp.com" autoComplete="email" required />
            </div>
          </div>

          <div style={fGroup}>
            <label style={lbl}>Mot de passe</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={fIcon} />
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="input-premium" style={{ width: '100%', paddingLeft: '40px', paddingRight: '44px' }} placeholder="••••••••" autoComplete="current-password" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', display: 'flex' }}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input type="checkbox" id="rememberMe" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} style={{ cursor: 'pointer', accentColor: 'var(--primary)' }} />
            <label htmlFor="rememberMe" style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600', cursor: 'pointer' }}>Se souvenir de moi</label>
          </div>

          <button type="submit" disabled={loading} className="btn-modern primary" style={{ width: '100%', justifyContent: 'center', padding: '14px', borderRadius: 'var(--radius-xl)', fontSize: '15px', marginTop: '8px' }}>
            {loading ? <Loader2 size={18} className="spinner" /> : <><LogIn size={18} style={{ marginRight: '8px' }} /> Se connecter</>}
          </button>
        </form>

        <div style={{ marginTop: '40px', padding: '16px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-2xl)', border: '1px solid var(--border-light)' }}>
          <p style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-faint)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>Accès Démo</p>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <p>Email: <code style={{ color: 'var(--primary)', fontWeight: '700' }}>admin@ipfp.com</code></p>
            <p>Pass: <code style={{ color: 'var(--primary)', fontWeight: '700' }}>admin123</code></p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const fGroup = { display: 'flex', flexDirection: 'column', gap: '8px' };
const lbl = { fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' };
const fIcon = { position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' };

export default AdminLogin;
