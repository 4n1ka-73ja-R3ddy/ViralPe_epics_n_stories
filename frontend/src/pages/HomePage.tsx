import { useEffect, useState } from 'react';
import {
  CredentialResponse,
  GoogleLogin
} from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { signInWithGoogle } from '../lib/api';
import { getSession, setSession } from '../lib/session';

export default function HomePage() {
  const navigate = useNavigate();

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const googleClientId = (
    import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined
  )?.trim();

  useEffect(() => {
    const session = getSession();

    if (!session) {
      return;
    }

    navigate(
      session.profileComplete ? '/dashboard' : '/onboarding',
      { replace: true }
    );
  }, [navigate]);

  const handleGoogleSuccess = async (
    credentialResponse: CredentialResponse
  ) => {
    if (!credentialResponse.credential) {
      setError(
        'Google did not return a valid sign-in token. Please try again.'
      );
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await signInWithGoogle(
        credentialResponse.credential
      );

      setSession({
        userId: response.userId,
        token: response.token,
        profileComplete: response.profileComplete
      });

      navigate(
        response.profileComplete
          ? '/dashboard'
          : '/onboarding'
      );
    } catch (authError) {
      setError(
        authError instanceof Error
          ? authError.message
          : 'We could not sign you in. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-background login-background-one" />
      <div className="login-background login-background-two" />

      <header className="login-header">
        <a className="brand" href="/" aria-label="ViralPe home">
          <span className="brand-mark">V</span>

          <span className="brand-copy">
            <strong>ViralPe</strong>
            <small>Wallet Network</small>
          </span>
        </a>

        <nav className="login-nav" aria-label="Page links">
          <a href="#benefits">Benefits</a>
          <a href="#security">Security</a>
        </nav>
      </header>

      <main className="login-main">
        <section className="login-hero">
          <p className="login-eyebrow">
            Payments that give something back
          </p>

          <h1>
            Pay smarter.
            <br />
            Earn with every transaction.
          </h1>

          <p className="login-description">
            Recharge, pay bills and manage rewards through one
            secure wallet experience.
          </p>

          <div className="login-benefits" id="benefits">
            <div className="login-benefit">
              <span className="benefit-icon">₹</span>

              <div>
                <strong>One spendable wallet</strong>
                <p>
                  Use rewards and wallet balance during checkout.
                </p>
              </div>
            </div>

            <div className="login-benefit">
              <span className="benefit-icon">↗</span>

              <div>
                <strong>Rewards on everyday payments</strong>
                <p>
                  Track cashback, referrals and royalty earnings.
                </p>
              </div>
            </div>

            <div className="login-benefit">
              <span className="benefit-icon">⌖</span>

              <div>
                <strong>Pincode-based rewards</strong>
                <p>
                  Participate in regional earning pools.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="login-card" id="security">
          <div className="login-card-header">
            <span className="secure-badge">
              Secure access
            </span>

            <h2>Welcome to ViralPe</h2>

            <p>
              Continue with your Google account. New users will
              complete a short profile setup.
            </p>
          </div>

          <div className="google-login-container" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
            {googleClientId ? (
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() =>
                  setError(
                    'The Google sign-in window could not be opened.'
                  )
                }
                shape="pill"
                size="large"
                text="continue_with"
                theme="outline"
                useOneTap={false}
              />
            ) : (
              <p className="login-configuration-error">
                Google sign-in is currently unavailable.
              </p>
            )}

            {/* Apple ID Sign-In Button (Story 1.2) */}
            <button
              type="button"
              onClick={async () => {
                setLoading(true);
                setError('');
                try {
                  const res = await fetch('/api/auth/sign-in/apple', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      providerId: 'apple-user-' + Date.now(),
                      email: 'apple.user.' + Date.now() + '@privaterelay.appleid.com',
                      fullName: 'Apple ID User'
                    })
                  }).then(r => r.json());

                  setSession({
                    userId: res.userId,
                    token: res.token,
                    profileComplete: res.profileComplete
                  });

                  navigate(res.profileComplete ? '/dashboard' : '/onboarding');
                } catch (err) {
                  setError('Apple Sign-In failed. Please try again.');
                } finally {
                  setLoading(false);
                }
              }}
              style={{
                width: '100%',
                maxWidth: '240px',
                height: '40px',
                borderRadius: '20px',
                border: '1px solid var(--border-color)',
                background: '#000000',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 170 170" fill="currentColor">
                <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.82.13-9.67-1.92-14.54-6.14-3.4-2.9-7.3-7.65-11.71-14.25-6.24-9.36-11.2-19.8-14.88-31.32-3.68-11.53-5.52-22.36-5.52-32.49 0-14.75 3.65-26.68 10.96-35.8 7.31-9.12 16.48-13.78 27.5-13.98 4.71.07 9.87 1.15 15.48 3.24 5.61 2.09 9.5 3.14 11.67 3.14 1.95 0 5.82-1.05 11.62-3.14 5.8-2.09 10.74-3.14 14.82-3.14 11.63.4 20.91 4.96 27.84 13.68-10.23 6.18-15.22 14.86-14.97 26.04.25 8.78 3.55 16.14 9.9 22.08 6.35 5.94 13.92 9.29 22.71 10.05-2.04 6.09-4.7 12.38-7.98 18.87zM119.22 31.84c0-6.8 2.45-13.37 7.35-19.7 4.9-6.33 11.1-10.37 18.6-12.14.62 7.07-1.7 13.7-6.96 19.89-5.26 6.19-11.58 10.08-18.99 11.95z"/>
              </svg>
              Sign in with Apple
            </button>
          </div>

          {loading ? (
            <div className="login-loading">
              <span className="login-spinner" />
              Signing you in securely...
            </div>
          ) : null}

          {error ? (
            <p className="login-error" role="alert">
              {error}
            </p>
          ) : null}

          <div className="login-divider">
            <span />
            <p>Why continue with Google?</p>
            <span />
          </div>

          <div className="security-list">
            <div>
              <span>✓</span>
              <p>Your Google password is never shared with ViralPe.</p>
            </div>

            <div>
              <span>✓</span>
              <p>Your verified name and email secure your account.</p>
            </div>

            <div>
              <span>✓</span>
              <p>Returning users go directly to their dashboard.</p>
            </div>
          </div>

          <p className="login-legal">
            By continuing, you agree to ViralPe&apos;s{' '}
            <a href="#">Terms of Use</a> and{' '}
            <a href="#">Privacy Policy</a>.
          </p>
        </section>
      </main>

      <footer className="login-footer">
        <span>© 2026 ViralPe</span>

        <div>
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Help</a>
        </div>
      </footer>
    </div>
  );
}