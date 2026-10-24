import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useLanguage } from './i18n/LanguageContext';
import { CreditCard, ArrowUpRight, ArrowDownLeft, Clock, PlusCircle, X, History, DollarSign } from 'lucide-react';
import { API_BASE_URL } from './config';

interface Transaction {
  id: number;
  created_at: string;
  type: number;
  amount: number;
  comment?: string;
  status: number;
}

const BalanceView: React.FC = () => {
  const { token } = useAuth();
  const { t } = useLanguage();
  const [balanceData, setBalanceData] = useState<{ currentBalance: number; pendingBalance: number; transactions: Transaction[] }>({
    currentBalance: 0,
    pendingBalance: 0,
    transactions: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [rechargeComment, setRechargeComment] = useState('');

  const fetchBalance = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/balance/my-balance`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(t.common.error);
      const data = await res.json();
      setBalanceData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchBalance();
  }, [token]);

  const handleRequestRecharge = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      const res = await fetch(`${API_BASE_URL}/balance/recharge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: parseFloat(rechargeAmount),
          comment: rechargeComment,
        }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || t.common.error);
      }
      setSuccess(t.balance.topUpSuccess);
      setShowRechargeModal(false);
      setRechargeAmount('');
      setRechargeComment('');
      fetchBalance();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '1100px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {t.balance.title}
          </h2>
          <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
            {t.balance.subtitle}
          </p>
        </div>
        <button 
          onClick={() => setShowRechargeModal(true)}
          className="btn-primary"
          style={{ width: 'auto', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <PlusCircle size={18} /> {t.balance.requestTopUp}
        </button>
      </div>

      {error && <div className="error-message" style={{ marginBottom: '1rem' }}>{error}</div>}
      {success && <div className="success-message" style={{ marginBottom: '1rem' }}>{success}</div>}

      {/* KPI Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <span>{t.balance.currentBalance}</span>
            <DollarSign size={16} />
          </div>
          <div className="stat-card-body">
            <div>
              <div className="stat-card-value" style={{ color: '#059669' }}>
                ${balanceData.currentBalance.toFixed(2)}
              </div>
              <div className="stat-card-sub">{t.balance.fundsReady}</div>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span>{t.balance.pendingReview}</span>
            <Clock size={16} />
          </div>
          <div className="stat-card-body">
            <div>
              <div className="stat-card-value" style={{ color: '#d97706' }}>
                ${balanceData.pendingBalance.toFixed(2)}
              </div>
              <div className="stat-card-sub">{t.balance.pendingReviewSub}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Card with Dark Navy Header */}
      <div className="card">
        <div className="card-header">
          <h3>
            <History size={18} /> {t.balance.transactionHistory}
          </h3>
          <span className="card-header-badge">{balanceData.transactions?.length || 0} {t.balance.movementsCount}</span>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
              {t.common.loading}
            </div>
          ) : (
            <div className="table-responsive" style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}>
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>{t.common.date}</th>
                    <th>{t.common.filter}</th>
                    <th>{t.common.amount}</th>
                    <th>{t.balance.notesLabel}</th>
                    <th style={{ textAlign: 'right' }}>{t.common.status}</th>
                  </tr>
                </thead>
                <tbody>
                  {balanceData.transactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-secondary)' }}>
                        {t.balance.noTransactions}
                      </td>
                    </tr>
                  ) : (
                    balanceData.transactions.map((tr) => (
                      <tr key={tr.id}>
                        <td><strong>#{tr.id}</strong></td>
                        <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                          {new Date(tr.created_at).toLocaleDateString()} {new Date(tr.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: tr.type === 1 ? '#059669' : '#dc2626', fontWeight: 600 }}>
                            {tr.type === 1 ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
                            {tr.type === 1 ? t.balance.deposit : t.balance.withdrawal}
                          </span>
                        </td>
                        <td>
                          <strong style={{ color: tr.type === 1 ? '#059669' : '#dc2626' }}>
                            {tr.type === 1 ? '+' : '-'}${Math.abs(tr.amount || 0).toFixed(2)}
                          </strong>
                        </td>
                        <td style={{ color: 'var(--text-secondary)' }}>{tr.comment || '-'}</td>
                        <td style={{ textAlign: 'right' }}>
                          <span className={`badge ${tr.status === 1 ? 'badge-success' : tr.status === 0 ? 'badge-warning' : 'badge-danger'}`}>
                            {tr.status === 1 ? t.common.approved : tr.status === 0 ? t.common.pending : t.common.rejected}
                          </span>
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

      {/* Modal Solicitar Recarga */}
      {showRechargeModal && (
        <div className="modal-overlay" onClick={() => setShowRechargeModal(false)}>
          <div className="modal-content" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3><CreditCard size={18} /> {t.balance.requestTopUp}</h3>
              <button onClick={() => setShowRechargeModal(false)} className="modal-close-btn" title={t.common.close}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ padding: '1.25rem' }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 0, marginBottom: '1.25rem' }}>
                {t.balance.modalDesc}
              </p>

              <form onSubmit={handleRequestRecharge}>
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label>{t.balance.amountToRequest}</label>
                  <input 
                    type="number" 
                    step="0.01"
                    min="1"
                    value={rechargeAmount}
                    onChange={(e) => setRechargeAmount(e.target.value)}
                    required
                    placeholder="100.00"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label>{t.balance.notesLabel}</label>
                  <input 
                    type="text"
                    value={rechargeComment}
                    onChange={(e) => setRechargeComment(e.target.value)}
                    placeholder={t.balance.notesPlaceholder}
                  />
                </div>

                <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button type="button" className="btn-secondary" style={{ width: 'auto' }} onClick={() => setShowRechargeModal(false)}>
                    {t.common.cancel}
                  </button>
                  <button type="submit" className="btn-primary" style={{ width: 'auto' }}>
                    {t.balance.submitRequest}
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

export default BalanceView;
