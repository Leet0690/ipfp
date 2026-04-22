import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import AdminLayout from './components/AdminLayout';
import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/AdminDashboard/Dashboard';
import StudentManagement from './pages/StudentManagement';
import TeacherManagement from './pages/TeacherManagement';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import AddStudent from './pages/AddStudent';
import AddTeacher from './pages/AddTeacher';
import TeacherPortal from './pages/TeacherPortal';
import StudentResults from './pages/StudentResults';
import GradeManagement from './pages/GradeManagement';
import StudentAttendance from './pages/StudentAttendance';
import TeacherAttendance from './pages/TeacherAttendance';
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
    return <Navigate to="/admin/login" replace />;
  }

  return <AdminLayout>{children}</AdminLayout>;
};

const AppContent = () => {
  const location = useLocation();

  if (IS_UNDER_MAINTENANCE) {
    return <Maintenance />;
  }

  // Public routes (no authentication needed)
  const isPublicRoute = location.pathname.startsWith('/teacher/') || location.pathname.startsWith('/results/');


  return (
    <Routes>
      {/* Admin Login - Public */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Admin Routes - Protected */}
      <Route path="/admin/dashboard" element={<ProtectedAdminRoute><Dashboard /></ProtectedAdminRoute>} />
      
      {/* Management Tables */}
      <Route path="/admin/students" element={<ProtectedAdminRoute><StudentManagement /></ProtectedAdminRoute>} />
      <Route path="/admin/teachers" element={<ProtectedAdminRoute><TeacherManagement /></ProtectedAdminRoute>} />
      
      {/* Forms (Add entities) */}
      <Route path="/admin/add-student" element={<ProtectedAdminRoute><AddStudent /></ProtectedAdminRoute>} />
      <Route path="/admin/add-teacher" element={<ProtectedAdminRoute><AddTeacher /></ProtectedAdminRoute>} />
      
      {/* Other Tools */}
      <Route path="/admin/grades" element={<ProtectedAdminRoute><GradeManagement /></ProtectedAdminRoute>} />
      <Route path="/admin/attendance-students" element={<ProtectedAdminRoute><StudentAttendance /></ProtectedAdminRoute>} />
      <Route path="/admin/attendance-teachers" element={<ProtectedAdminRoute><TeacherAttendance /></ProtectedAdminRoute>} />
      
      {/* Additional Features */}
      <Route path="/admin/reports" element={<ProtectedAdminRoute><Reports /></ProtectedAdminRoute>} />
      <Route path="/admin/settings" element={<ProtectedAdminRoute><Settings /></ProtectedAdminRoute>} />

      {/* Public Token-Based Routes */}
      <Route path="/teacher/:teacherId" element={<TeacherPortal />} />
      <Route path="/results/:studentId" element={<StudentResults />} />

      {/* Default Routes */}
      <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/admin/login" replace />} />
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
