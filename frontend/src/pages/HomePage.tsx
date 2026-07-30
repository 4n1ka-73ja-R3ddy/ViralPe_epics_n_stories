import { useEffect, useState } from 'react';
import { CredentialResponse, GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { signInWithGoogle } from '../lib/api';
import { getSession, setSession } from '../lib/session';
import { getStoredTheme, initTheme, setStoredTheme, ThemeMode } from '../lib/theme';

export default function HomePage() {
  const navigate = useNavigate();

  const [theme, setTheme] = useState<ThemeMode>('light');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const googleClientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined)?.trim();

  useEffect(() => {
    const currentTheme = initTheme();
    setTheme(currentTheme);

    const handleThemeChange = () => {
      setTheme(getStoredTheme());
    };

    window.addEventListener('theme-change', handleThemeChange);
    return () => window.removeEventListener('theme-change', handleThemeChange);
  }, []);

  useEffect(() => {
    const session = getSession();
    if (session?.token && session?.profileComplete) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const toggleTheme = () => {
    const nextTheme: ThemeMode = theme === 'light' ? 'dark' : 'light';
    setStoredTheme(nextTheme);
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      setError('Google did not return a valid sign-in token. Please try again.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await signInWithGoogle(credentialResponse.credential);

      setSession({
        userId: response.userId,
        token: response.token,
        profileComplete: response.profileComplete
      });

      navigate(response.profileComplete ? '/dashboard' : '/onboarding');
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'We could not sign you in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-canvas)', color: 'var(--text-primary)', transition: 'all 0.2s ease-in-out', display: 'flex', flexDirection: 'column', position: 'relative', overflowX: 'hidden' }}>
      
      {/* Decorative Background Aura Circles */}
      <div
        style={{
          position: 'fixed',
          top: '-160px',
          right: '-100px',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(13, 148, 136, 0.22) 0%, rgba(13, 148, 136, 0) 70%)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />
      <div
        style={{
          position: 'fixed',
          bottom: '-160px',
          left: '-100px',
          width: '450px',
          height: '450px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(13, 148, 136, 0.2) 0%, rgba(13, 148, 136, 0) 70%)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      {/* Top Header Navigation Bar */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'var(--bg-card)',
          borderBottom: '1px solid var(--border-color)',
          boxShadow: '0 2px 10px var(--shadow-color)',
          padding: '0.85rem 2rem'
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          
          {/* Brand Logo */}
          <div onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--accent-gradient)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.25rem' }}>
              V
            </div>
            <div>
              <strong style={{ fontSize: '1.2rem', color: 'var(--text-primary)', fontWeight: 800, display: 'block', lineHeight: 1.1 }}>
                ViralPe
              </strong>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                WALLET NETWORK
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', overflowX: 'auto' }}>
            <a href="/" style={{ color: 'var(--accent-primary)', fontWeight: 800, fontSize: '0.9rem', textDecoration: 'none' }}>Home</a>
            <a href="/about" style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none' }}>About</a>
            <a href="/referral" style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none' }}>Referral</a>
            <a href="/bills" style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none' }}>Services</a>
            <a href="/admin/platform" style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none' }}>Vendors</a>
          </nav>

          {/* Right Header Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={toggleTheme}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: '999px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-highlight)',
                color: 'var(--text-primary)',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
            </button>

            <button
              onClick={() => navigate('/login')}
              style={{
                padding: '0.55rem 1.4rem',
                borderRadius: '12px',
                background: 'var(--accent-gradient)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.9rem',
                cursor: 'pointer',
                boxShadow: '0 4px 12px var(--shadow-color)'
              }}
            >
              Login
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area (flex: 1 pushes footer to absolute bottom) */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4rem', paddingBottom: '3rem' }}>
        
        {/* 1. Hero Section */}
        <section
          style={{
            padding: '4.5rem 1.5rem 2rem 1.5rem',
            textAlign: 'center',
            position: 'relative'
          }}
        >
          <div style={{ maxWidth: '920px', margin: '0 auto' }}>
            
            <span style={{ padding: '0.45rem 1.25rem', borderRadius: '999px', background: 'var(--bg-highlight)', color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: 800, border: '1px solid var(--border-color)', display: 'inline-block', marginBottom: '1.5rem' }}>
              ⚡ INDIA'S HYPERLOCAL REWARDS WALLET
            </span>

            <h1 style={{ fontSize: '3.2rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1.15, margin: '0 0 1.25rem 0' }}>
              Pay Bills, Recharges & Vouchers.<br />
              <span style={{ color: 'var(--accent-primary)' }}>Earn Guaranteed Wallet Royalties.</span>
            </h1>

            <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', maxWidth: '750px', margin: '0 auto 2.25rem auto', lineHeight: 1.6, fontWeight: 500 }}>
              Instant BBPS bill payments, mobile recharges & top brand gift cards. Earn real wallet cashback, pincode pool bonuses, and multi-level referral royalties on every spend.
            </p>

            <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '3.5rem' }}>
              <button
                onClick={() => navigate('/login')}
                style={{
                  padding: '0.9rem 2.25rem',
                  borderRadius: '14px',
                  background: 'var(--accent-gradient)',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 900,
                  fontSize: '1.05rem',
                  cursor: 'pointer',
                  boxShadow: '0 6px 20px var(--shadow-color)'
                }}
              >
                Pay & Earn Cashback →
              </button>

              <button
                onClick={() => navigate('/vouchers')}
                style={{
                  padding: '0.9rem 2.25rem',
                  borderRadius: '14px',
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  fontWeight: 800,
                  fontSize: '1.05rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px var(--shadow-color)'
                }}
              >
                Explore Gift Vouchers 🎁
              </button>
            </div>

            {/* Key Stat Highlights Bar */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '1.5rem',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '24px',
                padding: '2rem',
                boxShadow: '0 8px 30px var(--shadow-color)'
              }}
            >
              <div>
                <strong style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--accent-primary)', display: 'block' }}>₹25L+</strong>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Cashback Paid</span>
              </div>

              <div>
                <strong style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--accent-primary)', display: 'block' }}>50,000+</strong>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Active Pincodes</span>
              </div>

              <div>
                <strong style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--accent-primary)', display: 'block' }}>100%</strong>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Instant Wallet Debit</span>
              </div>

              <div>
                <strong style={{ fontSize: '2rem', fontWeight: 900, color: '#10b981', display: 'block' }}>99.9%</strong>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Success Rate</span>
              </div>
            </div>

          </div>
        </section>

        {/* 2. Feature Showcase Cards */}
        <section style={{ maxWidth: '1180px', margin: '0 auto', width: '100%', padding: '0 1.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              REVOLUTIONARY DIGITAL REWARDS
            </span>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0.4rem 0 0 0' }}>
              Everything You Need in One Unified Wallet
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '2rem', boxShadow: '0 8px 25px var(--shadow-color)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'var(--bg-highlight)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.4rem', marginBottom: '1.25rem' }}>
                📱
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>
                Utility Bills & Recharges
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>
                Pay Electricity, Water, Gas, FASTag, and Mobile Recharges via BBPS. Earn up to 5% instant wallet cashback on every transaction.
              </p>
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '2rem', boxShadow: '0 8px 25px var(--shadow-color)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'var(--bg-highlight)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.4rem', marginBottom: '1.25rem' }}>
                🎁
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>
                Top Brand Gift Vouchers
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>
                Instant digital gift cards for Amazon, Swiggy, Zomato, Flipkart, and Myntra. Redeem instantly or pay using your Reversal Wallet.
              </p>
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '2rem', boxShadow: '0 8px 25px var(--shadow-color)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'var(--bg-highlight)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.4rem', marginBottom: '1.25rem' }}>
                🏆
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>
                Pincode Pool Championships
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>
                Participate in your registered All-India pincode earning pool. Get automatic monthly payouts based on network spending volume in your area.
              </p>
            </div>

          </div>
        </section>

      </main>

      {/* Footer Pinned to Absolute Bottom */}
      <footer
        style={{
          background: 'var(--bg-card)',
          borderTop: '1px solid var(--border-color)',
          padding: '1.5rem 2rem',
          zIndex: 10
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            © 2026 ViralPe Network. All rights reserved.
          </span>

          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <a href="/about" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 600 }}>About</a>
            <a href="/referral" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 600 }}>Referral</a>
            <a href="/vouchers" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 600 }}>Vouchers</a>
          </div>
        </div>
      </footer>

    </div>
  );
}