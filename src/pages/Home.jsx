import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  PieChart, 
  Layers, 
  ChevronRight,
  Sparkles,
  Globe,
  Settings
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  }),
};

const Home = () => {
  return (
    <div className="max-w-container section-padding">
      {/* ── Hero ── */}
      <div style={{ textAlign: 'center', paddingTop: '40px', marginBottom: '80px' }}>
        <motion.div initial="hidden" animate="visible" variants={fadeUp} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          <motion.div variants={fadeUp} custom={0} className="badge-status primary" style={{ marginBottom: '32px', padding: '8px 16px', borderRadius: '100px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)', animation: 'pulse 2s infinite' }}></span>
            <Globe size={12} /> Plateforme de Gestion Académique
          </motion.div>

          <motion.h1 variants={fadeUp} custom={1} style={{ fontSize: 'clamp(2.5rem, 8vw, 4.8rem)', fontWeight: '900', letterSpacing: '-0.04em', lineHeight: '1', marginBottom: '24px', color: 'var(--text-primary)' }}>
            Le futur de la <br />
            <span className="luminous-text" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>gestion scolaire.</span>
          </motion.h1>

          <motion.p variants={fadeUp} custom={2} style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: 'var(--text-tertiary)', maxWidth: '580px', marginBottom: '48px', lineHeight: '1.6' }}>
            Une expérience administrative fluide, sécurisée et intuitive pour les instituts de formation professionnelle.
          </motion.p>

          <motion.div variants={fadeUp} custom={3} style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link to="/admin/add-student" className="btn-modern primary" style={{ padding: '16px 36px', borderRadius: 'var(--radius-pill)', fontSize: '15px' }}>
              Commencer <ArrowRight size={18} style={{ marginLeft: '8px' }} />
            </Link>
            <Link to="/login" className="btn-modern secondary" style={{ padding: '16px 36px', borderRadius: 'var(--radius-pill)', fontSize: '15px' }}>
              Accès Administration
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* ── Features ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '80px' }}>
        {[
          { icon: ShieldCheck, title: 'Sécurité Maximale', desc: 'Protection des données via LUX-CORE et authentification par token sécurisé.', color: 'var(--primary)', bg: 'var(--primary-ultra-light)' },
          { icon: Zap, title: 'Performance Temps Réel', desc: 'Synchronisation instantanée des présences et des notes sur tous les terminaux.', color: 'var(--accent)', bg: 'rgba(254, 205, 8, 0.1)' },
          { icon: PieChart, title: 'Analytique Avancée', desc: 'Tableaux de bord visuels et rapports automatisés pour le suivi académique.', color: 'var(--info)', bg: 'rgba(37, 99, 235, 0.05)' },
          { icon: Layers, title: 'Interface SaaS', desc: 'Design premium responsive conçu pour une productivité administrative accrue.', color: 'var(--text-secondary)', bg: 'var(--bg-subtle)' }
        ].map((feat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
            className="glass-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-xl)', background: feat.bg, color: feat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <feat.icon size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px' }}>{feat.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6' }}>{feat.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} style={{ textAlign: 'center', padding: '60px 0', maxWidth: '700px', margin: '0 auto' }}>
        <p style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '24px' }}>Expertise & Innovation</p>
        <blockquote style={{ fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)', fontWeight: '600', color: 'var(--text-secondary)', lineHeight: '1.5', fontStyle: 'italic' }}>
          "IPFP Manager n'est pas seulement un outil de gestion, c'est le partenaire numérique de votre réussite institutionnelle."
        </blockquote>
      </motion.div>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.8); } }
      `}</style>
    </div>
  );
};

export default Home;
