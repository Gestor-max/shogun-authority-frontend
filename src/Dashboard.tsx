import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useLanguage } from './i18n/LanguageContext';
import { 
  Database, 
  TrendingUp, 
  Award, 
  ArrowRight, 
  Shield, 
  CreditCard, 
  ShoppingBag, 
  Users, 
  CheckCircle2, 
  Layers,
  Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from './config';

const Dashboard: React.FC = () => {
  const { user, token } = useAuth();
  const { t } = useLanguage();
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

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        {t.common.loading}
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
            {t.dashboard.title}
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
            {t.dashboard.description}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/marketplace" className="btn btn-primary">
            <Database size={16} /> {t.nav.marketplace}
          </Link>
          <Link to="/orders" className="btn btn-secondary">
            <ShoppingBag size={16} /> {isAdmin ? t.nav.ordersManagement : t.nav.myOrders}
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <span>{t.dashboard.totalInventory}</span>
            <Database size={16} />
          </div>
          <div className="stat-card-body">
            <div>
              <div className="stat-card-value">{stats.totalPortals.toLocaleString()}</div>
              <div className="stat-card-sub">{t.dashboard.catalogedSites}</div>
            </div>
            <span className="badge badge-info">100% {t.common.active}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span>{t.dashboard.verifiedPortals}</span>
            <CheckCircle2 size={16} />
          </div>
          <div className="stat-card-body">
            <div>
              <div className="stat-card-value">{stats.activePortals.toLocaleString()}</div>
              <div className="stat-card-sub">{t.dashboard.confirmedMetrics}</div>
            </div>
            <span className="badge badge-success">{t.dashboard.verifiedBadge}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span>{t.dashboard.avgDr}</span>
            <Award size={16} />
          </div>
          <div className="stat-card-body">
            <div>
              <div className="stat-card-value" style={{ color: '#059669' }}>DR {stats.avgDr}</div>
              <div className="stat-card-sub">{t.dashboard.globalDr}</div>
            </div>
            <span className="badge badge-success">{t.dashboard.highAuthorityBadge}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span>{isAdmin ? t.dashboard.systemStatus : t.dashboard.availableBalance}</span>
            {isAdmin ? <Activity size={16} /> : <CreditCard size={16} />}
          </div>
          <div className="stat-card-body">
            <div>
              <div className="stat-card-value" style={{ color: '#2563eb' }}>
                {isAdmin ? 'Online' : `$${balance.currentBalance.toFixed(2)}`}
              </div>
              <div className="stat-card-sub">
                {isAdmin ? 'Supabase + Railway' : `${t.dashboard.pendingBalance}: $${balance.pendingBalance.toFixed(2)}`}
              </div>
            </div>
            <span className="badge badge-info">{isAdmin ? 'Live' : t.common.active}</span>
          </div>
        </div>
      </div>

      {/* Main Operational Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        
        {/* Card 1: Accesos Rápidos */}
        <div className="card">
          <div className="card-header">
            <h3><Layers size={18} /> {t.dashboard.quickActions}</h3>
            <span className="card-header-badge">{t.dashboard.operationalBadge}</span>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link 
                to="/marketplace" 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  padding: '0.85rem 1rem', 
                  borderRadius: 'var(--radius-sm)', 
                  border: '1px solid var(--border-color)', 
                  textDecoration: 'none', 
                  color: 'var(--text-primary)',
                  backgroundColor: '#f8fafc',
                  transition: 'background-color 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Database size={18} style={{ color: 'var(--primary)' }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{t.dashboard.marketplaceLinkTitle}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.dashboard.exploreMarketplaceSub}</div>
                  </div>
                </div>
                <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} />
              </Link>

              <Link 
                to="/orders" 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  padding: '0.85rem 1rem', 
                  borderRadius: 'var(--radius-sm)', 
                  border: '1px solid var(--border-color)', 
                  textDecoration: 'none', 
                  color: 'var(--text-primary)',
                  backgroundColor: '#f8fafc',
                  transition: 'background-color 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <ShoppingBag size={18} style={{ color: '#059669' }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{isAdmin ? t.dashboard.ordersLinkTitleAdmin : t.dashboard.ordersLinkTitleUser}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.dashboard.allOrdersSub}</div>
                  </div>
                </div>
                <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} />
              </Link>

              {isAdmin ? (
                <Link 
                  to="/users" 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: '0.85rem 1rem', 
                    borderRadius: 'var(--radius-sm)', 
                    border: '1px solid var(--border-color)', 
                    textDecoration: 'none', 
                    color: 'var(--text-primary)',
                    backgroundColor: '#f8fafc',
                    transition: 'background-color 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Users size={18} style={{ color: '#d97706' }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{t.dashboard.usersLinkTitle}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.dashboard.manageUsersSub}</div>
                    </div>
                  </div>
                  <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} />
                </Link>
              ) : (
                <Link 
                  to="/balance" 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: '0.85rem 1rem', 
                    borderRadius: 'var(--radius-sm)', 
                    border: '1px solid var(--border-color)', 
                    textDecoration: 'none', 
                    color: 'var(--text-primary)',
                    backgroundColor: '#f8fafc',
                    transition: 'background-color 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <CreditCard size={18} style={{ color: 'var(--primary)' }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{t.dashboard.balanceLinkTitle}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.dashboard.manageBalanceSub}</div>
                    </div>
                  </div>
                  <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Card 2: Nichos y Especialidades */}
        <div className="card">
          <div className="card-header">
            <h3><TrendingUp size={18} /> {t.dashboard.availableNichesTitle}</h3>
            <span className="card-header-badge">{t.dashboard.activeFiltersBadge}</span>
          </div>
          <div className="card-body">
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.5 }}>
              {t.dashboard.availableNichesDesc}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span className="badge badge-info" style={{ padding: '0.35rem 0.65rem' }}>Technology & SaaS</span>
              <span className="badge badge-info" style={{ padding: '0.35rem 0.65rem' }}>Crypto & Web3</span>
              <span className="badge badge-info" style={{ padding: '0.35rem 0.65rem' }}>Finance & Business</span>
              <span className="badge badge-info" style={{ padding: '0.35rem 0.65rem' }}>News & Media</span>
              <span className="badge badge-info" style={{ padding: '0.35rem 0.65rem' }}>Health & Wellness</span>
              <span className="badge badge-info" style={{ padding: '0.35rem 0.65rem' }}>Sports & Outdoor</span>
              <span className="badge badge-info" style={{ padding: '0.35rem 0.65rem' }}>Gaming & Esports</span>
              <span className="badge badge-info" style={{ padding: '0.35rem 0.65rem' }}>Lifestyle & Fashion</span>
              <span className="badge badge-warning" style={{ padding: '0.35rem 0.65rem' }}>{t.marketplace.acceptsGambling}</span>
              <span className="badge badge-warning" style={{ padding: '0.35rem 0.65rem' }}>{t.marketplace.acceptsCbd}</span>
              <span className="badge badge-warning" style={{ padding: '0.35rem 0.65rem' }}>{t.marketplace.acceptsLoans}</span>
            </div>
            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              {t.dashboard.englishCoverageNote}
            </div>
          </div>
        </div>

      </div>

      {/* Card 3: Resumen del Flujo de Publicación */}
      <div className="card">
        <div className="card-header">
          <h3><Shield size={18} /> {t.dashboard.workflowTitle}</h3>
          <span className="card-header-badge">{t.dashboard.operationalGuideBadge}</span>
        </div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', marginBottom: '0.25rem' }}>{t.dashboard.stepBadge} 1</div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>{t.dashboard.step1Title}</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{t.dashboard.step1Desc}</div>
            </div>

            <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', marginBottom: '0.25rem' }}>{t.dashboard.stepBadge} 2</div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>{t.dashboard.step2Title}</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{t.dashboard.step2Desc}</div>
            </div>

            <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', marginBottom: '0.25rem' }}>{t.dashboard.stepBadge} 3</div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>{t.dashboard.step3Title}</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{t.dashboard.step3Desc}</div>
            </div>

            <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', marginBottom: '0.25rem' }}>{t.dashboard.stepBadge} 4</div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>{t.dashboard.step4Title}</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{t.dashboard.step4Desc}</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
