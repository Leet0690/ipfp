import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import DashboardLayout from './layouts/DashboardLayout';
import { School, Link as LinkIcon, Globe, ShieldAlert, Loader2 } from 'lucide-react';

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

const isPortailDomain = typeof window !== 'undefined' && window.location.hostname === 'portail-ipfp.web.app';

const PortailBlockedPage = () => (
  <div className="flex-center" style={{ minHeight: '100vh', background: 'var(--bg-main)', padding: 'var(--space-6)' }}>
    <div style={{ textAlign: 'center', maxWidth: '440px' }}>
      <div style={{ width: '80px', height: '80px', background: 'var(--primary-ultra-light)', color: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: 'var(--shadow-lg)' }}>
        <School size={40} />
      </div>
      <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '16px', letterSpacing: '-0.04em' }}>
        Portail Académique IPFP
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: '1.7', marginBottom: '32px' }}>
        Cet accès est exclusivement réservé aux <strong>formateurs</strong> et aux <strong>stagiaires</strong> munis d'un lien d'accès sécurisé.
      </p>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '12px 20px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-pill)', fontSize: '13px', fontWeight: '800', color: 'var(--text-secondary)', border: '1px solid var(--border-light)' }}>
        <LinkIcon size={14} style={{ color: 'var(--primary)' }} />
        <span>portail-ipfp.web.app/portal/token</span>
      </div>
    </div>
  </div>
);

const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

const AppContent = () => {
  const { isAuthenticated, loading } = useApp();
  const location = useLocation();
  const isPublicRoute = location.pathname.startsWith('/portal/') || location.pathname.startsWith('/results/') || location.pathname.startsWith('/teacher/');

  if (isPortailDomain) {
    if (loading) return <div className="flex-center" style={{ height: '100vh' }}><Loader2 className="spinner" size={32} style={{ color: 'var(--primary)' }} /></div>;
    if (!isPublicRoute) return <PortailBlockedPage />;
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
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

  if (!isAuthenticated && !isPublicRoute && location.pathname !== '/login') return <Navigate to="/login" />;

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

  if (!isAuthenticated || isPublicRoute) return <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}><main style={{ flex: 1 }}>{appRoutes}</main></div>;
  return <DashboardLayout>{appRoutes}</DashboardLayout>;
};

const App = () => (
  <AdminAuthProvider>
    <ScrollToTop />
    <AppContent />
  </AdminAuthProvider>
);

export default App;
