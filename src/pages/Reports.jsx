import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { MODULES_DATA } from '../data/modules';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, Cell
} from 'recharts';
import { 
  ChartLine, 
  Filter, 
  BarChart3, 
  Users, 
  TrendingUp, 
  BookOpen,
  PieChart,
  LayoutDashboard
} from 'lucide-react';

const Reports = () => {
  const { students = [], grades = {}, modules: allModules = [] } = useApp() || {};

  const [selectedDiploma, setSelectedDiploma] = useState(Object.keys(MODULES_DATA)[0]);
  const [selectedMajor, setSelectedMajor] = useState('');
  const [selectedYear, setSelectedYear] = useState('1ère année');
  const [selectedModule, setSelectedModule] = useState('');

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

  const analytics = useMemo(() => {
    const filteredStudents = students.filter(s => 
      s.diploma === selectedDiploma && s.major === selectedMajor && s.year === selectedYear
    );

    let avgC1 = 0, avgC2 = 0, avgC3 = 0, avgEFC = 0;
    let countC1 = 0, countC2 = 0, countC3 = 0, countEFC = 0;

    filteredStudents.forEach(s => {
      const g = grades[s.id]?.[selectedModule.replace(/\./g, '_')];
      if (g) {
        if (g.c1 && !isNaN(parseFloat(g.c1))) { avgC1 += parseFloat(g.c1); countC1++; }
        if (g.c2 && !isNaN(parseFloat(g.c2))) { avgC2 += parseFloat(g.c2); countC2++; }
        if (g.c3 && !isNaN(parseFloat(g.c3))) { avgC3 += parseFloat(g.c3); countC3++; }
        const efcfp = parseFloat(g.efcfp), efcft = parseFloat(g.efcft);
        if (!isNaN(efcfp) && !isNaN(efcft)) { avgEFC += (efcfp + efcft) / 2; countEFC++; }
      }
    });

    const progressionData = [
      { name: 'C1', val: countC1 > 0 ? (avgC1 / countC1).toFixed(2) : 0 },
      { name: 'C2', val: countC2 > 0 ? (avgC2 / countC2).toFixed(2) : 0 },
      { name: 'C3', val: countC3 > 0 ? (avgC3 / countC3).toFixed(2) : 0 },
      { name: 'EFC', val: countEFC > 0 ? (avgEFC / countEFC).toFixed(2) : 0 },
    ].filter(d => d.name !== 'C3' || countC3 > 0);

    const globalModuleData = availableModules.map(mod => {
      let total = 0, count = 0;
      filteredStudents.forEach(s => {
        const g = grades[s.id]?.[mod.replace(/\./g, '_')];
        if (g) {
          const efcfp = parseFloat(g.efcfp), efcft = parseFloat(g.efcft);
          if (!isNaN(efcfp) && !isNaN(efcft)) { total += (efcfp + efcft) / 2; count++; }
        }
      });
      return { 
        name: mod.length > 20 ? mod.substring(0, 20) + '...' : mod, 
        moyenne: count > 0 ? (total / count).toFixed(2) : 0 
      };
    }).sort((a, b) => b.moyenne - a.moyenne);

    return { progressionData, globalModuleData, filteredStudentsCount: filteredStudents.length };
  }, [students, grades, selectedDiploma, selectedMajor, selectedYear, selectedModule, availableModules]);

  return (
    <div className="section-padding" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      <header>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
          <div style={{ padding: '10px', background: 'var(--primary-ultra-light)', color: 'var(--primary)', borderRadius: 'var(--radius-lg)' }}>
             <ChartLine size={24} />
          </div>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: '900', color: 'var(--text-primary)' }}>Analytique & Rapports</h1>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Suivi visuel des performances académiques et de la progression.</p>
      </header>

      {/* --- Filter Bar --- */}
      <div className="glass-card" style={{ padding: 'var(--space-5)', display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)', alignItems: 'flex-end' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={labelStyle}>Niveau</label>
          <select className="input-premium" style={{ minWidth: '180px' }} value={selectedDiploma} onChange={e => setSelectedDiploma(e.target.value)}>
            {Object.keys(MODULES_DATA).map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={labelStyle}>Filière</label>
          <select className="input-premium" style={{ minWidth: '200px' }} value={selectedMajor} onChange={e => setSelectedMajor(e.target.value)}>
            {availableMajors.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={labelStyle}>Année</label>
          <select className="input-premium" value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
            <option value="1ère année">1ère année</option>
            <option value="2ème année">2ème année</option>
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minWidth: '240px' }}>
          <label style={labelStyle}>Module d'analyse</label>
          <select className="input-premium" value={selectedModule} onChange={e => setSelectedModule(e.target.value)}>
            {availableModules.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>

      {/* --- Charts Grid --- */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 'var(--space-6)' }}>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: 'var(--space-8)', minHeight: '450px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-8)' }}>
            <div>
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: '800' }}>Progression du Module</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Moyenne séquentielle (C1 → C2 → EFC)</p>
            </div>
            <div className="badge-status primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Users size={12} /> {analytics.filteredStudentsCount} Stagiaires
            </div>
          </div>
          
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.progressionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: 'var(--text-faint)' }} dy={10} />
                <YAxis domain={[0, 20]} axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: 'var(--text-faint)' }} />
                <Tooltip 
                  contentStyle={{ background: 'white', border: 'none', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)' }}
                  itemStyle={{ fontWeight: 800, color: 'var(--primary)' }}
                />
                <Line type="monotone" dataKey="val" stroke="var(--primary)" strokeWidth={4} dot={{ r: 5, fill: 'var(--primary)', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card" style={{ padding: 'var(--space-8)', minHeight: '450px' }}>
          <div style={{ marginBottom: 'var(--space-8)' }}>
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: '800' }}>Comparatif Inter-Modules</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Classement par moyenne finale</p>
          </div>

          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.globalModuleData.slice(0, 8)} layout="vertical" margin={{ left: 10 }}>
                <XAxis type="number" domain={[0, 20]} hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} tick={{ fontSize: 10, fontWeight: 700, fill: 'var(--text-primary)' }} />
                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} contentStyle={{ border: 'none', borderRadius: '12px', boxShadow: 'var(--shadow-md)' }} />
                <Bar dataKey="moyenne" radius={[0, 10, 10, 0]} barSize={18}>
                  {analytics.globalModuleData.slice(0, 8).map((entry, index) => (
                    <Cell key={index} fill={parseFloat(entry.moyenne) >= 10 ? 'var(--primary)' : 'var(--danger)'} />
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

const labelStyle = { fontSize: '10px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' };

export default Reports;
