import React from 'react';
import { motion } from 'framer-motion';
import useTokenAuth from '../hooks/useTokenAuth';

/**
 * TokenProtection wrapper component
 * Validates token and shows appropriate message or content
 */
const TokenProtection = ({ children, tokenType = 'student_results' }) => {
  const { isValid, isExpired, loading, error } = useTokenAuth(tokenType);

  // Loading state
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f8f9fc 0%, #eef2f7 100%)',
        padding: '24px'
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            textAlign: 'center'
          }}
        >
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid rgba(176, 104, 185, 0.2)',
            borderTopColor: 'var(--primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }} />
          <h2 style={{
            fontSize: '18px',
            fontWeight: '700',
            color: 'var(--text-primary)',
            marginBottom: '8px'
          }}>
            Verifying access...
          </h2>
          <p style={{
            fontSize: '13px',
            color: 'var(--text-muted)',
            margin: 0
          }}>
            Please wait while we validate your link
          </p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </motion.div>
      </div>
    );
  }

  // Error or invalid token state
  if (!isValid || error) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f8f9fc 0%, #eef2f7 100%)',
        padding: '24px',
        fontFamily: "'Inter', sans-serif"
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            maxWidth: '500px',
            width: '100%',
            padding: '48px',
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.8)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}
        >
          {/* Icon */}
          <div style={{
            width: '80px',
            height: '80px',
            background: 'rgba(239, 68, 68, 0.1)',
            color: '#dc2626',
            borderRadius: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            margin: '0 auto 32px',
            boxShadow: '0 10px 20px -5px rgba(220, 38, 38, 0.2)'
          }}>
            <i className="fa-solid fa-circle-xmark"></i>
          </div>

          {/* Title */}
          <h1 style={{
            fontSize: '32px',
            fontWeight: '900',
            color: 'var(--text-primary)',
            letterSpacing: '-0.04em',
            marginBottom: '16px',
            lineHeight: 1.1
          }}>
            {isExpired ? 'Link Expired' : 'Invalid Link'}
          </h1>

          {/* Message */}
          <p style={{
            fontSize: '16px',
            color: 'var(--text-muted)',
            lineHeight: 1.6,
            marginBottom: '32px',
            fontWeight: '500'
          }}>
            {isExpired
              ? "This link has expired. Please contact your administrator to receive a new access link."
              : "The access link you provided is invalid or has been revoked. Please contact your administrator for assistance."}
          </p>

          {/* Additional Info */}
          <div style={{
            padding: '20px',
            background: 'rgba(239, 68, 68, 0.05)',
            borderRadius: '20px',
            border: '1px solid rgba(239, 68, 68, 0.1)',
            marginBottom: '24px'
          }}>
            <p style={{
              fontSize: '12px',
              fontWeight: '600',
              color: 'var(--text-tertiary)',
              margin: 0
            }}>
              <i className="fa-solid fa-info-circle" style={{ marginRight: '6px' }}></i>
              IPFP Manager - Institut Polytechnique de la Formation Professionnelle
            </p>
          </div>

          {/* Contact Info */}
          <div style={{
            fontSize: '12px',
            color: 'var(--text-faint)',
            fontWeight: '600'
          }}>
            <p style={{ margin: '0 0 8px 0' }}>Contact your administrator for support:</p>
            <p style={{ margin: 0 }}>
              <i className="fa-solid fa-envelope" style={{ marginRight: '6px' }}></i>
              admin@ipfp.com
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // Valid token - show content
  return children;
};

export default TokenProtection;
