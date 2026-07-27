import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavigationHeader from '../components/NavigationHeader';
import {
  getReferralHistory,
  getReferralHistoryByDate,
  ReferralEarningsHistoryResponse
} from '../lib/api';
import { getSession } from '../lib/session';

export default function ReferralPage() {
  const navigate = useNavigate();

  const [history, setHistory] = useState<ReferralEarningsHistoryResponse | null>(null);
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
        ? await getReferralHistoryByDate(
            session.userId,
            startDate,
            endDate
          )
        : await getReferralHistory(session.userId);

      setHistory(response);
    } catch (historyError) {
      setError(
        historyError instanceof Error
          ? historyError.message
          : 'Unable to load referral history.'
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

  const totalReferral = useMemo(
    () => history?.totalReferralEarnings ?? 0,
    [history]
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f4f8f7', color: '#0d2b26' }}>
      <NavigationHeader />

      <main style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1.5rem' }}>
        {/* Header Title */}
        <div style={{ marginBottom: '2rem' }}>
          <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#00685b', fontWeight: 700 }}>
            REFERRAL ENGINE
          </span>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, margin: '0.25rem 0', color: '#0d2b26' }}>
            Referral Earnings & Bonus History
          </h1>
          <p style={{ color: '#5b706c', fontSize: '0.95rem' }}>
            Track bonuses earned from downstream referee transactions across all verticals.
          </p>
        </div>

        {/* Summary Stat Card */}
        {history && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem', boxShadow: '0 4px 20px var(--shadow-color)', maxWidth: '400px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', textTransform: 'uppercase', fontWeight: 700 }}>Total Referral Earnings</span>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent-primary)', margin: '0.3rem 0' }}>₹{totalReferral.toFixed(2)}</h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total credited from referred user transactions</span>
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
            {filtering ? 'Applying...' : 'Apply Filter'}
          </button>
        </section>

        {loading && <p style={{ color: 'var(--text-secondary)' }}>Loading referral history...</p>}
        {error && <p style={{ color: '#fca5a5' }}>{error}</p>}

        {/* History List */}
        {!loading && history?.earnings.length ? (
          <section style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 20px var(--shadow-color)' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '1.25rem', fontWeight: 800 }}>Detailed Referral Earnings</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {history.earnings.map((entry) => (
                <div
                  key={entry.referralBonusId}
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--bg-highlight)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                      ◎
                    </div>
                    <div>
                      <strong style={{ fontSize: '1rem', color: 'var(--text-primary)', display: 'block' }}>Referral Bonus</strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Referee #{entry.refereeUserId} · Tx #{entry.sourceTransactionId} · {new Date(entry.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <strong style={{ color: 'var(--accent-primary)', fontSize: '1.2rem', fontWeight: 800, display: 'block' }}>
                      +₹{entry.referralBonus.toFixed(2)}
                    </strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {entry.referralPercentage}% margin bonus
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {!loading && history?.earnings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', color: 'var(--text-secondary)', boxShadow: '0 4px 20px var(--shadow-color)' }}>
            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }}>👥</span>
            <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>No referral earnings yet</strong>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Refer friends using your referral code to start earning bonuses automatically.</p>
          </div>
        ) : null}
      </main>
    </div>
  );
}
