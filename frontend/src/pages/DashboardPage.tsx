import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getLedger,
  getProfile,
  getWalletSummary,
  LedgerEntryResponse,
  UserProfileResponse,
  WalletSummaryResponse
} from '../lib/api';
import { clearSession, getSession } from '../lib/session';

const EMPTY_SUMMARY: WalletSummaryResponse = {
  walletBalance: 0,
  reversalBalance: 0,
  cashback: 0,
  referral: 0,
  vendorRoyalty: 0,
  pincodeRoyalty: 0,
  totalEarnings: 0
};

export default function DashboardPage() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [walletSummary, setWalletSummary] =
    useState<WalletSummaryResponse>(EMPTY_SUMMARY);
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
        const [profileData, summaryData, ledgerData] =
          await Promise.all([
            getProfile(session.userId),
            getWalletSummary(session.userId),
            getLedger(session.userId)
          ]);

        setProfile(profileData);

        setWalletSummary({
          walletBalance: summaryData.walletBalance ?? 0,
          reversalBalance: summaryData.reversalBalance ?? 0,
          cashback: summaryData.cashback ?? 0,
          referral: summaryData.referral ?? 0,
          vendorRoyalty: summaryData.vendorRoyalty ?? 0,
          pincodeRoyalty: summaryData.pincodeRoyalty ?? 0,
          totalEarnings: summaryData.totalEarnings ?? 0
        });

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
        <a
          className="brand"
          href="/dashboard"
          aria-label="ViralPe dashboard"
        >
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
            <p className="login-eyebrow">
              Your ViralPe dashboard
            </p>

            <h1>Welcome back, {firstName}.</h1>

            <p>
              Manage your wallet, earnings and recent activity
              from one place.
            </p>
          </div>

          <div className="dashboard-pincode-pill">
            <span>Registered pincode</span>
            <strong>
              {profile?.registeredPincode || 'Not set'}
            </strong>
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
                <span className="wallet-label">
                  Spendable balance
                </span>

                <strong>
                  ₹{walletSummary.walletBalance.toFixed(2)}
                </strong>
              </div>

              <span className="wallet-symbol">₹</span>
            </div>

            <p>
              Use this balance for utility payments and eligible
              purchases.
            </p>

            <div className="wallet-card-footer">
              <span>Available now</span>
              <span>ViralPe Wallet</span>
            </div>
          </article>

          <article className="dashboard-mini-card">
            <div className="dashboard-mini-icon reversal-icon">
              ↺
            </div>

            <div>
              <span>Reversal Wallet</span>

              <strong>
                ₹{walletSummary.reversalBalance.toFixed(2)}
              </strong>

              <p>
                Same-day reusable failed-payment balance.
              </p>
            </div>
          </article>

          <article className="dashboard-mini-card">
            <div className="dashboard-mini-icon earnings-icon">
              ↗
            </div>

            <div>
              <span>Total Earnings</span>

              <strong>
                ₹{walletSummary.totalEarnings.toFixed(2)}
              </strong>

              <p>
                Combined total of all read-only earning ledgers.
              </p>
            </div>
          </article>
        </section>

        <section className="earnings-summary-section">
          <div className="dashboard-panel-heading">
            <div>
              <span className="panel-kicker">
                Lifetime earnings
              </span>

              <h2>Earnings overview</h2>
            </div>
          </div>

          <div className="earnings-summary-grid">
            <article className="earnings-summary-card">
              <span className="earnings-summary-icon">
                ₹
              </span>

              <div>
                <p>Cashback</p>
                <strong>
                  ₹{walletSummary.cashback.toFixed(2)}
                </strong>
                <span>Your transaction cashback earnings.</span>
              </div>
            </article>

            <article className="earnings-summary-card">
              <span className="earnings-summary-icon">
                ◎
              </span>

              <div>
                <p>Referral</p>
                <strong>
                  ₹{walletSummary.referral.toFixed(2)}
                </strong>
                <span>Earnings from referred users.</span>
              </div>
            </article>

            <article className="earnings-summary-card">
              <span className="earnings-summary-icon">
                ◇
              </span>

              <div>
                <p>Vendor Royalty</p>
                <strong>
                  ₹{walletSummary.vendorRoyalty.toFixed(2)}
                </strong>
                <span>Earnings from onboarded vendors.</span>
              </div>
            </article>

            <article className="earnings-summary-card">
              <span className="earnings-summary-icon">
                ⌖
              </span>

              <div>
                <p>Pincode Royalty</p>
                <strong>
                  ₹{walletSummary.pincodeRoyalty.toFixed(2)}
                </strong>
                <span>Championship and regional earnings.</span>
              </div>
            </article>
          </div>
        </section>

        <section className="dashboard-content-grid">
          <article className="dashboard-panel">
            <div className="dashboard-panel-heading">
              <div>
                <span className="panel-kicker">
                  Start here
                </span>

                <h2>Quick actions</h2>
              </div>
            </div>

            <div className="quick-action-grid">
              <button
                type="button"
                className="quick-action-card"
              >
                <span className="quick-action-icon">▣</span>
                <strong>Pay Bills</strong>
                <p>Electricity, water and broadband.</p>
              </button>

              <button
                type="button"
                className="quick-action-card"
              >
                <span className="quick-action-icon">⌁</span>
                <strong>Mobile Recharge</strong>
                <p>Recharge prepaid mobile numbers.</p>
              </button>

              <button
                type="button"
                className="quick-action-card"
              >
                <span className="quick-action-icon">↗</span>
                <strong>Cashback</strong>
                <p>Track your cashback earnings.</p>
              </button>

              <button
                type="button"
                className="quick-action-card"
              >
                <span className="quick-action-icon">◎</span>
                <strong>Referrals</strong>
                <p>Invite users and earn rewards.</p>
              </button>
            </div>
          </article>

          <article className="dashboard-panel dashboard-reward-panel">
            <div className="dashboard-panel-heading">
              <div>
                <span className="panel-kicker">
                  Regional rewards
                </span>

                <h2>Pincode Championship</h2>
              </div>

              <span className="reward-phase-pill">
                Daily
              </span>
            </div>

            <div className="reward-pool-card">
              <span>Pincode royalty earned</span>

              <strong>
                ₹{walletSummary.pincodeRoyalty.toFixed(2)}
              </strong>

              <p>
                Championship earnings for your registered
                pincode will appear here.
              </p>
            </div>

            <div className="reward-details">
              <div>
                <span>Your pincode</span>
                <strong>
                  {profile?.registeredPincode || '-'}
                </strong>
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
              <span className="panel-kicker">
                Wallet history
              </span>

              <h2>Recent activity</h2>
            </div>

            <button
              type="button"
              className="panel-link-button"
            >
              View all
            </button>
          </div>

          {ledgerPreview.length === 0 ? (
            <div className="dashboard-empty-state">
              <span className="empty-state-icon">↕</span>

              <strong>No wallet activity yet</strong>

              <p>
                Your credits, debits and reward entries will
                appear here.
              </p>
            </div>
          ) : (
            <div className="dashboard-activity-list">
              {ledgerPreview.map((entry) => {
                const isCredit = entry.amount >= 0;

                return (
                  <div
                    className="dashboard-activity-row"
                    key={entry.id}
                  >
                    <div
                      className={`activity-direction ${
                        isCredit
                          ? 'activity-credit'
                          : 'activity-debit'
                      }`}
                    >
                      {isCredit ? '+' : '−'}
                    </div>

                    <div className="activity-main">
                      <strong>{entry.category}</strong>

                      <span>
                        {entry.sourceReference ||
                          'Wallet activity'}
                      </span>
                    </div>

                    <div className="activity-meta">
                      <strong
                        className={
                          isCredit
                            ? 'amount-credit'
                            : 'amount-debit'
                        }
                      >
                        {isCredit ? '+' : '−'}₹
                        {Math.abs(entry.amount).toFixed(2)}
                      </strong>

                      <span>
                        {new Date(
                          entry.createdAt
                        ).toLocaleString()}
                      </span>
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