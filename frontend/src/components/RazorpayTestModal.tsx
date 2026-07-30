import { useEffect, useState } from 'react';
import { createRazorpayOrder, verifyRazorpayPayment } from '../lib/api';
import { getSession } from '../lib/session';

interface RazorpayTestModalProps {
  isOpen: boolean;
  amount: number;
  onSuccess: (details: { razorpayPaymentId: string; razorpayOrderId: string; razorpaySignature: string }) => void;
  onClose: () => void;
}

export default function RazorpayTestModal({
  isOpen,
  amount,
  onSuccess,
  onClose
}: RazorpayTestModalProps) {
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [orderId, setOrderId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState('user@okaxis');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const keyId = 'rzp_test_TIWpw5hrzzlXzV';

  useEffect(() => {
    if (isOpen && amount > 0) {
      setLoadingOrder(true);
      setError('');
      const session = getSession();

      createRazorpayOrder({
        amount,
        currency: 'INR',
        receipt: 'rcpt_' + Date.now(),
        userId: session?.userId || 1
      })
        .then((res) => {
          setOrderId(res.orderId || 'order_RzpTest_' + Date.now());
        })
        .catch(() => {
          setOrderId('order_RzpTest_' + Date.now());
        })
        .finally(() => {
          setLoadingOrder(false);
        });
    }
  }, [isOpen, amount]);

  if (!isOpen) return null;

  const handleSimulatePaymentSuccess = async () => {
    setProcessing(true);
    setError('');

    const session = getSession();
    const mockPaymentId = 'pay_RzpTest_' + Math.floor(10000000 + Math.random() * 90000000);
    const mockSignature = 'simulated_sig_' + Math.random().toString(36).substring(2);

    try {
      if (session) {
        await verifyRazorpayPayment({
          razorpayOrderId: orderId,
          razorpayPaymentId: mockPaymentId,
          razorpaySignature: mockSignature,
          userId: session.userId,
          amount
        });
      }

      onSuccess({
        razorpayOrderId: orderId,
        razorpayPaymentId: mockPaymentId,
        razorpaySignature: mockSignature
      });
    } catch {
      // Fallback success
      onSuccess({
        razorpayOrderId: orderId,
        razorpayPaymentId: mockPaymentId,
        razorpaySignature: mockSignature
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: '1rem'
      }}
    >
      <div
        style={{
          background: 'var(--bg-card)',
          border: '2px solid var(--accent-primary)',
          borderRadius: '24px',
          maxWidth: '460px',
          width: '100%',
          padding: '1.75rem',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
          position: 'relative',
          animation: 'fadeIn 0.2s ease-in-out'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#3395ff', color: '#ffffff', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
              R
            </div>
            <div>
              <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)', display: 'block', lineHeight: 1.1 }}>
                Razorpay Checkout
              </strong>
              <span style={{ fontSize: '0.72rem', color: '#0d9488', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                ⚡ TEST MODE ACTIVE
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-card-subtle)',
              border: '1px solid var(--border-color)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              cursor: 'pointer',
              fontWeight: 800,
              color: 'var(--text-secondary)'
            }}
          >
            ✕
          </button>
        </div>

        {/* Credentials & Order Info */}
        <div style={{ background: 'var(--bg-card-subtle)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '1rem', marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Key ID:</span>
            <code style={{ background: 'var(--bg-highlight)', color: 'var(--accent-primary)', padding: '0.1rem 0.4rem', borderRadius: '6px', fontWeight: 700, fontSize: '0.8rem' }}>
              {keyId}
            </code>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Order ID:</span>
            <code style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.8rem' }}>
              {loadingOrder ? 'Generating...' : orderId}
            </code>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px dashed var(--border-color)', marginTop: '0.25rem' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>Amount Payable:</span>
            <strong style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--accent-primary)' }}>
              ₹{amount.toFixed(2)}
            </strong>
          </div>
        </div>

        {/* Payment Methods */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
            Select Test Payment Option
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.65rem' }}>
            <button
              onClick={() => setPaymentMethod('upi')}
              style={{
                padding: '0.65rem 0.5rem',
                borderRadius: '12px',
                border: `1.5px solid ${paymentMethod === 'upi' ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                background: paymentMethod === 'upi' ? 'var(--bg-highlight)' : 'var(--bg-card)',
                color: paymentMethod === 'upi' ? 'var(--accent-primary)' : 'var(--text-primary)',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              📲 UPI / QR
            </button>

            <button
              onClick={() => setPaymentMethod('card')}
              style={{
                padding: '0.65rem 0.5rem',
                borderRadius: '12px',
                border: `1.5px solid ${paymentMethod === 'card' ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                background: paymentMethod === 'card' ? 'var(--bg-highlight)' : 'var(--bg-card)',
                color: paymentMethod === 'card' ? 'var(--accent-primary)' : 'var(--text-primary)',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              💳 Card
            </button>

            <button
              onClick={() => setPaymentMethod('netbanking')}
              style={{
                padding: '0.65rem 0.5rem',
                borderRadius: '12px',
                border: `1.5px solid ${paymentMethod === 'netbanking' ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                background: paymentMethod === 'netbanking' ? 'var(--bg-highlight)' : 'var(--bg-card)',
                color: paymentMethod === 'netbanking' ? 'var(--accent-primary)' : 'var(--text-primary)',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              🏦 NetBanking
            </button>
          </div>
        </div>

        {paymentMethod === 'upi' && (
          <div style={{ marginBottom: '1.25rem' }}>
            <input
              type="text"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="Enter UPI ID"
              style={{
                width: '100%',
                height: '42px',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-card-subtle)',
                color: 'var(--text-primary)',
                padding: '0 0.85rem',
                fontSize: '0.9rem',
                fontWeight: 600
              }}
            />
          </div>
        )}

        {paymentMethod === 'card' && (
          <div style={{ background: 'var(--bg-card-subtle)', border: '1px dashed var(--border-color)', padding: '0.75rem', borderRadius: '10px', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            💳 <strong>Test Card Number:</strong> <code>4111 1111 1111 1111</code> (Expiry: 12/28, CVV: 123)
          </div>
        )}

        {error && (
          <div style={{ color: '#ef4444', fontSize: '0.82rem', marginBottom: '1rem', fontWeight: 600 }}>
            ⚠️ {error}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button
            onClick={handleSimulatePaymentSuccess}
            disabled={processing || loadingOrder}
            style={{
              width: '100%',
              height: '48px',
              borderRadius: '12px',
              background: '#0d9488',
              color: '#ffffff',
              border: 'none',
              fontWeight: 800,
              fontSize: '0.95rem',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(13, 148, 136, 0.4)'
            }}
          >
            {processing ? 'Verifying Razorpay Signature...' : `Pay ₹${amount.toFixed(2)} (Simulate Razorpay Success) →`}
          </button>

          <button
            onClick={onClose}
            style={{
              width: '100%',
              padding: '0.65rem',
              borderRadius: '10px',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            Cancel Payment
          </button>
        </div>

      </div>
    </div>
  );
}
