import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAdminAuth } from '../context/AdminAuthContext';

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
      setError('Email and password are required');
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
      setError(result.error);
    }

    setLoading(false);
  };

  // Pre-fill email if "remember me" was checked
  React.useEffect(() => {
    const savedEmail = localStorage.getItem('admin_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f8f9fc 0%, #eef2f7 100%)',
      padding: '24px',
      fontFamily: "'Inter', sans-serif"
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{
          maxWidth: '420px',
          width: '100%',
          padding: '48px 40px',
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.8)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)'
        }}
      >
        {/* Logo */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '32px',
          gap: '12px'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: 'var(--primary)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '24px',
            boxShadow: '0 10px 20px rgba(176, 104, 185, 0.3)'
          }}>
            <i className="fa-solid fa-school"></i>
          </div>
          <div>
            <h1 style={{
              fontSize: '20px',
              fontWeight: '800',
              color: 'var(--text-primary)',
              margin: 0,
              letterSpacing: '-0.02em'
            }}>IPFP MANAGER</h1>
            <p style={{
              fontSize: '10px',
              fontWeight: '600',
              color: 'var(--text-muted)',
              margin: '2px 0 0 0',
              letterSpacing: '0.04em',
              textTransform: 'uppercase'
            }}>Admin Portal</p>
          </div>
        </div>

        {/* Title */}
        <h2 style={{
          fontSize: '28px',
          fontWeight: '900',
          color: 'var(--text-primary)',
          textAlign: 'center',
          marginBottom: '8px',
          letterSpacing: '-0.04em'
        }}>
          Admin Login
        </h2>

        <p style={{
          fontSize: '14px',
          color: 'var(--text-muted)',
          textAlign: 'center',
          marginBottom: '32px',
          fontWeight: '500'
        }}>
          Sign in to access the admin dashboard
        </p>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '12px',
              padding: '12px 16px',
              marginBottom: '24px',
              fontSize: '13px',
              color: '#dc2626',
              fontWeight: '500'
            }}
          >
            ⚠️ {error}
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Email Input */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '700',
              color: 'var(--text-primary)',
              marginBottom: '6px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@ipfp.com"
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '10px',
                border: '1px solid var(--border)',
                fontSize: '14px',
                fontWeight: '500',
                color: 'var(--text-primary)',
                background: 'var(--bg-input)',
                boxSizing: 'border-box',
                transition: 'all 0.15s'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--primary)';
                e.target.style.boxShadow = '0 0 0 3px rgba(176, 104, 185, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Password Input */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '700',
              color: 'var(--text-primary)',
              marginBottom: '6px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 14px',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'var(--text-primary)',
                  background: 'var(--bg-input)',
                  boxSizing: 'border-box',
                  transition: 'all 0.15s',
                  paddingRight: '40px'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--primary)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(176, 104, 185, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  fontSize: '14px',
                  padding: '4px 8px'
                }}
              >
                <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{
                width: '16px',
                height: '16px',
                cursor: 'pointer',
                accentColor: 'var(--primary)'
              }}
            />
            <label
              htmlFor="rememberMe"
              style={{
                fontSize: '13px',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Remember my email
            </label>
          </div>

          {/* Login Button */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={!loading ? { scale: 1.02 } : {}}
            whileTap={!loading ? { scale: 0.98 } : {}}
            style={{
              marginTop: '8px',
              padding: '12px 16px',
              borderRadius: '10px',
              border: 'none',
              background: 'var(--primary)',
              color: 'white',
              fontSize: '14px',
              fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'all 0.15s',
              boxShadow: '0 10px 20px rgba(176, 104, 185, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {loading ? (
              <>
                <div style={{
                  width: '14px',
                  height: '14px',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderTopColor: 'white',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite'
                }} />
                Signing in...
              </>
            ) : (
              <>
                <i className="fa-solid fa-arrow-right-to-bracket" style={{ fontSize: '12px' }}></i>
                Sign In
              </>
            )}
          </motion.button>
        </form>

        {/* Demo Info */}
        <div style={{
          marginTop: '32px',
          paddingTop: '24px',
          borderTop: '1px solid var(--border-light)',
          background: 'rgba(176, 104, 185, 0.05)',
          borderRadius: '12px',
          padding: '12px 14px',
          fontSize: '12px',
          color: 'var(--text-secondary)',
          fontWeight: '500'
        }}>
          <p style={{ margin: '0 0 6px 0' }}>📝 Demo Credentials:</p>
          <p style={{ margin: '2px 0' }}>Email: <code style={{ background: 'rgba(0,0,0,0.05)', padding: '2px 6px', borderRadius: '4px' }}>admin@ipfp.com</code></p>
          <p style={{ margin: '2px 0' }}>Password: <code style={{ background: 'rgba(0,0,0,0.05)', padding: '2px 6px', borderRadius: '4px' }}>admin123</code></p>
        </div>

        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}</style>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
