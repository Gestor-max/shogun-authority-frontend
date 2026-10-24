import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { useLanguage } from './i18n/LanguageContext';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, CheckCircle2, Lock, ArrowRight, LogIn } from 'lucide-react';
import { API_BASE_URL } from './config';
import PublicNavbar from './PublicNavbar';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
      login(response.data.access_token, response.data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || t.auth.invalidCredentials);
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
                <LogIn size={18} /> {t.auth.loginTitle}
              </h3>
            </div>
            
            <div className="card-body" style={{ padding: '2rem 1.75rem' }}>
              {error && <div className="error-message">{error}</div>}
              
              <form onSubmit={handleSubmit}>
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
                    placeholder="••••••••"
                    required 
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn-primary" 
                  disabled={loading}
                  style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '0.925rem' }}
                >
                  <Lock size={16} /> {loading ? t.auth.loggingIn : t.auth.loginButton} <ArrowRight size={16} />
                </button>
              </form>
              
              <p style={{ textAlign: 'center', marginTop: '1.5rem', marginBottom: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                {t.auth.noAccount} <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>{t.auth.registerHere}</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
