import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useTheme } from './ThemeContext';
import { 
  Home, 
  Shield, 
  User, 
  LogOut, 
  Sun, 
  Moon, 
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
  const { theme, toggleTheme } = useTheme();
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
      {/* Header móvil */}
      <div className="mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#c084fc', fontWeight: 'bold' }}>
          <Shield size={22} />
          <span>Shogun Authority</span>
        </div>
        <button className="mobile-menu-btn" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <Shield size={26} style={{ color: '#c084fc' }} />
            <span>Shogun<span style={{ color: '#c084fc' }}>Authority</span></span>
          </div>
          <button 
            className="mobile-menu-btn" 
            style={{ display: mobileOpen ? 'block' : 'none' }}
            onClick={() => setMobileOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/dashboard" onClick={closeMobileMenu} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <Home size={18} /> Dashboard
          </NavLink>

          <NavLink to="/marketplace" onClick={closeMobileMenu} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <Database size={18} /> Marketplace
          </NavLink>

          <NavLink to="/orders" onClick={closeMobileMenu} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <ShoppingBag size={18} /> {isAdmin ? 'Todos los Pedidos' : 'Mis Compras'}
          </NavLink>

          {!isAdmin && (
            <NavLink to="/balance" onClick={closeMobileMenu} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <CreditCard size={18} /> Mi Balance
            </NavLink>
          )}

          {isAdmin && (
            <>
              <NavLink to="/categories" onClick={closeMobileMenu} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <FolderPlus size={18} /> Categorías
              </NavLink>
              <NavLink to="/users" onClick={closeMobileMenu} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <Users size={18} /> Usuarios
              </NavLink>
              <NavLink to="/transactions" onClick={closeMobileMenu} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <ListOrdered size={18} /> Transacciones
              </NavLink>
              <NavLink to="/balance-requests" onClick={closeMobileMenu} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <Clock size={18} /> Solicitudes Recarga
              </NavLink>
            </>
          )}

          <NavLink to="/profile" onClick={closeMobileMenu} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <User size={18} /> Perfil
          </NavLink>

          <button className="sidebar-link" onClick={toggleTheme} style={{ marginTop: 'auto', border: 'none', background: 'transparent', cursor: 'pointer', width: '100%', textAlign: 'left' }}>
            {theme === 'dark' ? (
              <><Sun size={18} /> Modo Claro</>
            ) : (
              <><Moon size={18} /> Modo Oscuro</>
            )}
          </button>
        </nav>

        <button className="sidebar-link" onClick={handleLogout} style={{ marginTop: '0.5rem', border: 'none', background: 'transparent', cursor: 'pointer', width: '100%', textAlign: 'left', color: 'var(--error)' }}>
          <LogOut size={18} /> Cerrar Sesión
        </button>
      </aside>

      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;
