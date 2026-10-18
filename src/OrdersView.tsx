import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { ShoppingBag, CheckCircle, Clock, XCircle, ExternalLink, Calendar, User } from 'lucide-react';
import { API_BASE_URL } from './config';

interface OrderItem {
  id: number;
  name?: string;
  comments?: string;
  price?: string;
  status: number; // 0: Pending, 1: Completed, 2: Cancelled
  created_at: string;
  user_id?: number;
  authority?: {
    id: number;
    portal: string;
    title?: string;
  };
  user?: {
    id: number;
    name?: string;
    email: string;
  };
}

const OrdersView: React.FC = () => {
  const { token, user } = useAuth();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isAdmin = user?.rol_id === 1;

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const endpoint = isAdmin ? `${API_BASE_URL}/orders/all` : `${API_BASE_URL}/orders/my-orders`;
      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error al cargar la lista de pedidos');
      const data = await res.json();
      setOrders(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchOrders();
  }, [token]);

  const handleUpdateStatus = async (id: number, status: number) => {
    setError(''); setSuccess('');
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('Error al actualizar estado del pedido');
      setSuccess('Estado de la orden actualizado exitosamente');
      fetchOrders();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '1200px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, color: '#5bc0be' }}>
            <ShoppingBag size={26} /> {isAdmin ? 'Gestión Global de Pedidos & Compras' : 'Mis Pedidos & Compras'}
          </h2>
          <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
            {isAdmin 
              ? 'Panel de administración para procesar y actualizar publicaciones solicitadas por clientes.' 
              : 'Historial de publicaciones y portales authority adquiridos con tu saldo.'}
          </p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Cargando historial de compras...</p>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '8px' }}>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>No hay compras o publicaciones registradas.</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID Pedido</th>
                <th>Portal / Publicación</th>
                {isAdmin && <th>Cliente</th>}
                <th>Costo ($)</th>
                <th>Fecha de Compra</th>
                <th>Estado</th>
                {isAdmin && <th>Acción Admin</th>}
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id}>
                  <td><strong>#{o.id}</strong></td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text)' }}>{o.name || 'Publicación en Portal'}</div>
                    {o.authority && (
                      <a 
                        href={o.authority.portal} 
                        target="_blank" 
                        rel="noreferrer" 
                        style={{ color: '#5bc0be', fontSize: '0.75rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                      >
                        {o.authority.portal} <ExternalLink size={12} />
                      </a>
                    )}
                    {o.comments && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        <em>"{o.comments}"</em>
                      </div>
                    )}
                  </td>

                  {isAdmin && (
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.85rem' }}>
                        <User size={14} style={{ color: 'var(--text-muted)' }} />
                        <span>{o.user?.name || o.user?.email || `User #${o.user_id}`}</span>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{o.user?.email}</span>
                    </td>
                  )}

                  <td>
                    <strong style={{ color: '#34d399' }}>
                      ${parseFloat(o.price || '0').toFixed(2)}
                    </strong>
                  </td>

                  <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <Calendar size={13} />
                      {new Date(o.created_at).toLocaleDateString()} {new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>

                  <td>
                    {o.status === 1 ? (
                      <span className="badge badge-success">
                        <CheckCircle size={12} /> Completada
                      </span>
                    ) : o.status === 0 ? (
                      <span className="badge badge-warning">
                        <Clock size={12} /> Procesando
                      </span>
                    ) : (
                      <span className="badge badge-danger">
                        <XCircle size={12} /> Cancelada
                      </span>
                    )}
                  </td>

                  {isAdmin && (
                    <td>
                      <div style={{ display: 'flex', gap: '0.375rem' }}>
                        {o.status !== 1 && (
                          <button 
                            className="btn-success"
                            style={{ width: 'auto', padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                            onClick={() => handleUpdateStatus(o.id, 1)}
                          >
                            Aprobar
                          </button>
                        )}
                        {o.status !== 2 && (
                          <button 
                            className="btn-danger"
                            style={{ width: 'auto', padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                            onClick={() => handleUpdateStatus(o.id, 2)}
                          >
                            Cancelar
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrdersView;
