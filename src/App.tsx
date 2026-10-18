import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';
import Authorities from './Authorities';
import Profile from './Profile';
import UsersManagement from './UsersManagement';
import BalanceView from './BalanceView';
import BalanceRequests from './BalanceRequests';
import AllTransactionsView from './AllTransactionsView';
import OrdersView from './OrdersView';
import CategoriesManagement from './CategoriesManagement';
import LandingPage from './LandingPage';
import Layout from './Layout';
import './index.css';
import { ThemeProvider } from './ThemeContext';

const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({ children, adminOnly }) => {
  const { token, user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!token) return <Navigate to="/login" />;
  if (adminOnly && user?.rol_id !== 1) return <Navigate to="/dashboard" />;
  
  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/marketplace" element={<ProtectedRoute><Authorities /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><OrdersView /></ProtectedRoute>} />
            <Route path="/balance" element={<ProtectedRoute><BalanceView /></ProtectedRoute>} />
            <Route path="/categories" element={<ProtectedRoute adminOnly><CategoriesManagement /></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute adminOnly><UsersManagement /></ProtectedRoute>} />
            <Route path="/transactions" element={<ProtectedRoute adminOnly><AllTransactionsView /></ProtectedRoute>} />
            <Route path="/balance-requests" element={<ProtectedRoute adminOnly><BalanceRequests /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
