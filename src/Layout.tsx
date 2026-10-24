import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useLanguage } from './i18n/LanguageContext';
import LanguageSelector from './LanguageSelector';
import { 
  Home, 
  Shield, 
  User, 
  LogOut, 
  Database, 
  Users, 
  CreditCard, 
  Clock, 
  Menu, 
  X,
  ListOrdered,
  FolderPlus,
  ShoppingBag
} from 'lucide-react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdmin = user?.rol_id === 1;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

  return (
    <div className="layout">
      {/* Mobile Sticky Header */}
      <header className="mobile-header">
        <div className="mobile-brand">
          <div className="brand-icon">
            <Shield size={20} />
          </div>
          <span className="brand-text">Shogun<strong>Authority</strong></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <LanguageSelector variant="sidebar" />
          <button 
            className="mobile-hamburger" 
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? t.nav.closeMenu : t.nav.openMenu}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* Backdrop Overlay on Mobile */}
      {mobileOpen && (
        <div 
          className="sidebar-backdrop" 
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}

      {/* Dark Sidebar */}
      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="brand-icon">
              <Shield size={22} />
            </div>
            <div className="brand-meta">
              <span className="brand-title">Shogun<strong>Authority</strong></span>
              <span className="brand-sub">Platform Suite</span>
            </div>
          </div>
          <button 
            className="sidebar-close-btn" 
            onClick={closeMobileMenu}
            aria-label={t.nav.closeMenu}
          >
            <X size={18} />
          </button>
        </div>

        <div className="sidebar-section-label">{t.nav.mainNavigation}</div>
        <nav className="sidebar-nav">
          <NavLink to="/dashboard" onClick={closeMobileMenu} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <Home size={18} /> <span>{t.nav.dashboard}</span>
          </NavLink>

          <NavLink to="/marketplace" onClick={closeMobileMenu} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <Database size={18} /> <span>{t.nav.marketplace}</span>
          </NavLink>

          <NavLink to="/orders" onClick={closeMobileMenu} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <ShoppingBag size={18} /> <span>{isAdmin ? t.nav.ordersManagement : t.nav.myOrders}</span>
          </NavLink>

          {!isAdmin && (
            <NavLink to="/balance" onClick={closeMobileMenu} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <CreditCard size={18} /> <span>{t.nav.myBalance}</span>
            </NavLink>
          )}

          {isAdmin && (
            <>
              <div className="sidebar-section-label" style={{ marginTop: '1rem' }}>{t.nav.administration}</div>
              <NavLink to="/categories" onClick={closeMobileMenu} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <FolderPlus size={18} /> <span>{t.nav.categories}</span>
              </NavLink>
              <NavLink to="/users" onClick={closeMobileMenu} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <Users size={18} /> <span>{t.nav.users}</span>
              </NavLink>
              <NavLink to="/transactions" onClick={closeMobileMenu} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <ListOrdered size={18} /> <span>{t.nav.transactions}</span>
              </NavLink>
              <NavLink to="/balance-requests" onClick={closeMobileMenu} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <Clock size={18} /> <span>{t.nav.balanceRequests}</span>
              </NavLink>
            </>
          )}

          <div className="sidebar-section-label" style={{ marginTop: '1rem' }}>{t.nav.account}</div>
          <NavLink to="/profile" onClick={closeMobileMenu} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <User size={18} /> <span>{t.nav.profile}</span>
          </NavLink>
        </nav>

        {/* Sidebar Footer: Language selector + User Profile Badge + Logout */}
        <div className="sidebar-footer">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--sidebar-text)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Language
            </span>
            <LanguageSelector variant="sidebar" />
          </div>

          <div className="user-profile-badge">
            <div className="user-avatar">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="user-details">
              <span className="user-name">{user?.name || t.nav.user}</span>
              <span className="user-role">{isAdmin ? t.nav.admin : t.nav.authorizedManager}</span>
            </div>
          </div>
          <button className="sidebar-logout-btn" onClick={handleLogout} title={t.nav.logout}>
            <LogOut size={16} /> <span>{t.nav.logout}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area (Light / Clean Gray Canvas) */}
      <main className="main-content">
        <div className="main-content-inner">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
