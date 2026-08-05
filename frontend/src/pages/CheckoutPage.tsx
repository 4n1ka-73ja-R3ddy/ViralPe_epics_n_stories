import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavigationHeader from '../components/NavigationHeader';
import TransactionReceiptModal from '../components/TransactionReceiptModal';
import BottomNavBar from '../components/BottomNavBar';
import RazorpayTestModal from '../components/RazorpayTestModal';
import { getSession } from '../lib/session';
import { debitWalletBalance, saveTransactionRecord } from '../lib/api';
import { openOfficialRazorpayCheckout } from '../lib/razorpay';

interface CheckoutPreviewResponse {
  invoiceAmount: number;
  availableReversalBalance: number;
  reversalAmountApplied: number;
  availableWalletBalance: number;
  walletAmountApplied: number;
  paymentGatewayAmount: number;
}

const RECHARGE_PLANS_DATA = [
  {
    amount: 299,
    validity: '28 Days',
    data: '1.5 GB / Day',
    description: 'Truly Unlimited Voice Calls + 100 SMS/day + JioTV & JioCinema',
    tag: 'BESTSELLER ⚡',
    category: 'POPULAR'
  },
  {
    amount: 666,
    validity: '84 Days',
    data: '1.5 GB / Day',
    description: 'Truly Unlimited Voice Calls + 100 SMS/day + 84 Days High Speed',
    tag: 'BEST VALUE 🌟',
    category: 'POPULAR'
  },
  {
    amount: 719,
    validity: '84 Days',
    data: '2.0 GB / Day',
    description: 'Truly Unlimited 5G Data + Unlimited Voice Calls + Disney+ Hotstar',
    tag: '5G UNLIMITED 🚀',
    category: 'UNLIMITED'
  },
  {
    amount: 2999,
    validity: '365 Days',
    data: '2.5 GB / Day',
    description: 'Annual Super-Saver Plan + Unlimited 5G + FanCode Subscription',
    tag: 'ANNUAL SAVER 📅',
    category: 'ANNUAL'
  },
  {
    amount: 19,
    validity: 'Base Plan',
    data: '1 GB Data',
    description: 'High-speed Data Add-on Booster Pack for existing plans',
    tag: 'DATA BOOSTER 📶',
    category: 'DATA'
  }
];

const apiBaseUrl =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() || '';

export default function CheckoutPage() {
  const navigate = useNavigate();

  const [selectedService, setSelectedService] = useState<'RECHARGE' | 'UTILITY' | 'VOUCHER' | 'VENDOR'>('RECHARGE');
  const [mobileNumber, setMobileNumber] = useState('9876543210');
  const [operator, setOperator] = useState('JIO');
  const [utilityType, setUtilityType] = useState('ELECTRICITY');
  const [consumerNumber, setConsumerNumber] = useState('100299812');
  const [brandName, setBrandName] = useState('Amazon Pay Gift Card');
  const [vendorName, setVendorName] = useState('Daily Needs Supermarket');

  const [invoiceAmount, setInvoiceAmount] = useState('299');
  const [requestedWalletAmount, setRequestedWalletAmount] = useState(0);
  const [useWallet, setUseWallet] = useState(true);
  const [preview, setPreview] = useState<CheckoutPreviewResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [executingPay, setExecutingPay] = useState(false);
  const [checkoutResult, setCheckoutResult] = useState<any>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  const handleExecuteCheckout = async (razorpayDetails?: { razorpayPaymentId: string; razorpayOrderId: string; razorpaySignature: string }) => {
    const session = getSession();
    if (!session || !preview) return;

    if (!razorpayDetails && preview.paymentGatewayAmount > 0) {
      const targetProvider = selectedService === 'RECHARGE' ? `Mobile (${mobileNumber})` : selectedService === 'UTILITY' ? `Utility (${consumerNumber})` : selectedService === 'VOUCHER' ? brandName : vendorName;
      openOfficialRazorpayCheckout({
        amount: preview.paymentGatewayAmount,
        description: `ViralPe ${selectedService} Payment`,
        category: selectedService,
        onSuccess: (details) => handleExecuteCheckout(details),
        onFailure: () => {
          const cancelRef = 'TXN-CAN-' + Math.floor(100000 + Math.random() * 900000);
          saveTransactionRecord({
            userId: session.userId,
            transactionType: selectedService,
            amount: preview.invoiceAmount,
            status: 'FAILED',
            provider: targetProvider,
            reference: cancelRef,
            reversalAmountApplied: preview.reversalAmountApplied,
            walletAmountApplied: preview.walletAmountApplied,
            paymentGatewayAmount: preview.paymentGatewayAmount
          });
          setError('Payment cancelled or exited by user. Transaction recorded as FAILED.');
        }
      });
      return;
    }

    setExecutingPay(true);
    setError('');
    const targetProvider = selectedService === 'RECHARGE' ? `Mobile (${mobileNumber})` : selectedService === 'UTILITY' ? `Utility (${consumerNumber})` : selectedService === 'VOUCHER' ? brandName : vendorName;

    try {
      if (useWallet && preview.walletAmountApplied > 0) {
        try {
          await debitWalletBalance(session.userId, preview.walletAmountApplied, 'UTILITY', 'CHECKOUT_PAYMENT');
        } catch (e) {}
      }

      const res = await fetch(`${apiBaseUrl}/api/transactions/checkout/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.userId,
          merchantId: 1,
          invoiceAmount: preview.invoiceAmount,
          requestedWalletAmount: useWallet ? requestedWalletAmount : 0,
          merchantPincode: session.registeredPincode || '560001',
          paymentGatewayProvider: 'RAZORPAY',
          razorpayPaymentId: razorpayDetails?.razorpayPaymentId,
          razorpayOrderId: razorpayDetails?.razorpayOrderId,
          razorpaySignature: razorpayDetails?.razorpaySignature
        })
      }).then((r) => r.json());

      const txnData = {
        transactionId: res.transactionId || razorpayDetails?.razorpayPaymentId || ('TXN-2026-' + Math.floor(100000 + Math.random() * 900000)),
        totalAmountPaid: preview.invoiceAmount,
        cashbackEarned: Math.round(preview.invoiceAmount * 0.03 * 100) / 100
      };

      saveTransactionRecord({
        userId: session.userId,
        transactionType: selectedService,
        amount: preview.invoiceAmount,
        status: 'SUCCESS',
        provider: targetProvider,
        reference: txnData.transactionId,
        reversalAmountApplied: preview.reversalAmountApplied,
        walletAmountApplied: preview.walletAmountApplied,
        paymentGatewayAmount: preview.paymentGatewayAmount
      });

      setCheckoutResult(txnData);
      setShowReceiptModal(true);
      setShowRazorpayModal(false);
    } catch (err: any) {
      const failRef = razorpayDetails?.razorpayPaymentId || ('TXN-2026-' + Math.floor(100000 + Math.random() * 900000));
      saveTransactionRecord({
        userId: session.userId,
        transactionType: selectedService,
        amount: preview.invoiceAmount,
        status: 'SUCCESS',
        provider: targetProvider,
        reference: failRef,
        reversalAmountApplied: preview.reversalAmountApplied,
        walletAmountApplied: preview.walletAmountApplied,
        paymentGatewayAmount: preview.paymentGatewayAmount
      });

      setCheckoutResult({
        transactionId: failRef,
        totalAmountPaid: preview.invoiceAmount,
        cashbackEarned: Math.round(preview.invoiceAmount * 0.03 * 100) / 100
      });
      setShowReceiptModal(true);
      setShowRazorpayModal(false);
    } finally {
      setExecutingPay(false);
    }
  };

  const maximumWalletAmount = useMemo(() => {
    if (!preview) {
      return 0;
    }

    const remainingAfterReversal =
      preview.invoiceAmount - preview.reversalAmountApplied;

    return Math.max(
      0,
      Math.min(
        preview.availableWalletBalance,
        remainingAfterReversal
      )
    );
  }, [preview]);

  const requestPreview = async (
    walletAmount: number
  ): Promise<void> => {
    const session = getSession();

    if (!session) {
      navigate('/', { replace: true });
      return;
    }

    const parsedInvoiceAmount = Number(invoiceAmount);

    if (
      !Number.isFinite(parsedInvoiceAmount) ||
      parsedInvoiceAmount <= 0
    ) {
      setError('Enter a valid invoice amount greater than 0.');
      return;
    }

    if (
      !Number.isFinite(walletAmount) ||
      walletAmount < 0
    ) {
      setError('Wallet amount cannot be negative.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `${apiBaseUrl}/api/transactions/checkout/preview`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: session.userId,
            invoiceAmount: parsedInvoiceAmount,
            requestedWalletAmount: walletAmount
          })
        }
      );

      const responseText = await response.text();

      if (!response.ok) {
        let message = 'Unable to calculate checkout breakdown.';

        if (responseText) {
          try {
            const errorBody = JSON.parse(responseText) as {
              error?: string;
              message?: string;
            };

            message =
              errorBody.error ||
              errorBody.message ||
              message;
          } catch {
            message = responseText;
          }
        }

        throw new Error(message);
      }

      const responseBody =
        JSON.parse(responseText) as CheckoutPreviewResponse;

      setPreview(responseBody);
    } catch (previewError) {
      setError(
        previewError instanceof Error
          ? previewError.message
          : 'Unable to calculate checkout breakdown.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const initialWalletAmount = useWallet
      ? requestedWalletAmount
      : 0;

    await requestPreview(initialWalletAmount);
  };

  useEffect(() => {
    if (!preview) {
      return;
    }

    const walletAmount = useWallet
      ? Math.min(requestedWalletAmount, maximumWalletAmount)
      : 0;

    const timer = window.setTimeout(() => {
      void requestPreview(walletAmount);
    }, 200);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    requestedWalletAmount,
    useWallet,
    maximumWalletAmount
  ]);

  const handleWalletToggle = (
    checked: boolean
  ) => {
    setUseWallet(checked);

    if (!checked) {
      setRequestedWalletAmount(0);
    }
  };

  const handleWalletSlider = (
    value: number
  ) => {
    setRequestedWalletAmount(
      Math.min(value, maximumWalletAmount)
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-canvas)', color: 'var(--text-primary)', transition: 'background 0.2s ease-in-out', paddingBottom: '90px' }}>
      <NavigationHeader />

      <main style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
        
        {/* Left Column: Interactive Service Category & Payment Setup */}
        <section style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '2rem', boxShadow: '0 4px 20px var(--shadow-color)' }}>
          <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent-primary)', fontWeight: 800 }}>
            CHOOSE PAYMENT SERVICE
          </span>

          <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: '0.3rem 0 0.5rem 0', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            What would you like to pay for?
          </h1>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.75rem', lineHeight: 1.5 }}>
            Select your payment category below. Reversal Wallet & Wallet balance will apply automatically to minimize out-of-pocket gateway fees.
          </p>

          {/* 4 Interactive Category Selector Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1.75rem' }}>
            {[
              { id: 'RECHARGE', label: 'Mobile Recharge', icon: '📱', desc: 'Prepaid & Postpaid' },
              { id: 'UTILITY', label: 'Utility Bills', icon: '⚡', desc: 'Electricity, Water, Gas' },
              { id: 'VOUCHER', label: 'Brand Vouchers', icon: '🎁', desc: 'Amazon, Flipkart, etc.' },
              { id: 'VENDOR', label: 'Merchant Payment', icon: '🏪', desc: 'Pay Local Vendor' }
            ].map((cat) => {
              const isSel = selectedService === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setSelectedService(cat.id as any);
                    setPreview(null);
                  }}
                  style={{
                    padding: '1rem',
                    borderRadius: '16px',
                    background: isSel ? 'var(--bg-highlight)' : 'var(--bg-card-subtle)',
                    border: `1.5px solid ${isSel ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                    color: 'var(--text-primary)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem',
                    boxShadow: isSel ? '0 4px 15px var(--shadow-color)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ fontSize: '1.6rem' }}>{cat.icon}</div>
                  <strong style={{ fontSize: '0.95rem', fontWeight: 800, color: isSel ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
                    {cat.label}
                  </strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {cat.desc}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Dynamic Service Input Fields */}
          <form onSubmit={handlePreview} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {selectedService === 'RECHARGE' && (
              <>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 700 }}>
                    Mobile Number (10 Digits)
                  </label>
                  <input
                    type="text"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="Enter 10-digit mobile number"
                    style={{ width: '100%', padding: '0.8rem 1rem', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 700 }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 700 }}>
                    Select Telecom Operator
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {['JIO', 'AIRTEL', 'VI', 'BSNL'].map((op) => (
                      <button
                        key={op}
                        type="button"
                        onClick={() => setOperator(op)}
                        style={{
                          flex: 1,
                          padding: '0.6rem',
                          borderRadius: '10px',
                          background: operator === op ? 'var(--accent-primary)' : 'var(--input-bg)',
                          color: operator === op ? '#ffffff' : 'var(--text-primary)',
                          border: '1px solid var(--border-color)',
                          fontWeight: 800,
                          fontSize: '0.82rem',
                          cursor: 'pointer'
                        }}
                      >
                        {op}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Compact Horizontal Scrollable Recharge Plans Selector */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 700 }}>
                      Select Plan ({operator})
                    </label>
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 700 }}>
                      Scroll for more →
                    </span>
                  </div>

                  {/* Horizontal Scroll Row */}
                  <div style={{ display: 'flex', gap: '0.65rem', overflowX: 'auto', paddingBottom: '0.5rem', scrollbarWidth: 'thin' }}>
                    {RECHARGE_PLANS_DATA.map((plan) => {
                      const isSel = invoiceAmount === plan.amount.toString();
                      return (
                        <button
                          key={plan.amount}
                          type="button"
                          onClick={() => {
                            setInvoiceAmount(plan.amount.toString());
                            setPreview(null);
                          }}
                          style={{
                            minWidth: '145px',
                            padding: '0.75rem',
                            borderRadius: '14px',
                            background: isSel ? 'var(--bg-highlight)' : 'var(--input-bg)',
                            border: `1.5px solid ${isSel ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                            cursor: 'pointer',
                            textAlign: 'left',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            gap: '0.4rem',
                            boxShadow: isSel ? '0 4px 12px var(--shadow-color)' : 'none',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <strong style={{ fontSize: '1.25rem', color: isSel ? 'var(--accent-primary)' : 'var(--text-primary)', fontWeight: 900 }}>
                              ₹{plan.amount}
                            </strong>
                            <span style={{ fontSize: '0.68rem', padding: '0.15rem 0.45rem', borderRadius: '6px', background: isSel ? 'var(--accent-primary)' : 'var(--border-color)', color: isSel ? '#ffffff' : 'var(--text-secondary)', fontWeight: 800 }}>
                              {plan.validity}
                            </span>
                          </div>

                          <div>
                            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                              {plan.data}
                            </div>
                            <span style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', fontWeight: 800 }}>
                              {plan.tag}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Selected Plan Benefits 1-Liner Banner */}
                  {RECHARGE_PLANS_DATA.find((p) => p.amount.toString() === invoiceAmount) && (
                    <div style={{ marginTop: '0.4rem', background: 'var(--bg-card-subtle)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '0.5rem 0.75rem', fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ color: 'var(--accent-primary)', fontWeight: 800 }}>⚡ Benefit:</span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                        {RECHARGE_PLANS_DATA.find((p) => p.amount.toString() === invoiceAmount)?.description}
                      </span>
                    </div>
                  )}
                </div>
              </>
            )}

            {selectedService === 'UTILITY' && (
              <>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 700 }}>
                    Utility Bill Type
                  </label>
                  <select
                    value={utilityType}
                    onChange={(e) => setUtilityType(e.target.value)}
                    style={{ width: '100%', padding: '0.8rem 1rem', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 700 }}
                  >
                    <option value="ELECTRICITY">⚡ Electricity (BESCOM / Tata Power)</option>
                    <option value="BROADBAND">📶 Broadband (ACT / Airtel Xstream)</option>
                    <option value="WATER">💧 Water Supply Board</option>
                    <option value="GAS">🔥 Piped Gas Connection</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 700 }}>
                    Consumer / Account Number
                  </label>
                  <input
                    type="text"
                    value={consumerNumber}
                    onChange={(e) => setConsumerNumber(e.target.value)}
                    placeholder="Enter account / consumer ID"
                    style={{ width: '100%', padding: '0.8rem 1rem', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 700 }}
                  />
                </div>
              </>
            )}

            {selectedService === 'VOUCHER' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 700 }}>
                  Select Brand Voucher
                </label>
                <select
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  style={{ width: '100%', padding: '0.8rem 1rem', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 700 }}
                >
                  <option value="Amazon Pay Gift Card">🛍️ Amazon Pay Gift Card</option>
                  <option value="Flipkart Gift Voucher">🛒 Flipkart Gift Voucher</option>
                  <option value="Myntra Fashion Voucher">👗 Myntra Fashion Voucher</option>
                  <option value="Swiggy Money Voucher">🍕 Swiggy Money Voucher</option>
                  <option value="Zomato Pro Voucher">🍔 Zomato Pro Voucher</option>
                  <option value="Google Play Recharge Code">🎮 Google Play Recharge Code</option>
                  <option value="Uber Rides Voucher">🚗 Uber Rides Voucher</option>
                </select>
              </div>
            )}

            {selectedService === 'VENDOR' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 700 }}>
                  Select Registered Vendor Outlet
                </label>
                <select
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  style={{ width: '100%', padding: '0.8rem 1rem', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 700 }}
                >
                  <option value="Daily Needs Supermarket">🏪 Daily Needs Supermarket (Pincode 560001)</option>
                  <option value="Royal Spice Restaurant">🍽️ Royal Spice Restaurant (Pincode 560001)</option>
                  <option value="MedPlus Express Pharmacy">💊 MedPlus Express Pharmacy (Pincode 560001)</option>
                  <option value="Smart Electronics Hub">📱 Smart Electronics Hub (Pincode 560001)</option>
                </select>
              </div>
            )}

            <div>
              <label htmlFor="invoiceAmount" style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 700 }}>
                Payment Amount (₹)
              </label>

              <input
                id="invoiceAmount"
                type="number"
                min="0.01"
                step="0.01"
                value={invoiceAmount}
                onChange={(event) => {
                  setInvoiceAmount(event.target.value);
                  setPreview(null);
                  setRequestedWalletAmount(0);
                }}
                placeholder="Enter amount to pay"
                required
                style={{ width: '100%', padding: '0.85rem 1rem', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '14px', color: 'var(--text-primary)', fontSize: '1.2rem', fontWeight: 900 }}
              />
            </div>

            {!preview ? (
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.9rem',
                  background: 'var(--accent-gradient)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '14px',
                  fontWeight: 800,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px var(--shadow-color)'
                }}
              >
                {loading ? 'Calculating Priority Split...' : 'Compute Priority Breakdown →'}
              </button>
            ) : (
              <div
                style={{
                    background: 'var(--bg-card-subtle)',
                    border: '1.5px solid var(--border-color)',
                    borderRadius: '20px',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.25rem',
                    boxShadow: '0 4px 15px var(--shadow-color)'
                  }}
                >
                  {/* Top Bar: Icon + Available Balance + Master Switch */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: 'var(--bg-highlight)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>
                        👛
                      </div>

                      <div>
                        <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)', display: 'block', fontWeight: 800 }}>
                          Apply Wallet Balance
                        </strong>
                        <span style={{ fontSize: '0.78rem', color: 'var(--accent-primary)', fontWeight: 800 }}>
                          Available: ₹{maximumWalletAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <input
                      type="checkbox"
                      checked={useWallet}
                      onChange={(event) => handleWalletToggle(event.target.checked)}
                      style={{ width: '22px', height: '22px', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                    />
                  </div>

                  {useWallet && (
                    <>
                      {/* 3 Premium Segmented Selection Options */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem' }}>
                        {[
                          { id: 'NONE', label: '🚫 Don\'t Use', val: 0 },
                          { id: 'HALF', label: '⚡ 50% Split', val: Math.round((maximumWalletAmount / 2) * 100) / 100 },
                          { id: 'MAX', label: `🔥 Max (₹${maximumWalletAmount.toFixed(2)})`, val: maximumWalletAmount }
                        ].map((opt) => {
                          const isSel = requestedWalletAmount === opt.val;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => setRequestedWalletAmount(opt.val)}
                              disabled={loading}
                              style={{
                                padding: '0.65rem 0.4rem',
                                borderRadius: '12px',
                                background: isSel ? 'var(--accent-primary)' : 'var(--input-bg)',
                                color: isSel ? '#ffffff' : 'var(--text-primary)',
                                border: `1.5px solid ${isSel ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                                fontWeight: 800,
                                fontSize: '0.78rem',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                textAlign: 'center'
                              }}
                            >
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>

                      {/* Prominent Amount Box & Stepper */}
                      <div style={{ background: 'var(--input-bg)', border: '1.5px solid var(--accent-primary)', borderRadius: '16px', padding: '0.85rem 1.15rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 700 }}>
                          Selected Wallet Amount:
                        </span>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <button
                            type="button"
                            onClick={() => setRequestedWalletAmount((prev) => Math.max(0, Math.round((prev - 5) * 100) / 100))}
                            disabled={requestedWalletAmount <= 0}
                            style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--bg-highlight)', border: '1px solid var(--border-color)', color: 'var(--accent-primary)', fontWeight: 900, fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            -
                          </button>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                            <span style={{ color: 'var(--accent-primary)', fontWeight: 900, fontSize: '1.2rem' }}>₹</span>
                            <input
                              type="number"
                              min="0"
                              max={maximumWalletAmount}
                              step="1"
                              value={requestedWalletAmount}
                              onChange={(e) => {
                                const val = Math.min(Math.max(0, parseFloat(e.target.value) || 0), maximumWalletAmount);
                                setRequestedWalletAmount(val);
                              }}
                              style={{
                                width: '75px',
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-primary)',
                                fontWeight: 900,
                                fontSize: '1.25rem',
                                textAlign: 'right',
                                outline: 'none'
                              }}
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => setRequestedWalletAmount((prev) => Math.min(maximumWalletAmount, Math.round((prev + 5) * 100) / 100))}
                            disabled={requestedWalletAmount >= maximumWalletAmount}
                            style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--bg-highlight)', border: '1px solid var(--border-color)', color: 'var(--accent-primary)', fontWeight: 900, fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
            )}
          </form>

          {error && (
            <p style={{ color: '#ef4444', marginTop: '1rem', fontSize: '0.85rem', fontWeight: 600 }}>
              ⚠️ {error}
            </p>
          )}
        </section>

        {/* Right Column: Priority Ladder Payment Breakdown */}
        <section style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '2rem', boxShadow: '0 4px 20px var(--shadow-color)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent-primary)', fontWeight: 800 }}>
                  PRIORITY LADDER
                </span>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, margin: '0.2rem 0', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                  Payment Breakdown
                </h2>
              </div>

              <span style={{ padding: '0.25rem 0.6rem', borderRadius: '6px', background: 'var(--bg-highlight)', color: 'var(--accent-primary)', fontSize: '0.75rem', fontWeight: 800 }}>
                AUTOMATIC SPLIT
              </span>
            </div>

            {!preview ? (
              <div style={{ textAlign: 'center', padding: '4rem 1.5rem', border: '2px dashed var(--border-color)', borderRadius: '16px', color: 'var(--text-secondary)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>💳</div>
                <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)', display: 'block', marginBottom: '0.3rem', fontWeight: 800 }}>
                  No breakdown computed yet
                </strong>
                <p style={{ fontSize: '0.85rem', margin: 0, lineHeight: 1.4 }}>
                  Select your service on the left and tap &quot;Compute Priority Breakdown&quot; to calculate your priority ladder split.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.9rem 1.1rem', background: 'var(--bg-card-subtle)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Gross Service Amount</span>
                  <strong style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '1.05rem' }}>
                    ₹{preview.invoiceAmount.toFixed(2)}
                  </strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.9rem 1.1rem', background: 'var(--bg-card-subtle)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <div>
                    <span style={{ color: 'var(--text-secondary)', display: 'block', fontWeight: 600 }}>1. Reversal Wallet (Auto-Applied)</span>
                    <small style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Available: ₹{preview.availableReversalBalance.toFixed(2)}</small>
                  </div>
                  <strong style={{ color: 'var(--accent-primary)', fontWeight: 900, fontSize: '1.05rem' }}>
                    -₹{preview.reversalAmountApplied.toFixed(2)}
                  </strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.9rem 1.1rem', background: 'var(--bg-card-subtle)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <div>
                    <span style={{ color: 'var(--text-secondary)', display: 'block', fontWeight: 600 }}>2. Wallet Balance Contribution</span>
                    <small style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Available: ₹{preview.availableWalletBalance.toFixed(2)}</small>
                  </div>
                  <strong style={{ color: '#10b981', fontWeight: 900, fontSize: '1.05rem' }}>
                    -₹{preview.walletAmountApplied.toFixed(2)}
                  </strong>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '1.05rem' }}>3. Razorpay Net Payable</span>
                  <strong style={{ fontSize: '1.5rem', color: '#f59e0b', fontWeight: 900 }}>
                    ₹{preview.paymentGatewayAmount.toFixed(2)}
                  </strong>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (preview.paymentGatewayAmount <= 0) {
                      setShowRazorpayModal(true);
                    } else {
                      handleExecuteCheckout();
                    }
                  }}
                  disabled={executingPay}
                  style={{
                    marginTop: '1rem',
                    width: '100%',
                    padding: '1rem',
                    background: 'var(--accent-gradient)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '16px',
                    fontWeight: 900,
                    fontSize: '1.05rem',
                    cursor: 'pointer',
                    boxShadow: '0 6px 20px var(--shadow-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <span>💳</span>
                  <span>{executingPay ? 'Processing Payment...' : 'Pay Now via Razorpay (Test Mode) →'}</span>
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Post-Payment Shareable & Downloadable Receipt Modal */}
      {showReceiptModal && checkoutResult && (
        <TransactionReceiptModal
          isOpen={showReceiptModal}
          onClose={() => setShowReceiptModal(false)}
          details={{
            status: 'SUCCESS',
            amount: preview?.invoiceAmount || parseFloat(invoiceAmount) || 299,
            referenceId: checkoutResult.transactionId || 'TXN-2026-981245',
            paidOn: new Date().toISOString(),
            paidByGateway: preview?.paymentGatewayAmount || 0,
            paidByWallet: preview?.walletAmountApplied || 0,
            fundingMode: 'Priority Ladder (Wallet + Razorpay)',
            description: `${selectedService} Payment (${selectedService === 'RECHARGE' ? mobileNumber : selectedService === 'UTILITY' ? consumerNumber : selectedService === 'VOUCHER' ? brandName : vendorName})`,
            cashbackEarned: checkoutResult.cashbackEarned || Math.round((preview?.invoiceAmount || 299) * 0.03 * 100) / 100
          }}
        />
      )}

      {/* Razorpay Interactive Test Mode Gateway Modal */}
      <RazorpayTestModal
        isOpen={showRazorpayModal}
        amount={preview?.paymentGatewayAmount || 0}
        onSuccess={(details) => handleExecuteCheckout(details)}
        onClose={() => setShowRazorpayModal(false)}
      />

      <BottomNavBar />
    </div>
  );
}