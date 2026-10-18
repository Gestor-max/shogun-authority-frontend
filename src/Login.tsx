import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Sparkles, CheckCircle2, Lock, ArrowRight } from 'lucide-react';
import { API_BASE_URL } from './config';
import PublicNavbar from './PublicNavbar';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
      login(response.data.access_token, response.data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Credenciales inválidas');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', width: '100%', background: '#0b132b' }}>
      <PublicNavbar />

      <div style={{ flex: 1, display: 'flex', width: '100%' }}>
        {/* Columna Izquierda - Hero SaaS */}
        <div style={{ flex: 1, padding: '4rem 3rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'linear-gradient(135deg, #1c2541 0%, #0b132b 100%)', borderRight: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ maxWidth: '520px', margin: '0 auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(91, 192, 190, 0.15)', color: '#5bc0be', padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '1.5rem', border: '1px solid rgba(91, 192, 190, 0.3)' }}>
              <Sparkles size={16} /> Shogun Authority Enterprise Platform
            </div>

            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 1rem 0', lineHeight: 1.2 }}>
              Gestión Inteligente de Prensa & Indexación SEO
            </h1>

            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '2rem' }}>
              Accede a nuestra red privada de portales de alta autoridad con métricas verificadas, compra directa de backlinks y seguimiento en tiempo real.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#e2e8f0', fontSize: '0.9375rem' }}>
                <CheckCircle2 size={20} style={{ color: '#34d399' }} /> Catalogación Ahrefs & Moz en tiempo real (DR 40+ a 90+)
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#e2e8f0', fontSize: '0.9375rem' }}>
                <CheckCircle2 size={20} style={{ color: '#34d399' }} /> Aprobación instantánea de recargas y saldo transparente
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#e2e8f0', fontSize: '0.9375rem' }}>
                <CheckCircle2 size={20} style={{ color: '#34d399' }} /> Monitoreo y trazabilidad de URLs indexables
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha - Formulario */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div className="container" style={{ width: '100%', maxWidth: '420px', padding: '2.5rem', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '8px' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ background: 'rgba(91, 192, 190, 0.15)', width: '56px', height: '56px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#5bc0be', border: '1px solid rgba(91, 192, 190, 0.3)' }}>
                <Shield size={30} />
              </div>
              <h2 style={{ margin: '0 0 0.5rem 0', color: '#f8fafc', fontSize: '1.5rem' }}>Iniciar Sesión</h2>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>Ingresa tus credenciales para acceder al panel</p>
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>Correo Electrónico</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="admin@admin.com"
                  required 
                />
              </div>
              <div className="form-group">
                <label style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>Contraseña</label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="••••••••"
                  required 
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem', justifyContent: 'center', padding: '0.75rem' }}>
                <Lock size={16} /> Acceder a Shogun <ArrowRight size={16} />
              </button>
            </form>
            
            <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              ¿No tienes cuenta? <Link to="/register" style={{ color: '#5bc0be', textDecoration: 'none', fontWeight: 600 }}>Regístrate gratis</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
