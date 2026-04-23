import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
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
import ScheduleManagement from './pages/ScheduleManagement';
import Maintenance from './pages/Maintenance';

// Set to true to block the site and show "Under Construction"
const IS_UNDER_MAINTENANCE = false;

// Protected Admin Routes Wrapper
const ProtectedAdminRoute = ({ children }) => {
  const { isAdmin, loading } = useAdminAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'var(--bg-page)'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid var(--border)',
          borderTopColor: 'var(--primary)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
};

const AppContent = () => {
  const { isAuthenticated } = useApp();
  const location = useLocation();

  if (IS_UNDER_MAINTENANCE) {
    return <Maintenance />;
  }

  // Public routes (no authentication needed)
  const isPublicRoute = location.pathname === '/login' || location.pathname.startsWith('/portal/') || location.pathname.startsWith('/results/');
  
  if (isPublicRoute) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-page)', display: 'flex', flexDirection: 'column' }}>
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/portal/:teacherId" element={<TeacherPortal />} />
            <Route path="/results/:studentId" element={<StudentResults />} />
          </Routes>
        </main>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
      <Route path="/admin/students" element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
      <Route path="/admin/teachers" element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
      <Route path="/admin/add-student" element={<ProtectedAdminRoute><AddStudent /></ProtectedAdminRoute>} />
      <Route path="/admin/add-teacher" element={<ProtectedAdminRoute><AddTeacher /></ProtectedAdminRoute>} />
      <Route path="/admin/schedules" element={<ProtectedAdminRoute><ScheduleManagement /></ProtectedAdminRoute>} />
      <Route path="/admin/grades" element={<ProtectedAdminRoute><GradeManagement /></ProtectedAdminRoute>} />
      <Route path="/admin/attendance-students" element={<ProtectedAdminRoute><StudentAttendance /></ProtectedAdminRoute>} />
      <Route path="/admin/attendance-teachers" element={<ProtectedAdminRoute><TeacherAttendance /></ProtectedAdminRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => (
  <AppProvider>
    <AdminAuthProvider>
      <AppContent />
    </AdminAuthProvider>
  </AppProvider>
);

export default App;
