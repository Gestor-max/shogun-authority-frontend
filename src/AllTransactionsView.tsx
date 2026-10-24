import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useLanguage } from './i18n/LanguageContext';
import { ListOrdered, ArrowUpRight, ArrowDownLeft, User } from 'lucide-react';
import { API_BASE_URL } from './config';

interface GlobalTransaction {
  id: number;
  type: number;
  amount: number;
  comment?: string;
  status: number;
  created_at: string;
  user?: {
    name?: string;
    email: string;
  };
}

const AllTransactionsView: React.FC = () => {
  const { token } = useAuth();
  const { t } = useLanguage();
  const [transactions, setTransactions] = useState<GlobalTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAllTransactions = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/balance/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(t.common.error);
      const data = await res.json();
      setTransactions(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchAllTransactions();
  }, [token]);

  return (
    <div style={{ width: '100%', maxWidth: '1100px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          {t.admin.transactionsTitle}
        </h2>
        <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
          {t.admin.transactionsSubtitle}
        </p>
      </div>

      {error && <div className="error-message" style={{ marginBottom: '1rem' }}>{error}</div>}

      <div className="card">
        <div className="card-header">
          <h3>
            <ListOrdered size={18} /> {t.admin.transactionsLedgerTitle}
          </h3>
          <span className="card-header-badge">{transactions.length} {t.admin.recordsCountBadge}</span>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
              {t.admin.loadingTransactions}
            </div>
          ) : (
            <div className="table-responsive" style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}>
              <table>
                <thead>
                  <tr>
                    <th>{t.admin.colId}</th>
                    <th>{t.orders.client}</th>
                    <th>{t.admin.colTransType}</th>
                    <th>{t.admin.colTransAmount}</th>
                    <th>{t.admin.colTransComment}</th>
                    <th>{t.orders.status}</th>
                    <th>{t.orders.date}</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-secondary)' }}>
                        {t.admin.noTransactions}
                      </td>
                    </tr>
                  ) : (
                    transactions.map(item => (
                      <tr key={item.id}>
                        <td><strong>#{item.id}</strong></td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <User size={15} style={{ color: 'var(--text-secondary)' }} />
                            <div>
                              <strong style={{ color: 'var(--text-primary)' }}>{item.user?.name || '-'}</strong>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.user?.email}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: item.type === 1 ? '#059669' : '#dc2626', fontWeight: 600 }}>
                            {item.type === 1 ? <ArrowUpRight size={15} /> : <ArrowDownLeft size={15} />}
                            {item.type === 1 ? t.admin.typeTopUp : t.admin.typePurchase}
                          </span>
                        </td>
                        <td>
                          <strong style={{ color: item.type === 1 ? '#059669' : '#dc2626' }}>
                            {item.type === 1 ? '+' : '-'}${Math.abs(item.amount || 0).toFixed(2)}
                          </strong>
                        </td>
                        <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{item.comment || '-'}</td>
                        <td>
                          <span className={`badge ${item.status === 1 ? 'badge-success' : item.status === 0 ? 'badge-warning' : 'badge-danger'}`}>
                            {item.status === 1 ? t.common.completed : item.status === 0 ? t.common.pending : t.common.rejected}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                          {new Date(item.created_at).toLocaleDateString()} {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllTransactionsView;
