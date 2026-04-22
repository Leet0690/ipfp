import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { getModulesForStudent } from '../../data/modules';

const Dashboard = () => {
  const { students, teachers, grades, studentAttendance, teacherAttendance } = useApp();

  // Calculate statistics
  const stats = useMemo(() => {
    // Student stats
    const totalStudents = (students || []).length;

    // Teacher stats
    const totalTeachers = (teachers || []).length;

    // Attendance stats
    const studentPresent = (studentAttendance || []).filter(a => a.status === 'present').length;
    const studentTotal = Math.max(1, (studentAttendance || []).length);
    const studentAttendanceRate = Math.round((studentPresent / studentTotal) * 100);

    const teacherPresent = (teacherAttendance || []).filter(a => a.status === 'present').length;
    const teacherTotal = Math.max(1, (teacherAttendance || []).length);
    const teacherAttendanceRate = Math.round((teacherPresent / teacherTotal) * 100);

    // Grade statistics
    let gradesEntered = 0;
    let gradesTotal = 0;
    let passCount = 0;

    (students || []).forEach(s => {
      const studentModules = getModulesForStudent(s);
      gradesTotal += studentModules.length;

      studentModules.forEach(m => {
        const g = grades[s.id]?.[m];
        if (g && (g.c1 || g.c2 || g.efcfp || g.efcft)) {
          gradesEntered++;

          // Calculate if passed (≥ 10/20)
          let cc = null;
          if (g.c1 && g.c2) {
            const c1 = parseFloat(g.c1), c2 = parseFloat(g.c2);
            cc = (c1 + c2) / 2;
            if (g.c3) {
              const c3 = parseFloat(g.c3);
              cc = (c1 + c2 + c3) / 3;
            }
          }

          if (cc && g.efcfp && g.efcft) {
            const efcfp = parseFloat(g.efcfp);
            const efcft = parseFloat(g.efcft);
            const efc = (efcfp + efcft) / 2;
            const final = cc * 0.4 + efc * 0.6;
            if (final >= 10) passCount++;
          }
        }
      });
    });

    const gradeEntryRate = gradesTotal > 0 ? Math.round((gradesEntered / gradesTotal) * 100) : 0;
    const passRate = gradesEntered > 0 ? Math.round((passCount / gradesEntered) * 100) : 0;

    return {
      totalStudents,
      totalTeachers,
      studentAttendanceRate,
      teacherAttendanceRate,
      gradeEntryRate,
      passRate
    };
  }, [students, teachers, grades, studentAttendance, teacherAttendance]);

  const StatCard = ({ icon, label, value, color }) => (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        background: 'white',
        border: '1px solid var(--border-light)',
        borderRadius: '16px',
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        boxShadow: 'var(--shadow-sm)'
      }}
    >
      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        background: `${color}15`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: color,
        fontSize: '20px',
        flexShrink: 0
      }}>
        <i className={`fa-solid ${icon}`}></i>
      </div>
      <div>
        <p style={{
          fontSize: '12px',
          fontWeight: '600',
          color: 'var(--text-muted)',
          margin: '0 0 4px 0',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          {label}
        </p>
        <h3 style={{
          fontSize: '24px',
          fontWeight: '800',
          color: 'var(--text-primary)',
          margin: 0,
          letterSpacing: '-0.02em'
        }}>
          {value}
        </h3>
      </div>
    </motion.div>
  );

  return (
    <div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ marginBottom: '32px' }}
      >
        <h1 style={{
          fontSize: '28px',
          fontWeight: '800',
          color: 'var(--text-primary)',
          marginBottom: '8px',
          letterSpacing: '-0.02em'
        }}>
          👋 Welcome to IPFP Manager
        </h1>
        <p style={{
          fontSize: '14px',
          color: 'var(--text-muted)',
          margin: 0,
          fontWeight: '500'
        }}>
          Here's an overview of your institution's performance
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px',
        marginBottom: '40px'
      }}>
        <StatCard
          icon="fa-user-graduate"
          label="Total Students"
          value={stats.totalStudents}
          color="var(--primary)"
        />
        <StatCard
          icon="fa-chalkboard-user"
          label="Total Teachers"
          value={stats.totalTeachers}
          color="#a06208"
        />
        <StatCard
          icon="fa-user-check"
          label="Student Attendance"
          value={`${stats.studentAttendanceRate}%`}
          color="#16a34a"
        />
        <StatCard
          icon="fa-calendar-check"
          label="Teacher Attendance"
          value={`${stats.teacherAttendanceRate}%`}
          color="#0ea5e9"
        />
        <StatCard
          icon="fa-pen-ruler"
          label="Grades Entered"
          value={`${stats.gradeEntryRate}%`}
          color="var(--accent)"
        />
        <StatCard
          icon="fa-trophy"
          label="Pass Rate"
          value={`${stats.passRate}%`}
          color="#8b5cf6"
        />
      </div>

      {/* Info Box */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          background: 'linear-gradient(135deg, rgba(176, 104, 185, 0.08) 0%, rgba(254, 205, 8, 0.08) 100%)',
          border: '1px solid rgba(176, 104, 185, 0.12)',
          borderRadius: '16px',
          padding: '24px',
          textAlign: 'center'
        }}
      >
        <i className="fa-solid fa-info" style={{
          fontSize: '24px',
          color: 'var(--primary)',
          marginBottom: '12px',
          display: 'block'
        }}></i>
        <h3 style={{
          fontSize: '16px',
          fontWeight: '700',
          color: 'var(--text-primary)',
          marginBottom: '8px'
        }}>
          Getting Started
        </h3>
        <p style={{
          fontSize: '13px',
          color: 'var(--text-secondary)',
          margin: 0,
          lineHeight: '1.6'
        }}>
          Use the navigation menu to manage students, teachers, classes, and view detailed reports. Generate and share access links for students and teachers to access their respective portals.
        </p>
      </motion.div>
    </div>
  );
};

export default Dashboard;
