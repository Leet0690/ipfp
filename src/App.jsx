import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import DashboardLayout from './layouts/DashboardLayout';

import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import AddStudent from './pages/AddStudent';
import AddTeacher from './pages/AddTeacher';
import TeacherPortal from './pages/TeacherPortal';
import StudentResults from './pages/StudentResults';
import GradeManagement from './pages/GradeManagement';
import StudentAttendance from './pages/StudentAttendance';
import TeacherAttendance from './pages/TeacherAttendance';
import Reports from './pages/Reports';
import ScheduleManagement from './pages/ScheduleManagement';
import FinanceDashboard from './pages/FinanceDashboard';
import ModuleManagement from './pages/ModuleManagement';

// Detect if we're on the public portail domain (formateurs/stagiaires only)
const isPortailDomain = typeof window !== 'undefined' && window.location.hostname === 'portail-ipfp.web.app';

// Blocked page shown when someone tries to access admin on the portail domain
const PortailBlockedPage = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-page)', padding: '24px' }}>
    <div style={{ textAlign: 'center', maxWidth: '420px' }}>
      <div style={{ width: '80px', height: '80px', background: 'var(--primary-ultra-light)', color: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', margin: '0 auto 24px', boxShadow: '0 0 40px rgba(139, 92, 246, 0.1)' }}>
        <i className="fa-solid fa-school"></i>
      </div>
      <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '12px', letterSpacing: '-0.02em' }}>
        Portail IPFP
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '24px' }}>
        Ce portail est réservé aux <strong>formateurs</strong> et <strong>stagiaires</strong>.<br />
        Veuillez utiliser le lien qui vous a été communiqué pour accéder à votre espace.
      </p>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-pill)', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>
        <i className="fa-solid fa-link" style={{ color: 'var(--primary)' }}></i>
        portail-ipfp.web.app/portal/votre-token
      </div>
    </div>
  </div>
);

const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const AppContent = () => {
  const { isAuthenticated, loading } = useApp();
  const location = useLocation();

  const isPublicRoute = location.pathname.startsWith('/portal/') || 
                        location.pathname.startsWith('/results/') ||
                        location.pathname.startsWith('/teacher/');

  // ── PORTAIL DOMAIN: only allow /portal/ and /results/ routes ──
  if (isPortailDomain) {
    if (loading) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-page)' }}>
          <div className="spinner"></div>
        </div>
      );
    }

    // If the path is not a public route, show the blocked page
    if (!isPublicRoute) {
      return <PortailBlockedPage />;
    }

    // Only render public routes on the portail domain
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-page)', display: 'flex', flexDirection: 'column' }}>
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/portal/:teacherId" element={<TeacherPortal />} />
            <Route path="/teacher/:teacherId" element={<TeacherPortal />} />
            <Route path="/results/:studentId" element={<StudentResults />} />
            <Route path="*" element={<PortailBlockedPage />} />
          </Routes>
        </main>
      </div>
    );
  }

  // ── ADMIN DOMAIN (ipfp-4802c.web.app or localhost): full access ──
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-page)' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated && !isPublicRoute && location.pathname !== '/login') {
    return <Navigate to="/login" />;
  }

  const appRoutes = (
    <Routes>
      <Route path="/" element={<AdminDashboard />} />
      <Route path="/admin/students" element={<AdminDashboard />} />
      <Route path="/admin/teachers" element={<AdminDashboard />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin/add-student" element={<AddStudent />} />
      <Route path="/admin/add-teacher" element={<AddTeacher />} />
      <Route path="/admin/schedules" element={<ScheduleManagement />} />
      <Route path="/admin/grades" element={<GradeManagement />} />
      <Route path="/admin/attendance-students" element={<StudentAttendance />} />
      <Route path="/admin/modules" element={<ModuleManagement />} />
      <Route path="/admin/reports" element={<Reports />} />
      <Route path="/admin/attendance-teachers" element={<TeacherAttendance />} />
      <Route path="/admin/finance" element={<FinanceDashboard />} />
      <Route path="/portal/:teacherId" element={<TeacherPortal />} />
      <Route path="/teacher/:teacherId" element={<TeacherPortal />} />
      <Route path="/results/:studentId" element={<StudentResults />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );

  if (!isAuthenticated || isPublicRoute) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-page)', display: 'flex', flexDirection: 'column' }}>
        <main style={{ flex: 1 }}>
          {appRoutes}
        </main>
      </div>
    );
  }

  return (
    <DashboardLayout>
      {appRoutes}
    </DashboardLayout>
  );
};

const App = () => (
  <AppProvider>
    <AdminAuthProvider>
      <ScrollToTop />
      <AppContent />
    </AdminAuthProvider>
  </AppProvider>
);

export default App;
