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
import Maintenance from './pages/Maintenance';

const IS_MAINTENANCE = true; // Set to true to activate maintenance mode// Component to scroll to top on route change
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



  const isPublicRoute = location.pathname === '/login' || 
                        location.pathname.startsWith('/portal/') || 
                        location.pathname.startsWith('/results/') ||
                        location.pathname.startsWith('/teacher/'); // Backward compatibility for old links
  
  if (IS_MAINTENANCE) {
    return <Maintenance />;
  }
  
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-page)' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated && !isPublicRoute) {
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

  // If it's a public route or user not authenticated, show directly without the layout sidebar
  if (!isAuthenticated || isPublicRoute) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-page)', display: 'flex', flexDirection: 'column' }}>
        <main style={{ flex: 1 }}>
          {appRoutes}
        </main>
      </div>
    );
  }

  // Wrapper layout for Private Admin pages
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
