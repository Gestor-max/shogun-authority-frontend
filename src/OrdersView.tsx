import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useLanguage } from './i18n/LanguageContext';
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
  const { t } = useLanguage();
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
      if (!res.ok) throw new Error(t.common.error);
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
      if (!res.ok) throw new Error(t.common.error);
      setSuccess(t.orders.orderUpdatedSuccess);
      fetchOrders();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '1200px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          {isAdmin ? t.orders.titleAdmin : t.orders.title}
        </h2>
        <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
          {isAdmin ? t.orders.subtitleAdmin : t.orders.subtitle}
        </p>
      </div>

      {error && <div className="error-message" style={{ marginBottom: '1rem' }}>{error}</div>}
      {success && <div className="success-message" style={{ marginBottom: '1rem' }}>{success}</div>}

      <div className="card">
        <div className="card-header">
          <h3>
            <ShoppingBag size={18} /> {isAdmin ? t.orders.cardHeaderAdmin : t.orders.cardHeaderClient}
          </h3>
          <span className="card-header-badge">{orders.length} {t.orders.ordersRegistered}</span>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
              {t.common.loading}
            </div>
          ) : orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ color: 'var(--text-secondary)', margin: 0 }}>{t.orders.noOrders}</p>
            </div>
          ) : (
            <div className="table-responsive" style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}>
              <table>
                <thead>
                  <tr>
                    <th>{t.orders.orderId}</th>
                    <th>{t.orders.publisher}</th>
                    {isAdmin && <th>{t.orders.client}</th>}
                    <th>{t.orders.price}</th>
                    <th>{t.orders.date}</th>
                    <th>{t.orders.status}</th>
                    {isAdmin && <th style={{ textAlign: 'right' }}>{t.common.actions}</th>}
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id}>
                      <td><strong>#{o.id}</strong></td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{o.name || t.orders.publisher}</div>
                        {o.authority && (
                          <a 
                            href={o.authority.portal} 
                            target="_blank" 
                            rel="noreferrer" 
                            style={{ color: 'var(--primary)', fontSize: '0.8rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                          >
                            {o.authority.portal} <ExternalLink size={12} />
                          </a>
                        )}
                        {o.comments && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                            <em>"{o.comments}"</em>
                          </div>
                        )}
                      </td>

                      {isAdmin && (
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.85rem' }}>
                            <User size={14} style={{ color: 'var(--text-secondary)' }} />
                            <span>{o.user?.name || o.user?.email || `User #${o.user_id}`}</span>
                          </div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{o.user?.email}</span>
                        </td>
                      )}

                      <td>
                        <strong style={{ color: '#059669' }}>
                          ${parseFloat(o.price || '0').toFixed(2)}
                        </strong>
                      </td>

                      <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                          <Calendar size={13} />
                          {new Date(o.created_at).toLocaleDateString()} {new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      <td>
                        {o.status === 1 ? (
                          <span className="badge badge-success">
                            <CheckCircle size={12} /> {t.orders.statusPublished}
                          </span>
                        ) : o.status === 0 ? (
                          <span className="badge badge-warning">
                            <Clock size={12} /> {t.orders.statusPending}
                          </span>
                        ) : (
                          <span className="badge badge-danger">
                            <XCircle size={12} /> {t.orders.statusCancelled}
                          </span>
                        )}
                      </td>

                      {isAdmin && (
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '0.375rem', justifyContent: 'flex-end' }}>
                            {o.status !== 1 && (
                              <button 
                                className="btn-success"
                                style={{ width: 'auto', padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                                onClick={() => handleUpdateStatus(o.id, 1)}
                              >
                                {t.admin.approve}
                              </button>
                            )}
                            {o.status !== 2 && (
                              <button 
                                className="btn-danger"
                                style={{ width: 'auto', padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                                onClick={() => handleUpdateStatus(o.id, 2)}
                              >
                                {t.common.cancel}
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
      </div>
    </div>
  );
};

export default OrdersView;
