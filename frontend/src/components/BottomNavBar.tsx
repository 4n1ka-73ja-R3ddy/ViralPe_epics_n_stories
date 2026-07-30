import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function BottomNavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showQrModal, setShowQrModal] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <nav
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '70px',
          background: 'var(--bg-card)',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          zIndex: 1000,
          boxShadow: '0 -4px 20px var(--shadow-color)',
          padding: '0 0.5rem'
        }}
      >
        {/* Item 1: Home */}
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            background: 'none',
            border: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.2rem',
            color: isActive('/dashboard') ? 'var(--accent-primary)' : 'var(--text-secondary)',
            cursor: 'pointer',
            fontWeight: isActive('/dashboard') ? 800 : 600,
            fontSize: '0.75rem',
            flex: 1
          }}
        >
          <span style={{ fontSize: '1.4rem' }}>🏠</span>
          <span>Home</span>
        </button>

        {/* Item 2: History */}
        <button
          onClick={() => navigate('/history')}
          style={{
            background: 'none',
            border: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.2rem',
            color: isActive('/history') ? 'var(--accent-primary)' : 'var(--text-secondary)',
            cursor: 'pointer',
            fontWeight: isActive('/history') ? 800 : 600,
            fontSize: '0.75rem',
            flex: 1
          }}
        >
          <span style={{ fontSize: '1.4rem' }}>📜</span>
          <span>History</span>
        </button>

        {/* Item 3: Center QR Scanner Floating Button */}
        <div style={{ position: 'relative', flex: 1, display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={() => setShowQrModal(true)}
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'var(--accent-gradient)',
              color: '#ffffff',
              border: '4px solid var(--bg-canvas)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
              marginTop: '-24px',
              transition: 'transform 0.15s'
            }}
            title="Scan QR Code to Pay"
          >
            <span style={{ fontSize: '1.6rem' }}>📷</span>
          </button>
        </div>

        {/* Item 4: My Vouchers */}
        <button
          onClick={() => navigate('/my-vouchers')}
          style={{
            background: 'none',
            border: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.2rem',
            color: (isActive('/my-vouchers') || isActive('/vouchers')) ? 'var(--accent-primary)' : 'var(--text-secondary)',
            cursor: 'pointer',
            fontWeight: (isActive('/my-vouchers') || isActive('/vouchers')) ? 800 : 600,
            fontSize: '0.75rem',
            flex: 1
          }}
        >
          <span style={{ fontSize: '1.4rem' }}>🎁</span>
          <span>Vouchers</span>
        </button>

        {/* Item 5: Profile */}
        <button
          onClick={() => navigate('/profile')}
          style={{
            background: 'none',
            border: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.2rem',
            color: isActive('/profile') ? 'var(--accent-primary)' : 'var(--text-secondary)',
            cursor: 'pointer',
            fontWeight: isActive('/profile') ? 800 : 600,
            fontSize: '0.75rem',
            flex: 1
          }}
        >
          <span style={{ fontSize: '1.4rem' }}>👤</span>
          <span>Profile</span>
        </button>
      </nav>

      {/* QR Code Scanner Simulation Modal */}
      {showQrModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '1.5rem'
          }}
        >
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '24px',
              padding: '2rem',
              maxWidth: '400px',
              width: '100%',
              textAlign: 'center',
              boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
              color: 'var(--text-primary)'
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📷</div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>
              QR Scanner / UPI Pay
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Scan any merchant or vendor QR code to initiate zero-load checkout.
            </p>

            <div
              style={{
                width: '180px',
                height: '180px',
                margin: '0 auto 1.5rem auto',
                border: '3px dashed var(--accent-primary)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg-highlight)',
                color: 'var(--accent-primary)',
                fontWeight: 700,
                fontSize: '0.85rem'
              }}
            >
              [ Ready to Scan ]
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => {
                  setShowQrModal(false);
                  navigate('/checkout');
                }}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '12px',
                  background: 'var(--accent-gradient)',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                Proceed to Pay →
              </button>
              <button
                onClick={() => setShowQrModal(false)}
                style={{
                  padding: '0.75rem 1.25rem',
                  borderRadius: '12px',
                  background: 'transparent',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-color)',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
