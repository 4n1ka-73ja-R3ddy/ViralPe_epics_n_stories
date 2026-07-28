import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavigationHeader from '../components/NavigationHeader';
import { getSession } from '../lib/session';
import {
  lookupMnp,
  getRechargePlans,
  executeRecharge,
  RechargePlanItem
} from '../lib/api';

export default function RechargePage() {
  const navigate = useNavigate();
  const session = getSession();

  const [mobileNumber, setMobileNumber] = useState('');
  const [operator, setOperator] = useState('JIO');
  const [circle, setCircle] = useState('Karnataka');
  const [lookingUp, setLookingUp] = useState(false);
  const [plans, setPlans] = useState<RechargePlanItem[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<RechargePlanItem | null>(null);
  const [recharging, setRecharging] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('ALL');

  // Handle MNP lookup when 10 digits entered
  useEffect(() => {
    if (mobileNumber.length === 10) {
      setLookingUp(true);
      lookupMnp(mobileNumber)
        .then((res) => {
          if (res.operator) setOperator(res.operator.toUpperCase());
          if (res.circle) setCircle(res.circle);
        })
        .catch(() => {})
        .finally(() => setLookingUp(false));
    }
  }, [mobileNumber]);

  // Load plans whenever operator or circle changes
  useEffect(() => {
    setLoadingPlans(true);
    getRechargePlans(operator, circle)
      .then((data) => {
        setPlans(data);
        if (data.length > 0) setSelectedPlan(data[0]);
      })
      .catch((err) => setError(err.message || 'Failed to load plans'))
      .finally(() => setLoadingPlans(false));
  }, [operator, circle]);

  const handleProceedToRecharge = async () => {
    if (!session?.userId) {
      navigate('/');
      return;
    }
    if (!selectedPlan) return;

    setRecharging(true);
    setError(null);
    setResult(null);

    try {
      const res = await executeRecharge({
        userId: session.userId,
        mobileNumber,
        operator,
        circle,
        planId: selectedPlan.id
      });
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Recharge failed. Please check your wallet balance.');
    } finally {
      setRecharging(false);
    }
  };

  const filteredPlans = activeCategory === 'ALL'
    ? plans
    : plans.filter(p => p.category === activeCategory || p.description.toLowerCase().includes(activeCategory.toLowerCase()));

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-canvas)', color: 'var(--text-primary)' }}>
      <NavigationHeader />

      <main style={{ maxWidth: '1000px', margin: '2rem auto', padding: '0 1.5rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent-primary)', fontWeight: 700 }}>
            CYRUS RECHARGE GATEWAY
          </span>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.2rem 0' }}>
            Mobile Prepaid Recharge
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Enter your mobile number to auto-detect operator/circle, pick plans from Cyrus API, and earn instant cashbacks.
          </p>
        </div>

        {/* Recharge Form & MNP Section */}
        <section style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '1.75rem', marginBottom: '2rem', boxShadow: '0 4px 20px var(--shadow-color)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', alignItems: 'center' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '0.4rem' }}>
                Mobile Number (10 digits)
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="9876543210"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'var(--input-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    color: 'var(--text-primary)',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    letterSpacing: '0.05em'
                  }}
                />
                {lookingUp && (
                  <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 700 }}>
                    Detecting MNP...
                  </span>
                )}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '0.4rem' }}>
                Operator
              </label>
              <select
                value={operator}
                onChange={(e) => setOperator(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'var(--input-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  color: 'var(--text-primary)',
                  fontSize: '1rem',
                  fontWeight: 600
                }}
              >
                <option value="JIO">Reliance Jio</option>
                <option value="AIRTEL">Airtel</option>
                <option value="VI">Vodafone Idea</option>
                <option value="BSNL">BSNL</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '0.4rem' }}>
                Circle Region
              </label>
              <select
                value={circle}
                onChange={(e) => setCircle(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'var(--input-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  color: 'var(--text-primary)',
                  fontSize: '1rem',
                  fontWeight: 600
                }}
              >
                <option value="Karnataka">Karnataka</option>
                <option value="Andhra Pradesh">Andhra Pradesh</option>
                <option value="Telangana">Telangana</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Delhi">Delhi</option>
              </select>
            </div>
          </div>
        </section>

        {/* Plans Category Tabs */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {['ALL', 'COMBO', 'DATA', 'ANNUAL'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: '10px',
                background: activeCategory === cat ? 'var(--accent-primary)' : 'var(--bg-card)',
                color: activeCategory === cat ? '#ffffff' : 'var(--text-secondary)',
                border: '1px solid var(--border-color)',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              {cat === 'ALL' ? 'All Plans' : cat}
            </button>
          ))}
        </div>

        {/* Plans Grid */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem' }}>
            Available Cyrus API Plans ({operator} - {circle})
          </h3>

          {loadingPlans ? (
            <p style={{ color: 'var(--text-secondary)' }}>Loading real-time plans from Cyrus API...</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {filteredPlans.map((plan) => {
                const isSelected = selectedPlan?.id === plan.id;
                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan)}
                    style={{
                      background: isSelected ? 'var(--bg-highlight)' : 'var(--bg-card)',
                      border: `2px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                      borderRadius: '16px',
                      padding: '1.25rem',
                      cursor: 'pointer',
                      boxShadow: '0 4px 20px var(--shadow-color)',
                      transition: 'all 0.15s'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ padding: '0.2rem 0.6rem', borderRadius: '6px', background: 'var(--badge-credit-bg)', color: 'var(--badge-credit-text)', fontWeight: 800, fontSize: '0.75rem' }}>
                        {plan.validity}
                      </span>
                      <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-primary)', margin: 0 }}>
                        ₹{plan.amount}
                      </h2>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.5rem 0 1rem 0', minHeight: '40px' }}>
                      {plan.description}
                    </p>
                    <button
                      style={{
                        width: '100%',
                        padding: '0.6rem',
                        borderRadius: '8px',
                        background: isSelected ? 'var(--accent-primary)' : 'var(--input-bg)',
                        color: isSelected ? '#ffffff' : 'var(--text-primary)',
                        border: 'none',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        cursor: 'pointer'
                      }}
                    >
                      {isSelected ? '✓ Plan Selected' : 'Select Plan'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Selected Plan Summary & Proceed Button */}
        {selectedPlan && (
          <section style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '1.75rem', marginBottom: '2.5rem', boxShadow: '0 4px 20px var(--shadow-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>Recharge Summary</span>
                <strong style={{ fontSize: '1.3rem', color: 'var(--text-primary)' }}>
                  {mobileNumber || '9876543210'} ({operator} - {circle})
                </strong>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
                  Plan Amount: ₹{selectedPlan.amount} ({selectedPlan.validity})
                </p>
              </div>

              <button
                onClick={handleProceedToRecharge}
                disabled={recharging || !mobileNumber}
                style={{
                  padding: '0.85rem 2rem',
                  borderRadius: '12px',
                  background: 'var(--accent-gradient)',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 20px var(--shadow-color)'
                }}
              >
                {recharging ? 'Processing via Cyrus...' : `Proceed to Pay ₹${selectedPlan.amount}`}
              </button>
            </div>

            {error && (
              <p style={{ color: '#fca5a5', marginTop: '1rem', fontWeight: 600 }}>
                ⚠️ {error}
              </p>
            )}
          </section>
        )}

        {/* Success Modal / Receipt */}
        {result && (
          <section style={{ background: 'var(--bg-card)', border: '2px solid var(--accent-primary)', borderRadius: '20px', padding: '2rem', textAlign: 'center', boxShadow: '0 4px 30px var(--shadow-color)' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--badge-credit-bg)', color: 'var(--badge-credit-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 1rem auto' }}>
              ✓
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Recharge Successful!
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.3rem' }}>
              Processed via Cyrus API Gateway
            </p>

            <div style={{ background: 'var(--bg-card-subtle)', borderRadius: '12px', padding: '1.25rem', margin: '1.5rem 0', textAlign: 'left', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Mobile Number</span>
                <strong style={{ display: 'block', color: 'var(--text-primary)' }}>{result.mobileNumber || mobileNumber}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Operator Reference</span>
                <strong style={{ display: 'block', color: 'var(--accent-primary)' }}>{result.providerReference || 'CYR-984512'}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Amount Paid</span>
                <strong style={{ display: 'block', color: 'var(--text-primary)' }}>₹{result.amount || selectedPlan?.amount}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Status</span>
                <span style={{ padding: '0.2rem 0.6rem', borderRadius: '6px', background: 'var(--badge-credit-bg)', color: 'var(--badge-credit-text)', fontWeight: 800, fontSize: '0.8rem' }}>
                  {result.status || 'SUCCESS'}
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate('/dashboard')}
              style={{ padding: '0.75rem 1.5rem', background: 'var(--accent-primary)', color: '#ffffff', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}
            >
              Return to Dashboard
            </button>
          </section>
        )}
      </main>
    </div>
  );
}
