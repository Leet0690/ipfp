import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { jsPDF } from 'jspdf';
import { logoBase64 } from '../utils/logoBase64';
import { TableSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import { 
  Lock, 
  ArrowRight, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  DoorOpen, 
  Search, 
  Plus, 
  FileText, 
  Trash2, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw,
  BarChart3,
  PieChart,
  Edit3,
  X,
  CreditCard,
  History,
  CalendarDays
} from 'lucide-react';

const FinanceDashboard = () => {
  const { 
    students, teachers, payments, salaries, loading,
    addPayment, deletePayment, addSalary, deleteSalary, updateTeacher,
    teacherAttendance, isDirectorAuth, loginDirector, logoutDirector, logout, confirmAction
  } = useApp();
  const { showToast } = useToast();

  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('payments');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingTeacherId, setEditingTeacherId] = useState(null);
  
  const [paymentsPage, setPaymentsPage] = useState(1);
  const [salariesPage, setSalariesPage] = useState(1);
  const itemsPerPage = 10;
  
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
      showToast('Mot de passe incorrect', 'error');
    } else {
      showToast('Accès autorisé', 'success');
    }
  };

  const handleSaveRate = async (teacherId) => {
    const newVal = document.getElementById(`rate-${teacherId}`).value;
    const rate = parseFloat(newVal);
    if (!isNaN(rate)) {
      await updateTeacher(teacherId, { hourlyRate: rate });
      showToast('Tarif mis à jour', 'success');
      setEditingTeacherId(null);
    }
  };

  const generateReceipt = (payment, student) => {
    const doc = new jsPDF();
    const w = doc.internal.pageSize.getWidth();
    try { doc.addImage(logoBase64, 'JPEG', 15, 10, 40, 18); } catch(e) {}
    doc.setFontSize(22); doc.setTextColor(40, 40, 40); doc.text('REÇU DE PAIEMENT', w/2, 45, { align: 'center' });
    doc.setDrawColor(200); doc.line(15, 50, w - 15, 50);
    doc.setFontSize(12); doc.setTextColor(80, 80, 80);
    doc.text(`N° Reçu: ${payment.id.substring(0, 8).toUpperCase()}`, 15, 65);
    doc.text(`Date: ${payment.date}`, w - 15, 65, { align: 'right' });
    doc.setFillColor(248, 250, 252); doc.rect(15, 75, w - 30, 60, 'F');
    doc.setDrawColor(226, 232, 240); doc.rect(15, 75, w - 30, 60, 'S');
    doc.setTextColor(40, 40, 40); doc.setFont('helvetica', 'bold'); doc.text('Détails du Stagiaire:', 25, 85);
    doc.setFont('helvetica', 'normal'); doc.text(`${student.firstName} ${student.lastName}`, 25, 95);
    doc.text(`Filière: ${student.major}`, 25, 103);
    doc.setFont('helvetica', 'bold'); doc.text('Détails du Paiement:', 110, 85);
    doc.setFont('helvetica', 'normal'); doc.text(`Mois: ${payment.month}`, 110, 95);
    doc.text(`Montant: ${payment.amount} DH`, 110, 103);
    doc.text(`Mode: Cash`, 110, 111);
    doc.setFontSize(16); doc.setFont('helvetica', 'bold');
    doc.text(`TOTAL PAYÉ: ${payment.amount} DH`, w - 25, 125, { align: 'right' });
    doc.setFontSize(10); doc.setFont('helvetica', 'italic'); doc.text('Signature et Cachet IPFP', w - 60, 160);
    doc.save(`Recu_${student.lastName}_${payment.month}.pdf`);
    showToast('Reçu généré', 'success');
  };

  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      const student = students.find(s => s.id === p.studentId);
      if (!student) return false;
      const searchStr = `${student.firstName} ${student.lastName} ${p.month}`.toLowerCase();
      return searchStr.includes(searchTerm.toLowerCase());
    });
  }, [payments, students, searchTerm]);

  const calculatedSalaries = useMemo(() => {
    return teachers.map(t => {
      const hours = teacherAttendance
        .filter(a => {
          if (a.teacherId !== t.id || a.status !== 'present') return false;
          const date = new Date(a.date);
          return date.getMonth() === salaryFilter.month && date.getFullYear() === salaryFilter.year;
        })
        .reduce((acc, a) => acc + (parseFloat(a.hours) || 0), 0);
      const hourlyRate = parseFloat(t.hourlyRate) || 0;
      const total = hours * hourlyRate;
      const monthName = months[salaryFilter.month];
      const isPaid = salaries.some(s => s.teacherId === t.id && s.month === monthName && s.year === salaryFilter.year);
      return { ...t, hours, hourlyRate, total, isPaid };
    });
  }, [teachers, teacherAttendance, salaryFilter, salaries]);

  const paginatedSalaries = useMemo(() => {
    return salaries.slice((salariesPage - 1) * itemsPerPage, salariesPage * itemsPerPage);
  }, [salaries, salariesPage, itemsPerPage]);
  
  const totalSalariesPages = Math.ceil(salaries.length / itemsPerPage);

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
      <div className="flex-center" style={{ minHeight: 'calc(100vh - 150px)', width: '100%' }}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-premium" style={{ padding: 'var(--space-10)', maxWidth: '420px', width: '100%', textAlign: 'center' }}>
          <div style={{ width: '72px', height: '72px', background: 'var(--primary-ultra-light)', borderRadius: 'var(--radius-3xl)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-6)', color: 'var(--primary)' }}>
            <Lock size={32} />
          </div>
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: '900', marginBottom: 'var(--space-2)' }}>Espace Direction</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-8)' }}>Accès restreint à la gestion financière de l'IPFP.</p>
          <form onSubmit={handleLogin}>
            <input type="password" className="input-premium" placeholder="Mot de passe confidentiel" style={{ width: '100%', marginBottom: 'var(--space-4)', textAlign: 'center', padding: '14px' }} value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />
            <button type="submit" className="btn-modern primary" style={{ width: '100%', justifyContent: 'center', padding: '14px' }}>
              Déverrouiller <ArrowRight size={18} style={{ marginLeft: '8px' }} />
            </button>
            <button type="button" onClick={logout} className="btn-modern" style={{ width: '100%', justifyContent: 'center', padding: '14px', marginTop: '12px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
              Se déconnecter de l'application
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="section-padding">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-8)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: '900', color: 'var(--text-primary)' }}>Gestion Financière</h1>
          <p style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Tableau de bord des flux et de la trésorerie</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={logoutDirector} className="btn-modern" style={{ background: 'var(--bg-subtle)' }} title="Verrouiller l'espace direction">
            <Lock size={16} style={{ marginRight: '8px' }} /> Verrouiller
          </button>
          <button onClick={logout} className="btn-modern" style={{ background: 'var(--danger-ultra-light)', color: 'var(--danger)', border: '1px solid var(--danger-bg)' }}>
            <RotateCcw size={16} style={{ marginRight: '8px' }} /> Déconnexion
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
        <StatCard title="Revenus Totaux" value={stats.revenue} icon={TrendingUp} color="var(--success)" />
        <StatCard title="Charges Salariales" value={stats.expenses} icon={TrendingDown} color="var(--danger)" />
        <StatCard title="Bénéfice Net" value={stats.balance} icon={Wallet} color="var(--primary)" />
      </div>

      <div className="modern-tabs-container" style={{ marginBottom: 'var(--space-6)' }}>
        <button onClick={() => setActiveTab('payments')} className={`modern-tab ${activeTab === 'payments' ? 'active' : ''}`}>Paiements</button>
        <button onClick={() => setActiveTab('salaries')} className={`modern-tab ${activeTab === 'salaries' ? 'active' : ''}`}>Salaires</button>
        <button onClick={() => setActiveTab('stats')} className={`modern-tab ${activeTab === 'stats' ? 'active' : ''}`}>Analyses</button>
      </div>

      {activeTab === 'payments' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="glass-card" style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-5)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: '320px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
              <input type="text" className="input-premium" style={{ width: '100%', paddingLeft: '38px' }} placeholder="Rechercher un stagiaire ou mois..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <button onClick={() => setShowPaymentModal(true)} className="btn-modern primary">
              <Plus size={16} style={{ marginRight: '8px' }} /> Enregistrer Paiement
            </button>
          </div>

          <div className="glass-card" style={{ overflow: 'hidden' }}>
            {loading ? <TableSkeleton rows={8} /> : (
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-subtle)' }}>
                    <th style={thStyle}>Stagiaire</th>
                    <th style={thStyle}>Période</th>
                    <th style={thStyle}>Montant</th>
                    <th style={thStyle}>Date</th>
                    <th style={thStyle}>Statut</th>
                    <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.length === 0 ? (
                    <tr><td colSpan="6"><EmptyState title="Aucun paiement" message="Aucune transaction trouvée pour cette recherche." icon="search" /></td></tr>
                  ) : filteredPayments.map(p => {
                    const student = students.find(s => s.id === p.studentId);
                    return (
                      <tr key={p.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={tdStyle}>
                          <p style={{ fontWeight: '700', fontSize: 'var(--text-sm)' }}>{student?.firstName} {student?.lastName}</p>
                          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{student?.major}</p>
                        </td>
                        <td style={tdStyle}><span style={{ fontWeight: '700' }}>{p.month}</span></td>
                        <td style={tdStyle}><span style={{ fontWeight: '900', color: 'var(--success)' }}>{p.amount.toLocaleString()} DH</span></td>
                        <td style={tdStyle}><span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{p.date}</span></td>
                        <td style={tdStyle}><span className="badge-status success">{p.status}</span></td>
                        <td style={{ ...tdStyle, textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button onClick={() => generateReceipt(p, student)} className="action-btn" title="Reçu"><FileText size={16} /></button>
                            <button onClick={async () => {
                              if (await confirmAction({ title: "Supprimer paiement ?", message: "Voulez-vous supprimer ce reçu de paiement ?", type: "danger" })) {
                                deletePayment(p.id);
                              }
                            }} className="action-btn delete"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>
      )}

      {activeTab === 'salaries' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="glass-card" style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-5)', display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CalendarDays size={16} style={{ color: 'var(--text-muted)' }} />
              <select className="input-premium" value={salaryFilter.month} onChange={(e) => setSalaryFilter({...salaryFilter, month: parseInt(e.target.value)})}>
                {months.map((m, i) => <option key={m} value={i}>{m}</option>)}
              </select>
            </div>
            <select className="input-premium" value={salaryFilter.year} onChange={(e) => setSalaryFilter({...salaryFilter, year: parseInt(e.target.value)})}>
              <option value={2026}>2026</option>
              <option value={2025}>2025</option>
            </select>
          </div>

          <div className="glass-card" style={{ overflow: 'hidden' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-subtle)' }}>
                  <th style={thStyle}>Formateur</th>
                  <th style={thStyle}>Volume H.</th>
                  <th style={thStyle}>Tarif (DH/h)</th>
                  <th style={thStyle}>Net à payer</th>
                  <th style={thStyle}>Statut</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {calculatedSalaries.map(s => (
                  <tr key={s.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={tdStyle}><p style={{ fontWeight: '700' }}>{s.name}</p></td>
                    <td style={tdStyle}><span style={{ fontWeight: '800' }}>{s.hours} h</span></td>
                    <td style={tdStyle}>
                      {editingTeacherId === s.id ? (
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <input type="number" className="input-premium" style={{ width: '80px', padding: '6px' }} defaultValue={s.hourlyRate} id={`rate-${s.id}`} autoFocus />
                          <button className="action-btn" onClick={() => handleSaveRate(s.id)}><Check size={16} style={{ color: 'var(--success)' }} /></button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: '700' }}>{s.hourlyRate} DH</span>
                          <button className="action-btn" onClick={() => setEditingTeacherId(s.id)}><Edit3 size={12} /></button>
                        </div>
                      )}
                    </td>
                    <td style={tdStyle}><span style={{ fontWeight: '900', color: 'var(--primary)' }}>{s.total.toLocaleString()} DH</span></td>
                    <td style={tdStyle}><span className={`badge-status ${s.isPaid ? 'success' : 'warning'}`}>{s.isPaid ? 'Règlé' : 'À régler'}</span></td>
                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                      {!s.isPaid && s.total > 0 && (
                        <button className="btn-modern primary" style={{ padding: '6px 12px', fontSize: '11px' }}
                          onClick={async () => {
                            if (await confirmAction({ title: "Confirmer paiement ?", message: `Voulez-vous valider le salaire de ${s.total} DH pour ${s.name} ?`, type: "warning" })) {
                              await addSalary({ teacherId: s.id, teacherName: s.name, amount: s.total, hours: s.hours, month: months[salaryFilter.month], year: salaryFilter.year, date: new Date().toISOString().split('T')[0] });
                            }
                          }}>Valider Paiement</button>
                      )}
                      {s.isPaid && (
                        <button className="action-btn delete" onClick={async () => {
                          if (await confirmAction({ title: "Annuler paiement ?", message: "Voulez-vous supprimer ce versement ?", type: "danger" })) {
                            const sal = salaries.find(sal => sal.teacherId === s.id && sal.month === months[salaryFilter.month] && sal.year === salaryFilter.year);
                            if (sal) {
                              await deleteSalary(sal.id);
                            }
                          }
                        }}><RotateCcw size={16} /></button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: 'var(--space-10)' }}>
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: '900', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <History size={20} /> Historique des règlements
            </h3>
            <div className="glass-card" style={{ overflow: 'hidden' }}>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-subtle)' }}>
                    <th style={thStyle}>Bénéficiaire</th>
                    <th style={thStyle}>Période</th>
                    <th style={thStyle}>Montant</th>
                    <th style={thStyle}>Date Versement</th>
                    <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedSalaries.length === 0 ? (
                    <tr><td colSpan="5"><EmptyState title="Aucun historique" message="Aucun versement n'a encore été enregistré." icon="history" /></td></tr>
                  ) : paginatedSalaries.map(s => (
                    <tr key={s.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={tdStyle}><span style={{ fontWeight: '700' }}>{s.teacherName}</span></td>
                      <td style={tdStyle}>{s.month} {s.year}</td>
                      <td style={tdStyle}><span style={{ fontWeight: '800' }}>{s.amount.toLocaleString()} DH</span></td>
                      <td style={tdStyle}>{s.date}</td>
                      <td style={{ ...tdStyle, textAlign: 'right' }}>
                        <button onClick={async () => {
                          if (await confirmAction({ title: "Supprimer ?", message: "Voulez-vous supprimer cet historique ?", type: "danger" })) {
                            deleteSalary(s.id);
                          }
                        }} className="action-btn delete"><Trash2 size={16} /></button>
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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 'var(--space-4)' }}>
          <div className="glass-card" style={{ padding: 'var(--space-6)' }}>
            <h3 style={{ fontSize: 'var(--text-md)', fontWeight: '800', marginBottom: 'var(--space-6)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PieChart size={18} /> Structure Budgétaire
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', fontWeight: '700' }}>
                  <span>Revenus (Encaissements)</span>
                  <span style={{ color: 'var(--success)' }}>+{stats.revenue.toLocaleString()} DH</span>
                </div>
                <div style={{ width: '100%', height: '10px', background: 'var(--bg-subtle)', borderRadius: '5px', overflow: 'hidden' }}>
                  <div style={{ width: '100%', height: '100%', background: 'var(--success)' }}></div>
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', fontWeight: '700' }}>
                  <span>Charges (Salaires)</span>
                  <span style={{ color: 'var(--danger)' }}>-{stats.expenses.toLocaleString()} DH</span>
                </div>
                <div style={{ width: '100%', height: '10px', background: 'var(--bg-subtle)', borderRadius: '5px', overflow: 'hidden' }}>
                  <div style={{ width: `${(stats.expenses / (stats.revenue || 1)) * 100}%`, height: '100%', background: 'var(--danger)' }}></div>
                </div>
              </div>
            </div>
          </div>
          <div className="glass-card" style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
            <BarChart3 size={40} style={{ color: 'var(--accent)', marginBottom: 'var(--space-4)' }} />
            <h3 style={{ fontSize: 'var(--text-md)', fontWeight: '800', marginBottom: 'var(--space-2)' }}>Passif Circulant</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: 'var(--space-4)' }}>Salaires calculés non encore validés.</p>
            <div style={{ padding: '16px 32px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-xl)', border: '2px dashed var(--accent)' }}>
              <span style={{ fontSize: 'var(--text-xl)', fontWeight: '900', color: 'var(--accent)' }}>{stats.pendingSalaries.toLocaleString()} DH</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(6px)' }} onClick={() => setShowPaymentModal(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="glass-premium" style={{ position: 'relative', width: '100%', maxWidth: '500px', padding: '32px', borderRadius: 'var(--radius-3xl)', boxShadow: 'var(--shadow-xl)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: '900' }}>Enregistrer un Paiement</h2>
                <button onClick={() => setShowPaymentModal(false)} className="action-btn"><X size={20} /></button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={lbl}>Stagiaire Bénéficiaire</label>
                  <select className="input-premium" style={{ width: '100%', marginTop: '6px' }} value={paymentData.studentId} onChange={(e) => setPaymentData({...paymentData, studentId: e.target.value})}>
                    <option value="">Sélectionner un stagiaire...</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.lastName} {s.firstName}</option>)}
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={lbl}>Montant (DH)</label>
                    <input type="number" className="input-premium" style={{ width: '100%', marginTop: '6px' }} value={paymentData.amount} onChange={(e) => setPaymentData({...paymentData, amount: e.target.value})} />
                  </div>
                  <div>
                    <label style={lbl}>Mois Concerné</label>
                    <select className="input-premium" style={{ width: '100%', marginTop: '6px' }} value={paymentData.month} onChange={(e) => setPaymentData({...paymentData, month: e.target.value})}>
                      {months.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                </div>
                <button className="btn-modern primary" style={{ width: '100%', padding: '14px', justifyContent: 'center' }}
                  onClick={async () => {
                    if (!paymentData.studentId || !paymentData.amount) return showToast('Champs requis', 'warning');
                    await addPayment(paymentData);
                    setShowPaymentModal(false);
                    setPaymentData({ ...paymentData, studentId: '', amount: '' });
                  }}><CreditCard size={18} style={{ marginRight: '8px' }} /> Valider l'encaissement</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="glass-card" style={{ padding: '24px', borderLeft: `4px solid ${color}` }}>
    <p style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
      <Icon size={14} style={{ color }} /> {title}
    </p>
    <p style={{ fontSize: 'var(--text-3xl)', fontWeight: '900', color }}>{value.toLocaleString()} <span style={{ fontSize: '16px' }}>DH</span></p>
  </div>
);

const thStyle = { padding: '16px', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' };
const tdStyle = { padding: '16px', fontSize: 'var(--text-sm)' };
const lbl = { fontSize: '10px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' };

export default FinanceDashboard;
