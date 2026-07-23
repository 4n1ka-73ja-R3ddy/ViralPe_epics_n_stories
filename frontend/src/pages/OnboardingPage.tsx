import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  completeProfile,
  PincodeValidationResponse,
  validatePincode
} from '../lib/api';
import { getSession, setSession } from '../lib/session';

export default function OnboardingPage() {
  const navigate = useNavigate();

  const [pincode, setPincode] = useState('');
  const [code, setCode] = useState('');
  const [locationConfirmed, setLocationConfirmed] = useState(false);
  const [locationData, setLocationData] =
    useState<PincodeValidationResponse | null>(null);
  const [warning, setWarning] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [validatingPincode, setValidatingPincode] = useState(false);

  useEffect(() => {
    const session = getSession();

    if (!session) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const applySampleValues = () => {
    setPincode('560001');
    setCode('101');
    setLocationConfirmed(false);
    setLocationData(null);
    setError('');
    setWarning('');
  };

  const handleValidatePincode = async () => {
    if (!/^\d{6}$/.test(pincode)) {
      setError('Enter a valid 6-digit pincode before validating.');
      return;
    }

    setValidatingPincode(true);
    setError('');
    setWarning('');

    try {
      const response = await validatePincode(pincode);
      setLocationData(response);
      setLocationConfirmed(false);
    } catch (pincodeError) {
      setLocationData(null);
      setLocationConfirmed(false);

      setError(
        pincodeError instanceof Error
          ? pincodeError.message
          : 'Unable to validate pincode.'
      );
    } finally {
      setValidatingPincode(false);
    }
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const session = getSession();

    if (!session) {
      navigate('/', { replace: true });
      return;
    }

    if (!locationData || !locationConfirmed) {
      setError(
        'Please validate and confirm your pincode location before continuing.'
      );
      return;
    }

    setSaving(true);
    setError('');
    setWarning('');

    try {
      const response = await completeProfile({
        userId: session.userId,
        pincode,
        locationConfirmed,
        referralCode: code.trim() || undefined
      });

      if (response.warning) {
        setWarning(response.warning);
      }

      setSession({
        ...session,
        profileComplete: true
      });

      navigate('/dashboard');
    } catch (profileError) {
      setError(
        profileError instanceof Error
          ? profileError.message
          : 'Unable to complete profile.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="onboarding-page">
      <div className="onboarding-orb onboarding-orb-one" />
      <div className="onboarding-orb onboarding-orb-two" />

      <header className="onboarding-header">
        <a className="brand" href="/" aria-label="ViralPe home">
          <span className="brand-mark">V</span>

          <span className="brand-copy">
            <strong>ViralPe</strong>
            <small>Wallet Network</small>
          </span>
        </a>

        <span className="onboarding-step">
          Step 1 of 1
        </span>
      </header>

      <main className="onboarding-main">
        <section className="onboarding-copy">
          <p className="login-eyebrow">
            Complete your profile
          </p>

          <h1>
            Your rewards start with your location.
          </h1>

          <p>
            Confirm your residential pincode so ViralPe can map
            you to the correct regional rewards pool.
          </p>

          <div className="onboarding-points">
            <div>
              <span>1</span>
              <p>Validate your 6-digit pincode.</p>
            </div>

            <div>
              <span>2</span>
              <p>Confirm the City, District and State.</p>
            </div>

// developed by anika teja reddy
            <div>
              <span>3</span>
              <p>Add an optional referral or onboarding code.</p>
            </div>
          </div>
        </section>

        <section className="onboarding-card">
          <div className="onboarding-card-header">
            <span className="secure-badge">
              Secure profile setup
            </span>

            <h2>Confirm your location</h2>

            <p>
              Your pincode is permanent after profile completion.
            </p>
          </div>

          <button
            type="button"
            className="demo-sample-button"
            onClick={applySampleValues}
          >
            Use Demo Sample Values
          </button>

          <form
            onSubmit={handleSubmit}
            className="onboarding-form"
          >
            <div className="form-group">
              <label htmlFor="pincode">
                Residential pincode
              </label>

              <div className="input-row">
                <input
                  id="pincode"
                  className="input"
                  type="text"
                  inputMode="numeric"
                  value={pincode}
                  onChange={(event) => {
                    const nextValue = event.target.value.replace(
                      /\D/g,
                      ''
                    );

                    setPincode(nextValue);
                    setLocationConfirmed(false);
                    setLocationData(null);
                    setError('');
                  }}
                  placeholder="Enter 6-digit pincode"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  required
                />

                <button
                  type="button"
                  className="button button-small"
                  onClick={handleValidatePincode}
                  disabled={validatingPincode}
                >
                  {validatingPincode
                    ? 'Checking...'
                    : 'Validate'}
                </button>
              </div>
            </div>

            {locationData ? (
              <div className="confirmed-location-card">
                <div className="location-icon">
                  ✓
                </div>

                <div className="location-content">
                  <span>Validated location</span>

                  <strong>
                    {locationData.city}, {locationData.state}
                  </strong>

                  <p>
                    {locationData.district} district ·{' '}
                    {locationData.pincode}
                  </p>
                </div>

                <label className="location-confirmation">
                  <input
                    type="checkbox"
                    checked={locationConfirmed}
                    onChange={(event) =>
                      setLocationConfirmed(event.target.checked)
                    }
                  />

                  <span>
                    I confirm this is my residential location.
                  </span>
                </label>
              </div>
            ) : null}

            <div className="form-group">
              <label htmlFor="referralCode">
                Referral or onboarding code
                <span className="optional-label">
                  Optional
                </span>
              </label>

              <input
                id="referralCode"
                className="input"
                type="text"
                value={code}
                onChange={(event) =>
                  setCode(event.target.value)
                }
                placeholder="Enter a referral or vendor code"
              />

              <p className="field-help">
                You can skip this field and complete onboarding.
              </p>
            </div>

            {error ? (
              <p className="onboarding-message onboarding-error">
                {error}
              </p>
            ) : null}

            {warning ? (
              <p className="onboarding-message onboarding-warning">
                {warning}
              </p>
            ) : null}

            <button
              type="submit"
              className="button onboarding-submit"
              disabled={saving}
            >
              {saving
                ? 'Completing Profile...'
                : 'Continue to Dashboard'}
            </button>
          </form>
        </section>
      </main>

      <footer className="onboarding-footer">
        <span>Secure profile onboarding</span>
        <span>Your Google account remains connected.</span>
      </footer>
    </div>
  );
}