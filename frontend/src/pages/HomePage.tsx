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

          <div className="google-login-container">
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