import { logoBase64 } from '../utils/logoBase64';

const Logo = ({ size = 40, showText = true, color = 'var(--primary)' }) => {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px' }}>
      <img 
        src={logoBase64} 
        alt="IPFP Logo" 
        style={{ 
          width: size * 1.5, 
          height: 'auto',
          objectFit: 'contain',
          filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1))'
        }} 
      />
      
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
