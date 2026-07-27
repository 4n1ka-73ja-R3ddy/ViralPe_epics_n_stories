import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavigationHeader from '../components/NavigationHeader';
import {
  CashbackHistoryResponse,
  getCashbackHistory,
  getCashbackHistoryByDate
} from '../lib/api';
import { getSession } from '../lib/session';

export default function CashbackPage() {
  const navigate = useNavigate();

  const [history, setHistory] = useState<CashbackHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filtering, setFiltering] = useState(false);

  const loadHistory = async () => {
    const session = getSession();

    if (!session) {
      navigate('/', { replace: true });
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = startDate && endDate
        ? await getCashbackHistoryByDate(
            session.userId,
            startDate,
            endDate
          )
        : await getCashbackHistory(session.userId);

      setHistory(response);
    } catch (historyError) {
      setError(
        historyError instanceof Error
          ? historyError.message
          : 'Unable to load cashback history.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadHistory();
  }, [navigate]);

  const applyFilter = async () => {
    if (!startDate || !endDate) {
      setError('Please choose both a start and end date.');
      return;
    }

    setFiltering(true);
    setError('');

    try {
      await loadHistory();
    } finally {
      setFiltering(false);
    }
  };

  // Compute summary stats
  const totalNet = history?.totalCashback ?? 0;
  const totalGross = history?.cashbackHistory.reduce((acc, item) => acc + (item.grossCashback ?? 0), 0) ?? 0;
  const totalPincodePool = history?.cashbackHistory.reduce((acc, item) => acc + (item.pincodeDeduction ?? 0), 0) ?? 0;

  return (
    <div style={{ minHeight: '100vh', background: '#f4f8f7', color: '#0d2b26' }}>
      <NavigationHeader />

      <main style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1.5rem' }}>
        {/* Header Title */}
        <div style={{ marginBottom: '2rem' }}>
          <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#00685b', fontWeight: 700 }}>
            REWARD LEDGER
          </span>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, margin: '0.25rem 0', color: '#0d2b26' }}>
            Cashback Earnings & Pincode Carveout
          </h1>
          <p style={{ color: '#5b706c', fontSize: '0.95rem' }}>
            Track raw transaction cashbacks, transparent pincode pool deductions, and liquid wallet credits.
          </p>
        </div>

        {/* Summary Stat Cards */}
        {history && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 20px var(--shadow-color)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', textTransform: 'uppercase', fontWeight: 700 }}>Total Net Liquid Cashback</span>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-primary)', margin: '0.3rem 0' }}>₹{totalNet.toFixed(2)}</h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Credited instantly to your liquid spendable Wallet Balance</span>
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 20px var(--shadow-color)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', textTransform: 'uppercase', fontWeight: 700 }}>Gross Raw Cashback</span>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-primary)', margin: '0.3rem 0' }}>₹{totalGross.toFixed(2)}</h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Computed from profit margin per vertical rules</span>
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 20px var(--shadow-color)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', textTransform: 'uppercase', fontWeight: 700 }}>Pincode Pool Contributed</span>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-primary)', margin: '0.3rem 0' }}>₹{totalPincodePool.toFixed(2)}</h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Rerouted to your pincode's championship prize pool</span>
            </div>
          </div>
        )}

        {/* Filter Toolbar */}
        <section style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', boxShadow: '0 4px 20px var(--shadow-color)' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.3rem', fontWeight: 600 }}>Start Date</label>
            <input
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ padding: '0.45rem 0.8rem', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.85rem' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.3rem', fontWeight: 600 }}>End Date</label>
            <input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ padding: '0.45rem 0.8rem', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.85rem' }}
            />
          </div>

          <button
            onClick={applyFilter}
            disabled={filtering}
            style={{ padding: '0.55rem 1.25rem', background: 'var(--accent-gradient)', color: '#030c09', border: 'none', borderRadius: '8px', fontWeight: 800, cursor: 'pointer', marginTop: 'auto' }}
          >
            {filtering ? 'Applying...' : 'Apply Date Filter'}
          </button>
        </section>

        {loading && <p style={{ color: 'var(--text-secondary)' }}>Loading cashback earnings ledger...</p>}
        {error && <p style={{ color: '#fca5a5' }}>{error}</p>}

        {/* Earnings History List */}
        {!loading && history?.cashbackHistory.length ? (
          <section style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 20px var(--shadow-color)' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '1.25rem', fontWeight: 800 }}>Detailed Cashback Ledger</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {history.cashbackHistory.map((entry) => (
                <div
                  key={entry.cashbackLedgerId}
                  style={{
                    background: 'var(--bg-card-subtle)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                      <span style={{ padding: '0.2rem 0.6rem', borderRadius: '6px', background: 'var(--badge-credit-bg)', color: 'var(--badge-credit-text)', fontWeight: 700, fontSize: '0.8rem' }}>
                        {entry.transactionType || 'CHECKOUT'}
                      </span>
                      <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>
                        Source Transaction #{entry.sourceTransactionId || '-'}
                      </strong>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {entry.createdAt ? new Date(entry.createdAt).toLocaleString() : '-'}
                    </span>
                  </div>

                  {/* Breakdown Badges */}
                  <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', textAlign: 'right' }}>
                    <div>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Gross Cashback</span>
                      <strong style={{ color: 'var(--accent-primary)', fontSize: '0.95rem' }}>₹{entry.grossCashback.toFixed(2)}</strong>
                    </div>
                    <div>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Pincode Pool Deducted</span>
                      <strong style={{ color: '#fca5a5', fontSize: '0.95rem' }}>-₹{entry.pincodeDeduction.toFixed(2)}</strong>
                    </div>
                    <div>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--badge-credit-text)', fontWeight: 700 }}>Net Liquid Credited</span>
                      <strong style={{ color: 'var(--accent-primary)', fontSize: '1.2rem', fontWeight: 800 }}>+₹{entry.netCashback.toFixed(2)}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {!loading && history?.cashbackHistory.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', color: 'var(--text-secondary)', boxShadow: '0 4px 20px var(--shadow-color)' }}>
            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }}>💸</span>
            <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>No cashback entries recorded yet</strong>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Complete transactions to earn instant net cashbacks and contribute to your pincode pool.</p>
          </div>
        ) : null}
      </main>
    </div>
  );
}
