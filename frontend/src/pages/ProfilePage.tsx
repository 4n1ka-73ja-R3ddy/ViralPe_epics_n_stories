import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavigationHeader from '../components/NavigationHeader';
import BottomNavBar from '../components/BottomNavBar';
import { getProfile, getWalletSummary, UserProfileResponse, WalletSummaryResponse } from '../lib/api';
import { clearSession, getSession } from '../lib/session';

export default function ProfilePage() {
  const navigate = useNavigate();
  const session = getSession();

  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [wallet, setWallet] = useState<WalletSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.userId) {
      navigate('/');
      return;
    }

    Promise.all([
      getProfile(session.userId),
      getWalletSummary(session.userId)
    ])
      .then(([profData, wallData]) => {
        setProfile(profData);
        setWallet(wallData);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    clearSession();
    navigate('/');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-canvas)', color: 'var(--text-primary)', paddingBottom: '90px' }}>
      <NavigationHeader />

      <main style={{ maxWidth: '700px', margin: '2rem auto', padding: '0 1.25rem' }}>
        {/* Profile Card */}
        <section
          style={{
            background: 'var(--bg-card)',
            border: '2px solid var(--accent-primary)',
            borderRadius: '24px',
            padding: '2rem',
            boxShadow: '0 8px 30px var(--shadow-color)',
            marginBottom: '2rem',
            textAlign: 'center',
            position: 'relative'
          }}
        >
          {/* Avatar Icon */}
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'var(--accent-gradient)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.5rem',
              margin: '0 auto 1rem auto',
              boxShadow: '0 6px 20px var(--shadow-color)'
            }}
          >
            👤
          </div>

          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.3rem 0' }}>
            {profile?.fullName || session?.email?.split('@')[0] || 'User Profile'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: '0 0 1.25rem 0' }}>
            {profile?.email || session?.email}
          </p>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'var(--bg-highlight)',
              color: 'var(--accent-primary)',
              padding: '0.4rem 1rem',
              borderRadius: '20px',
              fontWeight: 800,
              fontSize: '0.85rem',
              border: '1px solid var(--border-color)',
              marginBottom: '1.5rem'
            }}
          >
            <span>User ID: #{session?.userId || 1}</span>
            <span>•</span>
            <span>{'GOOGLE'}</span>
          </div>

          {/* Details List */}
          <div style={{ background: 'var(--bg-card-subtle)', borderRadius: '16px', padding: '1.25rem', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed var(--border-color)', paddingBottom: '0.6rem' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Residential Pincode</span>
              <strong style={{ fontSize: '1rem', color: 'var(--accent-primary)', textDecoration: 'underline' }}>
                📍 {profile?.registeredPincode || session?.registeredPincode || ''} (Locked)
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed var(--border-color)', paddingBottom: '0.6rem' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Referral Code</span>
              <strong style={{ fontSize: '1rem', color: 'var(--accent-primary)', letterSpacing: '0.05em' }}>
                🎁 VPE4USAIRAM
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed var(--border-color)', paddingBottom: '0.6rem' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Spendable Wallet</span>
              <strong style={{ fontSize: '1.1rem', color: 'var(--accent-primary)' }}>
                ₹{(wallet?.walletBalance ?? 0).toFixed(2)}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Total Lifetime Earnings</span>
              <strong style={{ fontSize: '1.1rem', color: 'var(--accent-primary)' }}>
                ₹{(wallet?.totalEarnings ?? 0).toFixed(2)}
              </strong>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button
            onClick={() => navigate('/admin/platform')}
            style={{
              width: '100%',
              padding: '0.9rem',
              borderRadius: '14px',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              fontWeight: 800,
              fontSize: '1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 4px 15px var(--shadow-color)'
            }}
          >
            <span>⚙️ Platform Admin Management</span>
            <span>→</span>
          </button>

          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '0.9rem',
              borderRadius: '14px',
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              border: '1px solid #ef4444',
              fontWeight: 800,
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >
            🚪 Sign Out of ViralPe
          </button>
        </section>
      </main>

      <BottomNavBar />
    </div>
  );
}
