import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';

const NAV_LINKS = [
  { to: "/", icon: "fa-chart-pie", label: "Dashboard" },
  { to: "/admin/students", icon: "fa-users", label: "Stagiaires" },
  { to: "/admin/teachers", icon: "fa-chalkboard-user", label: "Formateurs" },
  { to: "/admin/schedules", icon: "fa-calendar-days", label: "Emplois du Temps" },
  { to: "/admin/grades", icon: "fa-pen-ruler", label: "Notes" },
  { to: "/admin/attendance-students", icon: "fa-user-clock", label: "Absences Stagiaires" },
  { to: "/admin/attendance-teachers", icon: "fa-calendar-check", label: "Présences Formateurs" }
];

export default function DashboardLayout({ children }) {
  const { logout, notifications, markNotificationAsRead, clearNotifications } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const location = useLocation();

  const unreadCount = (notifications || []).filter(n => !n.read).length;

  // Render a single nav link with Framer Motion hover effects
  const renderNavLink = (item, isMobile = false) => {
    const isActive = location.pathname === item.to;
    return (
      <Link 
        key={item.to} 
        to={item.to}
        onClick={() => isMobile && setIsMobileMenuOpen(false)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 16px',
          borderRadius: 'var(--radius-lg)',
          fontSize: '13px',
          fontWeight: '600',
          color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
          background: isActive ? 'var(--primary-ultra-light)' : 'transparent',
          textDecoration: 'none',
          transition: 'all 0.2s var(--ease-smooth)',
          position: 'relative',
          overflow: 'hidden'
        }}
        onMouseEnter={(e) => {
          if (!isActive) e.currentTarget.style.background = 'var(--bg-subtle)';
        }}
        onMouseLeave={(e) => {
          if (!isActive) e.currentTarget.style.background = 'transparent';
        }}
      >
        <div style={{
          width: '24px',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <i className={`fa-solid ${item.icon}`} style={{ fontSize: '14px' }}></i>
        </div>
        
        <AnimatePresence initial={false}>
          {(!isMobile && isSidebarOpen) || isMobile ? (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              style={{ whiteSpace: 'nowrap' }}
            >
              {item.label}
            </motion.span>
          ) : null}
        </AnimatePresence>
        
        {isActive && (
          <motion.div
            layoutId="activeTab"
            style={{
              position: 'absolute',
              left: 0,
              top: '10%',
              bottom: '10%',
              width: '3px',
              backgroundColor: 'var(--primary)',
              borderRadius: '0 4px 4px 0'
            }}
          />
        )}
      </Link>
    );
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-page)', overflow: 'hidden' }}>
      
      {/* Desktop Sidebar */}
      <motion.aside
        className="glass-premium"
        initial={false}
        animate={{ width: isSidebarOpen ? '260px' : '80px' }}
        transition={{ duration: 0.3, type: 'spring', bounce: 0, stiffness: 200, damping: 25 }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid var(--border-light)',
          position: 'relative',
          zIndex: 40,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: isSidebarOpen ? 'space-between' : 'center', height: '72px', padding: isSidebarOpen ? '0 20px' : '0', borderBottom: '1px solid rgba(176, 104, 185, 0.04)' }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '16px', boxShadow: 'var(--shadow-glow)' }}>
              <i className="fa-solid fa-school"></i>
            </div>
            {isSidebarOpen && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <span className="luminous-text" style={{ fontSize: '16px', fontWeight: '900', letterSpacing: '-0.02em', display: 'block' }}>IPFP</span>
                <p style={{ fontSize: '9px', fontWeight: '700', color: 'var(--text-muted)', letterSpacing: '0.06em', marginTop: '-2px', textTransform: 'uppercase' }}>Manager</p>
              </motion.div>
            )}
          </Link>
        </div>

        <nav style={{ flex: 1, padding: '24px 12px', display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }} className="no-scrollbar">
          {NAV_LINKS.map(item => renderNavLink(item))}
        </nav>

        <div style={{ padding: '16px 12px', borderTop: '1px solid var(--border-light)' }}>
           <button 
             onClick={logout} 
             style={{ 
               width: '100%', 
               padding: '12px 16px', 
               borderRadius: 'var(--radius-md)', 
               border: '1px solid var(--border)', 
               background: 'transparent', 
               color: 'var(--text-secondary)', 
               fontSize: '13px', 
               fontWeight: '600',
               cursor: 'pointer', 
               display: 'flex', 
               alignItems: 'center', 
               justifyContent: isSidebarOpen ? 'flex-start' : 'center',
               gap: '12px',
               transition: 'all 0.2s ease'
             }}
             onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-subtle)'; e.currentTarget.style.color = '#ef4444'; }}
             onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
           >
             <i className="fa-solid fa-arrow-right-from-bracket"></i>
             {isSidebarOpen && <span>Déconnexion</span>}
           </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        
        {/* Top Header inside main area */}
        <header style={{ 
          height: '72px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          padding: '0 24px', 
          background: 'rgba(255, 255, 255, 0.5)', 
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border-light)',
          zIndex: 30
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Desktop toggler */}
            <button 
              className="desktop-menu-btn"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              style={{
                width: '36px', height: '36px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)',
                background: 'var(--white)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                transition: 'all 0.2s', boxShadow: 'var(--shadow-xs)'
              }}
            >
              <i className={`fa-solid ${isSidebarOpen ? 'fa-angle-left' : 'fa-bars'}`}></i>
            </button>

            {/* Mobile toggler */}
            <button 
              className="mobile-menu-btn"
              onClick={() => setIsMobileMenuOpen(true)}
              style={{
                width: '36px', height: '36px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)',
                background: 'var(--white)', color: 'var(--text-secondary)', display: 'none', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              }}
            >
              <i className="fa-solid fa-bars"></i>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Notifications */}
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setShowNotifs(!showNotifs)} 
                style={{ 
                  width: '38px', height: '38px', borderRadius: '50%', background: 'var(--white)', border: '1px solid var(--border)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', cursor: 'pointer',
                  position: 'relative', transition: 'all 0.2s', boxShadow: 'var(--shadow-xs)'
                }}
              >
                <i className="fa-regular fa-bell"></i>
                {unreadCount > 0 && (
                  <span style={{ 
                    position: 'absolute', top: '-2px', right: '-2px', background: '#ef4444', color: 'white', 
                    fontSize: '10px', fontWeight: '800', width: '16px', height: '16px', borderRadius: '50%', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--white)'
                  }}>
                    {unreadCount}
                  </span>
                )}
              </button>
              
              <AnimatePresence>
                {showNotifs && (
                  <>
                    <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setShowNotifs(false)}></div>
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95, y: 10 }} 
                      animate={{ opacity: 1, scale: 1, y: 0 }} 
                      exit={{ opacity: 0, scale: 0.95, y: 10 }} 
                      transition={{ duration: 0.2 }} 
                      className="glass-premium" 
                      style={{ position: 'absolute', right: 0, marginTop: '12px', width: '320px', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-xl)', padding: '16px', zIndex: 50 }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>Notifications</h4>
                        {unreadCount > 0 && (
                          <button onClick={() => { clearNotifications(); setShowNotifs(false); }}
                            style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>
                            Tout vider
                          </button>
                        )}
                      </div>
                      <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }} className="no-scrollbar">
                        {(notifications || []).length === 0 ? (
                          <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '32px 0' }}>Aucune notification.</p>
                        ) : (notifications || []).map(n => (
                          <div key={n.id} onClick={() => markNotificationAsRead(n.id)} style={{ padding: '12px 14px', borderRadius: 'var(--radius-lg)', cursor: 'pointer', background: n.read ? 'var(--bg-page)' : 'var(--primary-ultra-light)', border: `1px solid ${n.read ? 'var(--border-light)' : 'rgba(176,104,185,0.1)'}`, transition: 'all 0.2s' }}>
                            <p style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)', lineHeight: '1.4' }}>{n.message}</p>
                            <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '6px', fontWeight: '600' }}>{new Date(n.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* User Profile Mini */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '16px', borderLeft: '1px solid var(--border)' }}>
              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>Admin IPFP</span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '600' }}>Direction</span>
              </div>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                A
              </div>
            </div>
          </div>
        </header>

        {/* Content Scroll Area */}
        <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '24px' }}>
          <div className="max-w-container" style={{ padding: 0 }}>
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.4 }}
            >
              {children}
            </motion.div>
            
            <footer style={{ textAlign: 'center', padding: '48px 0 24px', marginTop: '40px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
                <i className="fa-solid fa-school" style={{ color: 'var(--primary)', fontSize: '14px' }}></i>
                <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-tertiary)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Institut Polytechnique de la Formation Professionnelle
                </span>
              </div>
              <p style={{ fontSize: '11px', fontWeight: '500', color: 'var(--text-faint)', letterSpacing: '0.08em' }}>IPFP Manager · 2026</p>
            </footer>
          </div>
        </main>
      </div>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', zIndex: 100 }}
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Drawer Panel */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
              position: 'fixed',
              top: 0, left: 0, bottom: 0,
              width: '280px',
              background: 'var(--white)',
              zIndex: 101,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'var(--shadow-xl)'
            }}
          >
            <div style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)' }}>
               <Link to="/" onClick={() => setIsMobileMenuOpen(false)} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', background: 'var(--primary)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '14px' }}>
                  <i className="fa-solid fa-school"></i>
                </div>
                <div>
                  <span className="luminous-text" style={{ fontSize: '15px', fontWeight: '900' }}>IPFP</span>
                  <p style={{ fontSize: '9px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Manager</p>
                </div>
              </Link>
              <button onClick={() => setIsMobileMenuOpen(false)} style={{ background: 'transparent', border: 'none', fontSize: '18px', color: 'var(--text-tertiary)', cursor: 'pointer' }}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            
            <nav style={{ flex: 1, padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
              {NAV_LINKS.map(item => renderNavLink(item, true))}
            </nav>
            
            <div style={{ padding: '20px 16px', borderTop: '1px solid var(--border-light)' }}>
              <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} style={{ width: '100%', padding: '12px', background: 'var(--bg-subtle)', border: 'none', borderRadius: 'var(--radius-lg)', color: '#ef4444', fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}>
                <i className="fa-solid fa-arrow-right-from-bracket"></i>
                Déconnexion
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 1024px) {
          .desktop-menu-btn { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
