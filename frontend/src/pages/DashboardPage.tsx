import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavigationHeader from '../components/NavigationHeader';
import BottomNavBar from '../components/BottomNavBar';
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
import { getStoredTheme, initTheme, ThemeMode } from '../lib/theme';

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
  const session = getSession();

  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [walletSummary, setWalletSummary] = useState<WalletSummaryResponse>(EMPTY_SUMMARY);
  const [pincodePool, setPincodePool] = useState<PincodePoolResponse | null>(null);
  const [ticker, setTicker] = useState<PincodeChampionshipTickerResponse | null>(null);
  const [ledger, setLedger] = useState<LedgerEntryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [seedingDemo, setSeedingDemo] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>('light');
  const [countdown, setCountdown] = useState<string>('11h 59m 59s');

  const [showMoreUtility, setShowMoreUtility] = useState(false);
  const [showMoreVouchers, setShowMoreVouchers] = useState(false);
  const [showMoreVendors, setShowMoreVendors] = useState(false);

  useEffect(() => {
    const current = initTheme();
    setTheme(current);

    const handleThemeChange = () => {
      setTheme(getStoredTheme());
    };

    window.addEventListener('theme-change', handleThemeChange);
    return () => window.removeEventListener('theme-change', handleThemeChange);
  }, []);

  // Countdown timer for Championship evaluation
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      const diffSec = Math.max(0, Math.floor((endOfDay.getTime() - now.getTime()) / 1000));

      const hours = Math.floor(diffSec / 3600);
      const mins = Math.floor((diffSec % 3600) / 60);
      const secs = diffSec % 60;

      setCountdown(`${hours}h ${mins}m ${secs}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const fetchDashboard = async () => {
    const session = getSession();
    if (!session) return;
    setLoading(true);
    setError('');

    try {
      const [profileData, summaryData, ledgerData] = await Promise.all([
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

      if (profileData?.registeredPincode) {
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
      }
    } catch (err: any) {
      setError(err?.message || 'Unable to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleSeedDemo = async () => {
    const session = getSession();
    if (!session) return;

    setSeedingDemo(true);
    try {
      await loadDemoData(session.userId);
      await fetchDashboard();
    } catch {
      setError('Unable to load demo data.');
    } finally {
      setSeedingDemo(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-canvas)', color: 'var(--text-primary)', paddingBottom: '90px' }}>
      <NavigationHeader />

      <main style={{ maxWidth: '1100px', margin: '1.5rem auto', padding: '0 1.25rem' }}>
        
        {/* Landing Hero Banner (Top Section of Dashboard Page) */}
        <section
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '24px',
            padding: '2.5rem 2rem',
            textAlign: 'center',
            marginBottom: '2.5rem',
            boxShadow: '0 8px 30px var(--shadow-color)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ maxWidth: '850px', margin: '0 auto' }}>
            <span
              style={{
                padding: '0.45rem 1.25rem',
                borderRadius: '999px',
                background: 'var(--bg-highlight)',
                color: 'var(--accent-primary)',
                fontSize: '0.82rem',
                fontWeight: 800,
                border: '1px solid var(--border-color)',
                display: 'inline-block',
                marginBottom: '1.25rem'
              }}
            >
              ⚡ INDIA'S HYPERLOCAL REWARDS WALLET
            </span>

            <h1 style={{ fontSize: '2.8rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1.18, margin: '0 0 1rem 0' }}>
              Pay Bills, Recharges & Vouchers.<br />
              <span style={{ color: 'var(--accent-primary)' }}>Earn Guaranteed Wallet Royalties.</span>
            </h1>

            <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', maxWidth: '720px', margin: '0 auto 2rem auto', lineHeight: 1.6, fontWeight: 500 }}>
              Instant BBPS bill payments, mobile recharges & top brand gift cards. Earn real wallet cashback, pincode pool bonuses, and multi-level referral royalties on every spend.
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
              <button
                onClick={() => navigate('/checkout')}
                style={{
                  padding: '0.85rem 2rem',
                  borderRadius: '14px',
                  background: 'var(--accent-gradient)',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 900,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  boxShadow: '0 6px 20px var(--shadow-color)'
                }}
              >
                Pay & Earn Cashback →
              </button>

              <button
                onClick={() => navigate('/vouchers')}
                style={{
                  padding: '0.85rem 2rem',
                  borderRadius: '14px',
                  background: 'var(--bg-card-subtle)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  fontWeight: 800,
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                Explore Gift Vouchers 🎁
              </button>
            </div>

            {/* Key Stat Highlights Bar */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: '1.25rem',
                background: 'var(--bg-card-subtle)',
                border: '1px solid var(--border-color)',
                borderRadius: '18px',
                padding: '1.5rem'
              }}
            >
              <div>
                <strong style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--accent-primary)', display: 'block' }}>₹25L+</strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Cashback Paid</span>
              </div>

              <div>
                <strong style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--accent-primary)', display: 'block' }}>50,000+</strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Active Pincodes</span>
              </div>

              <div>
                <strong style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--accent-primary)', display: 'block' }}>100%</strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Instant Wallet Debit</span>
              </div>

              <div>
                <strong style={{ fontSize: '1.8rem', fontWeight: 900, color: '#10b981', display: 'block' }}>99.9%</strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Success Rate</span>
              </div>
            </div>

          </div>
        </section>

        {/* Clean Wireframe Header Section: Welcome + Username (edit) + Pincode */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
          <div>
            <span style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '1.5rem', color: 'var(--accent-primary)', display: 'block', marginBottom: '-0.2rem' }}>
              Welcome
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
                {profile?.fullName || 'Valued User'}
              </h1>
              <button
                onClick={() => navigate('/profile')}
                title="Edit Profile"
                style={{
                  background: 'var(--bg-highlight)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  color: 'var(--accent-primary)'
                }}
              >
                ✏️
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'right', cursor: 'pointer' }} onClick={() => navigate('/profile')}>
            <span style={{ fontSize: '1.25rem', fontStyle: 'italic', color: 'var(--accent-primary)', fontFamily: 'serif', display: 'block', lineHeight: 1.2 }}>
              Pincode
            </span>
            <strong style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', display: 'block', letterSpacing: '-0.02em', lineHeight: 1.2, textDecoration: 'underline', textUnderlineOffset: '4px' }}>
              {profile?.registeredPincode || session?.registeredPincode || ''}
            </strong>
          </div>
        </div>



        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '12px', padding: '0.75rem 1rem', marginBottom: '1.5rem', fontWeight: 600 }}>
            ⚠️ {error}
          </div>
        )}

        {/* Wireframe Top Dual Cards Grid */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
          {/* Card 1: Main Balance & Earning Ledger Summary (Left Card) */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '2px solid var(--border-color)',
              borderRadius: '20px',
              padding: '1.5rem',
              boxShadow: '0 4px 25px var(--shadow-color)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent-primary)' }}>
                  SUMMARY LEDGER
                </span>
                <span style={{ fontSize: '1.2rem' }}>💳</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed var(--border-color)', paddingBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>Lifetime :-</span>
                  <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--accent-primary)' }}>
                    ₹{walletSummary.totalEarnings.toFixed(2)}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed var(--border-color)', paddingBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>Cashback :-</span>
                  <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                    ₹{walletSummary.cashback.toFixed(2)}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed var(--border-color)', paddingBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>Referral :-</span>
                  <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                    ₹{walletSummary.referral.toFixed(2)}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-highlight)', padding: '0.75rem 1rem', borderRadius: '12px' }}>
                  <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--accent-primary)' }}>Available :-</span>
                  <span style={{ fontWeight: 900, fontSize: '1.4rem', color: 'var(--accent-primary)' }}>
                    ₹{walletSummary.walletBalance.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              style={{
                marginTop: '1.25rem',
                width: '100%',
                padding: '0.75rem',
                borderRadius: '12px',
                background: 'var(--accent-gradient)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.95rem',
                cursor: 'pointer',
                boxShadow: '0 4px 15px var(--shadow-color)'
              }}
            >
              Pay & Checkout →
            </button>
          </div>

          {/* Card 2: Royalty & Reversal Card (Right Card - "Royalty 👑") */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '2px solid var(--accent-primary)',
              borderRadius: '20px',
              padding: '1.5rem',
              boxShadow: '0 4px 25px var(--shadow-color)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Royalty 👑
                </span>
                <span
                  style={{
                    background: 'var(--bg-highlight)',
                    color: 'var(--accent-primary)',
                    padding: '0.25rem 0.6rem',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    border: '1px solid var(--border-color)'
                  }}
                >
                  {ticker?.phaseLabel || 'DAILY'} PHASE
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed var(--border-color)', paddingBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>Lifetime :-</span>
                  <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--accent-primary)' }}>
                    ₹{walletSummary.pincodeRoyalty.toFixed(2)}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed var(--border-color)', paddingBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>To date :-</span>
                    <span
                      style={{
                        background: '#fef3c7',
                        color: '#b45309',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '12px',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.2rem'
                      }}
                    >
                      ⏳ {countdown}
                    </span>
                  </div>
                  <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#d97706' }}>
                    ₹{(ticker?.currentCyclePool ?? pincodePool?.currentCyclePool ?? 0).toFixed(2)}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed var(--border-color)', paddingBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>Vendor :-</span>
                  <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                    ₹{walletSummary.vendorRoyalty.toFixed(2)}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(239, 68, 68, 0.08)', padding: '0.75rem 1rem', borderRadius: '12px' }}>
                  <div>
                    <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#dc2626' }}>Reversal :-</span>
                    <small style={{ display: 'block', fontSize: '0.7rem', color: '#dc2626' }}>Expires EOD</small>
                  </div>
                  <span style={{ fontWeight: 900, fontSize: '1.3rem', color: '#dc2626' }}>
                    ₹{walletSummary.reversalBalance.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/pincode-championship')}
              style={{
                marginTop: '1.25rem',
                width: '100%',
                padding: '0.75rem',
                borderRadius: '12px',
                background: 'var(--bg-highlight)',
                color: 'var(--accent-primary)',
                border: '1px solid var(--accent-primary)',
                fontWeight: 800,
                fontSize: '0.95rem',
                cursor: 'pointer'
              }}
            >
              Pincode Championship 🏆 →
            </button>
          </div>
        </section>

        {/* Wireframe Carousel Section 1: Utility :- frequently used. */}
        <section style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Utility :- <span style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontWeight: 400, fontSize: '1.1rem', color: 'var(--accent-primary)' }}>frequently used.</span>
            </h3>
            <button
              onClick={() => navigate('/bills')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent-primary)',
                fontWeight: 800,
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              ▷ more
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem' }}>
            {/* Utility Card 1: Mobile Recharge */}
            <div
              onClick={() => navigate('/recharge')}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                padding: '1.25rem',
                cursor: 'pointer',
                boxShadow: '0 4px 15px var(--shadow-color)',
                transition: 'transform 0.15s'
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📱</div>
              <strong style={{ display: 'block', fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                Mobile Recharge
              </strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Prepaid & MNP</span>
            </div>

            {/* Utility Card 2: Electricity */}
            <div
              onClick={() => navigate('/bills')}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                padding: '1.25rem',
                cursor: 'pointer',
                boxShadow: '0 4px 15px var(--shadow-color)',
                transition: 'transform 0.15s'
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚡</div>
              <strong style={{ display: 'block', fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                Electricity Bill
              </strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>BESCOM & State Boards</span>
            </div>

            {/* Utility Card 3: Water */}
            <div
              onClick={() => navigate('/bills')}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                padding: '1.25rem',
                cursor: 'pointer',
                boxShadow: '0 4px 15px var(--shadow-color)',
                transition: 'transform 0.15s'
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💧</div>
              <strong style={{ display: 'block', fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                Water Utility
              </strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Municipal Corporations</span>
            </div>

            {/* Utility Card 4: Gas Cylinder */}
            <div
              onClick={() => navigate('/bills')}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                padding: '1.25rem',
                cursor: 'pointer',
                boxShadow: '0 4px 15px var(--shadow-color)',
                transition: 'transform 0.15s'
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔥</div>
              <strong style={{ display: 'block', fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                Piped Gas / LPG
              </strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Cylinder Booking</span>
            </div>

            {/* Expanded Utility Cards */}
            {showMoreUtility && (
              <>
                <div
                  onClick={() => navigate('/bills')}
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.25rem', cursor: 'pointer', boxShadow: '0 4px 15px var(--shadow-color)' }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🌐</div>
                  <strong style={{ display: 'block', fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>Broadband Internet</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Airtel & JioFiber</span>
                </div>

                <div
                  onClick={() => navigate('/bills')}
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.25rem', cursor: 'pointer', boxShadow: '0 4px 15px var(--shadow-color)' }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📺</div>
                  <strong style={{ display: 'block', fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>DTH Recharge</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Tata Play & Airtel DTH</span>
                </div>

                <div
                  onClick={() => navigate('/bills')}
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.25rem', cursor: 'pointer', boxShadow: '0 4px 15px var(--shadow-color)' }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏛️</div>
                  <strong style={{ display: 'block', fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>Municipal Taxes</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Property Tax & Fees</span>
                </div>

                <div
                  onClick={() => navigate('/bills')}
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.25rem', cursor: 'pointer', boxShadow: '0 4px 15px var(--shadow-color)' }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🚗</div>
                  <strong style={{ display: 'block', fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>Fastag Recharge</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>NHAI & Toll Pass</span>
                </div>

                <div
                  onClick={() => navigate('/bills')}
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.25rem', cursor: 'pointer', boxShadow: '0 4px 15px var(--shadow-color)' }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📞</div>
                  <strong style={{ display: 'block', fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>Landline Bill</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>BSNL & MTNL</span>
                </div>

                <div
                  onClick={() => navigate('/bills')}
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.25rem', cursor: 'pointer', boxShadow: '0 4px 15px var(--shadow-color)' }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🛡️</div>
                  <strong style={{ display: 'block', fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>Insurance Premium</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>LIC & Health Pay</span>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Wireframe Carousel Section 2: Vouchers :- */}
        <section style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Vouchers :-
            </h3>
            <button
              onClick={() => navigate('/vouchers')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent-primary)',
                fontWeight: 800,
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              ▷ more
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem' }}>
            {/* Voucher Brand 1: Amazon Pay */}
            <div
              onClick={() => navigate('/vouchers')}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                padding: '1.25rem',
                cursor: 'pointer',
                boxShadow: '0 4px 15px var(--shadow-color)'
              }}
            >
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#232f3e', color: '#ff9900', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.7rem', marginBottom: '0.5rem' }}>
                amazon
              </div>
              <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                Amazon Pay
              </strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 700 }}>2.5% Cashback</span>
            </div>

            {/* Voucher Brand 2: Flipkart */}
            <div
              onClick={() => navigate('/vouchers')}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                padding: '1.25rem',
                cursor: 'pointer',
                boxShadow: '0 4px 15px var(--shadow-color)'
              }}
            >
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#2874f0', color: '#ffe500', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.2rem', fontStyle: 'italic', marginBottom: '0.5rem' }}>
                fk
              </div>
              <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                Flipkart
              </strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 700 }}>3.0% Cashback</span>
            </div>

            {/* Voucher Brand 3: Myntra */}
            <div
              onClick={() => navigate('/vouchers')}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                padding: '1.25rem',
                cursor: 'pointer',
                boxShadow: '0 4px 15px var(--shadow-color)'
              }}
            >
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #ff3f6c 0%, #ff905a 100%)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                M
              </div>
              <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                Myntra Fashion
              </strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 700 }}>5.0% Cashback</span>
            </div>

            {/* Voucher Brand 4: Swiggy */}
            <div
              onClick={() => navigate('/vouchers')}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                padding: '1.25rem',
                cursor: 'pointer',
                boxShadow: '0 4px 15px var(--shadow-color)'
              }}
            >
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fc8019', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                S
              </div>
              <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                Swiggy Money
              </strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 700 }}>4.0% Cashback</span>
            </div>

            {/* Expanded Voucher Cards */}
            {showMoreVouchers && (
              <>
                <div
                  onClick={() => navigate('/vouchers')}
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.25rem', cursor: 'pointer', boxShadow: '0 4px 15px var(--shadow-color)' }}
                >
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#cb202d', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.7rem', fontStyle: 'italic', marginBottom: '0.5rem' }}>
                    zomato
                  </div>
                  <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>Zomato Pro</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 700 }}>4.0% Cashback</span>
                </div>

                <div
                  onClick={() => navigate('/vouchers')}
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.25rem', cursor: 'pointer', boxShadow: '0 4px 15px var(--shadow-color)' }}
                >
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#1e293b', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1rem', marginBottom: '0.5rem' }}>
                    🎮
                  </div>
                  <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>Google Play</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 700 }}>2.0% Cashback</span>
                </div>

                <div
                  onClick={() => navigate('/vouchers')}
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.25rem', cursor: 'pointer', boxShadow: '0 4px 15px var(--shadow-color)' }}
                >
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#000000', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                    Uber
                  </div>
                  <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>Uber Rides</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 700 }}>3.5% Cashback</span>
                </div>

                <div
                  onClick={() => navigate('/vouchers')}
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.25rem', cursor: 'pointer', boxShadow: '0 4px 15px var(--shadow-color)' }}
                >
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#0066a1', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1rem', marginBottom: '0.5rem' }}>
                    🍕
                  </div>
                  <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>Domino's Pizza</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 700 }}>5.0% Cashback</span>
                </div>

                <div
                  onClick={() => navigate('/vouchers')}
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.25rem', cursor: 'pointer', boxShadow: '0 4px 15px var(--shadow-color)' }}
                >
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#e4002b', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1rem', marginBottom: '0.5rem' }}>
                    🍗
                  </div>
                  <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>KFC Chicken</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 700 }}>4.5% Cashback</span>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Wireframe Carousel Section 3: Vendors :- */}
        <section style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Vendors :-
            </h3>
            <button
              onClick={() => navigate('/admin/platform')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent-primary)',
                fontWeight: 800,
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              ▷ more
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem' }}>
            <div
              onClick={() => navigate('/admin/platform')}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                padding: '1.25rem',
                cursor: 'pointer',
                boxShadow: '0 4px 15px var(--shadow-color)'
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏪</div>
              <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                Local Merchants
              </strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Pincode {profile?.registeredPincode || session?.registeredPincode || ''}</span>
            </div>

            <div
              onClick={() => navigate('/admin/platform')}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                padding: '1.25rem',
                cursor: 'pointer',
                boxShadow: '0 4px 15px var(--shadow-color)'
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏬</div>
              <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                Retail Outlets
              </strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Commercial Network</span>
            </div>

            <div
              onClick={() => navigate('/admin/platform')}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                padding: '1.25rem',
                cursor: 'pointer',
                boxShadow: '0 4px 15px var(--shadow-color)'
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🍽️</div>
              <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                Partner Dining
              </strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Royalty Onboarder</span>
            </div>

            <div
              onClick={() => navigate('/admin/platform')}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                padding: '1.25rem',
                cursor: 'pointer',
                boxShadow: '0 4px 15px var(--shadow-color)'
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🛒</div>
              <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                Supermarkets
              </strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Regional Vendors</span>
            </div>

            {/* Expanded Vendor Cards */}
            {showMoreVendors && (
              <>
                <div
                  onClick={() => navigate('/admin/platform')}
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.25rem', cursor: 'pointer', boxShadow: '0 4px 15px var(--shadow-color)' }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💊</div>
                  <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>Pharmacy & Medical</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Apollo & Local Chemist</span>
                </div>

                <div
                  onClick={() => navigate('/admin/platform')}
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.25rem', cursor: 'pointer', boxShadow: '0 4px 15px var(--shadow-color)' }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⛽</div>
                  <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>Fuel Stations</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>HPCL & IndianOil</span>
                </div>

                <div
                  onClick={() => navigate('/admin/platform')}
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.25rem', cursor: 'pointer', boxShadow: '0 4px 15px var(--shadow-color)' }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💻</div>
                  <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>Electronics Stores</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Croma & Reliance Digital</span>
                </div>

                <div
                  onClick={() => navigate('/admin/platform')}
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.25rem', cursor: 'pointer', boxShadow: '0 4px 15px var(--shadow-color)' }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🥦</div>
                  <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>Organic Grocery</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Fresh Vegetables & Produce</span>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Bottom Refer & Earn Banner */}
        <section
          onClick={() => navigate('/referral')}
          style={{
            background: theme === 'dark'
              ? 'var(--bg-card)'
              : 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)',
            border: theme === 'dark' ? '1px solid var(--accent-primary)' : '1px solid rgba(217, 119, 6, 0.3)',
            borderRadius: '20px',
            padding: '1.4rem 1.75rem',
            color: theme === 'dark' ? 'var(--text-primary)' : '#000000',
            cursor: 'pointer',
            marginBottom: '2.5rem',
            boxShadow: '0 6px 25px var(--shadow-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1.25rem'
          }}
        >
          <div style={{ flex: '1 1 300px' }}>
            <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800, color: theme === 'dark' ? 'var(--accent-primary)' : '#78350f', display: 'block', marginBottom: '0.2rem' }}>
              👑 REFER & EARN
            </span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, margin: '0.2rem 0', color: theme === 'dark' ? 'var(--text-primary)' : '#000000' }}>
              Share your code, earn on every rupee they spend
            </h3>
            <p style={{ fontSize: '0.82rem', margin: 0, color: theme === 'dark' ? 'var(--text-secondary)' : '#451a03', fontWeight: 600 }}>
              Your referral royalty is credited automatically each time someone who joined with your code pays through VPE4U.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ background: theme === 'dark' ? 'var(--bg-card-subtle)' : '#ffffff', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '0.4rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <strong style={{ fontSize: '0.9rem', fontFamily: 'monospace', color: 'var(--text-primary)' }}>VPE4USAIRAM</strong>
              <span style={{ fontSize: '0.8rem', cursor: 'pointer' }} onClick={() => navigator.clipboard.writeText('VPE4USAIRAM')}>📋</span>
            </div>

            <span style={{ padding: '0.45rem 0.85rem', borderRadius: '14px', background: theme === 'dark' ? 'var(--bg-highlight)' : '#ffffff', color: theme === 'dark' ? 'var(--accent-primary)' : '#92400e', fontSize: '0.8rem', fontWeight: 800 }}>
              👥 3 Referred Users
            </span>

            <button
              onClick={() => navigate('/referral')}
              style={{
                padding: '0.5rem 1.1rem',
                borderRadius: '12px',
                background: theme === 'dark' ? 'var(--accent-primary)' : '#7f1d1d',
                color: '#ffffff',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <span>📤 Share</span>
            </button>

            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.origin + '/onboarding?ref=VPE4USAIRAM');
                alert('Referral link copied!');
              }}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '12px',
                background: theme === 'dark' ? 'var(--bg-card-subtle)' : '#ffffff',
                color: theme === 'dark' ? 'var(--text-primary)' : '#000000',
                border: '1px solid var(--border-color)',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <span>📋 Copy link</span>
            </button>
          </div>
        </section>

        {/* Demo Presentation Loader Trigger */}
        <section style={{ background: 'var(--bg-card-subtle)', borderRadius: '16px', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', border: '1px solid var(--border-color)' }}>
          <div>
            <strong style={{ fontSize: '1rem', color: 'var(--text-primary)', display: 'block' }}>
              ⚡ Demo Presentation Loader
            </strong>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Seed multi-date presentation records across all ledgers & transaction histories.
            </span>
          </div>
          <button
            onClick={handleSeedDemo}
            disabled={seedingDemo}
            style={{
              padding: '0.65rem 1.25rem',
              borderRadius: '10px',
              background: 'var(--accent-primary)',
              color: '#ffffff',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            {seedingDemo ? 'Loading Data...' : 'Seed Demo Presentation Data ⚡'}
          </button>
        </section>
      </main>

      {/* Wireframe Fixed Bottom Navigation Bar */}
      <BottomNavBar />
    </div>
  );
}