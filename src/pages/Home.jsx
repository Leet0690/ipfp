import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

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
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
          {/* Status Pill */}
          <motion.div
            variants={fadeUp}
            custom={0}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'white',
              padding: '6px 16px',
              borderRadius: '100px',
              fontSize: '11px',
              fontWeight: '600',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: '32px',
              border: '1px solid var(--border-light)',
              boxShadow: 'var(--shadow-xs)',
              color: 'var(--text-tertiary)',
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)', animation: 'pulse 2s infinite' }}></span>
            Plateforme en ligne
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            custom={1}
            style={{
              fontSize: 'clamp(2.2rem, 6vw, 4.5rem)',
              fontWeight: '800',
              letterSpacing: '-0.035em',
              lineHeight: '1.08',
              marginBottom: '24px',
              color: 'var(--text-primary)',
            }}
          >
            Le futur de la <br />
            <span className="luminous-text">gestion scolaire.</span>
          </motion.h1>

          {/* Subline */}
          <motion.p
            variants={fadeUp}
            custom={2}
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.15rem)',
              color: 'var(--text-tertiary)',
              maxWidth: '520px',
              marginBottom: '40px',
              lineHeight: '1.7',
              fontWeight: '400',
            }}
          >
            Une interface minimaliste et sécurisée, conçue pour offrir
            l'expérience de gestion d'institut la plus fluide.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={fadeUp}
            custom={3}
            style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}
          >
            <Link
              to="/admin/add-student"
              className="btn-modern primary"
              style={{ padding: '12px 28px', borderRadius: '100px', fontSize: '14px' }}
            >
              Commencer <i className="fa-solid fa-arrow-right" style={{ fontSize: '12px', marginLeft: '4px' }}></i>
            </Link>
            <Link
              to="/login"
              className="btn-secondary"
              style={{ padding: '12px 28px', borderRadius: '100px', fontSize: '14px' }}
            >
              Accès Admin
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* ── Bento Grid ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '16px',
        marginBottom: '80px',
      }}>
        {[
          {
            icon: 'fa-shield-halved',
            iconColor: 'var(--primary)',
            iconBg: 'var(--primary-ultra-light)',
            title: 'Sécurité avancée',
            desc: 'Chiffrement de bout en bout. Vos données sont protégées par le noyau LUX-CORE.',
            span: true,
          },
          {
            icon: 'fa-bolt',
            iconColor: 'var(--accent)',
            iconBg: 'var(--accent-glow)',
            title: 'Temps réel',
            desc: 'Synchronisation instantanée via notre infrastructure Edge distribuée.',
          },
          {
            icon: 'fa-chart-pie',
            iconColor: 'var(--primary)',
            iconBg: 'rgba(176, 104, 185, 0.08)',
            title: 'Analytics AI',
            desc: 'Analyse prédictive de réussite scolaire et tableaux de bord intelligents.',
          },
          {
            icon: 'fa-layer-group',
            iconColor: 'var(--text-secondary)',
            iconBg: 'var(--bg-subtle)',
            title: 'Interface SaaS',
            desc: 'Expérience utilisateur fluide, responsive et entièrement personnalisable.',
          },
        ].map((feature, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ delay: idx * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="glass-card"
            style={{
              padding: '28px',
              gridColumn: feature.span ? 'span 2' : 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-lg)',
                background: feature.iconBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: feature.iconColor,
                fontSize: '16px',
              }}
            >
              <i className={`fa-solid ${feature.icon}`}></i>
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '6px', color: 'var(--text-primary)' }}>
                {feature.title}
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-tertiary)', lineHeight: '1.6', fontWeight: '400' }}>
                {feature.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Quote ── */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        style={{ textAlign: 'center', paddingBottom: '40px', maxWidth: '640px', margin: '0 auto' }}
      >
        <p style={{
          fontSize: '11px',
          fontWeight: '600',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          marginBottom: '20px',
        }}>
          Déployé dans les meilleures institutions
        </p>
        <blockquote style={{
          fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)',
          fontWeight: '500',
          color: 'var(--text-secondary)',
          lineHeight: '1.5',
          letterSpacing: '-0.01em',
          fontStyle: 'normal',
        }}>
          "IPFP transcende le logiciel de gestion classique. C'est une plateforme conçue avec rigueur esthétique et technique."
        </blockquote>
      </motion.div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @media (max-width: 640px) {
          [style*="grid-column: span 2"] { grid-column: auto !important; }
        }
      `}</style>
    </div>
  );
};

export default Home;
