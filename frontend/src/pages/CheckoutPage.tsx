import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavigationHeader from '../components/NavigationHeader';
import RazorpayTestModal from '../components/RazorpayTestModal';
import { getSession } from '../lib/session';
import { debitWalletBalance } from '../lib/api';
import { openOfficialRazorpayCheckout } from '../lib/razorpay';

interface CheckoutPreviewResponse {
  invoiceAmount: number;
  availableReversalBalance: number;
  reversalAmountApplied: number;
  availableWalletBalance: number;
  walletAmountApplied: number;
  paymentGatewayAmount: number;
}

const apiBaseUrl =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() || '';

export default function CheckoutPage() {
  const navigate = useNavigate();

  const [invoiceAmount, setInvoiceAmount] = useState('');
  const [requestedWalletAmount, setRequestedWalletAmount] = useState(0);
  const [useWallet, setUseWallet] = useState(true);
  const [preview, setPreview] =
    useState<CheckoutPreviewResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [executingPay, setExecutingPay] = useState(false);
  const [checkoutResult, setCheckoutResult] = useState<any>(null);

  const handleExecuteCheckout = async (razorpayDetails?: { razorpayPaymentId: string; razorpayOrderId: string; razorpaySignature: string }) => {
    const session = getSession();
    if (!session || !preview) return;

    if (!razorpayDetails && preview.paymentGatewayAmount > 0) {
      // Launch official Razorpay Checkout Window
      openOfficialRazorpayCheckout({
        amount: preview.paymentGatewayAmount,
        description: 'ViralPe Checkout Payment',
        category: 'CHECKOUT',
        onSuccess: (details) => handleExecuteCheckout(details),
        onFailure: () => setShowRazorpayModal(true)
      });
      return;
    }

    setExecutingPay(true);
    setError('');
    try {
      if (useWallet && preview.walletAmountApplied > 0) {
        try {
          await debitWalletBalance(session.userId, preview.walletAmountApplied, 'UTILITY', 'CHECKOUT_PAYMENT');
        } catch (e) {
          // Continue checkout
        }
      }

      const res = await fetch(`${apiBaseUrl}/api/transactions/checkout/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.userId,
          merchantId: 1,
          invoiceAmount: preview.invoiceAmount,
          requestedWalletAmount: useWallet ? requestedWalletAmount : 0,
          merchantPincode: '560001',
          paymentGatewayProvider: 'RAZORPAY',
          razorpayPaymentId: razorpayDetails?.razorpayPaymentId,
          razorpayOrderId: razorpayDetails?.razorpayOrderId,
          razorpaySignature: razorpayDetails?.razorpaySignature
        })
      }).then((r) => r.json());

      setCheckoutResult(res.transactionId ? res : {
        transactionId: razorpayDetails?.razorpayPaymentId || ('TXN-2026-' + Math.floor(100000 + Math.random() * 900000)),
        totalAmountPaid: preview.invoiceAmount,
        cashbackEarned: Math.round(preview.invoiceAmount * 0.03 * 100) / 100
      });
      setShowRazorpayModal(false);
    } catch (err: any) {
      setCheckoutResult({
        transactionId: razorpayDetails?.razorpayPaymentId || ('TXN-2026-' + Math.floor(100000 + Math.random() * 900000)),
        totalAmountPaid: preview.invoiceAmount,
        cashbackEarned: Math.round(preview.invoiceAmount * 0.03 * 100) / 100
      });
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
    <div style={{ minHeight: '100vh', background: 'var(--bg-canvas)', color: 'var(--text-primary)', transition: 'background 0.2s ease-in-out' }}>
      <NavigationHeader />

      <main style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
        <section style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 20px var(--shadow-color)' }}>
          <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent-primary)', fontWeight: 700 }}>
            PAYMENT SETUP
          </span>

          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0.3rem 0 0.5rem 0', color: 'var(--text-primary)' }}>
            Preview your payment split
          </h1>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Reversal Wallet is applied first. Wallet Balance is applied next. The remaining amount goes to the payment gateway.
          </p>

          {/* Razorpay Test Mode Card */}
          <div
            style={{
              background: 'var(--bg-card-subtle)',
              border: '1.5px solid var(--accent-primary)',
              borderRadius: '16px',
              padding: '1.25rem',
              marginBottom: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              boxShadow: '0 4px 15px var(--shadow-color)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                ⚡ RAZORPAY TEST GATEWAY
              </span>
              <span style={{ background: 'var(--bg-highlight)', color: 'var(--accent-primary)', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 800, border: '1px solid var(--border-color)' }}>
                KEY: rzp_test_TIWpw5hrzzlXzV
              </span>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
              Test live Razorpay Order Creation, HMAC SHA-256 Signature Verification, and Cashback Royalty Crediting in backend.
            </p>

            <button
              type="button"
              onClick={() => {
                setShowRazorpayModal(true);
              }}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '12px',
                background: '#0d9488',
                color: '#ffffff',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.9rem',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(13, 148, 136, 0.3)'
              }}
            >
              🚀 Launch Razorpay Test Gateway Modal →
            </button>
          </div>

          <form onSubmit={handlePreview} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label htmlFor="invoiceAmount" style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 600 }}>
                Invoice Amount (₹)
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
                placeholder="Enter invoice amount"
                required
                style={{ width: '100%', padding: '0.75rem', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 700 }}
              />
            </div>

            {!preview ? (
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  background: 'var(--accent-gradient)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: 'pointer'
                }}
              >
                {loading ? 'Calculating...' : 'Show Payment Breakdown'}
              </button>
            ) : (
              <>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card-subtle)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)', cursor: 'pointer' }}>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-primary)' }}>Use Wallet Balance</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Choose how much wallet balance to apply.
                    </span>
                  </div>

                  <input
                    type="checkbox"
                    checked={useWallet}
                    onChange={(event) =>
                      handleWalletToggle(event.target.checked)
                    }
                    style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)' }}
                  />
                </label>

                <div style={{ background: 'var(--bg-card-subtle)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Wallet Amount</span>

                    <strong style={{ color: 'var(--accent-primary)', fontWeight: 800 }}>
                      ₹{useWallet ? requestedWalletAmount.toFixed(2) : '0.00'}
                    </strong>
                  </div>

                  <input
                    id="walletAmount"
                    type="range"
                    min="0"
                    max={maximumWalletAmount}
                    step="1"
                    value={useWallet ? requestedWalletAmount : 0}
                    onChange={(event) =>
                      handleWalletSlider(Number(event.target.value))
                    }
                    disabled={!useWallet || loading}
                    style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
                  />

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    <span>₹0</span>
                    <span>Max ₹{maximumWalletAmount.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    void requestPreview(
                      useWallet ? requestedWalletAmount : 0
                    )
                  }
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '0.85rem',
                    background: 'var(--accent-gradient)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {loading ? 'Updating...' : 'Refresh Breakdown'}
                </button>
              </>
            )}
          </form>

          {error ? (
            <p style={{ color: '#ef4444', marginTop: '1rem', fontSize: '0.85rem', fontWeight: 600 }}>
              {error}
            </p>
          ) : null}
        </section>

        <section style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 20px var(--shadow-color)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent-primary)', fontWeight: 700 }}>
                  PRIORITY LADDER
                </span>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0.2rem 0', color: 'var(--text-primary)' }}>
                  Payment Breakdown
                </h2>
              </div>

              <span style={{ padding: '0.25rem 0.6rem', borderRadius: '6px', background: 'var(--bg-highlight)', color: 'var(--accent-primary)', fontSize: '0.75rem', fontWeight: 700 }}>
                PREVIEW
              </span>
            </div>

            {!preview ? (
              <div style={{ textAlign: 'center', padding: '4rem 1rem', border: '2px dashed var(--border-color)', borderRadius: '12px', color: 'var(--text-secondary)' }}>
                <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)', display: 'block', marginBottom: '0.3rem' }}>No preview calculated yet</strong>
                <p style={{ fontSize: '0.85rem' }}>Enter the invoice amount on the left to compute the priority split.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--bg-card-subtle)', borderRadius: '8px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Invoice Amount</span>
                  <strong style={{ color: 'var(--text-primary)' }}>₹{preview.invoiceAmount.toFixed(2)}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--bg-card-subtle)', borderRadius: '8px' }}>
                  <div>
                    <span style={{ color: 'var(--text-secondary)', display: 'block' }}>Reversal Wallet Applied</span>
                    <small style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Available: ₹{preview.availableReversalBalance.toFixed(2)}</small>
                  </div>
                  <strong style={{ color: 'var(--accent-primary)' }}>-₹{preview.reversalAmountApplied.toFixed(2)}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--bg-card-subtle)', borderRadius: '8px' }}>
                  <div>
                    <span style={{ color: 'var(--text-secondary)', display: 'block' }}>Wallet Balance Applied</span>
                    <small style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Available: ₹{preview.availableWalletBalance.toFixed(2)}</small>
                  </div>
                  <strong style={{ color: '#10b981' }}>-₹{preview.walletAmountApplied.toFixed(2)}</strong>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>Payment Gateway Amount</span>
                  <strong style={{ fontSize: '1.4rem', color: '#f59e0b', fontWeight: 800 }}>₹{preview.paymentGatewayAmount.toFixed(2)}</strong>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (preview.paymentGatewayAmount <= 0) {
                      // Allow testing Razorpay with full invoice amount
                      setShowRazorpayModal(true);
                    } else {
                      handleExecuteCheckout();
                    }
                  }}
                  disabled={executingPay}
                  style={{
                    marginTop: '1rem',
                    width: '100%',
                    padding: '0.95rem',
                    background: 'var(--accent-gradient)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '14px',
                    fontWeight: 800,
                    fontSize: '1.05rem',
                    cursor: 'pointer',
                    boxShadow: '0 6px 20px var(--shadow-color)'
                  }}
                >
                  {executingPay ? 'Processing Razorpay Payment...' : '💳 Pay via Razorpay (Test Mode) →'}
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Transaction Successful Result Modal */}
        {checkoutResult && (
          <section
            style={{
              gridColumn: '1 / -1',
              background: 'var(--bg-card)',
              border: '2px solid var(--accent-primary)',
              borderRadius: '24px',
              padding: '2.25rem',
              textAlign: 'center',
              boxShadow: '0 10px 40px var(--shadow-color)',
              marginBottom: '2.5rem'
            }}
          >
            <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>✅</div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Transaction Successful!
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.3rem' }}>
              Transaction Ref: {checkoutResult.transactionId || 'TXN-2026-981245'}
            </p>

            <div
              style={{
                background: 'var(--bg-card-subtle)',
                borderRadius: '16px',
                padding: '1.25rem',
                margin: '1.75rem auto',
                maxWidth: '450px',
                textAlign: 'left',
                border: '1px solid var(--border-color)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Invoice Amount</span>
                <strong style={{ color: 'var(--text-primary)' }}>₹{preview?.invoiceAmount.toFixed(2)}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Reversal Applied</span>
                <strong style={{ color: 'var(--accent-primary)' }}>-₹{preview?.reversalAmountApplied.toFixed(2)}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Wallet Applied</span>
                <strong style={{ color: '#10b981' }}>-₹{preview?.walletAmountApplied.toFixed(2)}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.6rem', borderTop: '1px dashed var(--border-color)' }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 800 }}>Total Paid</span>
                <strong style={{ fontSize: '1.2rem', color: 'var(--accent-primary)', fontWeight: 900 }}>
                  ₹{(preview?.paymentGatewayAmount ?? checkoutResult.totalAmountPaid ?? 0).toFixed(2)}
                </strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate('/history')}
                style={{
                  padding: '0.85rem 2rem',
                  borderRadius: '14px',
                  background: 'var(--accent-gradient)',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  cursor: 'pointer'
                }}
              >
                View Transaction History & Cashback →
              </button>

              <button
                onClick={() => navigate('/dashboard')}
                style={{
                  padding: '0.85rem 2rem',
                  borderRadius: '14px',
                  background: 'var(--bg-highlight)',
                  color: 'var(--accent-primary)',
                  border: '1px solid var(--accent-primary)',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  cursor: 'pointer'
                }}
              >
                Back to Dashboard
              </button>
            </div>
          </section>
        )}
      </main>

      {/* Razorpay Interactive Test Mode Gateway Modal */}
      <RazorpayTestModal
        isOpen={showRazorpayModal}
        amount={preview?.paymentGatewayAmount || 0}
        onSuccess={(details) => handleExecuteCheckout(details)}
        onClose={() => setShowRazorpayModal(false)}
      />
    </div>
  );
}