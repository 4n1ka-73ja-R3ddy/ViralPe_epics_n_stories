import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getLedger,
  getProfile,
  getReversalWallet,
  getWalletBalance,
  LedgerEntryResponse,
  UserProfileResponse
} from '../lib/api';
import { clearSession, getSession } from '../lib/session';

export default function DashboardPage() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [reversalBalance, setReversalBalance] = useState(0);
  const [ledger, setLedger] = useState<LedgerEntryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const session = getSession();

    if (!session) {
      navigate('/', { replace: true });
      return;
    }

    const fetchDashboard = async () => {
      setLoading(true);
      setError('');

      try {
        const [
          profileData,
          walletData,
          reversalData,
          ledgerData
        ] = await Promise.all([
          getProfile(session.userId),
          getWalletBalance(session.userId),
          getReversalWallet(session.userId),
          getLedger(session.userId)
        ]);

        setProfile(profileData);
        setWalletBalance(walletData.balance ?? 0);
        setReversalBalance(reversalData.balance ?? 0);
        setLedger(ledgerData ?? []);
      } catch (dashboardError) {
        setError(
          dashboardError instanceof Error
            ? dashboardError.message
            : 'Failed to load dashboard data.'
        );
      } finally {
        setLoading(false);
      }
    };

    void fetchDashboard();
  }, [navigate]);

  const ledgerPreview = useMemo(
    () => ledger.slice(0, 5),
    [ledger]
  );

  const firstName =
    profile?.fullName?.trim().split(' ')[0] || 'there';

  const handleLogout = () => {
    clearSession();
    navigate('/');
  };

  return (
    <div className="fintech-dashboard-page">
      <header className="fintech-topbar">
        <a className="brand" href="/dashboard" aria-label="ViralPe dashboard">
          <span className="brand-mark">V</span>

          <span className="brand-copy">
            <strong>ViralPe</strong>
            <small>Wallet Network</small>
          </span>
        </a>

        <div className="fintech-user-actions">
          <div className="fintech-user-copy">
            <strong>{profile?.fullName || 'Your Account'}</strong>
            <span>{profile?.email || 'Loading profile...'}</span>
          </div>

          <button
            type="button"
            className="fintech-signout-button"
            onClick={handleLogout}
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="fintech-dashboard-main">
        <section className="dashboard-welcome">
          <div>
            <p className="login-eyebrow">Your ViralPe dashboard</p>
            <h1>Welcome back, {firstName}.</h1>
            <p>
              Manage your wallet, rewards and recent activity from one place.
            </p>
          </div>

          <div className="dashboard-pincode-pill">
            <span>Registered pincode</span>
            <strong>{profile?.registeredPincode || 'Not set'}</strong>
          </div>
        </section>

        {loading ? (
          <div className="dashboard-loading-card">
            <span className="login-spinner" />
            Loading your wallet data...
          </div>
        ) : null}

        {error ? (
          <p className="dashboard-error-message">
            {error}
          </p>
        ) : null}

        <section className="dashboard-balance-grid">
          <article className="dashboard-primary-wallet">
            <div className="wallet-card-top">
              <div>
                <span className="wallet-label">Spendable balance</span>
                <strong>₹{walletBalance.toFixed(2)}</strong>
              </div>

              <span className="wallet-symbol">₹</span>
            </div>

            <p>
              Use this balance for utility payments and eligible purchases.
            </p>

            <div className="wallet-card-footer">
              <span>Available now</span>
              <span>ViralPe Wallet</span>
            </div>
          </article>

          <article className="dashboard-mini-card">
            <div className="dashboard-mini-icon reversal-icon">↺</div>

            <div>
              <span>Reversal Wallet</span>
              <strong>₹{reversalBalance.toFixed(2)}</strong>
              <p>Same-day reusable failed-payment balance.</p>
            </div>
          </article>

          <article className="dashboard-mini-card">
            <div className="dashboard-mini-icon location-icon-small">⌖</div>

            <div>
              <span>Pincode Rewards</span>
              <strong>{profile?.registeredPincode || 'Not set'}</strong>
              <p>Your regional championship location.</p>
            </div>
          </article>
        </section>

        <section className="dashboard-content-grid">
          <article className="dashboard-panel">
            <div className="dashboard-panel-heading">
              <div>
                <span className="panel-kicker">Start here</span>
                <h2>Quick actions</h2>
              </div>
            </div>

            <div className="quick-action-grid">
              <button type="button" className="quick-action-card">
                <span className="quick-action-icon">▣</span>
                <strong>Pay Bills</strong>
                <p>Electricity, water and broadband.</p>
              </button>

              <button type="button" className="quick-action-card">
                <span className="quick-action-icon">⌁</span>
                <strong>Mobile Recharge</strong>
                <p>Recharge prepaid mobile numbers.</p>
              </button>

              <button type="button" className="quick-action-card">
                <span className="quick-action-icon">↗</span>
                <strong>Cashback</strong>
                <p>Track your reward earnings.</p>
              </button>

              <button type="button" className="quick-action-card">
                <span className="quick-action-icon">◎</span>
                <strong>Referrals</strong>
                <p>Invite users and earn rewards.</p>
              </button>
            </div>
          </article>

          <article className="dashboard-panel dashboard-reward-panel">
            <div className="dashboard-panel-heading">
              <div>
                <span className="panel-kicker">Regional rewards</span>
                <h2>Pincode Championship</h2>
              </div>

              <span className="reward-phase-pill">Daily</span>
            </div>

            <div className="reward-pool-card">
              <span>Current reward pool</span>
              <strong>₹0.00</strong>
              <p>
                Contributions from your pincode will appear here.
              </p>
            </div>

            <div className="reward-details">
              <div>
                <span>Your pincode</span>
                <strong>{profile?.registeredPincode || '-'}</strong>
              </div>

              <div>
                <span>Current rank</span>
                <strong>Not ranked</strong>
              </div>
            </div>
          </article>
        </section>

        <section className="dashboard-panel dashboard-activity-panel">
          <div className="dashboard-panel-heading">
            <div>
              <span className="panel-kicker">Wallet history</span>
              <h2>Recent activity</h2>
            </div>

            <button type="button" className="panel-link-button">
              View all
            </button>
          </div>

          {ledgerPreview.length === 0 ? (
            <div className="dashboard-empty-state">
              <span className="empty-state-icon">↕</span>
              <strong>No wallet activity yet</strong>
              <p>
                Your credits, debits and reward entries will appear here.
              </p>
            </div>
          ) : (
            <div className="dashboard-activity-list">
              {ledgerPreview.map((entry) => {
                const isCredit = entry.amount >= 0;

                return (
                  <div className="dashboard-activity-row" key={entry.id}>
                    <div className={`activity-direction ${isCredit ? 'activity-credit' : 'activity-debit'}`}>
                      {isCredit ? '+' : '−'}
                    </div>

                    <div className="activity-main">
                      <strong>{entry.category}</strong>
                      <span>{entry.sourceReference || 'Wallet activity'}</span>
                    </div>

                    <div className="activity-meta">
                      <strong className={isCredit ? 'amount-credit' : 'amount-debit'}>
                        {isCredit ? '+' : '−'}₹{Math.abs(entry.amount).toFixed(2)}
                      </strong>
                      <span>{new Date(entry.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}