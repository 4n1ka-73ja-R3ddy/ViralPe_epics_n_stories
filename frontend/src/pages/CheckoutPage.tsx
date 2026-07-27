import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavigationHeader from '../components/NavigationHeader';
import { getSession } from '../lib/session';

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
    <div style={{ minHeight: '100vh', background: '#f4f8f7', color: '#0d2b26' }}>
      <NavigationHeader />

      <main style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
        <section style={{ background: '#ffffff', border: '1px solid #e2ece9', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 20px rgba(0, 104, 91, 0.04)' }}>
          <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#00685b', fontWeight: 700 }}>
            PAYMENT SETUP
          </span>

          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0.3rem 0 0.5rem 0', color: '#0d2b26' }}>
            Preview your payment split
          </h1>

          <p style={{ color: '#5b706c', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Reversal Wallet is applied first. Wallet Balance is applied next. The remaining amount goes to the payment gateway.
          </p>

          <form onSubmit={handlePreview} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label htmlFor="invoiceAmount" style={{ display: 'block', fontSize: '0.85rem', color: '#5b706c', marginBottom: '0.4rem', fontWeight: 600 }}>
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
                style={{ width: '100%', padding: '0.75rem', background: '#ffffff', border: '1px solid #e2ece9', borderRadius: '10px', color: '#0d2b26', fontSize: '1rem', fontWeight: 700 }}
              />
            </div>

            {!preview ? (
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  background: 'linear-gradient(135deg, #00685b, #047857)',
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
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f4f8f7', padding: '1rem', borderRadius: '10px', border: '1px solid #e2ece9', cursor: 'pointer' }}>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.9rem', color: '#0d2b26' }}>Use Wallet Balance</strong>
                    <span style={{ fontSize: '0.75rem', color: '#5b706c' }}>
                      Choose how much wallet balance to apply.
                    </span>
                  </div>

                  <input
                    type="checkbox"
                    checked={useWallet}
                    onChange={(event) =>
                      handleWalletToggle(event.target.checked)
                    }
                    style={{ width: '18px', height: '18px', accentColor: '#00685b' }}
                  />
                </label>

                <div style={{ background: '#f4f8f7', padding: '1rem', borderRadius: '10px', border: '1px solid #e2ece9' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                    <span style={{ color: '#5b706c' }}>Wallet Amount</span>

                    <strong style={{ color: '#00685b', fontWeight: 800 }}>
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
                    style={{ width: '100%', accentColor: '#00685b' }}
                  />

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#5b706c', marginTop: '0.25rem' }}>
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
                    background: 'linear-gradient(135deg, #00685b, #047857)',
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
            <p style={{ color: '#dc2626', marginTop: '1rem', fontSize: '0.85rem', fontWeight: 600 }}>
              {error}
            </p>
          ) : null}
        </section>

        <section style={{ background: '#ffffff', border: '1px solid #e2ece9', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 20px rgba(0, 104, 91, 0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#00685b', fontWeight: 700 }}>
                  PRIORITY LADDER
                </span>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0.2rem 0', color: '#0d2b26' }}>
                  Payment Breakdown
                </h2>
              </div>

              <span style={{ padding: '0.25rem 0.6rem', borderRadius: '6px', background: '#e6f4f1', color: '#00685b', fontSize: '0.75rem', fontWeight: 700 }}>
                PREVIEW
              </span>
            </div>

            {!preview ? (
              <div style={{ textAlign: 'center', padding: '4rem 1rem', border: '2px dashed #e2ece9', borderRadius: '12px', color: '#5b706c' }}>
                <strong style={{ fontSize: '1.1rem', color: '#0d2b26', display: 'block', marginBottom: '0.3rem' }}>No preview calculated yet</strong>
                <p style={{ fontSize: '0.85rem' }}>Enter the invoice amount on the left to compute the priority split.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#f4f8f7', borderRadius: '8px' }}>
                  <span style={{ color: '#5b706c' }}>Invoice Amount</span>
                  <strong style={{ color: '#0d2b26' }}>₹{preview.invoiceAmount.toFixed(2)}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#f4f8f7', borderRadius: '8px' }}>
                  <div>
                    <span style={{ color: '#5b706c', display: 'block' }}>Reversal Wallet Applied</span>
                    <small style={{ color: '#5b706c', fontSize: '0.75rem' }}>Available: ₹{preview.availableReversalBalance.toFixed(2)}</small>
                  </div>
                  <strong style={{ color: '#00685b' }}>-₹{preview.reversalAmountApplied.toFixed(2)}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#f4f8f7', borderRadius: '8px' }}>
                  <div>
                    <span style={{ color: '#5b706c', display: 'block' }}>Wallet Balance Applied</span>
                    <small style={{ color: '#5b706c', fontSize: '0.75rem' }}>Available: ₹{preview.availableWalletBalance.toFixed(2)}</small>
                  </div>
                  <strong style={{ color: '#059669' }}>-₹{preview.walletAmountApplied.toFixed(2)}</strong>
                </div>

                <div style={{ borderTop: '1px solid #e2ece9', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#0d2b26', fontWeight: 700 }}>Payment Gateway Amount</span>
                  <strong style={{ fontSize: '1.4rem', color: '#d97706', fontWeight: 800 }}>₹{preview.paymentGatewayAmount.toFixed(2)}</strong>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button type="button" disabled style={{ flex: 1, padding: '0.6rem', background: '#e2ece9', color: '#5b706c', border: 'none', borderRadius: '6px', fontWeight: 700 }}>UPI</button>
                  <button type="button" disabled style={{ flex: 1, padding: '0.6rem', background: '#e2ece9', color: '#5b706c', border: 'none', borderRadius: '6px', fontWeight: 700 }}>Card</button>
                  <button type="button" disabled style={{ flex: 1, padding: '0.6rem', background: '#e2ece9', color: '#5b706c', border: 'none', borderRadius: '6px', fontWeight: 700 }}>Net Banking</button>
                </div>
              </div>
            )}
          </div>

          <p style={{ color: '#5b706c', fontSize: '0.8rem', marginTop: '1.5rem', textAlign: 'center' }}>
            Select a payment gateway option above to proceed.
          </p>
        </section>
      </main>
    </div>
  );
}