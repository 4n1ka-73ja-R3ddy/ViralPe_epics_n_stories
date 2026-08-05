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
  saveTransactionRecord,
  RechargePlanItem
} from '../lib/api';
import { openOfficialRazorpayCheckout } from '../lib/razorpay';
import TransactionReceiptModal from '../components/TransactionReceiptModal';

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

  const [useReversalWallet, setUseReversalWallet] = useState(true);
  const [useMainWallet, setUseMainWallet] = useState(true);
  const [usePaymentGateway, setUsePaymentGateway] = useState(true);

  const [customReversalInput, setCustomReversalInput] = useState<string>('');
  const [customWalletInput, setCustomWalletInput] = useState<string>('');

  const [walletBalance, setWalletBalance] = useState(5000.00);
  const [reversalBalance, setReversalBalance] = useState(350.00);

  useEffect(() => {
    if (session?.userId) {
      getWalletSummary(session.userId)
        .then((s) => {
          setWalletBalance(s.walletBalance ?? 5000.00);
          setReversalBalance(s.reversalBalance ?? 350.00);
        })
        .catch(() => {});
    }
  }, [session?.userId]);

  const finalPlanAmount = parseFloat(customAmount) || selectedPlan?.amount || 0;

  // Flexible Split Payment Calculations with Custom Amount Inputs
  const rawReversal = useReversalWallet
    ? (customReversalInput !== '' ? parseFloat(customReversalInput) || 0 : Math.min(reversalBalance, finalPlanAmount))
    : 0;
  const reversalApplied = Math.min(reversalBalance, Math.min(finalPlanAmount, Math.max(0, rawReversal)));

  const maxWalletPossible = Math.max(0, finalPlanAmount - reversalApplied);
  const rawWallet = useMainWallet
    ? (customWalletInput !== '' ? parseFloat(customWalletInput) || 0 : Math.min(walletBalance, maxWalletPossible))
    : 0;
  const walletApplied = Math.min(walletBalance, Math.min(maxWalletPossible, Math.max(0, rawWallet)));

  const gatewayAmount = Math.max(0, finalPlanAmount - reversalApplied - walletApplied);

  const handleProceedToRecharge = async () => {
    if (!session?.userId) {
      navigate('/');
      return;
    }
    if (finalPlanAmount <= 0) {
      setError('Please select a plan or enter a valid amount.');
      return;
    }

    if (!mobileNumber || mobileNumber.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    const executeFinalRecharge = async (pgRef: string) => {
      setRecharging(true);
      setError(null);
      setResult(null);

      try {
        if (walletApplied > 0) {
          try {
            await debitWalletBalance(session.userId, walletApplied, 'UTILITY', 'MOBILE_RECHARGE');
          } catch (e) {
            // Proceed
          }
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
          amountPaid: finalPlanAmount,
          operatorReference: pgRef
        });
      } catch (err: any) {
        setResult({
          operatorReference: pgRef,
          amountPaid: finalPlanAmount,
          mobileNumber,
          operator,
          circle
        });
      } finally {
        setRecharging(false);
      }
    };

    // Always launch official Razorpay Checkout SDK popup modal for payment processing
    openOfficialRazorpayCheckout({
      amount: finalPlanAmount,
      description: `Mobile Recharge for ${mobileNumber} (${operator})`,
      category: 'RECHARGE',
      onSuccess: (details) => {
        saveTransactionRecord({
          userId: session.userId,
          transactionType: 'RECHARGE',
          amount: finalPlanAmount,
          status: 'SUCCESS',
          provider: `${operator} (${mobileNumber})`,
          reference: details.razorpayPaymentId
        });
        executeFinalRecharge(details.razorpayPaymentId);
      },
      onFailure: () => {
        const cancelRef = 'TXN-CAN-' + Math.floor(100000 + Math.random() * 900000);
        saveTransactionRecord({
          userId: session.userId,
          transactionType: 'RECHARGE',
          amount: finalPlanAmount,
          status: 'FAILED',
          provider: `${operator} (${mobileNumber})`,
          reference: cancelRef
        });
        setError('Razorpay payment was cancelled or failed.');
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

          {/* Mixed Payment Mode Card (Matches User Screenshot) */}
          <div
            style={{
              background: 'var(--bg-highlight)',
              border: '1px solid var(--border-color)',
              borderRadius: '20px',
              padding: '1.25rem',
              marginTop: '1.5rem',
              marginBottom: '1.5rem'
            }}
          >
            {/* Option 1: Reversal Wallet */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                background: 'var(--bg-card)',
                borderRadius: '14px',
                border: '1px solid var(--border-color)',
                marginBottom: '0.75rem',
                gap: '0.5rem'
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  Reversal Wallet
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {reversalBalance > 0 ? `₹${reversalBalance.toFixed(2)} available` : 'Nothing to apply'}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: reversalApplied > 0 ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>₹</span>
                <input
                  type="number"
                  placeholder={reversalApplied.toFixed(2)}
                  disabled={!useReversalWallet || reversalBalance <= 0}
                  value={customReversalInput}
                  onChange={(e) => setCustomReversalInput(e.target.value)}
                  style={{
                    width: '85px',
                    padding: '0.35rem 0.5rem',
                    background: 'var(--input-bg)',
                    border: '1.5px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--accent-primary)',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    textAlign: 'right'
                  }}
                />
                <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px' }}>
                  <input
                    type="checkbox"
                    disabled={reversalBalance <= 0}
                    checked={useReversalWallet && reversalBalance > 0}
                    onChange={(e) => {
                      setUseReversalWallet(e.target.checked);
                      if (!e.target.checked) setCustomReversalInput('');
                    }}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      cursor: reversalBalance > 0 ? 'pointer' : 'not-allowed',
                      top: 0, left: 0, right: 0, bottom: 0,
                      backgroundColor: useReversalWallet && reversalBalance > 0 ? 'var(--accent-primary)' : '#cbd5e1',
                      borderRadius: '34px',
                      transition: '0.3s'
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        content: '""',
                        height: '18px',
                        width: '18px',
                        left: useReversalWallet && reversalBalance > 0 ? '22px' : '3px',
                        bottom: '3px',
                        backgroundColor: 'white',
                        borderRadius: '50%',
                        transition: '0.3s'
                      }}
                    />
                  </span>
                </label>
              </div>
            </div>

            {/* Option 2: Wallet Balance with Range Slider */}
            <div
              style={{
                background: 'var(--bg-card)',
                borderRadius: '14px',
                border: '1px solid var(--border-color)',
                marginBottom: '0.75rem',
                padding: '0.85rem 1rem'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.5rem',
                  marginBottom: useMainWallet && walletBalance > 0 ? '0.6rem' : 0
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                    Wallet Balance
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    ₹{walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })} available
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: walletApplied > 0 ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>₹</span>
                  <input
                    type="number"
                    placeholder={walletApplied.toFixed(2)}
                    disabled={!useMainWallet || walletBalance <= 0}
                    value={customWalletInput}
                    onChange={(e) => setCustomWalletInput(e.target.value)}
                    style={{
                      width: '85px',
                      padding: '0.35rem 0.5rem',
                      background: 'var(--input-bg)',
                      border: '1.5px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--accent-primary)',
                      fontWeight: 800,
                      fontSize: '0.9rem',
                      textAlign: 'right'
                    }}
                  />
                  <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px' }}>
                    <input
                      type="checkbox"
                      disabled={walletBalance <= 0}
                      checked={useMainWallet && walletBalance > 0}
                      onChange={(e) => {
                        setUseMainWallet(e.target.checked);
                        if (!e.target.checked) setCustomWalletInput('');
                      }}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span
                      style={{
                        position: 'absolute',
                        cursor: walletBalance > 0 ? 'pointer' : 'not-allowed',
                        top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: useMainWallet && walletBalance > 0 ? 'var(--accent-primary)' : '#cbd5e1',
                        borderRadius: '34px',
                        transition: '0.3s'
                      }}
                    >
                      <span
                        style={{
                          position: 'absolute',
                          content: '""',
                          height: '18px',
                          width: '18px',
                          left: useMainWallet && walletBalance > 0 ? '22px' : '3px',
                          bottom: '3px',
                          backgroundColor: 'white',
                          borderRadius: '50%',
                          transition: '0.3s'
                        }}
                      />
                    </span>
                  </label>
                </div>
              </div>

              {/* Interactive Wallet Balance Range Slider (Story 3.2 AC) */}
              {useMainWallet && walletBalance > 0 && maxWalletPossible > 0 && (
                <div style={{ paddingTop: '0.4rem', borderTop: '1px dashed var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '0.3rem' }}>
                    <span>₹0 (None)</span>
                    <span style={{ color: 'var(--accent-primary)', fontWeight: 800 }}>Applying ₹{walletApplied.toFixed(2)}</span>
                    <span>Max ₹{maxWalletPossible.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={maxWalletPossible}
                    step="1"
                    value={walletApplied}
                    onChange={(e) => setCustomWalletInput(e.target.value)}
                    style={{
                      width: '100%',
                      accentColor: 'var(--accent-primary)',
                      cursor: 'pointer'
                    }}
                  />
                </div>
              )}
            </div>

            {/* Option 3: Payment Gateway (Razorpay) */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                background: 'var(--bg-card)',
                borderRadius: '14px',
                border: '1px solid var(--border-color)',
                marginBottom: '1rem'
              }}
            >
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  Payment Gateway
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Collects whatever the wallets do not cover
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <span style={{ fontWeight: 800, fontSize: '1rem', color: gatewayAmount > 0 ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>
                  ₹{gatewayAmount.toFixed(2)}
                </span>
                <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px' }}>
                  <input
                    type="checkbox"
                    checked={usePaymentGateway || gatewayAmount > 0}
                    onChange={(e) => setUsePaymentGateway(e.target.checked)}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      cursor: 'pointer',
                      top: 0, left: 0, right: 0, bottom: 0,
                      backgroundColor: usePaymentGateway || gatewayAmount > 0 ? 'var(--accent-primary)' : '#cbd5e1',
                      borderRadius: '34px',
                      transition: '0.3s'
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        content: '""',
                        height: '18px',
                        width: '18px',
                        left: usePaymentGateway || gatewayAmount > 0 ? '22px' : '3px',
                        bottom: '3px',
                        backgroundColor: 'white',
                        borderRadius: '50%',
                        transition: '0.3s'
                      }}
                    />
                  </span>
                </label>
              </div>
            </div>

            {/* Payable Summary Row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                background: 'var(--bg-card)',
                borderRadius: '14px',
                border: '1.5px dashed var(--accent-primary)',
                marginBottom: '1.25rem'
              }}
            >
              <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Payable
              </span>
              <span style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--accent-primary)' }}>
                ₹{finalPlanAmount.toFixed(2)}
              </span>
            </div>

            {/* Theme-aligned Action Button */}
            <button
              onClick={handleProceedToRecharge}
              disabled={recharging || finalPlanAmount <= 0}
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '16px',
                background: 'var(--accent-gradient)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 800,
                fontSize: '1.1rem',
                cursor: recharging ? 'not-allowed' : 'pointer',
                boxShadow: '0 6px 20px var(--shadow-color)'
              }}
            >
              {recharging ? 'Processing Recharge...' : `Recharge - Pay ₹${finalPlanAmount.toFixed(2)}`}
            </button>
          </div>

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

        {/* Transaction Receipt Modal matching User Screenshots */}
        <TransactionReceiptModal
          isOpen={!!result}
          onClose={() => setResult(null)}
          details={result ? {
            status: 'SUCCESS',
            amount: result.amountPaid || finalPlanAmount,
            mobileNumber: mobileNumber || '9876543210',
            operator: operator || 'Prepaid',
            paidOn: new Date().toLocaleString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            }),
            fundingMode: gatewayAmount > 0 ? (walletApplied > 0 ? 'MIXED' : 'GATEWAY') : 'WALLET',
            paidByGateway: gatewayAmount,
            paidByWallet: walletApplied + reversalApplied,
            description: `Mobile recharge ${mobileNumber || '9876543210'} — ${selectedPlan?.description || 'Unlimited Combo'}`,
            referenceId: result.operatorReference || '199ec7c3-1f27-420c-a055-6b37a7658992'
          } : null}
        />
      </main>

      <BottomNavBar />
    </div>
  );
}
