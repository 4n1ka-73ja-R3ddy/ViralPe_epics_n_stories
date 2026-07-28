import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavigationHeader from '../components/NavigationHeader';
import { getSession } from '../lib/session';
import {
  getVoucherBrands,
  getVoucherDenominations,
  purchaseVoucher,
  getVoucherHistory,
  VoucherBrandItem,
  VoucherPurchaseRecord
} from '../lib/api';

function renderBrandLogo(brandId: string) {
  const id = brandId.toUpperCase();

  switch (id) {
    case 'AMAZON':
      return (
        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#232f3e', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', color: '#ff9900', fontWeight: 900, fontSize: '0.75rem', padding: '0 4px' }}>
          <span style={{ color: '#ffffff', fontSize: '0.7rem', fontWeight: 800 }}>amazon</span>
          <span style={{ fontSize: '0.8rem', lineHeight: 0.6 }}>◡</span>
        </div>
      );

    case 'FLIPKART':
      return (
        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#2874f0', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(40,116,240,0.3)', color: '#ffe500', fontWeight: 900, fontSize: '1.4rem', fontStyle: 'italic' }}>
          fk
        </div>
      );

    case 'MYNTRA':
      return (
        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #ff3f6c 0%, #ff905a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(255,63,108,0.3)', color: '#ffffff', fontWeight: 900, fontSize: '1.3rem' }}>
          M
        </div>
      );

    case 'SWIGGY':
      return (
        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fc8019', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(252,128,25,0.3)', color: '#ffffff', fontWeight: 900, fontSize: '1.3rem' }}>
          S
        </div>
      );

    case 'ZOMATO':
      return (
        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#cb202d', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(203,32,45,0.3)', color: '#ffffff', fontWeight: 900, fontSize: '0.75rem', fontStyle: 'italic', letterSpacing: '-0.03em' }}>
          zomato
        </div>
      );

    case 'PLAYSTORE':
      return (
        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M3.6 2.4C3.2 2.8 3 3.4 3 4.2V19.8C3 20.6 3.2 21.2 3.6 21.6L3.7 21.7L13.8 11.6V11.4L3.7 1.3L3.6 2.4Z" fill="#00D2FF"/>
            <path d="M17.1 14.9L13.8 11.6V11.4L17.1 8.1L17.2 8.2L21.1 10.4C22.2 11 22.2 12 21.1 12.6L17.2 14.8L17.1 14.9Z" fill="#FFC700"/>
            <path d="M17.2 14.8L13.8 11.5L3.6 21.7C4 22.1 4.7 22.2 5.5 21.7L17.2 14.8Z" fill="#FF3A44"/>
            <path d="M17.2 8.2L5.5 1.3C4.7 0.8 4 0.9 3.6 1.3L13.8 11.5L17.2 8.2Z" fill="#00E676"/>
          </svg>
        </div>
      );

    case 'UBER':
      return (
        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#000000', border: '1px solid #333333', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.4)', color: '#ffffff', fontWeight: 800, fontSize: '0.85rem' }}>
          Uber
        </div>
      );

    default:
      return (
        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--bg-highlight)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
          🎁
        </div>
      );
  }
}

export default function VoucherPage() {
  const navigate = useNavigate();
  const session = getSession();

  const [brands, setBrands] = useState<VoucherBrandItem[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<VoucherBrandItem | null>(null);
  const [denominations, setDenominations] = useState<number[]>([100, 250, 500, 1000, 2000]);
  const [selectedDenom, setSelectedDenom] = useState<number>(500);
  const [purchasing, setPurchasing] = useState(false);
  const [purchasedVoucher, setPurchasedVoucher] = useState<any | null>(null);
  const [history, setHistory] = useState<VoucherPurchaseRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    getVoucherBrands()
      .then((bList) => {
        setBrands(bList);
        if (bList.length > 0) setSelectedBrand(bList[0]);
      })
      .catch(() => {});

    if (session?.userId) {
      setLoadingHistory(true);
      getVoucherHistory(session.userId)
        .then(setHistory)
        .catch(() => {})
        .finally(() => setLoadingHistory(false));
    }
  }, []);

  useEffect(() => {
    if (selectedBrand) {
      getVoucherDenominations(selectedBrand.id)
        .then((dList) => {
          if (dList.length > 0) {
            setDenominations(dList.map(d => d.denomination));
            setSelectedDenom(dList[0].denomination);
          }
        })
        .catch(() => {});
    }
  }, [selectedBrand]);

  const handleBuyVoucher = async () => {
    if (!session?.userId) {
      navigate('/');
      return;
    }
    if (!selectedBrand) return;

    setPurchasing(true);
    setError(null);
    setPurchasedVoucher(null);

    try {
      const res = await purchaseVoucher(session.userId, selectedBrand.id, selectedDenom);
      setPurchasedVoucher(res);
      // Refresh history
      getVoucherHistory(session.userId).then(setHistory).catch(() => {});
    } catch (err: any) {
      setError(err.message || 'Voucher purchase failed. Please check wallet balance.');
    } finally {
      setPurchasing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-canvas)', color: 'var(--text-primary)' }}>
      <NavigationHeader />

      <main style={{ maxWidth: '1100px', margin: '2rem auto', padding: '0 1.5rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent-primary)', fontWeight: 700 }}>
            CYRUS BRAND GIFT CARDS
          </span>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.2rem 0' }}>
            Digital Gift Vouchers
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Purchase instant digital gift cards for top shopping, dining, and travel brands & earn cashback.
          </p>
        </div>

        {/* Brand Selection Grid */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem' }}>
            Select Brand Voucher
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            {(brands.length ? brands : [
              { id: 'AMAZON', name: 'Amazon Pay Gift Card', category: 'SHOPPING', discountPercent: 2.5, logo: '🛍️' },
              { id: 'FLIPKART', name: 'Flipkart Voucher', category: 'SHOPPING', discountPercent: 3.0, logo: '🛒' },
              { id: 'MYNTRA', name: 'Myntra Fashion', category: 'FASHION', discountPercent: 5.0, logo: '👗' },
              { id: 'SWIGGY', name: 'Swiggy Money', category: 'FOOD', discountPercent: 4.0, logo: '🍕' },
              { id: 'ZOMATO', name: 'Zomato Pro', category: 'FOOD', discountPercent: 4.0, logo: '🍔' },
              { id: 'PLAYSTORE', name: 'Google Play Code', category: 'DIGITAL', discountPercent: 2.0, logo: '🎮' },
              { id: 'UBER', name: 'Uber Rides', category: 'TRAVEL', discountPercent: 3.5, logo: '🚗' }
            ]).map((b) => {
              const isSelected = selectedBrand?.id === b.id;
              return (
                <div
                  key={b.id}
                  onClick={() => setSelectedBrand(b)}
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
                  <div style={{ marginBottom: '0.85rem' }}>
                    {renderBrandLogo(b.id)}
                  </div>
                  <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)', display: 'block' }}>
                    {b.name}
                  </strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 700 }}>
                    Earn up to {b.discountPercent || 3}% Cashback
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Denomination Picker & Purchase Section */}
        {selectedBrand && (
          <section style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '1.75rem', marginBottom: '2.5rem', boxShadow: '0 4px 20px var(--shadow-color)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem' }}>
              Choose Voucher Denomination for {selectedBrand.name}
            </h3>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
              {denominations.map((denom) => (
                <button
                  key={denom}
                  onClick={() => setSelectedDenom(denom)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    borderRadius: '12px',
                    background: selectedDenom === denom ? 'var(--accent-primary)' : 'var(--input-bg)',
                    color: selectedDenom === denom ? '#ffffff' : 'var(--text-primary)',
                    border: '1px solid var(--border-color)',
                    fontWeight: 800,
                    fontSize: '1.1rem',
                    cursor: 'pointer'
                  }}
                >
                  ₹{denom}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Payable Amount</span>
                <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-primary)', margin: 0 }}>
                  ₹{selectedDenom.toFixed(2)}
                </h2>
              </div>

              <button
                onClick={handleBuyVoucher}
                disabled={purchasing}
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
                {purchasing ? 'Purchasing Voucher...' : `Buy ${selectedBrand.name} Voucher (₹${selectedDenom})`}
              </button>
            </div>

            {error && (
              <p style={{ color: '#fca5a5', marginTop: '1rem', fontWeight: 600 }}>
                ⚠️ {error}
              </p>
            )}
          </section>
        )}

        {/* Issued Voucher Modal / Code Reveal */}
        {purchasedVoucher && (
          <section style={{ background: 'var(--bg-card)', border: '2px solid var(--accent-primary)', borderRadius: '20px', padding: '2rem', textAlign: 'center', marginBottom: '2.5rem', boxShadow: '0 4px 30px var(--shadow-color)' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--badge-credit-bg)', color: 'var(--badge-credit-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 1rem auto' }}>
              🎁
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Voucher Issued Successfully!
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.3rem' }}>
              Instant Code Delivered via Cyrus GiftCard Engine
            </p>

            <div style={{ background: 'var(--bg-card-subtle)', borderRadius: '14px', padding: '1.5rem', margin: '1.5rem 0', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Voucher Code</span>
                  <strong style={{ fontSize: '1.4rem', color: 'var(--accent-primary)', display: 'block', letterSpacing: '0.08em' }}>
                    {purchasedVoucher.voucherCode || 'AMZ-9845127634'}
                  </strong>
                </div>

                <button
                  onClick={() => copyToClipboard(purchasedVoucher.voucherCode || 'AMZ-9845127634')}
                  style={{ padding: '0.5rem 1rem', background: 'var(--accent-primary)', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                >
                  {copiedCode ? '✓ Copied!' : 'Copy Code'}
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Voucher PIN</span>
                  <strong style={{ display: 'block', color: 'var(--text-primary)', fontSize: '1.1rem' }}>
                    {purchasedVoucher.voucherPin || '884912'}
                  </strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Denomination</span>
                  <strong style={{ display: 'block', color: 'var(--text-primary)', fontSize: '1.1rem' }}>
                    ₹{purchasedVoucher.denomination || selectedDenom}
                  </strong>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* My Voucher Wallet / History */}
        <section style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '1.75rem', boxShadow: '0 4px 20px var(--shadow-color)' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
            My Voucher Wallet & History
          </h3>

          {loadingHistory ? (
            <p style={{ color: 'var(--text-secondary)' }}>Loading your voucher history...</p>
          ) : history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
              No digital vouchers purchased yet. Select a brand above to buy your first gift card!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {history.map((v) => (
                <div
                  key={v.id}
                  style={{
                    background: 'var(--bg-card-subtle)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)', display: 'block' }}>
                      {v.brandName} Gift Card
                    </strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Code: <strong style={{ color: 'var(--accent-primary)' }}>{v.voucherCode}</strong> · PIN: {v.voucherPin}
                    </span>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <strong style={{ fontSize: '1.2rem', color: 'var(--accent-primary)', fontWeight: 800, display: 'block' }}>
                      ₹{v.denomination.toFixed(2)}
                    </strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {new Date(v.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
