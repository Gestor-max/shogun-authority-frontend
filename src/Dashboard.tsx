import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Database, Globe, TrendingUp, Award, Zap, ArrowRight, Shield, CheckCircle, CreditCard, Sparkles, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from './config';

const Dashboard: React.FC = () => {
  const { user, token } = useAuth();
  const [stats, setStats] = useState<{ totalPortals: number; activePortals: number; avgDr: number; avgDa: number }>({
    totalPortals: 0,
    activePortals: 0,
    avgDr: 0,
    avgDa: 0,
  });
  const [balance, setBalance] = useState<{ currentBalance: number; pendingBalance: number }>({ currentBalance: 0, pendingBalance: 0 });
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.rol_id === 1;

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, balRes] = await Promise.all([
        fetch(`${API_BASE_URL}/authorities/stats`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/balance/my-balance`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (statsRes.ok) {
        const sData = await statsRes.json();
        setStats({
          totalPortals: sData.totalPortals || 0,
          activePortals: sData.activePortals || 0,
          avgDr: sData.avgDr || 0,
          avgDa: sData.avgDa || 45,
        });
      }
      if (balRes.ok) {
        const bData = await balRes.json();
        setBalance({ currentBalance: bData.currentBalance || 0, pendingBalance: bData.pendingBalance || 0 });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchDashboardData();
  }, [token]);

  const totalPortals = stats.totalPortals;
  const activePortals = stats.activePortals;
  const avgDr = stats.avgDr;
  const avgDa = stats.avgDa;

  if (loading) return <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Cargando Shogun Authority Suite...</div>;

  return (
    <div style={{ width: '100%', maxWidth: '1200px' }}>
      {/* Hero SaaS Header */}
      <div 
        style={{
          background: 'linear-gradient(135deg, #1c2541 0%, #0b132b 100%)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '2.5rem 2rem',
          marginBottom: '2rem',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)'
        }}
      >
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '750px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(91, 192, 190, 0.15)', color: '#5bc0be', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '1rem', border: '1px solid rgba(91, 192, 190, 0.3)' }}>
            <Sparkles size={14} /> Shogun Authority Marketplace & Indexing
          </div>
          
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 0.75rem 0', textAlign: 'left', lineHeight: 1.2 }}>
            Potencia tu Posicionamiento SEO con Portales de Alta Autoridad
          </h1>

          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', margin: '0 0 1.75rem 0', lineHeight: 1.6, textAlign: 'left' }}>
            Acceso exclusivo a catálogo verificado de medios digitales, backlinks de alto DR y monitoreo inteligente de publicaciones indexables.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/marketplace" className="btn-success" style={{ textDecoration: 'none', width: 'auto', padding: '0.75rem 1.5rem', fontSize: '0.9375rem' }}>
              <Database size={18} /> Explorar Portales Authority <ArrowRight size={16} />
            </Link>

            {!isAdmin && (
              <Link to="/balance" className="btn-secondary" style={{ textDecoration: 'none', width: 'auto', padding: '0.75rem 1.5rem', fontSize: '0.9375rem' }}>
                <CreditCard size={18} /> Mi Saldo (${balance.currentBalance.toFixed(2)})
              </Link>
            )}
          </div>
        </div>

        <Shield size={280} style={{ position: 'absolute', right: '-40px', bottom: '-40px', color: 'rgba(91, 192, 190, 0.04)', pointerEvents: 'none' }} />
      </div>

      {/* Metrics Dashboard */}
      <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
        Métricas Globales de la Red
      </h3>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="dashboard-card-icon" style={{ background: 'rgba(37, 99, 235, 0.15)', color: '#60a5fa' }}>
            <Database size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Portales Disponibles</span>
            <h3 style={{ margin: 0, fontSize: '1.75rem', color: 'var(--text)' }}>{totalPortals}</h3>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
            <Award size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>DR Promedio (Domain Rating)</span>
            <h3 style={{ margin: 0, fontSize: '1.75rem', color: '#34d399' }}>DR {avgDr}</h3>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
            <Zap size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>DA Promedio (Domain Authority)</span>
            <h3 style={{ margin: 0, fontSize: '1.75rem', color: '#fbbf24' }}>DA {avgDa}</h3>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-icon" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Portales Verificados</span>
            <h3 style={{ margin: 0, fontSize: '1.75rem', color: 'var(--text)' }}>{activePortals}</h3>
          </div>
        </div>
      </div>

      {/* SaaS Feature Cards */}
      <h3 style={{ fontSize: '1.1rem', marginTop: '2.5rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
        Funcionalidades Destacadas
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '6px', padding: '1.5rem' }}>
          <div style={{ color: '#5bc0be', marginBottom: '1rem' }}><Globe size={28} /></div>
          <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--text)' }}>Marketplace de Prensa & Guest Posts</h4>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Accede a medios de alto impacto en Estados Unidos y Reino Unido, filtrando por tráfico orgánico, métricas Ahrefs/Moz y nichos permitidos.
          </p>
        </div>

        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '6px', padding: '1.5rem' }}>
          <div style={{ color: '#34d399', marginBottom: '1rem' }}><CheckCircle size={28} /></div>
          <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--text)' }}>Gestión de Saldo & Pedidos Rápidos</h4>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Sistema de recarga de fondos transparente. Realiza compras directas con un solo clic y sigue el progreso de tus publicaciones.
          </p>
        </div>

        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '6px', padding: '1.5rem' }}>
          <div style={{ color: '#60a5fa', marginBottom: '1rem' }}><Star size={28} /></div>
          <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--text)' }}>Monitoreo de URLs & Indexación</h4>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Administra y monitorea el estado de tus enlaces publicados para asegurar la correcta indexación en motores de búsqueda.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
