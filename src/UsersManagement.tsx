import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useLanguage } from './i18n/LanguageContext';
import { Users, UserPlus, Key, CheckCircle, XCircle, Trash2, X } from 'lucide-react';
import { API_BASE_URL } from './config';

const UsersManagement: React.FC = () => {
  const { token } = useAuth();
  const { t } = useLanguage();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal Nuevo Usuario
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', rol_id: 2, status: 1 });

  // Modal Cambiar Password
  const [showPassModal, setShowPassModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(t.common.error);
      const data = await res.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchUsers();
  }, [token]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      const res = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newUser)
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || t.common.error);
      }
      setSuccess(t.admin.userCreatedSuccess);
      setShowCreateModal(false);
      setNewUser({ name: '', email: '', password: '', rol_id: 2, status: 1 });
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: number) => {
    setError(''); setSuccess('');
    const newStatus = currentStatus === 1 ? 0 : 1;
    try {
      const res = await fetch(`${API_BASE_URL}/users/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error(t.common.error);
      const statusText = newStatus === 1 ? t.admin.statusActive : t.admin.statusSuspended;
      setSuccess(t.admin.userStatusUpdated.replace('{0}', statusText));
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleChangeRole = async (id: number, rol_id: number) => {
    setError(''); setSuccess('');
    try {
      const res = await fetch(`${API_BASE_URL}/users/${id}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ rol_id })
      });
      if (!res.ok) throw new Error(t.common.error);
      setSuccess(t.admin.userRoleUpdated);
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;
    setError(''); setSuccess('');
    try {
      const res = await fetch(`${API_BASE_URL}/users/${selectedUserId}/password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ password: newPassword })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || t.common.error);
      }
      setSuccess(t.admin.passChangedSuccess);
      setShowPassModal(false);
      setNewPassword('');
      setSelectedUserId(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!window.confirm(t.admin.deleteUserConfirm)) return;
    setError(''); setSuccess('');
    try {
      const res = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(t.common.error);
      setSuccess(t.admin.userDeletedSuccess);
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '1200px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {t.admin.usersTitle}
          </h2>
          <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
            {t.admin.usersSubtitle}
          </p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)} 
          className="btn-primary"
          style={{ width: 'auto', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <UserPlus size={18} /> {t.admin.newUserBtn}
        </button>
      </div>

      {error && <div className="error-message" style={{ marginBottom: '1rem' }}>{error}</div>}
      {success && <div className="success-message" style={{ marginBottom: '1rem' }}>{success}</div>}

      <div className="card">
        <div className="card-header">
          <h3>
            <Users size={18} /> {t.admin.userDirectoryTitle}
          </h3>
          <span className="card-header-badge">{users.length} {t.admin.usersCountBadge}</span>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
              {t.admin.loadingUsers}
            </div>
          ) : (
            <div className="table-responsive" style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}>
              <table>
                <thead>
                  <tr>
                    <th>{t.admin.colId}</th>
                    <th>{t.admin.colUserNameEmail}</th>
                    <th>{t.admin.colUserRole}</th>
                    <th>{t.admin.colUserBalance}</th>
                    <th>{t.admin.colUserStatus}</th>
                    <th style={{ textAlign: 'right' }}>{t.admin.colActions}</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td><strong>#{u.id}</strong></td>
                      <td>
                        <strong style={{ color: 'var(--text-primary)' }}>{u.name || '-'}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{u.email}</div>
                      </td>
                      <td>
                        <select 
                          value={u.rol_id} 
                          onChange={(e) => handleChangeRole(u.id, Number(e.target.value))}
                          style={{ width: 'auto', padding: '0.35rem 0.65rem', fontSize: '0.8125rem' }}
                        >
                          <option value={1}>{t.admin.roleAdminOption}</option>
                          <option value={2}>{t.admin.roleUserOption}</option>
                        </select>
                      </td>
                      <td>
                        <strong style={{ color: (u.balance || 0) > 0 ? '#059669' : 'var(--text-secondary)' }}>
                          ${(u.balance || 0).toFixed(2)}
                        </strong>
                      </td>
                      <td>
                        <span className={`badge ${u.status === 1 ? 'badge-success' : 'badge-danger'}`}>
                          {u.status === 1 ? t.admin.statusActive : t.admin.statusSuspended}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                          <button 
                            className={u.status === 1 ? 'btn-secondary' : 'btn-success'}
                            style={{ width: 'auto', padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                            onClick={() => handleToggleStatus(u.id, u.status)}
                            title={u.status === 1 ? t.admin.suspendBtn : t.admin.activateBtn}
                          >
                            {u.status === 1 ? <XCircle size={13} /> : <CheckCircle size={13} />}
                            {u.status === 1 ? t.admin.suspendBtn : t.admin.activateBtn}
                          </button>

                          <button 
                            className="btn-secondary"
                            style={{ width: 'auto', padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                            onClick={() => { setSelectedUserId(u.id); setShowPassModal(true); }}
                            title={t.admin.passwordBtn}
                          >
                            <Key size={13} /> {t.admin.passwordBtn}
                          </button>

                          <button 
                            className="btn-danger"
                            style={{ width: 'auto', padding: '0.35rem 0.55rem', fontSize: '0.75rem' }}
                            onClick={() => handleDeleteUser(u.id)}
                            title={t.common.delete}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal Crear Usuario */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" style={{ maxWidth: '520px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3><UserPlus size={18} /> {t.admin.createUserTitle}</h3>
              <button onClick={() => setShowCreateModal(false)} className="modal-close-btn" title={t.common.close}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ padding: '1.25rem' }}>
              <form onSubmit={handleCreateUser}>
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label>{t.admin.userFullNameLabel}</label>
                  <input 
                    type="text" 
                    value={newUser.name} 
                    onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                    required
                    placeholder={t.admin.userFullNamePlaceholder}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label>{t.admin.userEmailLabel}</label>
                  <input 
                    type="email" 
                    value={newUser.email} 
                    onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                    required
                    placeholder={t.admin.userEmailPlaceholder}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label>{t.admin.userPassLabel}</label>
                  <input 
                    type="password" 
                    value={newUser.password} 
                    onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                    required
                    placeholder={t.admin.userPassPlaceholder}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label>{t.admin.userRoleLabel}</label>
                  <select 
                    value={newUser.rol_id} 
                    onChange={e => setNewUser({ ...newUser, rol_id: Number(e.target.value) })}
                  >
                    <option value={2}>{t.admin.roleUserOption}</option>
                    <option value={1}>{t.admin.roleAdminOption}</option>
                  </select>
                </div>
                <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button type="button" className="btn-secondary" style={{ width: 'auto' }} onClick={() => setShowCreateModal(false)}>
                    {t.common.cancel}
                  </button>
                  <button type="submit" className="btn-primary" style={{ width: 'auto' }}>
                    {t.admin.saveUserBtn}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cambiar Password */}
      {showPassModal && (
        <div className="modal-overlay" onClick={() => setShowPassModal(false)}>
          <div className="modal-content" style={{ maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3><Key size={18} /> {t.admin.changePassModalTitle.replace('{0}', String(selectedUserId))}</h3>
              <button onClick={() => setShowPassModal(false)} className="modal-close-btn" title={t.common.close}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ padding: '1.25rem' }}>
              <form onSubmit={handleChangePassword}>
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label>{t.admin.userPassLabel}</label>
                  <input 
                    type="password" 
                    value={newPassword} 
                    onChange={e => setNewPassword(e.target.value)}
                    required
                    placeholder={t.admin.userPassPlaceholder}
                  />
                </div>
                <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button type="button" className="btn-secondary" style={{ width: 'auto' }} onClick={() => setShowPassModal(false)}>
                    {t.common.cancel}
                  </button>
                  <button type="submit" className="btn-primary" style={{ width: 'auto' }}>
                    {t.admin.updatePassBtn}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagement;
