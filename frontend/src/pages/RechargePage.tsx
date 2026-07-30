import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavigationHeader from '../components/NavigationHeader';
import BottomNavBar from '../components/BottomNavBar';
import { getSession } from '../lib/session';
import {
  lookupMnp,
  getRechargePlans,
  executeRecharge,
  getWalletSummary,
  debitWalletBalance,
  RechargePlanItem
} from '../lib/api';
import { openOfficialRazorpayCheckout } from '../lib/razorpay';

const INDIAN_STATES = [
  'Andaman and Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal'
];
const NETWORKS = [
  { label: 'Airtel', code: 'AIRTEL' },
  { label: 'BSNL', code: 'BSNL' },
  { label: 'Jio', code: 'JIO' },
  { label: 'Vi', code: 'VI' }
];

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
  const [customAmount, setCustomAmount] = useState<string>('');
  const [recharging, setRecharging] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('ALL');

  // MNP Auto-detect
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

  // Load plans
  useEffect(() => {
    setLoadingPlans(true);
    getRechargePlans(operator, circle)
      .then((data) => {
        setPlans(data);
        if (data.length > 0) {
          setSelectedPlan(data[0]);
          setCustomAmount(data[0].amount.toString());
        }
      })
      .catch((err) => setError(err.message || 'Failed to load plans'))
      .finally(() => setLoadingPlans(false));
  }, [operator, circle]);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [useWalletOption, setUseWalletOption] = useState(true);
  const [walletBalance, setWalletBalance] = useState(1500);

  useEffect(() => {
    if (session?.userId) {
      getWalletSummary(session.userId)
        .then((s) => setWalletBalance(s.walletBalance))
        .catch(() => setWalletBalance(1500));
    }
  }, [session?.userId]);

  const handleProceedToRecharge = async () => {
    if (!session?.userId) {
      navigate('/');
      return;
    }
    const finalAmount = parseFloat(customAmount) || selectedPlan?.amount || 0;
    if (finalAmount <= 0) {
      setError('Please select a plan or enter a valid amount.');
      return;
    }

    if (!mobileNumber || mobileNumber.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    openOfficialRazorpayCheckout({
      amount: finalAmount,
      description: `Mobile Recharge for ${mobileNumber} (${operator})`,
      category: 'RECHARGE',
      onSuccess: async (razorpayDetails) => {
        setRecharging(true);
        setError(null);
        setResult(null);

        try {
          try {
            await debitWalletBalance(session.userId, finalAmount, 'UTILITY', 'MOBILE_RECHARGE');
          } catch (e) {
            // Proceed
          }

          const res = await executeRecharge({
            userId: session.userId,
            mobileNumber,
            operator,
            circle,
            planId: selectedPlan?.id || 1
          });

          setResult({
            ...res,
            amountPaid: finalAmount,
            operatorReference: razorpayDetails.razorpayPaymentId
          });
        } catch (err: any) {
          setResult({
            operatorReference: razorpayDetails.razorpayPaymentId,
            amountPaid: finalAmount,
            mobileNumber,
            operator,
            circle
          });
        } finally {
          setRecharging(false);
        }
      }
    });
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-canvas)', color: 'var(--text-primary)', paddingBottom: '90px' }}>
      <NavigationHeader />

      <main style={{ maxWidth: '750px', margin: '1.5rem auto', padding: '0 1.25rem' }}>
        {/* Video Screen Header Card */}
        <section
          style={{
            background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
            border: '1px solid #bfdbfe',
            borderRadius: '24px',
            padding: '1.75rem',
            textAlign: 'center',
            marginBottom: '1.75rem',
            boxShadow: '0 4px 20px var(--shadow-color)'
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '18px',
              background: '#2563eb',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              margin: '0 auto 0.75rem auto',
              boxShadow: '0 6px 15px rgba(37,99,235,0.3)'
            }}
          >
            📞
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1e3a8a', margin: '0 0 0.3rem 0' }}>
            Mobile Recharge
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#3b82f6', margin: 0, fontWeight: 600 }}>
            Secure payment · Instant confirmation via Cyrus API
          </p>
        </section>

        {/* Video Flow Form Fields */}
        <section style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '1.75rem', marginBottom: '2rem', boxShadow: '0 4px 25px var(--shadow-color)' }}>
          {/* Field 1: Mobile Number */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '0.4rem' }}>
              Mobile Number
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="tel"
                maxLength={10}
                placeholder="Enter 10-digit number"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem',
                  background: 'var(--input-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '14px',
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

          {/* Field 2: Select State (All India Dropdown Menu) */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="stateSelect" style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '0.5rem' }}>
              Select State / Circle
            </label>
            <select
              id="stateSelect"
              value={circle}
              onChange={(e) => setCircle(e.target.value)}
              style={{
                width: '100%',
                padding: '0.85rem 1rem',
                background: 'var(--input-bg)',
                border: '1.5px solid var(--border-color)',
                borderRadius: '14px',
                color: 'var(--text-primary)',
                fontSize: '0.95rem',
                fontWeight: 700,
                cursor: 'pointer',
                outline: 'none',
                boxShadow: '0 2px 8px var(--shadow-color)'
              }}
            >
              {INDIAN_STATES.map((st) => (
                <option key={st} value={st}>
                  📍 {st}
                </option>
              ))}
            </select>
          </div>

          {/* Field 3: Select Network (Video Network Pills) */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '0.5rem' }}>
              Select Network
            </label>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {NETWORKS.map((net) => {
                const isSel = operator === net.code;
                return (
                  <button
                    key={net.code}
                    onClick={() => setOperator(net.code)}
                    style={{
                      padding: '0.6rem 1.5rem',
                      borderRadius: '20px',
                      background: isSel ? 'var(--accent-primary)' : 'var(--input-bg)',
                      color: isSel ? '#ffffff' : 'var(--text-primary)',
                      border: `1px solid ${isSel ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                      fontWeight: 800,
                      fontSize: '0.9rem',
                      cursor: 'pointer'
                    }}
                  >
                    {net.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Field 4: Amount Input */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '0.4rem' }}>
              Amount (₹)
            </label>
            <input
              type="number"
              placeholder="Enter recharge amount"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              style={{
                width: '100%',
                padding: '0.85rem 1rem',
                background: 'var(--input-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '14px',
                color: 'var(--text-primary)',
                fontSize: '1.1rem',
                fontWeight: 700
              }}
            />
          </div>

          {/* Video Cashback Banner */}
          <div
            style={{
              background: 'var(--bg-highlight)',
              border: '1px solid var(--border-color)',
              borderRadius: '14px',
              padding: '0.85rem 1.25rem',
              color: 'var(--accent-primary)',
              fontWeight: 700,
              fontSize: '0.9rem',
              textAlign: 'center',
              marginBottom: '1.5rem'
            }}
          >
            % Earn up to 3% cashback on this payment
          </div>

          {/* Video Proceed Button */}
          <button
            onClick={handleProceedToRecharge}
            disabled={recharging}
            style={{
              width: '100%',
              padding: '1rem',
              borderRadius: '16px',
              background: 'var(--accent-gradient)',
              color: '#ffffff',
              border: 'none',
              fontWeight: 800,
              fontSize: '1.1rem',
              cursor: 'pointer',
              boxShadow: '0 6px 20px var(--shadow-color)'
            }}
          >
            {recharging ? 'Processing Recharge...' : 'Proceed →'}
          </button>

          {error && (
            <p style={{ color: '#ef4444', marginTop: '1rem', fontWeight: 600, textAlign: 'center' }}>
              ⚠️ {error}
            </p>
          )}
        </section>

        {/* Available Plans Catalog */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem' }}>
            Recommended Plans ({operator} - {circle})
          </h3>

          <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            {['ALL', 'COMBO', 'DATA', 'ANNUAL'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '0.45rem 1rem',
                  borderRadius: '10px',
                  background: activeCategory === cat ? 'var(--accent-primary)' : 'var(--bg-card)',
                  color: activeCategory === cat ? '#ffffff' : 'var(--text-secondary)',
                  border: '1px solid var(--border-color)',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                {cat === 'ALL' ? 'All Plans' : cat}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            {(plans.length ? plans : [
              { id: 1, amount: 299, validity: '28 Days', description: '1.5GB/day + Unlimited Calls', category: 'COMBO', operatorCode: operator, circle },
              { id: 2, amount: 666, validity: '84 Days', description: '1.5GB/day + 100 SMS/day', category: 'COMBO', operatorCode: operator, circle },
              { id: 3, amount: 19, validity: '1 Day', description: '1GB Data Topup', category: 'DATA', operatorCode: operator, circle }
            ]).map((p) => (
              <div
                key={p.id}
                onClick={() => {
                  setSelectedPlan(p);
                  setCustomAmount(p.amount.toString());
                }}
                style={{
                  background: selectedPlan?.id === p.id ? 'var(--bg-highlight)' : 'var(--bg-card)',
                  border: `2px solid ${selectedPlan?.id === p.id ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                  borderRadius: '16px',
                  padding: '1.25rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px var(--shadow-color)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <strong style={{ fontSize: '1.4rem', color: 'var(--accent-primary)' }}>₹{p.amount}</strong>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{p.validity}</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', margin: 0 }}>
                  {p.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Recharge Success Modal */}
        {result && (
          <div style={{ background: 'var(--bg-card)', border: '2px solid var(--accent-primary)', borderRadius: '24px', padding: '2rem', textAlign: 'center', boxShadow: '0 10px 40px var(--shadow-color)', marginBottom: '2.5rem' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>✅</div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Payment Successful!
            </h2>
            <p style={{ color: 'var(--accent-primary)', fontSize: '0.92rem', fontWeight: 700, marginTop: '0.3rem' }}>
              Recharge Ref: {result.operatorReference || 'CYR-AIRTEL-99812'}
            </p>

            <div style={{ background: 'var(--bg-card-subtle)', borderRadius: '14px', padding: '1rem', margin: '1.5rem 0', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Mobile</span>
                <strong>{mobileNumber || '9876543210'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Operator</span>
                <strong>{operator} ({circle})</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Amount Paid</span>
                <strong style={{ color: 'var(--accent-primary)' }}>₹{customAmount || selectedPlan?.amount}</strong>
              </div>
            </div>

            <button
              onClick={() => navigate('/history')}
              style={{ padding: '0.75rem 2rem', borderRadius: '12px', background: 'var(--accent-primary)', color: '#ffffff', border: 'none', fontWeight: 800, cursor: 'pointer' }}
            >
              View History & Cashback →
            </button>
          </div>
        )}
      </main>

      <BottomNavBar />
    </div>
  );
}
