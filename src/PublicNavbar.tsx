import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useLanguage } from './i18n/LanguageContext';
import { Shield, ArrowRight } from 'lucide-react';
import LanguageSelector from './LanguageSelector';

const PublicNavbar: React.FC = () => {
  const { token } = useAuth();
  const { t } = useLanguage();

  return (
    <nav style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between', 
      padding: '1rem 1.75rem', 
      borderBottom: '1px solid #1e293b', 
      background: '#0f172a', 
      position: 'sticky', 
      top: 0, 
      zIndex: 100,
      width: '100%',
      flexWrap: 'wrap',
      gap: '1rem'
    }}>
      <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ background: 'rgba(56, 189, 248, 0.15)', padding: '0.45rem', borderRadius: '8px', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Shield size={22} />
        </div>
        <span style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
          Shogun<strong style={{ color: '#38bdf8', fontWeight: 800 }}>Authority</strong>
        </span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <LanguageSelector variant="public" />
        
        {token ? (
          <Link to="/dashboard" className="btn-primary" style={{ textDecoration: 'none', padding: '0.55rem 1.15rem', fontSize: '0.85rem', width: 'auto' }}>
            {t.nav.goToDashboard} <ArrowRight size={15} />
          </Link>
        ) : (
          <>
            <Link to="/login" style={{ color: '#ffffff', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600, padding: '0.45rem 0.85rem' }}>
              {t.nav.login}
            </Link>
            <Link to="/register" className="btn-primary" style={{ textDecoration: 'none', padding: '0.55rem 1.15rem', fontSize: '0.85rem', width: 'auto' }}>
              {t.nav.getStarted} <ArrowRight size={15} />
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default PublicNavbar;
