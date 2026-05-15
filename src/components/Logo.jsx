import React from 'react';

const Logo = ({ size = 40, showText = true, color = 'var(--primary)' }) => {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px' }}>
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 40 40" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: 'drop-shadow(0 4px 8px rgba(176, 104, 185, 0.2))' }}
      >
        <rect width="40" height="40" rx="12" fill={color} />
        <path d="M10 28V12H15L20 20L25 12H30V28H26V18L21 26H19L14 18V28H10Z" fill="white" />
        <circle cx="32" cy="8" r="4" fill="var(--secondary)" />
      </svg>
      
      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
          <span style={{ 
            fontSize: size * 0.45, 
            fontWeight: '900', 
            letterSpacing: '-0.02em',
            background: 'linear-gradient(135deg, var(--text-primary) 0%, var(--primary) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textTransform: 'uppercase'
          }}>
            IPFP
          </span>
          <span style={{ 
            fontSize: size * 0.22, 
            fontWeight: '700', 
            color: 'var(--text-muted)', 
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginTop: '2px'
          }}>
            Manager
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
