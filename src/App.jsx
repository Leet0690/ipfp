import React, { useState } from 'react';
import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AppProvider, useApp } from './context/AppContext';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import AddStudent from './pages/AddStudent';
import AddTeacher from './pages/AddTeacher';
import TeacherPortal from './pages/TeacherPortal';
import StudentResults from './pages/StudentResults';
import GradeManagement from './pages/GradeManagement';
import StudentAttendance from './pages/StudentAttendance';
import TeacherAttendance from './pages/TeacherAttendance';
import Maintenance from './pages/Maintenance';

// Set to true to block the site and show "Under Construction"
const IS_UNDER_MAINTENANCE = true;

const AppContent = () => {
  const { isAuthenticated, logout, notifications, markNotificationAsRead, clearNotifications } = useApp();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const location = useLocation();

  if (IS_UNDER_MAINTENANCE) {
    return <Maintenance />;
  }

  const isPublicRoute = location.pathname === '/login' || location.pathname.startsWith('/portal/') || location.pathname.startsWith('/results/');
  if (!isAuthenticated && !isPublicRoute) return <Navigate to="/login" />;

  const unreadCount = (notifications || []).filter(n => !n.read).length;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', display: 'flex', flexDirection: 'column' }}>
      {isAuthenticated && !isPublicRoute && (
        <header className="glass-premium" style={{ position: 'sticky', top: 0, zIndex: 50, padding: '0 24px', borderBottom: '1px solid var(--border-light)', borderRadius: 0, boxShadow: 'var(--shadow-xs)' }}>
          <div className="max-w-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '56px', padding: 0 }}>
            <Link to="/" onClick={() => { setShowNotifs(false); setShowMobileMenu(false); }} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '34px', height: '34px', background: 'var(--primary)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '15px', boxShadow: 'var(--shadow-sm)' }}>
                <i className="fa-solid fa-school"></i>
              </div>
              <div>
                <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>IPFP MANAGER</span>
                <p style={{ fontSize: '9px', fontWeight: '600', color: 'var(--text-muted)', letterSpacing: '0.04em', lineHeight: 1, marginTop: '1px' }}>Gestion Scolaire</p>
              </div>
            </Link>

            <nav style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div className="nav-links-desktop">
                <NavLink to="/" current={location.pathname === '/'} icon="fa-chart-pie" label="Dashboard" />
                <NavLink to="/admin/add-student" current={location.pathname === '/admin/add-student'} icon="fa-user-plus" label="Stagiaire" />
                <NavLink to="/admin/add-teacher" current={location.pathname === '/admin/add-teacher'} icon="fa-chalkboard-user" label="Formateur" />
                <NavLink to="/admin/grades" current={location.pathname === '/admin/grades'} icon="fa-pen-ruler" label="Notes" />
                <NavLink to="/admin/attendance-students" current={location.pathname === '/admin/attendance-students'} icon="fa-user-clock" label="Abs. Stagiaires" />
                <NavLink to="/admin/attendance-teachers" current={location.pathname === '/admin/attendance-teachers'} icon="fa-calendar-check" label="Prés. Formateurs" />
              </div>

              {/* Mobile menu toggle */}
              <button className="mobile-menu-btn" onClick={() => setShowMobileMenu(!showMobileMenu)}
                style={{ display: 'none', padding: '8px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '16px' }}>
                <i className={`fa-solid ${showMobileMenu ? 'fa-xmark' : 'fa-bars'}`}></i>
              </button>

              {/* Notifications */}
              <div style={{ position: 'relative' }}>
                <button onClick={() => setShowNotifs(!showNotifs)} style={{ color: 'var(--text-muted)', padding: '8px', position: 'relative', fontSize: '15px', cursor: 'pointer', background: 'transparent', border: 'none', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center' }}>
                  <i className="fa-regular fa-bell"></i>
                  {unreadCount > 0 && <span style={{ position: 'absolute', top: '6px', right: '6px', width: '7px', height: '7px', background: '#ef4444', borderRadius: '50%', border: '2px solid white' }}></span>}
                </button>
                <AnimatePresence>
                  {showNotifs && (
                    <>
                      <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setShowNotifs(false)}></div>
                      <motion.div initial={{ opacity: 0, scale: 0.96, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 8 }} transition={{ duration: 0.2 }} className="glass-premium" style={{ position: 'absolute', right: 0, marginTop: '8px', width: '300px', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-xl)', padding: '16px', zIndex: 50 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <h4 style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)' }}>Notifications</h4>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {(notifications || []).length > 0 && (
                              <button onClick={() => { clearNotifications(); setShowNotifs(false); }} 
                                style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '10px', fontWeight: '700', cursor: 'pointer', padding: '2px 4px' }}>
                                Vider
                              </button>
                            )}
                            {unreadCount > 0 && <span style={{ background: 'var(--primary-ultra-light)', color: 'var(--primary)', fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: 'var(--radius-pill)' }}>{unreadCount}</span>}
                          </div>
                        </div>
                        <div style={{ maxHeight: '240px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {(notifications || []).length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '24px 0' }}>Aucune notification.</p>
                          ) : (notifications || []).map(n => (
                            <div key={n.id} onClick={() => markNotificationAsRead(n.id)} style={{ padding: '10px 12px', borderRadius: 'var(--radius-lg)', cursor: 'pointer', background: n.read ? 'transparent' : 'var(--primary-ultra-light)', border: `1px solid ${n.read ? 'transparent' : 'rgba(176,104,185,0.06)'}` }}>
                              <p style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{n.message}</p>
                              <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>{new Date(n.timestamp).toLocaleTimeString()}</p>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              <button onClick={logout} style={{ padding: '7px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '4px' }}>
                <i className="fa-solid fa-arrow-right-from-bracket" style={{ fontSize: '12px' }}></i>
              </button>
            </nav>
          </div>

          {/* Mobile Nav */}
          <AnimatePresence>
            {showMobileMenu && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                style={{ overflow: 'hidden', borderTop: '1px solid var(--border-light)', paddingBottom: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingTop: '8px' }}>
                  <MobileNavLink to="/" label="Dashboard" icon="fa-chart-pie" onClick={() => setShowMobileMenu(false)} />
                  <MobileNavLink to="/admin/add-student" label="Ajouter stagiaire" icon="fa-user-plus" onClick={() => setShowMobileMenu(false)} />
                  <MobileNavLink to="/admin/add-teacher" label="Ajouter formateur" icon="fa-chalkboard-user" onClick={() => setShowMobileMenu(false)} />
                  <MobileNavLink to="/admin/grades" label="Gestion des notes" icon="fa-pen-ruler" onClick={() => setShowMobileMenu(false)} />
                  <MobileNavLink to="/admin/attendance-students" label="Absences Stagiaires" icon="fa-user-clock" onClick={() => setShowMobileMenu(false)} />
                  <MobileNavLink to="/admin/attendance-teachers" label="Présences Formateurs" icon="fa-calendar-check" onClick={() => setShowMobileMenu(false)} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </header>
      )}

      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin/add-student" element={<AddStudent />} />
          <Route path="/admin/add-teacher" element={<AddTeacher />} />
          <Route path="/admin/grades" element={<GradeManagement />} />
          <Route path="/admin/attendance-students" element={<StudentAttendance />} />
          <Route path="/admin/attendance-teachers" element={<TeacherAttendance />} />
          <Route path="/portal/:teacherId" element={<TeacherPortal />} />
          <Route path="/results/:studentId" element={<StudentResults />} />
        </Routes>
      </main>

      {!isPublicRoute && isAuthenticated && (
        <footer style={{ textAlign: 'center', padding: '32px 16px', borderTop: '1px solid var(--border-light)', marginTop: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '6px' }}>
            <i className="fa-solid fa-school" style={{ color: 'var(--primary)', fontSize: '13px' }}></i>
            <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-tertiary)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Institut Polytechnique de la Formation Professionnelle
            </span>
          </div>
          <p style={{ fontSize: '10px', fontWeight: '500', color: 'var(--text-faint)', letterSpacing: '0.08em' }}>IPFP Manager · 2026</p>
        </footer>
      )}

      <style>{`
        .nav-links-desktop { display: flex; align-items: center; gap: 2px; margin-right: 12px; }
        @media (max-width: 768px) {
          .nav-links-desktop { display: none; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </div>
  );
};

const NavLink = ({ to, current, icon, label }) => (
  <Link to={to} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px', borderRadius: 'var(--radius-md)', fontSize: '11px', fontWeight: '600', color: current ? 'var(--primary)' : 'var(--text-muted)', background: current ? 'var(--primary-ultra-light)' : 'transparent', textDecoration: 'none', transition: 'all 0.15s', whiteSpace: 'nowrap' }}>
    <i className={`fa-solid ${icon}`} style={{ fontSize: '10px' }}></i> {label}
  </Link>
);

const MobileNavLink = ({ to, label, icon, onClick }) => (
  <Link to={to} onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: 'var(--radius-lg)', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', textDecoration: 'none', transition: 'background 0.15s' }}>
    <i className={`fa-solid ${icon}`} style={{ fontSize: '12px', color: 'var(--text-muted)', width: '16px', textAlign: 'center' }}></i> {label}
  </Link>
);

const App = () => (
  <AppProvider>
    <AppContent />
  </AppProvider>
);

export default App;
