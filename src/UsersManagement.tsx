import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Users, UserPlus, Key, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { API_BASE_URL } from './config';

const UsersManagement: React.FC = () => {
  const { token } = useAuth();
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
      if (!res.ok) throw new Error('Error al cargar la lista de usuarios');
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
        throw new Error(errData.message || 'Error al crear usuario');
      }
      setSuccess('Usuario creado exitosamente');
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
      if (!res.ok) throw new Error('Error al actualizar estado');
      setSuccess(`Estado del usuario modificado a ${newStatus === 1 ? 'Activo' : 'Inactivo'}`);
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
      if (!res.ok) throw new Error('Error al actualizar rol');
      setSuccess('Rol de usuario actualizado');
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
      if (!res.ok) throw new Error('Error al cambiar contraseña');
      setSuccess('Contraseña cambiada exitosamente');
      setShowPassModal(false);
      setNewPassword('');
      setSelectedUserId(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!window.confirm('¿Seguro que deseas eliminar este usuario?')) return;
    setError(''); setSuccess('');
    try {
      const res = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error al eliminar usuario');
      setSuccess('Usuario eliminado');
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '1200px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, color: '#5bc0be' }}>
            <Users size={26} /> Gestión de Usuarios
          </h2>
          <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
            Administración de permisos, estado, contraseñas y saldos de usuarios.
          </p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)} 
          style={{ width: 'auto' }}
        >
          <UserPlus size={18} /> Crear Nuevo Usuario
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Cargando usuarios...</p>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre / Email</th>
                <th>Rol</th>
                <th>Saldo Actual</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>#{u.id}</td>
                  <td>
                    <strong>{u.name || 'Sin nombre'}</strong>
                    <br />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</span>
                  </td>
                  <td>
                    <select 
                      value={u.rol_id} 
                      onChange={(e) => handleChangeRole(u.id, Number(e.target.value))}
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.8125rem' }}
                    >
                      <option value={1}>1 - Administrador</option>
                      <option value={2}>2 - Usuario Normal</option>
                    </select>
                  </td>
                  <td>
                    <strong style={{ color: u.balance > 0 ? '#34d399' : 'var(--text)' }}>
                      ${(u.balance || 0).toFixed(2)}
                    </strong>
                  </td>
                  <td>
                    <span className={`badge ${u.status === 1 ? 'badge-success' : 'badge-danger'}`}>
                      {u.status === 1 ? 'Activo' : 'Denegado'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button 
                        className={`btn-secondary ${u.status === 1 ? 'btn-danger' : 'btn-success'}`}
                        style={{ width: 'auto', padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}
                        onClick={() => handleToggleStatus(u.id, u.status)}
                      >
                        {u.status === 1 ? <XCircle size={14} /> : <CheckCircle size={14} />}
                        {u.status === 1 ? 'Denegar' : 'Permitir'}
                      </button>

                      <button 
                        className="btn-secondary"
                        style={{ width: 'auto', padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}
                        onClick={() => { setSelectedUserId(u.id); setShowPassModal(true); }}
                      >
                        <Key size={14} /> Pass
                      </button>

                      <button 
                        className="btn-danger"
                        style={{ width: 'auto', padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}
                        onClick={() => handleDeleteUser(u.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Crear Usuario */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Crear Nuevo Usuario</h3>
            <form onSubmit={handleCreateUser} style={{ marginTop: '1rem' }}>
              <div className="form-group">
                <label>Nombre Completo</label>
                <input 
                  type="text" 
                  value={newUser.name} 
                  onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Correo Electrónico</label>
                <input 
                  type="email" 
                  value={newUser.email} 
                  onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Contraseña</label>
                <input 
                  type="password" 
                  value={newUser.password} 
                  onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Rol de Usuario</label>
                <select 
                  value={newUser.rol_id} 
                  onChange={e => setNewUser({ ...newUser, rol_id: Number(e.target.value) })}
                >
                  <option value={2}>Rol 2 - Usuario Normal</option>
                  <option value={1}>Rol 1 - Administrador</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Cancelar
                </button>
                <button type="submit">Guardar Usuario</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Cambiar Password */}
      {showPassModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Cambiar Contraseña de Usuario #{selectedUserId}</h3>
            <form onSubmit={handleChangePassword} style={{ marginTop: '1rem' }}>
              <div className="form-group">
                <label>Nueva Contraseña</label>
                <input 
                  type="password" 
                  value={newPassword} 
                  onChange={e => setNewPassword(e.target.value)}
                  required
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowPassModal(false)}>
                  Cancelar
                </button>
                <button type="submit">Actualizar Contraseña</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagement;
