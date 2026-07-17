import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    <div className="checkout-page">
      <header className="checkout-topbar">
        <button
          type="button"
          className="checkout-back-button"
          onClick={() => navigate('/dashboard')}
        >
          ← Back to Dashboard
        </button>

        <div>
          <strong>ViralPe Checkout</strong>
          <span>Zero-load mixed-mode payment</span>
        </div>
      </header>

      <main className="checkout-main">
        <section className="checkout-form-card">
          <p className="login-eyebrow">Payment setup</p>

          <h1>Preview your payment split</h1>

          <p>
            Reversal Wallet is applied first. Wallet Balance is
            applied next. The remaining amount goes to the payment
            gateway.
          </p>

          <form onSubmit={handlePreview} className="checkout-form">
            <div className="checkout-field">
              <label htmlFor="invoiceAmount">
                Invoice Amount
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
              />
            </div>

            {!preview ? (
              <button
                type="submit"
                className="checkout-primary-button"
                disabled={loading}
              >
                {loading
                  ? 'Calculating...'
                  : 'Show Payment Breakdown'}
              </button>
            ) : (
              <>
                <label className="checkout-wallet-toggle">
                  <div>
                    <strong>Use Wallet Balance</strong>
                    <span>
                      Choose how much wallet balance to apply.
                    </span>
                  </div>

                  <input
                    type="checkbox"
                    checked={useWallet}
                    onChange={(event) =>
                      handleWalletToggle(event.target.checked)
                    }
                  />
                </label>

                <div className="checkout-slider-section">
                  <div className="checkout-slider-heading">
                    <span>Wallet amount</span>

                    <strong>
                      ₹
                      {useWallet
                        ? requestedWalletAmount.toFixed(2)
                        : '0.00'}
                    </strong>
                  </div>

                  <input
                    id="walletAmount"
                    type="range"
                    min="0"
                    max={maximumWalletAmount}
                    step="1"
                    value={
                      useWallet
                        ? requestedWalletAmount
                        : 0
                    }
                    onChange={(event) =>
                      handleWalletSlider(
                        Number(event.target.value)
                      )
                    }
                    disabled={!useWallet || loading}
                  />

                  <div className="checkout-slider-labels">
                    <span>₹0</span>

                    <span>
                      Maximum ₹
                      {maximumWalletAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className="checkout-primary-button"
                  onClick={() =>
                    void requestPreview(
                      useWallet
                        ? requestedWalletAmount
                        : 0
                    )
                  }
                  disabled={loading}
                >
                  {loading
                    ? 'Updating...'
                    : 'Refresh Breakdown'}
                </button>
              </>
            )}
          </form>

          {error ? (
            <p className="checkout-error" role="alert">
              {error}
            </p>
          ) : null}
        </section>

        <section className="checkout-breakdown-card">
          <div className="checkout-breakdown-heading">
            <div>
              <p className="login-eyebrow">
                Checkout priority ladder
              </p>

              <h2>Payment Breakdown</h2>
            </div>

            <span className="checkout-status-pill">
              Preview
            </span>
          </div>

          {!preview ? (
            <div className="checkout-empty-state">
              <strong>No preview yet</strong>

              <p>
                Enter the invoice amount to calculate the payment
                split.
              </p>
            </div>
          ) : (
            <div className="checkout-breakdown-list">
              <div className="checkout-breakdown-row">
                <span>Invoice Amount</span>

                <strong>
                  ₹{preview.invoiceAmount.toFixed(2)}
                </strong>
              </div>

              <div className="checkout-breakdown-row">
                <div>
                  <span>Reversal Wallet</span>

                  <small>
                    Available: ₹
                    {preview.availableReversalBalance.toFixed(2)}
                  </small>
                </div>

                <strong className="checkout-deduction">
                  −₹{preview.reversalAmountApplied.toFixed(2)}
                </strong>
              </div>

              <div className="checkout-breakdown-row">
                <div>
                  <span>Wallet Balance</span>

                  <small>
                    Available: ₹
                    {preview.availableWalletBalance.toFixed(2)}
                  </small>
                </div>

                <strong className="checkout-deduction">
                  −₹{preview.walletAmountApplied.toFixed(2)}
                </strong>
              </div>

              <div className="checkout-breakdown-divider" />

              <div className="checkout-breakdown-row checkout-total-row">
                <span>Payment Gateway Amount</span>

                <strong>
                  ₹{preview.paymentGatewayAmount.toFixed(2)}
                </strong>
              </div>

              <div className="checkout-payment-options">
                <button type="button" disabled>
                  UPI
                </button>

                <button type="button" disabled>
                  Card
                </button>

                <button type="button" disabled>
                  Net Banking
                </button>
              </div>

              <button
                type="button"
                className="checkout-confirm-button"
                disabled
              >
                Proceed to Pay
              </button>

              <p className="checkout-note">
                Payment confirmation will be enabled in Story 3.3.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}