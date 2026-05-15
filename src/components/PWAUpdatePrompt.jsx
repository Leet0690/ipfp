import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, X, Sparkles } from 'lucide-react';

const PWAUpdatePrompt = () => {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  const dismiss = () => setNeedRefresh(false);

  return (
    <AnimatePresence>
      {needRefresh && (
        <motion.div
          initial={{ opacity: 0, y: 80, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 80, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            padding: '14px 18px',
            borderRadius: 'var(--radius-xl)',
            background: 'var(--bg-card)',
            border: '1px solid rgba(176,104,185,0.25)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
            maxWidth: 'calc(100vw - 32px)',
            width: 'max-content',
          }}
        >
          <div style={{
            width: '36px', height: '36px', flexShrink: 0,
            borderRadius: '50%',
            background: 'var(--primary-ultra-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Sparkles size={17} style={{ color: 'var(--primary)' }} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-primary)', margin: 0, whiteSpace: 'nowrap' }}>
              Nouvelle version disponible
            </p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0', whiteSpace: 'nowrap' }}>
              Rechargez pour appliquer la mise à jour.
            </p>
          </div>

          <button
            onClick={() => {
              updateServiceWorker(true);
              // Fallback reload for certain browsers/states
              setTimeout(() => window.location.reload(), 500);
            }}
            style={{
              flexShrink: 0,
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '7px 14px',
              borderRadius: 'var(--radius-pill)',
              background: 'var(--primary)',
              color: '#fff',
              border: 'none',
              fontSize: '12px', fontWeight: '800',
              cursor: 'pointer',
              letterSpacing: '0.02em',
            }}
          >
            <RefreshCw size={13} />
            Rafraîchir
          </button>

          <button
            onClick={dismiss}
            style={{
              flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '28px', height: '28px',
              borderRadius: '50%',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            <X size={14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PWAUpdatePrompt;
