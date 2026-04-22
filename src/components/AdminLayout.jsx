import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdminAuth } from '../context/AdminAuthContext';

const AdminLayout = ({ children }) => {
  const { logout, adminUser } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const menuItems = [
    { label: 'Dashboard', icon: 'fa-chart-pie', path: '/admin/dashboard' },
    { label: 'Students', icon: 'fa-user-graduate', path: '/admin/students' },
    { label: 'Teachers', icon: 'fa-chalkboard-user', path: '/admin/teachers' },
    { label: 'Classes', icon: 'fa-book', path: '/admin/classes' },
    { label: 'Reports', icon: 'fa-chart-line', path: '/admin/reports' },
    { label: 'Settings', icon: 'fa-gear', path: '/admin/settings' }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-page)' }}>
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 280 : 80 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{
          background: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border-light)',
          display: 'flex',
          flexDirection: 'column',
          padding: '24px 16px',
          overflowY: 'auto'
        }}
      >
        {/* Logo */}
        <Link
          to="/admin/dashboard"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: sidebarOpen ? '12px' : '0',
            marginBottom: '32px',
            textDecoration: 'none',
            justifyContent: sidebarOpen ? 'flex-start' : 'center'
          }}
        >
          <div style={{
            width: '40px',
            height: '40px',
            background: 'var(--primary)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '18px',
            flexShrink: 0
          }}>
            <i className="fa-solid fa-school"></i>
          </div>
          {sidebarOpen && (
            <div>
              <h1 style={{
                fontSize: '13px',
                fontWeight: '800',
                color: 'var(--text-primary)',
                margin: 0,
                letterSpacing: '-0.02em'
              }}>IPFP</h1>
              <p style={{
                fontSize: '8px',
                fontWeight: '600',
                color: 'var(--text-muted)',
                margin: '0px',
                letterSpacing: '0.04em'
              }}>Admin</p>
            </div>
          )}
        </Link>

        {/* Navigation */}
        <nav style={{ flex: 1 }}>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: sidebarOpen ? '12px' : '0',
                padding: '10px 12px',
                marginBottom: '8px',
                borderRadius: '10px',
                textDecoration: 'none',
                color: isActive(item.path) ? 'var(--primary)' : 'var(--text-secondary)',
                background: isActive(item.path) ? 'var(--primary-ultra-light)' : 'transparent',
                fontSize: sidebarOpen ? '13px' : '12px',
                fontWeight: isActive(item.path) ? '700' : '600',
                transition: 'all 0.2s',
                justifyContent: sidebarOpen ? 'flex-start' : 'center',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                if (!isActive(item.path)) {
                  e.currentTarget.style.background = 'rgba(176, 104, 185, 0.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive(item.path)) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <i className={`fa-solid ${item.icon}`} style={{ fontSize: '14px', width: '16px', textAlign: 'center' }}></i>
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Sidebar Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '8px',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: '14px',
            marginBottom: '16px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--bg-secondary-hover)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--bg-tertiary)';
            e.currentTarget.style.color = 'var(--text-muted)';
          }}
        >
          <i className={`fa-solid ${sidebarOpen ? 'fa-chevron-left' : 'fa-chevron-right'}`}></i>
        </button>

        {/* User Profile */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: sidebarOpen ? '10px' : '0',
              padding: '10px 12px',
              borderRadius: '10px',
              border: '1px solid var(--border)',
              background: 'var(--bg-tertiary)',
              cursor: 'pointer',
              transition: 'all 0.2s',
              justifyContent: sidebarOpen ? 'flex-start' : 'center'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--primary-ultra-light)';
              e.currentTarget.style.borderColor = 'var(--primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--bg-tertiary)';
              e.currentTarget.style.borderColor = 'var(--border)';
            }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '14px',
              flexShrink: 0
            }}>
              <i className="fa-solid fa-user"></i>
            </div>
            {sidebarOpen && (
              <div style={{ textAlign: 'left', flex: 1 }}>
                <p style={{
                  fontSize: '12px',
                  fontWeight: '700',
                  color: 'var(--text-primary)',
                  margin: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {adminUser?.email?.split('@')[0] || 'Admin'}
                </p>
                <p style={{
                  fontSize: '10px',
                  color: 'var(--text-muted)',
                  margin: '2px 0 0 0'
                }}>
                  Super Admin
                </p>
              </div>
            )}
          </button>

          {/* User Menu Dropdown */}
          <AnimatePresence>
            {showUserMenu && sidebarOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                style={{
                  position: 'absolute',
                  bottom: 'calc(100% + 8px)',
                  left: 0,
                  right: 0,
                  background: 'white',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  boxShadow: 'var(--shadow-lg)',
                  zIndex: 100,
                  overflow: 'hidden'
                }}
              >
                <Link
                  to="/admin/settings"
                  onClick={() => setShowUserMenu(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 14px',
                    borderBottom: '1px solid var(--border-light)',
                    textDecoration: 'none',
                    color: 'var(--text-secondary)',
                    fontSize: '13px',
                    fontWeight: '500',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--primary-ultra-light)';
                    e.currentTarget.style.color = 'var(--primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                >
                  <i className="fa-solid fa-gear" style={{ fontSize: '12px' }}></i>
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 14px',
                    border: 'none',
                    background: 'transparent',
                    textDecoration: 'none',
                    color: '#dc2626',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(220, 38, 38, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <i className="fa-solid fa-arrow-right-from-bracket" style={{ fontSize: '12px' }}></i>
                  Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <header style={{
          background: 'white',
          borderBottom: '1px solid var(--border-light)',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: 'var(--shadow-xs)'
        }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              display: 'none',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              fontSize: '18px'
            }}
          >
            <i className={`fa-solid ${sidebarOpen ? 'fa-bars' : 'fa-xmark'}`}></i>
          </button>

          <div style={{ flex: 1 }} />

          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              background: 'transparent',
              color: 'var(--text-muted)',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#dc2626';
              e.currentTarget.style.color = '#dc2626';
              e.currentTarget.style.background = 'rgba(220, 38, 38, 0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.color = 'var(--text-muted)';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <i className="fa-solid fa-arrow-right-from-bracket" style={{ fontSize: '11px' }}></i>
            Logout
          </button>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
          {children}
        </main>

        {/* Footer */}
        <footer style={{
          borderTop: '1px solid var(--border-light)',
          padding: '16px 24px',
          textAlign: 'center',
          fontSize: '10px',
          color: 'var(--text-faint)',
          fontWeight: '500'
        }}>
          © 2026 IPFP Manager · All rights reserved
        </footer>
      </div>

      <style>{`
        @media (max-width: 768px) {
          aside { width: 80px !important; }
          aside [style*="sidebarOpen"] { display: none; }
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;
