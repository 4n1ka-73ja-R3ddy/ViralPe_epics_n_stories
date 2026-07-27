import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavigationHeader from '../components/NavigationHeader';
import {
  getLedger,
  getPincodeChampionshipTicker,
  getPincodePoolSummary,
  getProfile,
  getWalletSummary,
  loadDemoData,
  LedgerEntryResponse,
  PincodeChampionshipTickerResponse,
  PincodePoolResponse,
  UserProfileResponse,
  WalletSummaryResponse
} from '../lib/api';
import { getSession } from '../lib/session';

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
  const [pincodePool, setPincodePool] =
    useState<PincodePoolResponse | null>(null);
  const [ticker, setTicker] =
    useState<PincodeChampionshipTickerResponse | null>(null);
  const [ledger, setLedger] = useState<LedgerEntryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [seedingDemo, setSeedingDemo] = useState(false);

  const fetchDashboard = async () => {
    const session = getSession();
    if (!session) return;
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

      if (profileData.registeredPincode) {
        try {
          const [poolData, tickerData] = await Promise.all([
            getPincodePoolSummary(profileData.registeredPincode),
            getPincodeChampionshipTicker(profileData.registeredPincode)
          ]);

          setPincodePool(poolData);
          setTicker(tickerData);
        } catch {
          setPincodePool(null);
          setTicker(null);
        }
      } else {
        setPincodePool(null);
        setTicker(null);
      }
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

  useEffect(() => {
    const session = getSession();

    if (!session) {
      navigate('/', { replace: true });
      return;
    }

    void fetchDashboard();
  }, [navigate]);

  const handleSeedDemoData = async () => {
    const session = getSession();
    if (!session) return;
    try {
      setSeedingDemo(true);
      await loadDemoData(session.userId);
      await fetchDashboard();
    } catch (err: any) {
      alert(`Failed to load demo data: ${err.message}`);
    } finally {
      setSeedingDemo(false);
    }
  };

  const ledgerPreview = useMemo(
    () => ledger.slice(0, 5),
    [ledger]
  );

  const firstName =
    profile?.fullName?.trim().split(' ')[0] || 'there';

  return (
    <div style={{ minHeight: '100vh', background: '#f4f8f7', color: '#0d2b26' }}>
      <NavigationHeader />

      <main style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1.5rem' }}>
        {/* Welcome Banner */}
        <section style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#00685b', fontWeight: 700 }}>
              YOUR VIRALPE DASHBOARD
            </span>
            <h1 style={{ fontSize: '2.4rem', fontWeight: 800, margin: '0.2rem 0', color: '#0d2b26' }}>
              Welcome back, {firstName}.
            </h1>
            <p style={{ color: '#5b706c', fontSize: '0.95rem' }}>
              Manage your wallet balance, explore service modules, and track lifetime earnings.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={handleSeedDemoData}
              disabled={seedingDemo}
              style={{
                padding: '0.75rem 1.25rem',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #00685b, #047857)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(0, 104, 91, 0.15)',
                transition: 'all 0.15s'
              }}
            >
              {seedingDemo ? 'Loading Multi-Date Demo Data...' : '⚡ Seed Demo Presentation Data'}
            </button>

            <div style={{ background: '#ffffff', border: '1px solid #e2ece9', borderRadius: '14px', padding: '0.75rem 1.25rem', boxShadow: '0 4px 20px rgba(0, 104, 91, 0.04)', textAlign: 'right' }}>
              <span style={{ fontSize: '0.75rem', color: '#5b706c', display: 'block' }}>Registered Pincode</span>
              <strong style={{ fontSize: '1.15rem', color: '#00685b', fontWeight: 800 }}>
                {profile?.registeredPincode || 'Not set'}
              </strong>
            </div>
          </div>
        </section>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2ece9', color: '#5b706c', marginBottom: '2rem' }}>
            Loading your dashboard metrics...
          </div>
        ) : null}

        {error ? (
          <p style={{ color: '#dc2626', marginBottom: '1.5rem', fontWeight: 600 }}>
            {error}
          </p>
        ) : null}

        {/* Primary Balances Section */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
          {/* Main Wallet Card */}
          <div style={{ background: 'linear-gradient(135deg, #00685b, #047857)', borderRadius: '20px', padding: '1.75rem', color: '#ffffff', boxShadow: '0 8px 30px rgba(0, 104, 91, 0.15)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', opacity: 0.85, fontWeight: 700 }}>Spendable Balance</span>
                <span style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>₹</span>
              </div>
              <h2 style={{ fontSize: '2.8rem', fontWeight: 800, margin: '0.2rem 0', letterSpacing: '-0.02em' }}>
                ₹{walletSummary.walletBalance.toFixed(2)}
              </h2>
              <p style={{ fontSize: '0.85rem', opacity: 0.9, marginTop: '0.5rem' }}>
                Use balance for utility bill payments, recharges & checkout.
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255, 255, 255, 0.2)', paddingTop: '1rem', marginTop: '1rem', fontSize: '0.8rem', opacity: 0.9 }}>
              <span>Available Now</span>
              <span>ViralPe Wallet</span>
            </div>
          </div>

          {/* Reversal Wallet Card */}
          <div style={{ background: '#ffffff', border: '1px solid #e2ece9', borderRadius: '20px', padding: '1.75rem', boxShadow: '0 4px 20px rgba(0, 104, 91, 0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.2rem', marginBottom: '1rem' }}>
                ↺
              </div>
              <span style={{ fontSize: '0.85rem', color: '#5b706c', fontWeight: 600, display: 'block' }}>Reversal Wallet</span>
              <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#0d2b26', margin: '0.2rem 0' }}>
                ₹{walletSummary.reversalBalance.toFixed(2)}
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#5b706c', marginTop: '0.4rem' }}>
                Same-day reusable failed-payment balance priority pool.
              </p>
            </div>
          </div>

          {/* Total Earnings Card */}
          <div style={{ background: '#ffffff', border: '1px solid #e2ece9', borderRadius: '20px', padding: '1.75rem', boxShadow: '0 4px 20px rgba(0, 104, 91, 0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#e6f4f1', color: '#00685b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.2rem', marginBottom: '1rem' }}>
                ↗
              </div>
              <span style={{ fontSize: '0.85rem', color: '#5b706c', fontWeight: 600, display: 'block' }}>Total Earnings</span>
              <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#00685b', margin: '0.2rem 0' }}>
                ₹{walletSummary.totalEarnings.toFixed(2)}
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#5b706c', marginTop: '0.4rem' }}>
                Combined total of all read-only reward ledgers.
              </p>
            </div>
          </div>
        </section>

        {/* Section 1: Services & Feature Portals (Interactive Gateway Cards) */}
        <section style={{ marginBottom: '2.5rem' }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#00685b', fontWeight: 700 }}>
              PLATFORM MODULES
            </span>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0d2b26', margin: '0.2rem 0' }}>
              Services & Features Portal
            </h2>
            <p style={{ color: '#5b706c', fontSize: '0.9rem' }}>
              Select a module to initiate transactions, check rewards, view histories, or manage system parameters.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            {/* Card 1: Checkout */}
            <div
              onClick={() => navigate('/checkout')}
              style={{
                background: '#ffffff',
                border: '1px solid #e2ece9',
                borderRadius: '16px',
                padding: '1.5rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 4px 20px rgba(0, 104, 91, 0.04)'
              }}
            >
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#e6f4f1', color: '#00685b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.2rem', marginBottom: '1rem' }}>
                ▣
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0d2b26', margin: '0 0 0.3rem 0' }}>
                Checkout & Payments
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#5b706c', margin: '0 0 1rem 0' }}>
                Preview invoice breakdown, test multi-wallet balance deduction, & checkout.
              </p>
              <span style={{ color: '#00685b', fontSize: '0.85rem', fontWeight: 700 }}>
                Launch Checkout →
              </span>
            </div>

            {/* Card 2: Cashback */}
            <div
              onClick={() => navigate('/cashback')}
              style={{
                background: '#ffffff',
                border: '1px solid #e2ece9',
                borderRadius: '16px',
                padding: '1.5rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 4px 20px rgba(0, 104, 91, 0.04)'
              }}
            >
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.2rem', marginBottom: '1rem' }}>
                ↗
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0d2b26', margin: '0 0 0.3rem 0' }}>
                Cashback Ledger
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#5b706c', margin: '0 0 1rem 0' }}>
                Track liquid cashback credits and transparent pincode pool deductions.
              </p>
              <span style={{ color: '#15803d', fontSize: '0.85rem', fontWeight: 700 }}>
                View Cashback Ledger →
              </span>
            </div>

            {/* Card 3: Referrals */}
            <div
              onClick={() => navigate('/referral')}
              style={{
                background: '#ffffff',
                border: '1px solid #e2ece9',
                borderRadius: '16px',
                padding: '1.5rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 4px 20px rgba(0, 104, 91, 0.04)'
              }}
            >
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#e6f4f1', color: '#00685b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.2rem', marginBottom: '1rem' }}>
                ◎
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0d2b26', margin: '0 0 0.3rem 0' }}>
                Referrals & Bonuses
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#5b706c', margin: '0 0 1rem 0' }}>
                Invite users and track bonuses earned from referee transactions.
              </p>
              <span style={{ color: '#00685b', fontSize: '0.85rem', fontWeight: 700 }}>
                View Referral History →
              </span>
            </div>

            {/* Card 4: Championship */}
            <div
              onClick={() => navigate('/championship')}
              style={{
                background: '#ffffff',
                border: '1px solid #e2ece9',
                borderRadius: '16px',
                padding: '1.5rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 4px 20px rgba(0, 104, 91, 0.04)'
              }}
            >
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#e6f4f1', color: '#00685b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.2rem', marginBottom: '1rem' }}>
                ⌖
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0d2b26', margin: '0 0 0.3rem 0' }}>
                Pincode Championship
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#5b706c', margin: '0 0 1rem 0' }}>
                View live regional pool ticker, evaluation countdown & winner leaderboards.
              </p>
              <span style={{ color: '#00685b', fontSize: '0.85rem', fontWeight: 700 }}>
                Open Live Championship →
              </span>
            </div>

            {/* Card 5: History & Logs */}
            <div
              onClick={() => navigate('/transactions')}
              style={{
                background: '#ffffff',
                border: '1px solid #e2ece9',
                borderRadius: '16px',
                padding: '1.5rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 4px 20px rgba(0, 104, 91, 0.04)'
              }}
            >
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#e6f4f1', color: '#00685b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.2rem', marginBottom: '1rem' }}>
                🧾
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0d2b26', margin: '0 0 0.3rem 0' }}>
                History & Activity Logs
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#5b706c', margin: '0 0 1rem 0' }}>
                Inspect transaction payment breakdowns & running wallet balance audit log.
              </p>
              <span style={{ color: '#00685b', fontSize: '0.85rem', fontWeight: 700 }}>
                Inspect History Logs →
              </span>
            </div>
          </div>
        </section>

        {/* Section 2: Interactive Earnings Overview */}
        <section style={{ marginBottom: '2.5rem' }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#00685b', fontWeight: 700 }}>
              EARNINGS BREAKDOWN
            </span>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0d2b26', margin: '0.2rem 0' }}>
              Lifetime Earnings Ledgers
            </h2>
            <p style={{ color: '#5b706c', fontSize: '0.9rem' }}>
              Click any ledger card below to view its dedicated reporting history page.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            <div
              onClick={() => navigate('/cashback')}
              style={{ background: '#ffffff', border: '1px solid #e2ece9', borderRadius: '16px', padding: '1.5rem', cursor: 'pointer', boxShadow: '0 4px 20px rgba(0, 104, 91, 0.04)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: '#5b706c', fontWeight: 600 }}>Cashback Earnings</span>
                <span style={{ color: '#059669', fontSize: '1.1rem', fontWeight: 800 }}>₹</span>
              </div>
              <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#0d2b26', margin: '0.4rem 0' }}>
                ₹{walletSummary.cashback.toFixed(2)}
              </h3>
              <span style={{ fontSize: '0.8rem', color: '#00685b', fontWeight: 700 }}>View Cashback Details →</span>
            </div>

            <div
              onClick={() => navigate('/referral')}
              style={{ background: '#ffffff', border: '1px solid #e2ece9', borderRadius: '16px', padding: '1.5rem', cursor: 'pointer', boxShadow: '0 4px 20px rgba(0, 104, 91, 0.04)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: '#5b706c', fontWeight: 600 }}>Referral Earnings</span>
                <span style={{ color: '#00685b', fontSize: '1.1rem', fontWeight: 800 }}>◎</span>
              </div>
              <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#0d2b26', margin: '0.4rem 0' }}>
                ₹{walletSummary.referral.toFixed(2)}
              </h3>
              <span style={{ fontSize: '0.8rem', color: '#00685b', fontWeight: 700 }}>View Referral Details →</span>
            </div>

            <div
              onClick={() => navigate('/championship')}
              style={{ background: '#ffffff', border: '1px solid #e2ece9', borderRadius: '16px', padding: '1.5rem', cursor: 'pointer', boxShadow: '0 4px 20px rgba(0, 104, 91, 0.04)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: '#5b706c', fontWeight: 600 }}>Vendor Royalty</span>
                <span style={{ color: '#00685b', fontSize: '1.1rem', fontWeight: 800 }}>◇</span>
              </div>
              <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#0d2b26', margin: '0.4rem 0' }}>
                ₹{walletSummary.vendorRoyalty.toFixed(2)}
              </h3>
              <span style={{ fontSize: '0.8rem', color: '#00685b', fontWeight: 700 }}>View Royalty Rules →</span>
            </div>

            <div
              onClick={() => navigate('/championship')}
              style={{ background: '#ffffff', border: '1px solid #e2ece9', borderRadius: '16px', padding: '1.5rem', cursor: 'pointer', boxShadow: '0 4px 20px rgba(0, 104, 91, 0.04)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: '#5b706c', fontWeight: 600 }}>Pincode Royalty</span>
                <span style={{ color: '#00685b', fontSize: '1.1rem', fontWeight: 800 }}>⌖</span>
              </div>
              <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#0d2b26', margin: '0.4rem 0' }}>
                ₹{walletSummary.pincodeRoyalty.toFixed(2)}
              </h3>
              <span style={{ fontSize: '0.8rem', color: '#00685b', fontWeight: 700 }}>View Championship Pool →</span>
            </div>
          </div>
        </section>

        {/* Section 3: Live Championship Ticker Preview & Recent Activity */}
        <section style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
          {/* Recent Activity */}
          <div style={{ background: '#ffffff', border: '1px solid #e2ece9', borderRadius: '20px', padding: '1.75rem', boxShadow: '0 4px 20px rgba(0, 104, 91, 0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#00685b', fontWeight: 700 }}>WALLET HISTORY</span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0d2b26', margin: 0 }}>Recent Activity</h3>
              </div>
              <button
                onClick={() => navigate('/transactions')}
                style={{ padding: '0.45rem 0.85rem', background: '#e6f4f1', color: '#00685b', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
              >
                View Full Activity Log →
              </button>
            </div>

            {ledgerPreview.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#5b706c' }}>
                No recent activity recorded yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {ledgerPreview.map((entry) => {
                  const isCredit = entry.amount >= 0;
                  return (
                    <div key={entry.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#f4f8f7', borderRadius: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: isCredit ? '#dcfce7' : '#fee2e2', color: isCredit ? '#15803d' : '#b91c1c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                          {isCredit ? '+' : '-'}
                        </div>
                        <div>
                          <strong style={{ fontSize: '0.9rem', color: '#0d2b26', display: 'block' }}>{entry.category}</strong>
                          <span style={{ fontSize: '0.75rem', color: '#5b706c' }}>{entry.sourceReference || 'Wallet Activity'}</span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <strong style={{ fontSize: '0.95rem', color: isCredit ? '#059669' : '#dc2626', display: 'block' }}>
                          {isCredit ? '+' : '-'}₹{Math.abs(entry.amount).toFixed(2)}
                        </strong>
                        <span style={{ fontSize: '0.7rem', color: '#5b706c' }}>{new Date(entry.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Championship Live Card */}
          <div style={{ background: '#e6f4f1', border: '1px solid #c7e5df', borderRadius: '20px', padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <span style={{ padding: '0.25rem 0.6rem', borderRadius: '999px', background: '#00685b', color: '#ffffff', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase' }}>
                {ticker?.phaseLabel || 'DAILY'} CHAMPIONSHIP
              </span>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0d2b26', margin: '0.75rem 0 0.2rem 0' }}>
                Pincode Royalty Pool
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#5b706c' }}>Registered: {profile?.registeredPincode || '-'}</p>

              <div style={{ margin: '1.25rem 0' }}>
                <span style={{ fontSize: '0.8rem', color: '#5b706c', display: 'block' }}>Accumulated Pool</span>
                <h2 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#00685b', margin: 0 }}>
                  ₹{(ticker?.currentCyclePool ?? pincodePool?.currentCyclePool ?? walletSummary.pincodeRoyalty).toFixed(2)}
                </h2>
              </div>
            </div>

            <button
              onClick={() => navigate('/championship')}
              style={{ width: '100%', padding: '0.75rem', background: '#00685b', color: '#ffffff', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}
            >
              Open Live Championship →
            </button>
          </div>
        </section>

        {/* Section 4: Administration & Platform Configuration Portal */}
        <section style={{ background: '#ffffff', border: '1px solid #e2ece9', borderRadius: '20px', padding: '1.75rem', boxShadow: '0 4px 20px rgba(0, 104, 91, 0.04)' }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#00685b', fontWeight: 700 }}>
              ADMINISTRATION & PLATFORM CONTROLS
            </span>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0d2b26', margin: '0.2rem 0' }}>
              System Configuration & Fund Management Portal
            </h2>
            <p style={{ color: '#5b706c', fontSize: '0.9rem' }}>
              Manage promotional fund injections, pincode master directory lookups, and vertical royalty percentage splits.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
            {/* Admin Royalty Engine */}
            <div
              onClick={() => navigate('/admin/royalty')}
              style={{ background: '#f4f8f7', border: '1px solid #e2ece9', borderRadius: '16px', padding: '1.5rem', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#00685b', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                  ⚙️
                </div>
                <div>
                  <strong style={{ fontSize: '1.05rem', color: '#0d2b26', display: 'block' }}>Vertical Royalty Engine</strong>
                  <span style={{ fontSize: '0.75rem', color: '#5b706c' }}>Category profit margins & root deductions</span>
                </div>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#5b706c', margin: '0 0 1rem 0' }}>
                Configure vertical profit margins, set root deductions, & test effective margin base simulator.
              </p>
              <span style={{ color: '#00685b', fontSize: '0.85rem', fontWeight: 700 }}>
                Configure Royalty Engine →
              </span>
            </div>

            {/* Admin Platform Management */}
            <div
              onClick={() => navigate('/admin/platform')}
              style={{ background: '#f4f8f7', border: '1px solid #e2ece9', borderRadius: '16px', padding: '1.5rem', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#00685b', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                  🛠️
                </div>
                <div>
                  <strong style={{ fontSize: '1.05rem', color: '#0d2b26', display: 'block' }}>Admin Platform Management</strong>
                  <span style={{ fontSize: '0.75rem', color: '#5b706c' }}>Fund injection, pincodes & split history</span>
                </div>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#5b706c', margin: '0 0 1rem 0' }}>
                Inject promotional add-on funds with mandatory audit notes, manage master pincodes, & audit history.
              </p>
              <span style={{ color: '#00685b', fontSize: '0.85rem', fontWeight: 700 }}>
                Open Platform Controls →
              </span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}