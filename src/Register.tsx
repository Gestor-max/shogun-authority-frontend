import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from './i18n/LanguageContext';
import { Shield, CheckCircle2, UserPlus, ArrowRight } from 'lucide-react';
import { API_BASE_URL } from './config';
import PublicNavbar from './PublicNavbar';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError(t.auth.passwordTooShort);
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/auth/register`, { email, password, name });
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || t.common.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <PublicNavbar />

      <div className="auth-split-container">
        {/* Columna Izquierda - Info Operativa */}
        <div className="auth-hero-pane">
          <div style={{ maxWidth: '500px', margin: '0 auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '1.5rem', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
              <Shield size={16} /> {t.auth.heroBadge}
            </div>

            <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#ffffff', margin: '0 0 1rem 0', lineHeight: 1.25 }}>
              {t.auth.heroTitle}
            </h1>

            <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
              {t.auth.heroDesc}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#cbd5e1', fontSize: '0.9rem' }}>
                <CheckCircle2 size={18} style={{ color: '#38bdf8', flexShrink: 0 }} /> {t.auth.featureCatalog}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#cbd5e1', fontSize: '0.9rem' }}>
                <CheckCircle2 size={18} style={{ color: '#38bdf8', flexShrink: 0 }} /> {t.auth.featurePurchases}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#cbd5e1', fontSize: '0.9rem' }}>
                <CheckCircle2 size={18} style={{ color: '#38bdf8', flexShrink: 0 }} /> {t.auth.featureDashboard}
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha - Formulario en Card */}
        <div className="auth-form-pane">
          <div className="card" style={{ width: '100%', maxWidth: '420px', margin: 0, boxShadow: 'var(--shadow-md)' }}>
            <div className="card-header">
              <h3>
                <UserPlus size={18} /> {t.auth.registerTitle}
              </h3>
            </div>
            
            <div className="card-body" style={{ padding: '2rem 1.75rem' }}>
              {error && <div className="error-message">{error}</div>}
              
              <form onSubmit={handleSubmit}>
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label>{t.auth.nameLabel}</label>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder={t.auth.namePlaceholder}
                    required 
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label>{t.auth.emailLabel}</label>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder={t.auth.emailPlaceholder}
                    required 
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label>{t.auth.passwordLabel}</label>
                  <input 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder={t.auth.passwordPlaceholder}
                    required 
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn-primary" 
                  disabled={loading}
                  style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '0.925rem' }}
                >
                  <UserPlus size={16} /> {loading ? t.auth.registering : t.auth.registerButton} <ArrowRight size={16} />
                </button>
              </form>
              
              <p style={{ textAlign: 'center', marginTop: '1.5rem', marginBottom: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                {t.auth.alreadyHaveAccount} <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>{t.auth.loginHere}</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
