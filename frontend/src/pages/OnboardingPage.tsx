import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  completeProfile,
  PincodeValidationResponse,
  validatePincode
} from '../lib/api';
import { getSession, setSession } from '../lib/session';
import { getPincodeDetails, searchPincodes, PincodeCsvRecord, PincodeDetails } from '../lib/pincodeService';

export default function OnboardingPage() {
  const navigate = useNavigate();

  const [activeStage, setActiveStage] = useState(1);
  const [pincode, setPincode] = useState('');
  const [code, setCode] = useState('');
  const [locationConfirmed, setLocationConfirmed] = useState(false);
  const [locationData, setLocationData] =
    useState<PincodeValidationResponse | null>(null);
  const [pincodeDetails, setPincodeDetails] = useState<PincodeDetails | null>(null);
  const [selectedArea, setSelectedArea] = useState('');
  const [warning, setWarning] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [validatingPincode, setValidatingPincode] = useState(false);
  const [suggestions, setSuggestions] = useState<PincodeCsvRecord[]>([]);

  useEffect(() => {
    const session = getSession();

    if (!session) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const handleValidatePincode = async (overridePincode?: string) => {
    const targetCode = overridePincode || pincode;
    if (!/^\d{6}$/.test(targetCode)) {
      setError('⚠️ Enter a valid 6-digit pincode before validating.');
      return;
    }

    setValidatingPincode(true);
    setError('');
    setWarning('');

    try {
      // Lookup against All-India Pincode Directory CSV for Country, State, District, and Areas
      const details = await getPincodeDetails(targetCode);
      if (details) {
        setPincodeDetails(details);
        setSelectedArea(details.areas.length > 0 ? details.areas[0] : '');
        setLocationData({
          pincode: details.pincode,
          city: details.areas.length > 0 ? details.areas[0] : 'Local Area',
          district: details.district,
          state: details.state,
          valid: true
        });
        setLocationConfirmed(false);
        setActiveStage(2);
        setSuggestions([]);
        return;
      }

      // Backend API validation attempt
      const response = await validatePincode(targetCode);
      if (response && response.pincode) {
        setLocationData(response);
        setPincodeDetails({
          pincode: response.pincode,
          country: 'India 🇮🇳',
          state: response.state,
          district: response.district,
          areas: [response.city, `${response.city} Central`, `${response.city} East Sector`]
        });
        setSelectedArea(response.city);
        setLocationConfirmed(false);
        setActiveStage(2);
        setSuggestions([]);
        return;
      }

      throw new Error(`Invalid or unsupported pincode '${targetCode}'.`);
    } catch (pincodeError) {
      setLocationData(null);
      setPincodeDetails(null);
      setLocationConfirmed(false);
      setActiveStage(1); // Stay on Stage 1 (do not take user to next step!)

      setError(
        `⚠️ Invalid Pincode '${targetCode}'. This pincode does not exist in the All-India Pincode Directory.`
      );
    } finally {
      setValidatingPincode(false);
    }
  };

  const useDemoValues = async () => {
    setPincode('560001');
    setCode('101');
    setLocationConfirmed(false);
    setLocationData(null);
    setError('');
    setWarning('');

    setActiveStage(1);

    await handleValidatePincode();
  };

  const handleStageOneContinue = async () => {
    if (!/^[0-9]{6}$/.test(pincode)) {
      setError('Enter a valid 6-digit pincode before continuing.');
      return;
    }

    await handleValidatePincode();
  };

  const handleStageTwoContinue = () => {
    if (!locationData || !locationConfirmed) {
      setError(
        'Please validate and confirm your pincode location before continuing.'
      );
      return;
    }

    setError('');
    setWarning('');
    setActiveStage(3);
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
        profileComplete: true,
        registeredPincode: pincode
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
          Step {activeStage} of 3
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
            Complete your profile in three guided stages so
            ViralPe can map you to the correct regional rewards pool.
          </p>

          <div className="onboarding-points">
            <div>
              <span>1</span>
              <p>Enter and validate your 6-digit pincode.</p>
            </div>

            <div>
              <span>2</span>
              <p>Confirm the City, District and State for your location.</p>
            </div>

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

            <h2>Complete your profile</h2>

            <p>
              Your pincode is permanent after profile completion.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="onboarding-form"
          >
            <div className="stage-progress">
              <div className={`stage-pill ${activeStage >= 1 ? 'active' : ''}`}>
                Pincode
              </div>
              <div className={`stage-pill ${activeStage >= 2 ? 'active' : ''}`}>
                Location
              </div>
              <div className={`stage-pill ${activeStage >= 3 ? 'active' : ''}`}>
                Referral
              </div>
            </div>

            {activeStage === 1 ? (
              <div className="stage-card">
                <div className="form-group">
                  <label htmlFor="pincode">
                    Residential pincode
                  </label>

                  <div className="input-row" style={{ position: 'relative' }}>
                    <input
                      id="pincode"
                      className="input"
                      type="text"
                      inputMode="numeric"
                      value={pincode}
                      onChange={async (event) => {
                        const nextValue = event.target.value.replace(/\D/g, '');
                        setPincode(nextValue);
                        setLocationConfirmed(false);
                        setLocationData(null);
                        setError('');

                        if (nextValue.length >= 2) {
                          const results = await searchPincodes(nextValue);
                          setSuggestions(results);
                        } else {
                          setSuggestions([]);
                        }
                      }}
                      placeholder="Enter 6-digit pincode (e.g. 560001)"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      required
                    />

                    <button
                      type="button"
                      className="button button-small"
                      onClick={() => handleValidatePincode()}
                      disabled={validatingPincode}
                    >
                      {validatingPincode ? 'Checking...' : 'Validate'}
                    </button>

                    {suggestions.length > 0 && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          zIndex: 100,
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '12px',
                          marginTop: '0.35rem',
                          boxShadow: '0 8px 24px var(--shadow-color)',
                          maxHeight: '200px',
                          overflowY: 'auto'
                        }}
                      >
                        {suggestions.map((item) => (
                          <div
                            key={item.pincode}
                            onClick={() => {
                              setPincode(item.pincode);
                              setSuggestions([]);
                            }}
                            style={{
                              padding: '0.6rem 0.85rem',
                              cursor: 'pointer',
                              borderBottom: '1px solid var(--border-color)',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              fontSize: '0.85rem'
                            }}
                          >
                            <div>
                              <strong style={{ color: 'var(--accent-primary)', display: 'block' }}>📍 {item.pincode}</strong>
                              <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{item.officeName}, {item.district}</span>
                            </div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>{item.state}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : null}

            {activeStage === 2 ? (
              <div className="stage-card" style={{ padding: '1.5rem 1.25rem' }}>
                {locationData && pincodeDetails ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    
                    {/* Header Pincode Pill */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <strong style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 800 }}>
                        Location Details
                      </strong>
                      <span style={{ background: 'var(--bg-highlight)', color: 'var(--accent-primary)', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 800, border: '1px solid var(--border-color)' }}>
                        Pincode: {pincodeDetails.pincode}
                      </span>
                    </div>

                    {/* 1. Country Dropdown (Fixed / Disabled) */}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', display: 'block' }}>
                        Country (Fixed)
                      </label>
                      <select
                        disabled
                        style={{
                          width: '100%',
                          height: '44px',
                          borderRadius: '12px',
                          background: 'var(--bg-card-subtle)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--border-color)',
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          padding: '0 0.85rem',
                          cursor: 'not-allowed',
                          opacity: 0.9
                        }}
                      >
                        <option value="India">India 🇮🇳</option>
                      </select>
                    </div>

                    {/* 2. State Dropdown (Fixed / Disabled) */}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', display: 'block' }}>
                        State (Auto-Selected from Pincode)
                      </label>
                      <select
                        disabled
                        style={{
                          width: '100%',
                          height: '44px',
                          borderRadius: '12px',
                          background: 'var(--bg-card-subtle)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--border-color)',
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          padding: '0 0.85rem',
                          cursor: 'not-allowed',
                          opacity: 0.9
                        }}
                      >
                        <option value={pincodeDetails.state}>{pincodeDetails.state}</option>
                      </select>
                    </div>

                    {/* 3. District Dropdown (Fixed / Disabled) */}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', display: 'block' }}>
                        District (Auto-Selected from Pincode)
                      </label>
                      <select
                        disabled
                        style={{
                          width: '100%',
                          height: '44px',
                          borderRadius: '12px',
                          background: 'var(--bg-card-subtle)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--border-color)',
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          padding: '0 0.85rem',
                          cursor: 'not-allowed',
                          opacity: 0.9
                        }}
                      >
                        <option value={pincodeDetails.district}>{pincodeDetails.district}</option>
                      </select>
                    </div>

                    {/* 4. Active Selectable Area Dropdown */}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label htmlFor="areaSelect" style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-primary)', marginBottom: '0.35rem', display: 'block' }}>
                        Select Area / Sub-Locality <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      
                      <select
                        id="areaSelect"
                        className="input"
                        value={selectedArea}
                        onChange={(e) => {
                          const area = e.target.value;
                          setSelectedArea(area);
                          setLocationData({
                            ...locationData,
                            city: area
                          });
                        }}
                        style={{
                          width: '100%',
                          height: '46px',
                          borderRadius: '12px',
                          background: 'var(--bg-card)',
                          color: 'var(--text-primary)',
                          border: '1.5px solid var(--accent-primary)',
                          fontWeight: 700,
                          fontSize: '0.92rem',
                          padding: '0 0.85rem',
                          cursor: 'pointer',
                          boxShadow: '0 2px 8px var(--shadow-color)'
                        }}
                      >
                        {pincodeDetails.areas.map((areaItem, index) => (
                          <option key={index} value={areaItem}>
                            📍 {areaItem}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Location Confirmation Checkbox */}
                    <label
                      className="location-confirmation"
                      style={{
                        background: locationConfirmed ? 'var(--bg-highlight)' : 'var(--bg-card)',
                        border: `1.5px solid ${locationConfirmed ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                        borderRadius: '16px',
                        padding: '1.1rem 1.25rem',
                        transition: 'all 0.2s ease-in-out',
                        cursor: 'pointer',
                        display: 'flex',
                        gap: '0.85rem',
                        alignItems: 'center'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={locationConfirmed}
                        onChange={(event) => setLocationConfirmed(event.target.checked)}
                        style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--accent-primary)' }}
                      />

                      <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                        I confirm that <strong>{selectedArea || locationData.city}</strong>, {pincodeDetails.district}, {pincodeDetails.state}, India is my residential location.
                      </span>
                    </label>

                  </div>
                ) : null}

                <div className="stage-actions" style={{ marginTop: '1.75rem', display: 'flex', gap: '1rem' }}>
                  <button
                    type="button"
                    className="button button-muted"
                    onClick={() => setActiveStage(1)}
                    style={{ flex: 1, borderRadius: '12px', height: '46px', fontWeight: 700 }}
                  >
                    ← Back
                  </button>

                  <button
                    type="button"
                    className="button"
                    onClick={handleStageTwoContinue}
                    style={{ flex: 2, borderRadius: '12px', height: '46px', fontWeight: 800, background: 'var(--accent-gradient)', color: '#ffffff', border: 'none', boxShadow: '0 4px 15px var(--shadow-color)' }}
                  >
                    Continue to Referral →
                  </button>
                </div>
              </div>
            ) : null}

            {activeStage === 3 ? (
              <div className="stage-card">
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
                </div>

                <div className="stage-actions">
                  <button
                    type="button"
                    className="button button-muted"
                    onClick={() => setActiveStage(2)}
                  >
                    Back
                  </button>

                  <button
                    type="submit"
                    className="button onboarding-submit"
                    disabled={saving}
                  >
                    {saving
                      ? 'Completing Profile...'
                      : 'Complete Profile'}
                  </button>
                </div>
              </div>
            ) : null}

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