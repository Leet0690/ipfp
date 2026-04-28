import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { jsPDF } from 'jspdf';
import { logoBase64 } from '../utils/logoBase64';

const FinanceDashboard = () => {
  const isMaintenanceMode = true;

  if (isMaintenanceMode) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} 
          className="glass-card" style={{ padding: '60px 40px', textAlign: 'center', maxWidth: '480px', width: '100%' }}>
          <div style={{ width: '80px', height: '80px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '32px' }}>
            <i className="fa-solid fa-screwdriver-wrench"></i>
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '12px' }}>Module en Maintenance</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: '1.6', fontWeight: '500' }}>
            La gestion financière est actuellement en cours de mise à jour pour vous offrir de meilleures performances.
          </p>
          <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--border-light)' }}>
             <span className="badge-status warning" style={{ padding: '8px 16px', fontSize: '11px' }}>RETOUR PRÉVU : PROCHAINEMENT</span>
          </div>
        </motion.div>
      </div>
    );
  }

  const { 
    students, teachers, payments, salaries, 
    addPayment, deletePayment, addSalary, deleteSalary, updateTeacher,
    teacherAttendance, isDirectorAuth, loginDirector, logoutDirector
  } = useApp();

  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('payments');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingTeacherId, setEditingTeacherId] = useState(null);
  
  // Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState({
    studentId: '',
    amount: '',
    month: new Date().toLocaleString('fr-FR', { month: 'long' }),
    date: new Date().toISOString().split('T')[0],
    status: 'payé'
  });

  // Salary Calculation State
  const [salaryFilter, setSalaryFilter] = useState({
    teacherId: '',
    month: new Date().getMonth(),
    year: new Date().getFullYear()
  });

  const months = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];

  const handleLogin = (e) => {
    e.preventDefault();
    if (!loginDirector(password)) {
      alert('Mot de passe incorrect');
    }
  };

  const handleSaveRate = async (teacherId) => {
    const newVal = document.getElementById(`rate-${teacherId}`).value;
    const rate = parseFloat(newVal);
    if (!isNaN(rate)) {
      await updateTeacher(teacherId, { hourlyRate: rate });
      setEditingTeacherId(null);
    }
  };

  const generateReceipt = (payment, student) => {
    const doc = new jsPDF();
    const w = doc.internal.pageSize.getWidth();
    
    // Header
    try {
        doc.addImage(logoBase64, 'JPEG', 15, 10, 40, 18);
    } catch(e) {}
    
    doc.setFontSize(22);
    doc.setTextColor(40, 40, 40);
    doc.text('REÇU DE PAIEMENT', w/2, 45, { align: 'center' });
    
    doc.setDrawColor(200);
    doc.line(15, 50, w - 15, 50);
    
    doc.setFontSize(12);
    doc.setTextColor(80, 80, 80);
    doc.text(`N° Reçu: ${payment.id.substring(0, 8).toUpperCase()}`, 15, 65);
    doc.text(`Date: ${payment.date}`, w - 15, 65, { align: 'right' });
    
    // Details Box
    doc.setFillColor(248, 250, 252);
    doc.rect(15, 75, w - 30, 60, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(15, 75, w - 30, 60, 'S');
    
    doc.setTextColor(40, 40, 40);
    doc.setFont('helvetica', 'bold');
    doc.text('Détails du Stagiaire:', 25, 85);
    doc.setFont('helvetica', 'normal');
    doc.text(`${student.firstName} ${student.lastName}`, 25, 95);
    doc.text(`Filière: ${student.major}`, 25, 103);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Détails du Paiement:', 110, 85);
    doc.setFont('helvetica', 'normal');
    doc.text(`Mois: ${payment.month}`, 110, 95);
    doc.text(`Montant: ${payment.amount} DH`, 110, 103);
    doc.text(`Mode: Cash`, 110, 111);
    
    // Total
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`TOTAL PAYÉ: ${payment.amount} DH`, w - 25, 125, { align: 'right' });
    
    // Footer
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('Signature et Cachet IPFP', w - 60, 160);
    
    doc.save(`Recu_${student.lastName}_${payment.month}.pdf`);
  };

  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      const student = students.find(s => s.id === p.studentId);
      if (!student) return false;
      const searchStr = `${student.firstName} ${student.lastName} ${p.month}`.toLowerCase();
      return searchStr.includes(searchTerm.toLowerCase());
    });
  }, [payments, students, searchTerm]);

  // Salary calculation for each teacher for selected month/year
  const calculatedSalaries = useMemo(() => {
    return teachers.map(t => {
      // Filter attendance for this teacher in selected month
      const hours = teacherAttendance
        .filter(a => {
          if (a.teacherId !== t.id || a.status !== 'present') return false;
          const date = new Date(a.date);
          return date.getMonth() === salaryFilter.month && date.getFullYear() === salaryFilter.year;
        })
        .reduce((acc, a) => acc + (parseFloat(a.hours) || 0), 0);
      
      const hourlyRate = parseFloat(t.hourlyRate) || 0;
      const total = hours * hourlyRate;
      
      // Check if already recorded as paid
      const monthName = months[salaryFilter.month];
      const isPaid = salaries.some(s => s.teacherId === t.id && s.month === monthName && s.year === salaryFilter.year);

      return { ...t, hours, hourlyRate, total, isPaid };
    });
  }, [teachers, teacherAttendance, salaryFilter, salaries]);

  // Statistics
  const stats = useMemo(() => {
    const totalRevenue = payments.reduce((acc, p) => acc + (parseFloat(p.amount) || 0), 0);
    const totalSalaries = salaries.reduce((acc, s) => acc + (parseFloat(s.amount) || 0), 0);
    return {
      revenue: totalRevenue,
      expenses: totalSalaries,
      balance: totalRevenue - totalSalaries,
      pendingSalaries: calculatedSalaries.filter(s => !s.isPaid).reduce((acc, s) => acc + s.total, 0)
    };
  }, [payments, salaries, calculatedSalaries]);

  if (!isDirectorAuth) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: '40px', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', background: 'var(--primary-ultra-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: 'var(--primary)', fontSize: '24px' }}>
            <i className="fa-solid fa-lock"></i>
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>Espace Direction</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '32px' }}>Veuillez saisir le mot de passe de la directrice pour accéder à la gestion financière.</p>
          
          <form onSubmit={handleLogin}>
            <input 
              type="password" 
              className="input-premium" 
              placeholder="Mot de passe..." 
              style={{ width: '100%', marginBottom: '16px', textAlign: 'center' }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
            <button type="submit" className="btn-modern primary" style={{ width: '100%' }}>
              Accéder <i className="fa-solid fa-arrow-right" style={{ marginLeft: '8px' }}></i>
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="section-padding">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '900', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Gestion Financière</h1>
          <p style={{ color: 'var(--text-muted)', fontWeight: '500' }}>Suivi des encaissements et calcul des salaires</p>
        </div>
        <button onClick={logoutDirector} className="btn-modern" style={{ background: 'var(--bg-subtle)', color: 'var(--text-secondary)' }}>
          Quitter <i className="fa-solid fa-door-open" style={{ marginLeft: '8px' }}></i>
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div className="glass-card" style={{ padding: '24px', borderLeft: '4px solid #10b981' }}>
          <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Revenus Totaux</p>
          <p style={{ fontSize: '32px', fontWeight: '900', color: '#10b981' }}>{stats.revenue.toLocaleString()} <span style={{ fontSize: '16px' }}>DH</span></p>
        </div>
        <div className="glass-card" style={{ padding: '24px', borderLeft: '4px solid #f43f5e' }}>
          <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Salaires Payés</p>
          <p style={{ fontSize: '32px', fontWeight: '900', color: '#f43f5e' }}>{stats.expenses.toLocaleString()} <span style={{ fontSize: '16px' }}>DH</span></p>
        </div>
        <div className="glass-card" style={{ padding: '24px', borderLeft: '4px solid var(--primary)' }}>
          <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Bénéfice Net</p>
          <p style={{ fontSize: '32px', fontWeight: '900', color: 'var(--primary)' }}>{stats.balance.toLocaleString()} <span style={{ fontSize: '16px' }}>DH</span></p>
        </div>
      </div>

      <div className="modern-tabs-container" style={{ marginBottom: '24px' }}>
        <button onClick={() => setActiveTab('payments')} className={`modern-tab ${activeTab === 'payments' ? 'active' : ''}`}>
          Paiements Stagiaires
        </button>
        <button onClick={() => setActiveTab('salaries')} className={`modern-tab ${activeTab === 'salaries' ? 'active' : ''}`}>
          Salaires Formateurs
        </button>
        <button onClick={() => setActiveTab('stats')} className={`modern-tab ${activeTab === 'stats' ? 'active' : ''}`}>
          Analytique
        </button>
      </div>

      {activeTab === 'payments' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="glass-card" style={{ padding: '20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ position: 'relative', width: '300px' }}>
              <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}></i>
              <input 
                type="text" 
                className="input-premium" 
                style={{ width: '100%', paddingLeft: '36px' }} 
                placeholder="Rechercher un paiement..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button onClick={() => setShowPaymentModal(true)} className="btn-modern primary">
              Enregistrer un paiement <i className="fa-solid fa-plus" style={{ marginLeft: '8px' }}></i>
            </button>
          </div>

          <div className="glass-card" style={{ overflow: 'hidden' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-subtle)' }}>
                  <th style={{ padding: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>STAGIAIRE</th>
                  <th style={{ padding: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>MOIS</th>
                  <th style={{ padding: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>MONTANT</th>
                  <th style={{ padding: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>DATE</th>
                  <th style={{ padding: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>STATUT</th>
                  <th style={{ padding: '16px', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.length === 0 ? (
                  <tr><td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>Aucun paiement trouvé.</td></tr>
                ) : filteredPayments.map(p => {
                  const student = students.find(s => s.id === p.studentId);
                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '16px' }}>
                        <p style={{ fontWeight: '700', fontSize: '14px' }}>{student?.firstName} {student?.lastName}</p>
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{student?.major}</p>
                      </td>
                      <td style={{ padding: '16px', fontWeight: '600' }}>{p.month}</td>
                      <td style={{ padding: '16px', fontWeight: '800' }}>{p.amount} DH</td>
                      <td style={{ padding: '16px', fontSize: '13px' }}>{p.date}</td>
                      <td style={{ padding: '16px' }}>
                        <span className="badge-status success">{p.status}</span>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right' }}>
                        <button onClick={() => generateReceipt(p, student)} className="btn-icon" title="Imprimer Reçu" style={{ color: 'var(--primary)' }}>
                          <i className="fa-solid fa-file-pdf"></i>
                        </button>
                        <button onClick={() => deletePayment(p.id)} className="btn-icon" title="Supprimer" style={{ color: '#f43f5e', marginLeft: '12px' }}>
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {activeTab === 'salaries' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="glass-card" style={{ padding: '20px', marginBottom: '20px', display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>MOIS:</label>
              <select className="input-premium" value={salaryFilter.month} onChange={(e) => setSalaryFilter({...salaryFilter, month: parseInt(e.target.value)})}>
                {months.map((m, i) => <option key={m} value={i}>{m}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>ANNÉE:</label>
              <select className="input-premium" value={salaryFilter.year} onChange={(e) => setSalaryFilter({...salaryFilter, year: parseInt(e.target.value)})}>
                <option value={2026}>2026</option>
                <option value={2025}>2025</option>
              </select>
            </div>
          </div>

          <div className="glass-card" style={{ overflow: 'hidden' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-subtle)' }}>
                  <th style={{ padding: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>FORMATEUR</th>
                  <th style={{ padding: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>HEURES</th>
                  <th style={{ padding: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>TARIF H.</th>
                  <th style={{ padding: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>TOTAL CALCULÉ</th>
                  <th style={{ padding: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>STATUT</th>
                  <th style={{ padding: '16px', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {calculatedSalaries.map(s => (
                  <tr key={s.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '16px' }}>
                      <p style={{ fontWeight: '700', fontSize: '14px' }}>{s.name}</p>
                    </td>
                    <td style={{ padding: '16px', fontWeight: '600' }}>{s.hours} h</td>
                    <td style={{ padding: '16px' }}>
                      {editingTeacherId === s.id ? (
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <input 
                            type="number" 
                            className="input-premium" 
                            style={{ width: '70px', padding: '4px 8px', fontSize: '12px' }} 
                            defaultValue={s.hourlyRate} 
                            id={`rate-${s.id}`} 
                            autoFocus
                          />
                          <button className="btn-icon" onClick={() => handleSaveRate(s.id)}>
                            <i className="fa-solid fa-check" style={{ color: '#16a34a', fontSize: '12px' }}></i>
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: '600' }}>{s.hourlyRate} DH/h</span>
                          <button className="btn-icon" onClick={() => setEditingTeacherId(s.id)} style={{ opacity: 0.4, cursor: 'pointer' }} title="Modifier le tarif">
                            <i className="fa-solid fa-pen-to-square" style={{ fontSize: '11px' }}></i>
                          </button>
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '16px', fontWeight: '800', color: 'var(--primary)' }}>{s.total.toLocaleString()} DH</td>
                    <td style={{ padding: '16px' }}>
                      <span className={`badge-status ${s.isPaid ? 'success' : 'warning'}`}>
                        {s.isPaid ? 'Payé' : 'À payer'}
                      </span>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      {!s.isPaid && s.total > 0 && (
                        <button 
                          className="btn-modern primary" 
                          style={{ padding: '6px 12px', fontSize: '11px' }}
                          onClick={async () => {
                            if (window.confirm(`Confirmer le paiement de ${s.total} DH à ${s.name} ?`)) {
                              await addSalary({
                                teacherId: s.id,
                                teacherName: s.name,
                                amount: s.total,
                                hours: s.hours,
                                month: months[salaryFilter.month],
                                year: salaryFilter.year,
                                date: new Date().toISOString().split('T')[0]
                              });
                            }
                          }}
                        >
                          Marquer comme payé
                        </button>
                      )}
                      {s.isPaid && (
                        <button 
                          className="btn-icon" 
                          style={{ color: '#f43f5e' }}
                          onClick={async () => {
                            const salaryRecord = salaries.find(sal => sal.teacherId === s.id && sal.month === months[salaryFilter.month] && sal.year === salaryFilter.year);
                            if (salaryRecord) await deleteSalary(salaryRecord.id);
                          }}
                        >
                          <i className="fa-solid fa-rotate-left"></i>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '40px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px', color: 'var(--text-primary)' }}>Historique des Salaires Versés</h3>
            <div className="glass-card" style={{ overflow: 'hidden' }}>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-subtle)' }}>
                    <th style={{ padding: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>FORMATEUR</th>
                    <th style={{ padding: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>PÉRIODE</th>
                    <th style={{ padding: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>MONTANT</th>
                    <th style={{ padding: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>DATE PAIEMENT</th>
                    <th style={{ padding: '16px', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'right' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {salaries.length === 0 ? (
                    <tr><td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>Aucun historique de salaire.</td></tr>
                  ) : salaries.map(s => (
                    <tr key={s.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '16px', fontWeight: '700' }}>{s.teacherName}</td>
                      <td style={{ padding: '16px' }}>{s.month} {s.year}</td>
                      <td style={{ padding: '16px', fontWeight: '800' }}>{s.amount.toLocaleString()} DH</td>
                      <td style={{ padding: '16px' }}>{s.date}</td>
                      <td style={{ padding: '16px', textAlign: 'right' }}>
                        <button onClick={() => deleteSalary(s.id)} className="btn-icon" style={{ color: '#f43f5e' }}>
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'stats' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '20px' }}>Répartition Financière</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                    <span style={{ fontWeight: '600' }}>Paiements Stagiaires</span>
                    <span style={{ color: '#10b981', fontWeight: '800' }}>+{stats.revenue.toLocaleString()} DH</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'var(--bg-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: '100%', height: '100%', background: '#10b981' }}></div>
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                    <span style={{ fontWeight: '600' }}>Salaires Formateurs</span>
                    <span style={{ color: '#f43f5e', fontWeight: '800' }}>-{stats.expenses.toLocaleString()} DH</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'var(--bg-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${(stats.expenses / (stats.revenue || 1)) * 100}%`, height: '100%', background: '#f43f5e' }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '20px' }}>En attente de paiement</h3>
              <div style={{ padding: '20px', background: 'rgba(245, 158, 11, 0.05)', borderRadius: 'var(--radius-lg)', border: '1px dashed #f59e0b' }}>
                <p style={{ fontSize: '13px', color: '#b45309', fontWeight: '600', textAlign: 'center' }}>
                  Salaires calculés non encore payés : <br/>
                  <span style={{ fontSize: '24px', fontWeight: '900' }}>{stats.pendingSalaries.toLocaleString()} DH</span>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay" onClick={() => setShowPaymentModal(false)} />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="glass-card" style={{ maxWidth: '500px', width: '100%', padding: '32px', zIndex: 101 }}>
              <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '24px' }}>Enregistrer un Paiement</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>STAGIAIRE</label>
                  <select 
                    className="input-premium" 
                    style={{ width: '100%' }}
                    value={paymentData.studentId}
                    onChange={(e) => setPaymentData({...paymentData, studentId: e.target.value})}
                  >
                    <option value="">Sélectionner un stagiaire...</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.lastName} {s.firstName} ({s.major})</option>)}
                  </select>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>MONTANT (DH)</label>
                    <input 
                      type="number" 
                      className="input-premium" 
                      style={{ width: '100%' }}
                      value={paymentData.amount}
                      onChange={(e) => setPaymentData({...paymentData, amount: e.target.value})}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>MOIS</label>
                    <select 
                      className="input-premium" 
                      style={{ width: '100%' }}
                      value={paymentData.month}
                      onChange={(e) => setPaymentData({...paymentData, month: e.target.value})}
                    >
                      {months.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                </div>

                <button 
                  className="btn-modern primary" 
                  style={{ marginTop: '12px' }}
                  onClick={async () => {
                    if (!paymentData.studentId || !paymentData.amount) return alert('Remplissez tous les champs');
                    await addPayment(paymentData);
                    setShowPaymentModal(false);
                    setPaymentData({ ...paymentData, studentId: '', amount: '' });
                  }}
                >
                  Enregistrer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FinanceDashboard;
