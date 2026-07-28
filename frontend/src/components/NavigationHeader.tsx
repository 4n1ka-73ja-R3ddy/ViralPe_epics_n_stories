import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getProfile, UserProfileResponse } from '../lib/api';
import { clearSession, getSession, setSession } from '../lib/session';
import { getStoredTheme, initTheme, setStoredTheme, ThemeMode } from '../lib/theme';

export default function NavigationHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const session = getSession();

  const isDashboard = location.pathname === '/dashboard';

  const [theme, setTheme] = useState<ThemeMode>('light');
  const [userInfo, setUserInfo] = useState<{ fullName: string; email: string }>({
    fullName: session?.fullName || 'User',
    email: session?.email || ''
  });

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
    if (session?.userId) {
      void getProfile(session.userId)
        .then((prof: UserProfileResponse) => {
          const name = prof.fullName || 'User';
          const mail = prof.email || '';
          setUserInfo({ fullName: name, email: mail });

          setSession({
            ...session,
            fullName: name,
            email: mail,
            registeredPincode: prof.registeredPincode || session.registeredPincode
          });
        })
        .catch((err) => console.error('Error fetching user profile for header:', err));
    }
  }, [session?.userId]);

  const handleLogout = () => {
    clearSession();
    navigate('/', { replace: true });
  };

  const toggleTheme = () => {
    const nextTheme: ThemeMode = theme === 'light' ? 'dark' : 'light';
    setStoredTheme(nextTheme);
  };

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-color)',
        boxShadow: '0 2px 10px var(--shadow-color)',
        padding: '0.85rem 2rem',
        transition: 'all 0.2s ease-in-out'
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap'
        }}
      >
        {/* Left Side: Brand Logo + Subtitle + Back Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div
            onClick={() => navigate('/dashboard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'var(--accent-gradient)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.25rem',
                boxShadow: '0 4px 12px rgba(0, 104, 91, 0.2)',
              }}
            >
              V
            </div>
            <div>
              <strong
                style={{
                  fontSize: '1.2rem',
                  color: 'var(--text-primary)',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  display: 'block',
                  lineHeight: 1.1,
                }}
              >
                ViralPe
              </strong>
              <span
                style={{
                  fontSize: '0.68rem',
                  color: 'var(--text-secondary)',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                WALLET NETWORK
              </span>
            </div>
          </div>

          {!isDashboard && (
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-highlight)',
                color: 'var(--accent-primary)',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              ← Dashboard
            </button>
          )}
        </div>

        {/* Right Side: Theme Toggle Switch + User Name + Gmail + Sign Out Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.1rem' }}>
          <button
            onClick={toggleTheme}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 0.85rem',
              borderRadius: '999px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-highlight)',
              color: 'var(--text-primary)',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
            }}
          >
            {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
          </button>

          <div style={{ textAlign: 'right' }}>
            <strong
              style={{
                fontSize: '0.9rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                display: 'block',
                lineHeight: 1.2,
              }}
            >
              {userInfo.fullName}
            </strong>
            <span
              style={{
                fontSize: '0.78rem',
                color: 'var(--text-secondary)',
                fontWeight: 500,
                display: 'block',
              }}
            >
              {userInfo.email || 'user@gmail.com'}
            </span>
          </div>

          <button
            onClick={handleLogout}
            style={{
              padding: '0.5rem 1.1rem',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 6px var(--shadow-color)',
              transition: 'all 0.15s',
            }}
          >
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
}
