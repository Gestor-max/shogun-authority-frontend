import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Shield, ArrowRight } from 'lucide-react';

const PublicNavbar: React.FC = () => {
  const { token } = useAuth();

  return (
    <nav style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between', 
      padding: '1.25rem 3rem', 
      borderBottom: '1px solid rgba(255,255,255,0.08)', 
      background: 'rgba(11, 19, 43, 0.85)', 
      backdropFilter: 'blur(10px)', 
      position: 'sticky', 
      top: 0, 
      zIndex: 100,
      width: '100%'
    }}>
      <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ background: 'rgba(168, 85, 247, 0.15)', padding: '0.5rem', borderRadius: '10px', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
          <Shield size={24} />
        </div>
        <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#f8fafc' }}>
          Shogun<span style={{ color: '#c084fc' }}>Authority</span>
        </span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <Link to="/#features" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9375rem', fontWeight: 500 }}>Características</Link>
        <Link to="/#metrics" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9375rem', fontWeight: 500 }}>Métricas SEO</Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {token ? (
          <Link to="/dashboard" className="btn-success" style={{ textDecoration: 'none', padding: '0.6rem 1.25rem', fontSize: '0.875rem' }}>
            Ir al Dashboard <ArrowRight size={16} />
          </Link>
        ) : (
          <>
            <Link to="/login" style={{ color: '#f8fafc', textDecoration: 'none', fontSize: '0.9375rem', fontWeight: 600, padding: '0.5rem 1rem' }}>
              Iniciar Sesión
            </Link>
            <Link to="/register" className="btn-primary" style={{ textDecoration: 'none', padding: '0.6rem 1.25rem', fontSize: '0.875rem' }}>
              Comenzar Gratis <ArrowRight size={16} />
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default PublicNavbar;
