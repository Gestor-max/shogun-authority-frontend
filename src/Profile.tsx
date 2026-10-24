import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { useLanguage } from './i18n/LanguageContext';
import { User, Mail, Lock, ShieldCheck, Save, X, KeyRound } from 'lucide-react';
import { API_BASE_URL } from './config';

const Profile: React.FC = () => {
  const { user, token, login } = useAuth();
  const { t } = useLanguage();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    
    if (password && password !== confirmPassword) {
      setMessage({ type: 'error', text: t.profile.passwordMismatch });
      return;
    }

    setLoading(true);
    try {
      const payload: any = { name, email };
      if (password) payload.password = password;

      const res = await axios.patch(`${API_BASE_URL}/auth/profile`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      login(token!, res.data); // Update context with new user data
      setMessage({ type: 'success', text: t.profile.profileUpdated });
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: err.response?.data?.message || t.profile.updateError });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '960px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          {t.profile.title}
        </h2>
        <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
          {t.profile.subtitle}
        </p>
      </div>

      {message && (
        <div style={{ 
          color: message.type === 'success' ? '#065f46' : '#991b1b', 
          background: message.type === 'success' ? '#d1fae5' : '#fee2e2',
          borderColor: message.type === 'success' ? '#a7f3d0' : '#fecaca',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          border: '1px solid',
          marginBottom: '1.5rem',
          fontSize: '0.875rem'
        }}>
          {message.type === 'success' ? <ShieldCheck size={18} /> : <X size={18} />}
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
          {/* Datos Personales Card */}
          <div className="card" style={{ margin: 0 }}>
            <div className="card-header">
              <h3>
                <User size={18} /> {t.profile.personalInfo}
              </h3>
            </div>
            <div className="card-body">
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label>{t.profile.name}</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder={t.profile.namePlaceholder} 
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label>{t.profile.email}</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder={t.profile.emailPlaceholder} 
                    required 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Seguridad Card */}
          <div className="card" style={{ margin: 0 }}>
            <div className="card-header">
              <h3>
                <KeyRound size={18} /> {t.profile.securitySettings}
              </h3>
            </div>
            <div className="card-body">
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label>{t.profile.newPassword}</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder={t.profile.passwordPlaceholder} 
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                <label>{t.profile.confirmNewPassword}</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input 
                    type="password" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder={t.profile.passwordPlaceholder} 
                  />
                </div>
              </div>

              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.5rem 0 0 0' }}>
                {t.profile.leaveEmptyNotice}
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            type="submit" 
            disabled={loading} 
            className="btn-primary"
            style={{ width: 'auto', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', opacity: loading ? 0.7 : 1 }}
          >
            <Save size={18} /> {loading ? t.profile.updating : t.profile.saveChanges}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
