import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useLanguage } from './i18n/LanguageContext';
import { Clock, CheckCircle, XCircle, User } from 'lucide-react';
import { API_BASE_URL } from './config';

interface RechargeRequest {
  id: number;
  amount: number;
  comment?: string;
  created_at: string;
  user?: {
    name?: string;
    email: string;
  };
}

const BalanceRequests: React.FC = () => {
  const { token } = useAuth();
  const { t } = useLanguage();
  const [requests, setRequests] = useState<RechargeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/balance/pending`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(t.common.error);
      const data = await res.json();
      setRequests(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchPendingRequests();
  }, [token]);

  const handleApprove = async (id: number) => {
    setError(''); setSuccess('');
    try {
      const res = await fetch(`${API_BASE_URL}/balance/${id}/approve`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(t.common.error);
      setSuccess(t.admin.requestApprovedSuccess);
      fetchPendingRequests();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleReject = async (id: number) => {
    setError(''); setSuccess('');
    try {
      const res = await fetch(`${API_BASE_URL}/balance/${id}/reject`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(t.common.error);
      setSuccess(t.admin.requestRejectedSuccess);
      fetchPendingRequests();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '1100px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          {t.admin.balanceRequestsTitle}
        </h2>
        <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
          {t.admin.balanceRequestsSubtitle}
        </p>
      </div>

      {error && <div className="error-message" style={{ marginBottom: '1rem' }}>{error}</div>}
      {success && <div className="success-message" style={{ marginBottom: '1rem' }}>{success}</div>}

      <div className="card">
        <div className="card-header">
          <h3>
            <Clock size={18} /> {t.admin.queueCardTitle}
          </h3>
          <span className="card-header-badge">{requests.length} {t.admin.pendingCountBadge}</span>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
              {t.admin.loadingRequests}
            </div>
          ) : requests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
              {t.admin.noPendingRequests}
            </div>
          ) : (
            <div className="table-responsive" style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}>
              <table>
                <thead>
                  <tr>
                    <th>{t.admin.colId}</th>
                    <th>{t.orders.client}</th>
                    <th>{t.admin.colAmountRequested}</th>
                    <th>{t.admin.colCommentRef}</th>
                    <th>{t.admin.colDateRequested}</th>
                    <th style={{ textAlign: 'right' }}>{t.admin.colActions}</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map(r => (
                    <tr key={r.id}>
                      <td><strong>#{r.id}</strong></td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <User size={16} style={{ color: 'var(--text-secondary)' }} />
                          <div>
                            <strong>{r.user?.name || '-'}</strong>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{r.user?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <strong style={{ color: '#059669', fontSize: '0.95rem' }}>
                          +${(r.amount || 0).toFixed(2)}
                        </strong>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{r.comment || '-'}</td>
                      <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                        {new Date(r.created_at).toLocaleDateString()} {new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button 
                            className="btn-success"
                            style={{ width: 'auto', padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                            onClick={() => handleApprove(r.id)}
                          >
                            <CheckCircle size={14} /> {t.admin.approveBtn}
                          </button>
                          <button 
                            className="btn-danger"
                            style={{ width: 'auto', padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                            onClick={() => handleReject(r.id)}
                          >
                            <XCircle size={14} /> {t.admin.rejectBtn}
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
    </div>
  );
};

export default BalanceRequests;
