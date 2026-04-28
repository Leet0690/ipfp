import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { MODULES_DATA } from '../data/modules';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, Legend, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

// --- Styles ---
const cardHeaderStyle = { 
  display: 'flex', 
  justifyContent: 'space-between', 
  alignItems: 'center', 
  marginBottom: '24px' 
};

const selectStyle = {
  background: 'var(--bg-subtle)',
  border: '1px solid var(--border-light)',
  padding: '8px 12px',
  borderRadius: '10px',
  fontSize: '13px',
  fontWeight: '600',
  color: 'var(--text-primary)',
  cursor: 'pointer',
  outline: 'none',
  transition: 'all 0.2s ease'
};

const Reports = () => {
  const { students = [], grades = {}, studentAttendance = [], modules: allModules = [] } = useApp() || {};

  // --- Filter States ---
  const [selectedDiploma, setSelectedDiploma] = useState(Object.keys(MODULES_DATA)[0]);
  const [selectedMajor, setSelectedMajor] = useState('');
  const [selectedYear, setSelectedYear] = useState('1ère année');
  const [selectedModule, setSelectedModule] = useState('');

  // --- Derived Options ---
  const availableMajors = useMemo(() => {
    return selectedDiploma ? Object.keys(MODULES_DATA[selectedDiploma] || {}) : [];
  }, [selectedDiploma]);

  const availableModulesList = useMemo(() => {
    if (!selectedDiploma || !selectedMajor || !selectedYear) return [];
    return allModules.filter(m => 
      m.diploma === selectedDiploma && 
      m.major === selectedMajor && 
      m.year === selectedYear
    );
  }, [selectedDiploma, selectedMajor, selectedYear, allModules]);

  const availableModules = availableModulesList.map(m => m.name);

  // Set defaults when parents change
  React.useEffect(() => {
    if (availableMajors.length > 0 && !availableMajors.includes(selectedMajor)) {
      setSelectedMajor(availableMajors[0]);
    }
  }, [availableMajors, selectedMajor]);

  React.useEffect(() => {
    if (availableModules.length > 0 && !availableModules.includes(selectedModule)) {
      setSelectedModule(availableModules[0]);
    }
  }, [availableModules, selectedModule]);

  // --- Analytics Logic ---
  const analytics = useMemo(() => {
    const totalStudents = students.length || 0;
    
    // 1. Module Progression (C1, C2, C3, EFC)
    const moduleGrades = [];
    let avgC1 = 0, avgC2 = 0, avgC3 = 0, avgEFC = 0;
    let countC1 = 0, countC2 = 0, countC3 = 0, countEFC = 0;

    const filteredStudents = students.filter(s => 
      s.diploma === selectedDiploma && s.major === selectedMajor && s.year === selectedYear
    );

    filteredStudents.forEach(s => {
      const g = grades[s.id]?.[selectedModule];
      if (g) {
        if (g.c1 && !isNaN(parseFloat(g.c1))) { avgC1 += parseFloat(g.c1); countC1++; }
        if (g.c2 && !isNaN(parseFloat(g.c2))) { avgC2 += parseFloat(g.c2); countC2++; }
        if (g.c3 && !isNaN(parseFloat(g.c3))) { avgC3 += parseFloat(g.c3); countC3++; }
        
        const efcfp = parseFloat(g.efcfp), efcft = parseFloat(g.efcft);
        if (!isNaN(efcfp) && !isNaN(efcft)) {
          avgEFC += (efcfp + efcft) / 2;
          countEFC++;
        }
      }
    });

    const progressionData = [
      { name: 'C1', val: countC1 > 0 ? (avgC1 / countC1).toFixed(2) : 0 },
      { name: 'C2', val: countC2 > 0 ? (avgC2 / countC2).toFixed(2) : 0 },
      { name: 'C3', val: countC3 > 0 ? (avgC3 / countC3).toFixed(2) : 0 },
      { name: 'EFC', val: countEFC > 0 ? (avgEFC / countEFC).toFixed(2) : 0 },
    ].filter(d => d.name !== 'C3' || countC3 > 0);

    // 2. Global Module Status
    const globalModuleData = availableModules.map(mod => {
      let total = 0, count = 0;
      filteredStudents.forEach(s => {
        const g = grades[s.id]?.[mod];
        if (g) {
          const efcfp = parseFloat(g.efcfp), efcft = parseFloat(g.efcft);
          if (!isNaN(efcfp) && !isNaN(efcft)) {
            total += (efcfp + efcft) / 2;
            count++;
          }
        }
      });
      return { 
        name: mod.length > 20 ? mod.substring(0, 20) + '...' : mod, 
        fullName: mod,
        moyenne: count > 0 ? (total / count).toFixed(2) : 0 
      };
    }).sort((a, b) => b.moyenne - a.moyenne);

    return { progressionData, globalModuleData, filteredStudentsCount: filteredStudents.length };
  }, [students, grades, selectedDiploma, selectedMajor, selectedYear, selectedModule, availableModules]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', paddingBottom: '60px' }}>
      <header>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div style={{ padding: '8px', background: 'var(--primary-ultra-light)', color: 'var(--primary)', borderRadius: '12px' }}>
             <i className="fa-solid fa-chart-line" style={{ fontSize: '20px' }}></i>
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: '900', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Analytique & Rapports</h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>Visualisation de la progression académique par module et niveau.</p>
      </header>

      {/* --- Filter Bar --- */}
      <div className="glass-card" style={{ padding: '20px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-end', background: 'rgba(255,255,255,0.6)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Niveau</label>
          <select style={selectStyle} value={selectedDiploma} onChange={e => setSelectedDiploma(e.target.value)}>
            {Object.keys(MODULES_DATA).map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Filière</label>
          <select style={selectStyle} value={selectedMajor} onChange={e => setSelectedMajor(e.target.value)}>
            {availableMajors.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Année</label>
          <select style={selectStyle} value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
            <option value="1ère année">1ère année</option>
            <option value="2ème année">2ème année</option>
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minWidth: '200px' }}>
          <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Module Spécifique</label>
          <select style={selectStyle} value={selectedModule} onChange={e => setSelectedModule(e.target.value)}>
            {availableModules.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>

      {/* --- Charts Grid --- */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '24px' }}>
        
        {/* Module Progression Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: '32px', minHeight: '400px' }}>
          <div style={cardHeaderStyle}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)' }}>Progression par Module</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Moyenne des évaluations (C1 → C2 → EFC)</p>
            </div>
            <div style={{ background: 'var(--primary-ultra-light)', color: 'var(--primary)', padding: '6px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '800' }}>
              {analytics.filteredStudentsCount} Stagiaires
            </div>
          </div>
          
          <div style={{ height: '280px', width: '100%', marginTop: '20px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.progressionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: 'var(--text-muted)' }} dy={10} />
                <YAxis domain={[0, 20]} axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: 'var(--text-muted)' }} />
                <Tooltip 
                  contentStyle={{ background: 'rgba(255,255,255,0.95)', border: 'none', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', backdropFilter: 'blur(10px)' }}
                  itemStyle={{ fontWeight: 800, color: 'var(--primary)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="val" 
                  stroke="var(--primary)" 
                  strokeWidth={4} 
                  dot={{ r: 6, fill: 'var(--primary)', strokeWidth: 2, stroke: '#fff' }} 
                  activeDot={{ r: 8, strokeWidth: 0 }}
                  animationDuration={1500}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Global Module Comparison */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card" style={{ padding: '32px', minHeight: '400px' }}>
          <div style={cardHeaderStyle}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)' }}>État Global des Modules</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Moyenne finale par module pour ce niveau</p>
            </div>
          </div>

          <div style={{ height: '300px', width: '100%', marginTop: '10px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.globalModuleData.slice(0, 8)} layout="vertical" margin={{ left: 20, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis type="number" domain={[0, 20]} hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  width={120}
                  tick={{ fontSize: 10, fontWeight: 700, fill: 'var(--text-primary)' }} 
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                  contentStyle={{ background: 'white', border: 'none', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                  formatter={(value) => [`${value} / 20`, 'Moyenne']}
                />
                <Bar dataKey="moyenne" radius={[0, 10, 10, 0]} barSize={20}>
                  {analytics.globalModuleData.slice(0, 8).map((entry, index) => (
                    <Cell key={index} fill={parseFloat(entry.moyenne) >= 10 ? 'var(--primary)' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

      </div>

    </div>
  );
};

export default Reports;
