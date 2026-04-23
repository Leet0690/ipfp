import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import {
  flexRender, getCoreRowModel, useReactTable, getFilteredRowModel, getPaginationRowModel,
} from '@tanstack/react-table';
import { useApp } from '../context/AppContext';
import { generateBulletinGlobal } from '../utils/pdfGenerator';
import { FILIERES, MODULES_DATA, getModulesForStudent } from '../data/modules';

const labelStyle = { fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', paddingLeft: '2px' };
const selectStyle = { cursor: 'pointer', appearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2394a3b8\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px', paddingRight: '36px' };

const getGroupAbbreviation = (filiere, annee) => {
  let diplomaAbbr = "";
  let majorAbbr = "";
  
  for (const dip in MODULES_DATA) {
    if (MODULES_DATA[dip][filiere]) {
      diplomaAbbr = dip.includes('Spécialisé') ? "TS" : "T";
      break;
    }
  }

  if (filiere.includes('Développement')) majorAbbr = "DI";
  else if (filiere.includes('Gestion Informatisée')) majorAbbr = "GI";
  else if (filiere.includes('Logistique')) majorAbbr = "GTL";
  else if (filiere.includes('Entreprises')) majorAbbr = "GE";
  else majorAbbr = filiere.split(' ').map(w => w[0]).join('').toUpperCase();

  const yearNum = annee.includes('1') ? "1" : "2";
  
  return diplomaAbbr + majorAbbr + yearNum;
};

const ScheduleCalendar = ({ realSchedules, teachers }) => {
  const allFilieres = useMemo(() => Array.from(new Set(Object.values(FILIERES).flat())), []);
  const allAnnees = ['1ère année', '2ème année'];
  const [selectedFiliere, setSelectedFiliere] = useState(allFilieres.includes('Développement Informatique') ? 'Développement Informatique' : allFilieres[0]);
  const [selectedAnnee, setSelectedAnnee] = useState(allAnnees[0]);

  const groupLabel = useMemo(() => getGroupAbbreviation(selectedFiliere, selectedAnnee), [selectedFiliere, selectedAnnee]);

  const modules = useMemo(() => {
    for (const dip in MODULES_DATA) {
      if (MODULES_DATA[dip][selectedFiliere] && MODULES_DATA[dip][selectedFiliere][selectedAnnee]) {
        return MODULES_DATA[dip][selectedFiliere][selectedAnnee];
      }
    }
    return ['Atelier Pratique', 'Cours Général', 'Formation Générale'];
  }, [selectedFiliere, selectedAnnee]);

  const scheduleData = useMemo(() => {
    const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    
    // Check real schedules
    const filteredReal = realSchedules.filter(s => s.filiere === selectedFiliere && s.annee === selectedAnnee);
    return days.map(day => {
      const sessions = filteredReal.filter(s => s.day === day).map(s => ({
        id: s.id,
        time: s.time,
        title: s.module,
        room: s.room,
        type: s.type,
        teacherId: s.teacherId
      })).sort((a,b) => a.time.localeCompare(b.time));
      return { day, sessions };
    });
  }, [selectedFiliere, selectedAnnee, realSchedules]);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Emploi du temps
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <select className="input-premium" style={{ fontSize: '12px', padding: '6px 12px', maxWidth: '220px', cursor: 'pointer', appearance: 'auto' }} value={selectedFiliere} onChange={(e) => setSelectedFiliere(e.target.value)}>
              {allFilieres.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
            <select className="input-premium" style={{ fontSize: '12px', padding: '6px 12px', width: '130px', cursor: 'pointer', appearance: 'auto' }} value={selectedAnnee} onChange={(e) => setSelectedAnnee(e.target.value)}>
              {allAnnees.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>
        <Link to="/admin/schedules" className="btn-modern" style={{ padding: '6px 14px', fontSize: '12px', textDecoration: 'none' }}>
          <i className="fa-regular fa-calendar-plus" style={{ marginRight: '6px' }}></i> Gérer le planning
        </Link>
      </div>
      
      <div style={{ width: '100%', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', paddingBottom: '8px' }} className="no-scrollbar">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(130px, 1fr))', gap: '8px', minWidth: '100%' }}>
          {scheduleData.map((dayPlan, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-xl)', padding: '16px', border: '1px solid var(--border-light)' }}>
              <div style={{ textAlign: 'center', fontWeight: '800', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
                {dayPlan.day}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                {dayPlan.sessions.length > 0 ? dayPlan.sessions.map((session, j) => (
                  <div key={j} style={{ background: 'var(--bg-page)', padding: '14px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xs)', border: '1px solid var(--border-light)', borderLeft: `3px solid ${session.type === 'TP' ? 'var(--primary)' : 'var(--accent)'}`, transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '6px' }}><i className="fa-regular fa-clock" style={{marginRight: '4px'}}></i> {session.time}</div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', lineHeight: '1.3', marginBottom: '6px' }}>{session.title}</div>
                    {session.teacherId && (
                      <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '10px', fontWeight: '600' }}>
                        <i className="fa-solid fa-user-tie" style={{ marginRight: '4px' }}></i>
                        {teachers.find(t => t.id === session.teacherId)?.name || 'Formateur'}
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '10px', background: 'var(--primary-ultra-light)', padding: '2px 6px', borderRadius: '4px', fontWeight: '800', color: 'var(--primary)', border: '1px solid rgba(139, 92, 246, 0.1)' }}>{groupLabel}</span>
                    </div>
                  </div>
                )) : (
                  <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', color: 'var(--text-faint)', fontSize: '13px', fontWeight: '600' }}>Libre</div>
                )}
              </div>
            </div>
          ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const AdminDashboard = () => {
  const { students, teachers, grades, schedules, deleteStudent, deleteTeacher, updateStudent, updateTeacher, studentAttendance, teacherAttendance, migrateTeacherTokens } = useApp();
  const location = useLocation();
  const isDashboard = location.pathname === '/';
  const [localActiveTab, setLocalActiveTab] = useState('students');
  const activeTab = location.pathname.includes('teacher') ? 'teachers' 
                 : location.pathname.includes('student') ? 'students' 
                 : localActiveTab;

  const [globalFilter, setGlobalFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [diplomaFilter, setDiplomaFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');

  // Modal state
  const [modalMode, setModalMode] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [editModuleSearch, setEditModuleSearch] = useState('');

  const allDiplomas = useMemo(() => Object.keys(MODULES_DATA), []);

  // Edit helper functions
  const toggleDiplomaEdit = (dip) => {
    setEditFormData(prev => {
      const currentDiplomas = prev.diplomas || (prev.diploma ? [prev.diploma] : []);
      const isSelected = currentDiplomas.includes(dip);
      const newDiplomas = isSelected ? currentDiplomas.filter(d => d !== dip) : [...currentDiplomas, dip];
      return {
        ...prev,
        diploma: undefined, // Clear old single string
        diplomas: newDiplomas,
        groups: newDiplomas.length === 0 ? [] : prev.groups,
        years: newDiplomas.includes('Licence Professionnelle') && newDiplomas.length === 1 ? ['1ère année'] : prev.years,
        subjects: newDiplomas.length === 0 ? [] : prev.subjects
      };
    });
  };

  const toggleYearEdit = (year) => {
    setEditFormData(prev => ({
      ...prev,
      years: (prev.years || []).includes(year) ? (prev.years || []).filter(y => y !== year) : [...(prev.years || []), year]
    }));
  };

  const toggleGroupEdit = (filiere) => {
    setEditFormData(prev => ({
      ...prev,
      groups: (prev.groups || []).includes(filiere) ? (prev.groups || []).filter(g => g !== filiere) : [...(prev.groups || []), filiere]
    }));
  };

  const toggleSubjectEdit = (mod) => {
    setEditFormData(prev => ({
      ...prev,
      subjects: (prev.subjects || []).includes(mod) ? (prev.subjects || []).filter(s => s !== mod) : [...(prev.subjects || []), mod]
    }));
  };

  const toggleFiliereAllEdit = (year, filiere, modules) => {
    const allSelected = modules.every(m => (editFormData.subjects || []).includes(m));
    if (allSelected) {
      setEditFormData(prev => ({ ...prev, subjects: (prev.subjects || []).filter(s => !modules.includes(s)) }));
    } else {
      setEditFormData(prev => ({ ...prev, subjects: [...new Set([...(prev.subjects || []), ...modules])] }));
    }
  };

  // Open modals
  const openDetails = useCallback((item) => {
    setSelectedItem(item);
    setModalMode('details');
  }, []);

  const openEdit = useCallback((item) => {
    setSelectedItem(item);
    setEditFormData({ ...item });
    setModalMode('edit');
  }, []);

  const closeModal = useCallback(() => {
    setModalMode(null);
    setSelectedItem(null);
    setEditFormData({});
  }, []);

  const handleDelete = useCallback((item) => {
    setSelectedItem(item);
    setModalMode('confirmDelete');
  }, []);

  const confirmDeletion = useCallback(() => {
    if (!selectedItem) return;
    if (activeTab === 'students') deleteStudent(selectedItem.id);
    else deleteTeacher(selectedItem.id);
    closeModal();
  }, [activeTab, selectedItem, deleteStudent, deleteTeacher, closeModal]);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleUpdate = useCallback(async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Data Sanitization: Ensure new structure is used
      const finalData = { ...editFormData };
      if (!finalData.diplomas && finalData.diploma) {
        finalData.diplomas = [finalData.diploma];
      }
      // Remove old single field to avoid confusion
      delete finalData.diploma;

      if (activeTab === 'students') {
        await updateStudent(selectedItem.id, finalData);
      } else {
        await updateTeacher(selectedItem.id, finalData);
      }
      
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        closeModal();
      }, 1500);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'enregistrement.");
    } finally {
      setIsSaving(false);
    }
  }, [activeTab, selectedItem, editFormData, updateStudent, updateTeacher, closeModal]);

  const exportCSV = () => {
    const data = tableData;
    if (data.length === 0) return alert('Aucune donnée.');
    const headers = activeTab === 'students' ? "\uFEFFNom,Prénom,Matricule,Niveau,Filière,Année,Statut\n" : "\uFEFFNom,Module,Statut\n";
    const rows = data.map(item => {
      if (activeTab === 'students') return `"${item.lastName}","${item.firstName}","${item.regNo}","${item.diploma || ''}","${item.major}","${item.year || ''}","ACTIF"`;
      return `"${item.name || ''}","${item.subject || ''}","ACTIF"`;
    }).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a'); link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `IPFP_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  // ── Data ──
  const tableData = useMemo(() => {
    let data = activeTab === 'students' ? (students || []) : (teachers || []);
    
    // 1. Filter by Diploma (Niveau)
    if (diplomaFilter) {
      data = data.filter(item => {
        if (activeTab === 'students') return item.diploma === diplomaFilter;
        return (item.diplomas || (item.diploma ? [item.diploma] : [])).includes(diplomaFilter);
      });
    }

    // 2. Filter by Year (Année)
    if (yearFilter) {
      data = data.filter(item => {
        if (activeTab === 'students') return item.year === yearFilter;
        return (item.years || []).includes(yearFilter);
      });
    }

    // 3. Filter by Major/Subject (Filière)
    if (categoryFilter) {
      data = data.filter(item => {
        if (activeTab === 'students') return item.major === categoryFilter;
        const subjects = item.subjects || [item.subject];
        return subjects.includes(categoryFilter);
      });
    }
    return data;
  }, [activeTab, students, teachers, categoryFilter, diplomaFilter]);

  const columns = useMemo(() => [
    {
      accessorKey: 'avatar', header: '',
      cell: ({ row }) => (
        <div style={{ width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--primary-ultra-light)', color: 'var(--primary)', fontWeight: '700', fontSize: '14px', border: '1px solid var(--border-light)', flexShrink: 0 }}>
          {activeTab === 'students' ? (row.original.lastName?.[0] || '?') : (row.original.name?.[0] || '?')}
        </div>
      ),
    },
    {
      accessorKey: activeTab === 'students' ? 'lastName' : 'name', header: 'Identité',
      cell: ({ row }) => (
        <div style={{ minWidth: 0 }}>
          <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {activeTab === 'students' ? `${row.original.lastName} ${row.original.firstName}` : row.original.name}
          </h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span className="badge-status success" style={{ fontSize: '9px' }}>ACTIF</span>
            <span style={{ fontSize: '11px', fontWeight: '500', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
              {activeTab === 'students' ? row.original.major : (row.original.subjects || [row.original.subject]).slice(0, 2).join(', ')}
            </span>
          </div>
          {activeTab === 'students' && row.original.year && (
            <span style={{ fontSize: '10px', fontWeight: '600', color: 'var(--accent)', marginTop: '2px', display: 'inline-block' }}>
              {row.original.year} · {row.original.diploma || '—'}
            </span>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'ref', header: 'Référence',
      cell: ({ row }) => (
        <div>
          <p style={{ fontSize: '10px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>
            {activeTab === 'students' ? 'Matricule' : 'Modules'}
          </p>
          <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
            {activeTab === 'students' ? row.original.regNo : `${(row.original.subjects || [row.original.subject]).length} module(s)`}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'token', header: activeTab === 'students' ? 'Lien' : 'Liens Formateur',
      cell: ({ row }) => {
        const base = window.location.origin;
        if (activeTab === 'students') {
          const fullLink = base + `/results/${row.original.token}`;
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', maxWidth: '260px' }}
              onClick={() => { navigator.clipboard?.writeText(fullLink); }} title="Copier le lien">
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--primary-ultra-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', flexShrink: 0 }}>
                <i className="fa-solid fa-link"></i>
              </div>
              <span style={{ fontSize: '10px', fontWeight: '500', fontFamily: 'monospace', color: 'var(--primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fullLink}</span>
            </div>
          );
        } else {
          const linkAtt = base + `/portal/${row.original.tokenAttendance}`;
          const linkNotes = base + `/portal/${row.original.tokenGrades}`;
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', maxWidth: '220px' }}
                onClick={(e) => { e.stopPropagation(); navigator.clipboard?.writeText(linkAtt); alert('Lien Absences copié !'); }} title="Copier le lien Absences">
                <div style={{ width: '18px', height: '18px', borderRadius: '4px', background: 'var(--primary-ultra-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', flexShrink: 0 }}>
                  <i className="fa-solid fa-user-clock"></i>
                </div>
                <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--primary)', whiteSpace: 'nowrap' }}>Absences</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', maxWidth: '220px' }}
                onClick={(e) => { e.stopPropagation(); navigator.clipboard?.writeText(linkNotes); alert('Lien Notes copié !'); }} title="Copier le lien Notes">
                <div style={{ width: '18px', height: '18px', borderRadius: '4px', background: 'rgba(254, 205, 8, 0.1)', color: '#a06208', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', flexShrink: 0 }}>
                  <i className="fa-solid fa-clipboard-check"></i>
                </div>
                <span style={{ fontSize: '10px', fontWeight: '700', color: '#a06208', whiteSpace: 'nowrap' }}>Notes / Résultats</span>
              </div>
            </div>
          );
        }
      },
    },
    {
      id: 'actions', header: '',
      cell: ({ row }) => {
        const copyLink = () => {
          const base = window.location.origin;
          const path = activeTab === 'students' ? `/results/${row.original.token}` : `/portal/${row.original.token}`;
          navigator.clipboard?.writeText(base + path);
        };
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', justifyContent: 'flex-end' }}>
            <ActionBtn icon="fa-share-nodes" title="Copier le lien" color="var(--primary)" onClick={copyLink} />
            <ActionBtn icon="fa-eye" title="Détails" onClick={() => openDetails(row.original)} />
            <ActionBtn icon="fa-pen" title="Modifier" onClick={() => openEdit(row.original)} />
            {activeTab === 'students' && <ActionBtn icon="fa-download" title="Bulletin" onClick={() => generateBulletinGlobal(row.original, grades, getModulesForStudent(row.original))} />}
            <ActionBtn icon="fa-trash-can" title="Supprimer" color="#dc2626" onClick={() => handleDelete(row.original)} />
          </div>
        );
      },
    },
  ], [activeTab, openDetails, openEdit, handleDelete]);

  const table = useReactTable({
    data: tableData,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  const getMajorDistribution = () => {
    const counts = {};
    (students || []).forEach(s => { counts[s.major] = (counts[s.major] || 0) + 1 });
    const total = Math.max(1, (students || []).length);
    return Object.entries(counts).map(([name, count]) => ({ name, count, percent: Math.round((count / total) * 100) })).sort((a, b) => b.count - a.count).slice(0, 4);
  };
  const barColors = ['var(--primary)', 'var(--accent)', 'var(--secondary)', 'var(--text-faint)'];

  // ── New Advanced Stats ──
  const studentAttendanceRate = useMemo(() => {
    if (!studentAttendance || studentAttendance.length === 0) return 0;
    const presents = studentAttendance.filter(a => a.status === 'present').length;
    return Math.round((presents / studentAttendance.length) * 100);
  }, [studentAttendance]);

  const teacherAttendanceRate = useMemo(() => {
    if (!teacherAttendance || teacherAttendance.length === 0) return 0;
    const presents = teacherAttendance.filter(a => a.status === 'present').length;
    return Math.round((presents / teacherAttendance.length) * 100);
  }, [teacherAttendance]);

  const gradesProgress = useMemo(() => {
    if (!students || students.length === 0) return 0;
    let totalModules = 0;
    let enteredModules = 0;
    students.forEach(s => {
      const studentModules = getModulesForStudent(s);
      totalModules += studentModules.length;
      studentModules.forEach(m => {
        if (grades[s.id]?.[m]) {
          const g = grades[s.id][m];
          // Consider a module entered if any of the key grades are present
          if (g.c1 || g.c2 || g.c3 || g.efcfp || g.efcft) enteredModules++;
        }
      });
    });
    return totalModules > 0 ? Math.round((enteredModules / totalModules) * 100) : 0;
  }, [students, grades]);

  const moduleValidationRate = useMemo(() => {
    if (!students || students.length === 0) return 0;
    
    let totalAssigned = 0;
    let totalValidated = 0;

    students.forEach(s => {
      const studentModules = getModulesForStudent(s);
      const studentGrades = grades[s.id] || {};
      totalAssigned += studentModules.length;

      studentModules.forEach(mod => {
        const g = studentGrades[mod];
        if (!g) return;

        // Calc CC
        let cc = null;
        if (g.c1 !== '' && g.c2 !== '' && g.c1 !== undefined && g.c2 !== undefined) {
          const c1 = parseFloat(g.c1), c2 = parseFloat(g.c2);
          if (!isNaN(c1) && !isNaN(c2)) {
            if (g.c3 !== '' && g.c3 !== undefined && g.c3 !== null) {
              const c3 = parseFloat(g.c3);
              cc = !isNaN(c3) ? (c1 + c2 + c3) / 3 : (c1 + c2) / 2;
            } else {
              cc = (c1 + c2) / 2;
            }
          }
        }

        // Module Avg
        if (cc !== null && g.efcfp !== '' && g.efcft !== '' && g.efcfp !== undefined && g.efcft !== undefined) {
          const efcfp = parseFloat(g.efcfp), efcft = parseFloat(g.efcft);
          if (!isNaN(efcfp) && !isNaN(efcft)) {
            const efc = (efcfp + efcft) / 2;
            const avg = (cc * 0.4 + efc * 0.6);
            if (avg >= 10) totalValidated++;
          }
        }
      });
    });

    return totalAssigned > 0 ? Math.round((totalValidated / totalAssigned) * 100) : 0;
  }, [students, grades]);

  return (
    <div className="max-w-container section-padding" style={{ paddingTop: '24px' }}>
      
      {!isDashboard && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '4px' }}>
              {activeTab === 'students' ? 'Liste des Stagiaires' : 'Liste des Formateurs'}
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>
              Gestion du personnel et des apprenants
            </p>
          </div>
          
          {activeTab === 'students' ? (
             <Link to="/admin/add-student" className="btn-modern primary" style={{ padding: '10px 16px', fontSize: '13px' }}>
               <i className="fa-solid fa-plus"></i> Ajouter un stagiaire
             </Link>
          ) : (
             <Link to="/admin/add-teacher" className="btn-modern primary" style={{ padding: '10px 16px', fontSize: '13px' }}>
               <i className="fa-solid fa-plus"></i> Ajouter un formateur
             </Link>
          )}
        </div>
      )}

      {/* Migration Notice */}
      {!isDashboard && activeTab === 'teachers' && teachers.some(t => !t.tokenAttendance) && (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
          className="glass-card" 
          style={{ padding: '12px 20px', marginBottom: '20px', background: 'rgba(59, 130, 246, 0.05)', border: '1px dashed #3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#dbeafe', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="fa-solid fa-key" style={{ fontSize: '14px' }}></i>
            </div>
            <div>
              <p style={{ fontSize: '13px', color: '#1e40af', fontWeight: '700' }}>Mise à jour des accès requise</p>
              <p style={{ fontSize: '11px', color: '#3b82f6', fontWeight: '500' }}>Générez les nouveaux jetons (Notes & Absences) pour les formateurs existants.</p>
            </div>
          </div>
          <button onClick={migrateTeacherTokens} className="btn-modern primary" style={{ padding: '8px 16px', fontSize: '11px', background: '#2563eb' }}>
            Générer maintenant
          </button>
        </motion.div>
      )}

      {isDashboard && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <StatCard delay={0.05} icon="fa-graduation-cap" iconColor="var(--primary)" iconBg="var(--primary-ultra-light)" value={(students || []).length} label="Total Stagiaires" />
            <StatCard delay={0.1} icon="fa-chalkboard-user" iconColor="#a06208" iconBg="rgba(254, 205, 8, 0.12)" value={(teachers || []).length} label="Total Formateurs" />
            <StatCard delay={0.15} icon="fa-user-check" iconColor="#16a34a" iconBg="rgba(22, 163, 74, 0.1)" value={`${studentAttendanceRate}%`} label="Présence Stagiaires" />
            <StatCard delay={0.2} icon="fa-user-tie" iconColor="#0ea5e9" iconBg="rgba(14, 165, 233, 0.1)" value={`${teacherAttendanceRate}%`} label="Présence Formateurs" />
            <StatCard delay={0.25} icon="fa-check-double" iconColor="var(--accent)" iconBg="rgba(254, 205, 8, 0.1)" value={`${gradesProgress}%`} label="Saisie des Notes" />
            <StatCard delay={0.3} icon="fa-award" iconColor="#8b5cf6" iconBg="rgba(139, 92, 246, 0.1)" value={`${moduleValidationRate}%`} label="Réussite Modules" />
          </div>
          
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Répartition par Filière</span>
              <i className="fa-solid fa-chart-pie" style={{ color: 'var(--text-faint)', fontSize: '12px' }}></i>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px' }}>
              {getMajorDistribution().map((m, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '600', color: 'var(--text-tertiary)', marginBottom: '6px' }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '8px' }}>{m.name}</span>
                    <span style={{ flexShrink: 0 }}>{m.percent}%</span>
                  </div>
                  <div style={{ width: '100%', background: 'var(--bg-subtle)', borderRadius: '100px', height: '6px', overflow: 'hidden' }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${m.percent}%` }} transition={{ duration: 0.8, delay: 0.3 + i * 0.1 }} style={{ height: '6px', borderRadius: '100px', background: barColors[i] }}></motion.div>
                  </div>
                </div>
              ))}
              {getMajorDistribution().length === 0 && <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Aucune donnée</p>}
            </div>
          </motion.div>
          
          {/* ── Schedule Calendar ── */}
          <ScheduleCalendar realSchedules={schedules || []} teachers={teachers || []} />

        </div>
      )}

      {/* ── Controls ── */}
      {!isDashboard && (
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', padding: '8px', marginBottom: '20px', background: 'white', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-xs)' }}>
        <div style={{ flex: 1 }}></div>
        
        <select className="input-premium" style={{ fontSize: '12px', padding: '7px 12px', maxWidth: '140px', cursor: 'pointer', appearance: 'auto' }} value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}>
          <option value="">Toutes années</option>
          <option value="1ère année">1ère année</option>
          <option value="2ème année">2ème année</option>
        </select>

        <select className="input-premium" style={{ fontSize: '12px', padding: '7px 12px', maxWidth: '180px', cursor: 'pointer', appearance: 'auto' }} value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="">{activeTab === 'students' ? 'Toutes filières' : 'Tous modules'}</option>
          {Array.from(new Set(
            (activeTab === 'students' ? students : teachers)
            .filter(i => (!diplomaFilter || (activeTab === 'students' ? i.diploma === diplomaFilter : (i.diplomas || (i.diploma ? [i.diploma] : [])).includes(diplomaFilter))) && 
                         (!yearFilter || (activeTab === 'students' ? i.year === yearFilter : (i.years || []).includes(yearFilter))))
            .flatMap(i => activeTab === 'students' ? [i.major] : (i.subjects || [i.subject]))
          )).map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
        <div style={{ position: 'relative', minWidth: '160px', maxWidth: '220px', flex: '1 1 160px' }}>
          <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)', fontSize: '12px' }}></i>
          <input className="input-premium" style={{ width: '100%', paddingLeft: '34px', fontSize: '13px', padding: '7px 12px 7px 34px' }} placeholder="Rechercher…" value={globalFilter ?? ''} onChange={(e) => setGlobalFilter(e.target.value)} />
        </div>
        <button onClick={exportCSV} className="btn-modern" style={{ padding: '7px 14px', fontSize: '12px' }}><i className="fa-solid fa-arrow-down-to-line" style={{ fontSize: '11px' }}></i> Export</button>
      </div>
      )}

      {/* ── Rows ── */}
      {!isDashboard && (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '16px' }}>
        <AnimatePresence mode="popLayout">
          {table.getRowModel().rows.map((row, idx) => (
            <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0, transition: { delay: idx * 0.03, duration: 0.35, ease: [0.16, 1, 0.3, 1] } }} exit={{ opacity: 0, scale: 0.97 }} key={row.id} className="dashboard-grid-row">
              {row.getVisibleCells().map(cell => <div key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</div>)}
            </motion.div>
          ))}
        </AnimatePresence>
        {table.getRowModel().rows.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '64px 0' }}>
            <i className="fa-solid fa-inbox" style={{ fontSize: '40px', color: 'var(--border)', display: 'block', marginBottom: '12px' }}></i>
            <p style={{ color: 'var(--text-muted)', fontWeight: '500', fontSize: '14px' }}>Aucun résultat.</p>
          </motion.div>
        )}
      </div>
      )}

      {/* ── Pagination ── */}
      {!isDashboard && table.getPageCount() > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '12px 0' }}>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="btn-modern"
            style={{ padding: '6px 12px', fontSize: '11px', opacity: table.getCanPreviousPage() ? 1 : 0.5, cursor: table.getCanPreviousPage() ? 'pointer' : 'not-allowed' }}
          >
            <i className="fa-solid fa-chevron-left"></i> Précédent
          </button>
          
          <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>
            Page <span style={{ color: 'var(--text-primary)' }}>{table.getState().pagination.pageIndex + 1}</span> sur {table.getPageCount()}
          </span>

          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="btn-modern"
            style={{ padding: '6px 12px', fontSize: '11px', opacity: table.getCanNextPage() ? 1 : 0.5, cursor: table.getCanNextPage() ? 'pointer' : 'not-allowed' }}
          >
            Suivant <i className="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      )}

      {/* ══════ MODAL ══════ */}
      <AnimatePresence>
        {modalMode && selectedItem && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.12)', backdropFilter: 'blur(4px)' }} onClick={closeModal}></motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.96, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 16 }} transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              style={{ background: 'white', width: '100%', maxWidth: '500px', padding: '28px', borderRadius: 'var(--radius-3xl)', position: 'relative', zIndex: 101, boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border-light)', maxHeight: '90vh', overflowY: 'auto' }}>
              
              <button onClick={closeModal} style={{ position: 'absolute', right: '20px', top: '20px', padding: '8px', background: 'transparent', border: 'none', borderRadius: '50%', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '16px' }}>
                <i className="fa-solid fa-xmark"></i>
              </button>

              {/* ── DETAILS ── */}
              {modalMode === 'details' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                    <div style={{ width: '52px', height: '52px', borderRadius: 'var(--radius-xl)', background: 'var(--primary-ultra-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: '800', flexShrink: 0 }}>
                      {selectedItem.lastName?.[0] || selectedItem.name?.[0]}
                    </div>
                    <div>
                      <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>
                        {selectedItem.lastName ? `${selectedItem.lastName} ${selectedItem.firstName}` : selectedItem.name}
                      </h2>
                      <span className="badge-status success">Dossier actif</span>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', paddingTop: '20px', borderTop: '1px solid var(--border-light)' }}>
                    {activeTab === 'students' ? (
                      <>
                        <InfoBox label="Matricule" value={selectedItem.regNo} icon="fa-fingerprint" />
                        <InfoBox label="Filière" value={selectedItem.major} icon="fa-book" />
                        <InfoBox label="Niveau" value={selectedItem.diploma || '—'} icon="fa-graduation-cap" />
                        <InfoBox label="Année" value={selectedItem.year || '—'} icon="fa-calendar" />
                      </>
                    ) : (
                      <>
                        <InfoBox label="Modules" value={(selectedItem.subjects || [selectedItem.subject]).join(', ')} icon="fa-book" />
                        <InfoBox label="Groupes" value={(selectedItem.groups || []).join(', ')} icon="fa-users" />
                      </>
                    )}
                    <InfoBox label="Token" value={selectedItem.token} icon="fa-key" />
                    <InfoBox label="Statut" value="ACTIF" icon="fa-circle-check" valueColor="var(--primary)" />
                  </div>

                  {/* Shareable Link */}
                  <div style={{ marginTop: '20px', padding: '14px', background: 'var(--primary-ultra-light)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(176,104,185,0.08)' }}>
                    <p style={{ fontSize: '10px', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                      <i className="fa-solid fa-link" style={{ marginRight: '4px' }}></i>
                      {activeTab === 'students' ? 'Lien de consultation (stagiaire)' : 'Lien de saisie des notes (formateur)'}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input readOnly className="input-premium" style={{ flex: 1, fontSize: '11px', fontFamily: 'monospace', padding: '8px 12px', background: 'white' }}
                        value={`${window.location.origin}${activeTab === 'students' ? `/results/${selectedItem.token}` : `/portal/${selectedItem.token}`}`} />
                      <button className="btn-modern primary" style={{ padding: '8px 14px', fontSize: '11px', flexShrink: 0 }}
                        onClick={() => {
                          const link = `${window.location.origin}${activeTab === 'students' ? `/results/${selectedItem.token}` : `/portal/${selectedItem.token}`}`;
                          navigator.clipboard?.writeText(link);
                        }}>
                        <i className="fa-solid fa-copy"></i> Copier
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
                    <button className="btn-modern" style={{ flex: 1, justifyContent: 'center', padding: '10px' }} onClick={() => openEdit(selectedItem)}>
                      <i className="fa-solid fa-pen" style={{ fontSize: '12px' }}></i> Modifier
                    </button>
                    <button style={{ padding: '10px 16px', color: '#dc2626', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(239,68,68,0.15)', background: 'rgba(239,68,68,0.04)', cursor: 'pointer', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}
                      onClick={() => handleDelete(selectedItem)}>
                      <i className="fa-solid fa-trash-can" style={{ fontSize: '12px' }}></i>
                    </button>
                  </div>
                </div>
              )}

              {/* ── EDIT ── */}
              {modalMode === 'edit' && (
                saveSuccess ? (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    style={{ textAlign: 'center', padding: '40px 0' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--primary-ultra-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', margin: '0 auto 20px' }}>
                      <i className="fa-solid fa-check"></i>
                    </div>
                    <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>Modifications enregistrées !</h2>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Le profil a été mis à jour avec succès.</p>
                  </motion.div>
                ) : (
                <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>Modifier le profil</h2>
                    {isSaving && <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>}
                  </div>
                  
                  {activeTab === 'students' ? (
                    <>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <label style={labelStyle}>Nom</label>
                          <input type="text" className="input-premium" required value={editFormData.lastName || ''} onChange={(e) => setEditFormData({...editFormData, lastName: e.target.value})} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <label style={labelStyle}>Prénom</label>
                          <input type="text" className="input-premium" required value={editFormData.firstName || ''} onChange={(e) => setEditFormData({...editFormData, firstName: e.target.value})} />
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={labelStyle}>Matricule</label>
                        <input type="text" className="input-premium" style={{ fontFamily: 'monospace' }} placeholder="IPFP-2026-XXXX" required value={editFormData.regNo || ''} onChange={(e) => setEditFormData({...editFormData, regNo: e.target.value})} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={labelStyle}>Année</label>
                        <select className="input-premium" style={selectStyle} value={editFormData.year || ''} onChange={(e) => setEditFormData({...editFormData, year: e.target.value})}>
                          <option value="">—</option>
                          <option value="1ère année">1ère année</option>
                          <option value="2ème année">2ème année</option>
                        </select>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={labelStyle}>Diplôme préparé</label>
                        <select className="input-premium" style={selectStyle} value={editFormData.diploma || ''} onChange={(e) => setEditFormData({...editFormData, diploma: e.target.value.trim(), major: ''})}>
                          <option value="">—</option>
                          {Object.keys(FILIERES).map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={labelStyle}>Filière</label>
                        <select className="input-premium" style={selectStyle} value={editFormData.major || ''} onChange={(e) => setEditFormData({...editFormData, major: e.target.value.trim()})} disabled={!editFormData.diploma}>
                          <option value="">{editFormData.diploma ? 'Sélectionner' : 'Choisir niveau d\'abord'}</option>
                          {(FILIERES[editFormData.diploma] || []).map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={labelStyle}>Nom du formateur</label>
                        <input type="text" className="input-premium" required value={editFormData.name || ''} onChange={(e) => setEditFormData({...editFormData, name: e.target.value})} />
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={labelStyle}>Diplôme(s) préparé(s)</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {allDiplomas.map(dip => {
                            const currentDiplomas = editFormData.diplomas || (editFormData.diploma ? [editFormData.diploma] : []);
                            const isSelected = currentDiplomas.includes(dip);
                            return (
                              <button type="button" key={dip} onClick={() => toggleDiplomaEdit(dip)}
                                style={{
                                  padding: '6px 12px', borderRadius: 'var(--radius-lg)', fontSize: '10px', fontWeight: '700',
                                  border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                                  background: isSelected ? 'var(--primary-ultra-light)' : 'white',
                                  color: isSelected ? 'var(--primary)' : 'var(--text-muted)',
                                  cursor: 'pointer', transition: 'all 0.15s'
                                }}>
                                {isSelected && <i className="fa-solid fa-check" style={{ marginRight: '6px' }}></i>}
                                {dip}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {(editFormData.diplomas?.length > 0 || editFormData.diploma) && (
                        <>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={labelStyle}>Niveaux enseignés</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {['1ère année', '2ème année'].map(y => {
                            const isSelected = (editFormData.years || []).includes(y);
                            return (
                              <button type="button" key={y} onClick={() => toggleYearEdit(y)}
                                style={{
                                  padding: '6px 12px', borderRadius: 'var(--radius-pill)', fontSize: '10px', fontWeight: '700',
                                  border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                                  background: isSelected ? 'var(--primary-ultra-light)' : 'white',
                                  color: isSelected ? 'var(--primary)' : 'var(--text-muted)',
                                  cursor: 'pointer'
                                }}>
                                {isSelected && <i className="fa-solid fa-check" style={{ marginRight: '6px' }}></i>}
                                {y}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={labelStyle}>Filières assignées</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                              {Array.from(new Set(
                                (editFormData.diplomas || (editFormData.diploma ? [editFormData.diploma] : []))
                                .flatMap(d => Object.keys(MODULES_DATA[d] || {}))
                              )).map(f => {
                                const isSelected = (editFormData.groups || []).includes(f);
                                return (
                                  <button type="button" key={f} onClick={() => toggleGroupEdit(f)}
                                    style={{
                                      padding: '5px 10px', borderRadius: 'var(--radius-pill)', fontSize: '10px', fontWeight: '600',
                                      border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                                      background: isSelected ? 'var(--primary-ultra-light)' : 'white',
                                      color: isSelected ? 'var(--primary)' : 'var(--text-muted)',
                                      cursor: 'pointer'
                                    }}>
                                    {isSelected && <i className="fa-solid fa-check" style={{ marginRight: '4px' }}></i>}
                                    {f}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px', paddingTop: '15px', borderTop: '1px solid var(--border-light)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <label style={labelStyle}>Modules enseignés ({(editFormData.subjects || []).length})</label>
                              <div style={{ position: 'relative', width: '150px' }}>
                                <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)', fontSize: '10px' }}></i>
                                <input className="input-premium" style={{ paddingLeft: '24px', fontSize: '10px', height: '28px' }}
                                  placeholder="Filtrer..." value={editModuleSearch} onChange={(e) => setEditModuleSearch(e.target.value)} />
                              </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto', paddingRight: '4px' }}>
                              {(editFormData.years || []).sort().map(year => (
                                <div key={year} style={{ background: 'var(--bg-subtle)', padding: '12px', borderRadius: 'var(--radius-lg)' }}>
                                  <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '10px', textTransform: 'uppercase' }}>{year}</div>
                                  {(editFormData.groups || []).map(filiere => {
                                    const currentDiplomas = editFormData.diplomas || (editFormData.diploma ? [editFormData.diploma] : []);
                                    const modules = Array.from(new Set(currentDiplomas.flatMap(d => MODULES_DATA[d]?.[filiere]?.[year] || [])));
                                    const filtered = editModuleSearch ? modules.filter(m => m.toLowerCase().includes(editModuleSearch.toLowerCase())) : modules;
                                    if (filtered.length === 0) return null;
                                    const allSelected = filtered.every(m => (editFormData.subjects || []).includes(m));
                                    return (
                                      <div key={filiere} style={{ marginBottom: '10px', paddingLeft: '10px', borderLeft: '2px solid var(--primary-light)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                                          <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)' }}>{filiere}</div>
                                          <button type="button" onClick={() => toggleFiliereAllEdit(year, filiere, filtered)} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontSize: '9px', fontWeight: '700', cursor: 'pointer' }}>
                                            {allSelected ? 'Désel.' : 'Tout sel.'}
                                          </button>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                          {filtered.map(mod => {
                                            const isSelected = (editFormData.subjects || []).includes(mod);
                                            return (
                                              <button type="button" key={mod} onClick={() => toggleSubjectEdit(mod)}
                                                style={{ textAlign: 'left', padding: '4px 8px', borderRadius: 'var(--radius-md)', fontSize: '10px', border: 'none', cursor: 'pointer', transition: 'all 0.1s',
                                                  background: isSelected ? 'var(--primary-ultra-light)' : 'transparent', color: isSelected ? 'var(--primary)' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <i className={`fa-${isSelected ? 'solid fa-circle-check' : 'regular fa-circle'}`} style={{ fontSize: '10px' }}></i>
                                                {mod}
                                              </button>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </>
                  )}

                  <button type="submit" disabled={isSaving} className="btn-modern primary" style={{ width: '100%', justifyContent: 'center', padding: '10px', marginTop: '4px', opacity: isSaving ? 0.7 : 1 }}>
                    <i className={isSaving ? "fa-solid fa-circle-notch fa-spin" : "fa-solid fa-cloud-arrow-up"} style={{ fontSize: '12px' }}></i>
                    {isSaving ? " Enregistrement..." : " Enregistrer"}
                  </button>
                </form>
                )
              )}

              {/* ── CONFIRM DELETE ── */}
              {modalMode === 'confirmDelete' && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(239,68,68,0.06)', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', margin: '0 auto 20px' }}>
                    <i className="fa-solid fa-triangle-exclamation"></i>
                  </div>
                  <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>Suppression définitive</h2>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px', lineHeight: '1.5' }}>
                    Êtes-vous sûr de vouloir supprimer <strong>{selectedItem.lastName ? `${selectedItem.lastName} ${selectedItem.firstName}` : selectedItem.name}</strong> ? Cette action est irréversible.
                  </p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn-modern" style={{ flex: 1, background: 'var(--bg-subtle)', color: 'var(--text-primary)' }} onClick={closeModal}>
                      Annuler
                    </button>
                    <button className="btn-modern" style={{ flex: 1, background: '#dc2626', color: 'white' }} onClick={confirmDeletion}>
                      Supprimer
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ── Components ── */
const StatCard = ({ delay, icon, iconColor, iconBg, value, label }) => (
  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className="glass-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
    <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-lg)', background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: iconColor, fontSize: '16px', flexShrink: 0 }}>
      <i className={`fa-solid ${icon}`}></i>
    </div>
    <div style={{ overflow: 'hidden' }}>
      <h3 style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '-0.02em', lineHeight: 1, marginBottom: '4px', color: 'var(--text-primary)' }}>{value}</h3>
      <p style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</p>
    </div>
  </motion.div>
);

const ActionBtn = ({ icon, title, onClick, color = 'var(--text-muted)' }) => (
  <button onClick={onClick} title={title}
    style={{ padding: '6px 8px', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', fontSize: '12px', background: 'transparent', color, transition: 'all 0.12s' }}
    onMouseEnter={(e) => { e.currentTarget.style.background = color === '#dc2626' ? 'rgba(239,68,68,0.06)' : 'var(--bg-subtle)'; }}
    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
    <i className={`fa-solid ${icon}`}></i>
  </button>
);

const InfoBox = ({ label, value, icon, valueColor = 'var(--text-secondary)' }) => (
  <div style={{ padding: '14px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-lg)', position: 'relative' }}>
    <div style={{ position: 'absolute', right: '12px', top: '12px', color: 'var(--text-faint)', fontSize: '13px' }}><i className={`fa-solid ${icon}`}></i></div>
    <p style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>{label}</p>
    <p style={{ fontSize: '13px', fontWeight: '600', color: valueColor, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '20px' }}>{value}</p>
  </div>
);

export default AdminDashboard;
