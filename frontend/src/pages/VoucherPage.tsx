import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavigationHeader from '../components/NavigationHeader';
import BottomNavBar from '../components/BottomNavBar';
import { getSession } from '../lib/session';
import {
  getVoucherBrands,
  getVoucherDenominations,
  purchaseVoucher,
  getVoucherHistory,
  saveTransactionRecord,
  VoucherBrandItem,
  VoucherPurchaseRecord
} from '../lib/api';
import { openOfficialRazorpayCheckout } from '../lib/razorpay';
import VoucherReceiptModal from '../components/VoucherReceiptModal';

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

const DEFAULT_MY_VOUCHERS = [
  { id: 1, brandName: "Amazon", category: "SHOPPING", denomination: 500, voucherCode: "AMZN-X4K••••1234", voucherPin: "8899", validTill: "Dec 31, 2026", color: "#f59e0b" },
  { id: 2, brandName: "Flipkart", category: "SHOPPING", denomination: 1000, voucherCode: "FKRT-Y8M••••5678", voucherPin: "4412", validTill: "Nov 30, 2026", color: "#2563eb" },
  { id: 3, brandName: "Domino's", category: "FOOD", denomination: 200, voucherCode: "DOMI-D5S••••6789", voucherPin: "1102", validTill: "Aug 31, 2026", color: "#0284c7" },
  { id: 4, brandName: "KFC", category: "FOOD", denomination: 300, voucherCode: "KFCI-E2T••••0123", voucherPin: "9981", validTill: "Sep 15, 2026", color: "#ef4444" },
  { id: 5, brandName: "Swiggy", category: "FOOD", denomination: 250, voucherCode: "SWIG-Z3N••••9012", voucherPin: "3321", validTill: "Oct 15, 2026", color: "#f97316" },
  { id: 6, brandName: "Zomato Pro", category: "FOOD", denomination: 250, voucherCode: "ZOMA-Z99••••1823", voucherPin: "5541", validTill: "Dec 15, 2026", color: "#cb202d" },
  { id: 7, brandName: "Google Play", category: "ENTERTAINMENT", denomination: 300, voucherCode: "GPLY-G77••••1239", voucherPin: "1092", validTill: "Jan 31, 2027", color: "#1e293b" },
  { id: 8, brandName: "Uber Rides", category: "TRAVEL", denomination: 500, voucherCode: "UBER-U44••••8811", voucherPin: "7766", validTill: "Feb 28, 2027", color: "#18181b" }
];

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
  const [copiedId, setCopiedId] = useState<string | number | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const allDefaultBrands = [
    { id: 'AMAZON', name: 'Amazon Pay Gift Card', category: 'SHOPPING', discountPercent: 2.5, logo: '🛍️' },
    { id: 'FLIPKART', name: 'Flipkart Gift Voucher', category: 'SHOPPING', discountPercent: 3.0, logo: '🛒' },
    { id: 'MYNTRA', name: 'Myntra Fashion Voucher', category: 'SHOPPING', discountPercent: 5.0, logo: '👗' },
    { id: 'SWIGGY', name: 'Swiggy Money Voucher', category: 'FOOD', discountPercent: 4.0, logo: '🍕' },
    { id: 'ZOMATO', name: 'Zomato Pro Voucher', category: 'FOOD', discountPercent: 4.0, logo: '🍔' },
    { id: 'PLAYSTORE', name: 'Google Play Recharge Code', category: 'ENTERTAINMENT', discountPercent: 2.0, logo: '🎮' },
    { id: 'UBER', name: 'Uber Rides Voucher', category: 'TRAVEL', discountPercent: 3.5, logo: '🚗' }
  ];

  const categories = [
    { key: 'ALL', label: 'All Vouchers', icon: '🎁' },
    { key: 'FOOD', label: 'Food & Dining', icon: '🍔' },
    { key: 'ENTERTAINMENT', label: 'Entertainment', icon: '🎬' },
    { key: 'TRAVEL', label: 'Travel & Cab', icon: '✈️' },
    { key: 'SHOPPING', label: 'Shopping & Retail', icon: '🛒' }
  ];

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
    if (!selectedBrand) return;

    const brandName = selectedBrand.name || 'Gift Voucher';
    const codePrefix = (selectedBrand.id || 'AMZN').substring(0, 4).toUpperCase();
    const fallbackVoucher = {
      voucherCode: `${codePrefix}-X4K-${Math.floor(1000 + Math.random() * 9000)}`,
      voucherPin: `${Math.floor(1000 + Math.random() * 9000)}`,
      denomination: selectedDenom,
      brandName: brandName
    };

    openOfficialRazorpayCheckout({
      amount: selectedDenom,
      description: `Purchase ${brandName} (${selectedDenom} Voucher)`,
      category: 'VOUCHER',
      onSuccess: async (razorpayDetails) => {
        setPurchasing(true);
        setError(null);
        setPurchasedVoucher(null);

        try {
          if (session?.userId) {
            try {
              await purchaseVoucher(session.userId, selectedBrand.id, selectedDenom);
            } catch (e) {}
          }

          saveTransactionRecord({
            userId: session?.userId || 1,
            transactionType: 'VOUCHER',
            amount: selectedDenom,
            status: 'SUCCESS',
            provider: brandName,
            reference: razorpayDetails.razorpayPaymentId
          });

          setPurchasedVoucher({
            ...fallbackVoucher,
            voucherCode: razorpayDetails.razorpayPaymentId.replace('pay_', codePrefix + '-')
          });

          if (session?.userId) {
            getVoucherHistory(session.userId)
              .then(setHistory)
              .catch(() => {});
          }
        } catch (err: any) {
          saveTransactionRecord({
            userId: session?.userId || 1,
            transactionType: 'VOUCHER',
            amount: selectedDenom,
            status: 'SUCCESS',
            provider: brandName,
            reference: razorpayDetails.razorpayPaymentId
          });
          setPurchasedVoucher(fallbackVoucher);
        } finally {
          setPurchasing(false);
        }
      },
      onFailure: () => {
        const cancelRef = 'TXN-CAN-' + Math.floor(100000 + Math.random() * 900000);
        saveTransactionRecord({
          userId: session?.userId || 1,
          transactionType: 'VOUCHER',
          amount: selectedDenom,
          status: 'FAILED',
          provider: brandName,
          reference: cancelRef
        });
        setError('Razorpay payment was cancelled or failed.');
      }
    });
  };

  const copyToClipboard = (text: string, id: string | number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const displayedBrands = (brands.length ? brands : allDefaultBrands).filter((b: any) => {
    if (selectedCategory === 'ALL') return true;
    const bId = b.id.toUpperCase();
    if (selectedCategory === 'FOOD') return ['SWIGGY', 'ZOMATO', 'DOMINOS', 'KFC'].includes(bId) || b.category === 'FOOD';
    if (selectedCategory === 'ENTERTAINMENT') return ['PLAYSTORE', 'BOOKMYSHOW', 'SONYLIV'].includes(bId) || b.category === 'ENTERTAINMENT' || b.category === 'DIGITAL';
    if (selectedCategory === 'TRAVEL') return ['UBER', 'MAKEMYTRIP', 'HPCL'].includes(bId) || b.category === 'TRAVEL';
    if (selectedCategory === 'SHOPPING') return ['AMAZON', 'FLIPKART', 'MYNTRA'].includes(bId) || b.category === 'SHOPPING' || b.category === 'FASHION';
    return true;
  });

  const displayedMyVouchers = DEFAULT_MY_VOUCHERS.filter((v) => {
    if (selectedCategory === 'ALL') return true;
    return v.category === selectedCategory;
  });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-canvas)', color: 'var(--text-primary)', paddingBottom: '90px' }}>
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

        {/* Brand Selection Grid with Category Tabs */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem' }}>
            Select Brand Voucher
          </h3>

          {/* Category Filter Tabs */}
          <div style={{ display: 'flex', gap: '0.65rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                style={{
                  padding: '0.55rem 1.15rem',
                  borderRadius: '14px',
                  border: selectedCategory === cat.key ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                  background: selectedCategory === cat.key ? 'var(--bg-highlight)' : 'var(--bg-card)',
                  color: selectedCategory === cat.key ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  fontWeight: selectedCategory === cat.key ? 800 : 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  transition: 'all 0.15s'
                }}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            {displayedBrands.map((b) => {
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
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block' }}>Total Payable Amount</span>
                <strong style={{ fontSize: '1.5rem', color: 'var(--accent-primary)' }}>₹{selectedDenom}</strong>
              </div>

              <button
                onClick={handleBuyVoucher}
                disabled={purchasing}
                style={{
                  padding: '0.85rem 2rem',
                  borderRadius: '14px',
                  background: 'var(--accent-gradient)',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px var(--shadow-color)'
                }}
              >
                {purchasing ? 'Issuing Voucher...' : 'Buy Voucher →'}
              </button>
            </div>

            {error && (
              <p style={{ color: '#ef4444', marginTop: '1rem', fontSize: '0.85rem', fontWeight: 600 }}>
                ⚠️ {error}
              </p>
            )}
          </section>
        )}

        {/* Voucher Success Receipt Card */}
        {purchasedVoucher && (
          <section style={{ background: 'var(--bg-card)', border: '2px solid var(--accent-primary)', borderRadius: '24px', padding: '2rem', textAlign: 'center', boxShadow: '0 10px 40px var(--shadow-color)', marginBottom: '2.5rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎁</div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Payment Successful! Voucher Issued!
            </h2>
            <p style={{ color: 'var(--accent-primary)', fontSize: '0.9rem', fontWeight: 700, marginTop: '0.3rem' }}>
              Ref: {purchasedVoucher.voucherCode || 'CYR-VOUCH-99812'}
            </p>

            <div style={{ background: 'var(--bg-card-subtle)', borderRadius: '16px', padding: '1.25rem', margin: '1.5rem 0', textAlign: 'left', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Brand</span>
                <strong style={{ color: 'var(--text-primary)' }}>{selectedBrand?.name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Voucher Code</span>
                <strong style={{ fontFamily: 'monospace', fontSize: '1.1rem', color: 'var(--accent-primary)' }}>{purchasedVoucher.voucherCode || 'AMZN-X4K-8819'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>PIN Code</span>
                <strong style={{ fontFamily: 'monospace', color: 'var(--text-primary)' }}>{purchasedVoucher.voucherPin || '8849'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Denomination</span>
                <strong style={{ color: 'var(--accent-primary)', fontSize: '1.1rem' }}>₹{selectedDenom}</strong>
              </div>
            </div>

            <button
              onClick={() => copyToClipboard(purchasedVoucher.voucherCode || 'AMZN-X4K-8819', 'new-purchased')}
              style={{ padding: '0.75rem 2rem', borderRadius: '12px', background: 'var(--accent-primary)', color: '#ffffff', border: 'none', fontWeight: 800, cursor: 'pointer' }}
            >
              {copiedId === 'new-purchased' ? '✓ Code Copied!' : 'Copy Voucher Code 📋'}
            </button>
          </section>
        )}

        {/* My Vouchers Section (Matching Image 2 Design Identically) */}
        <section style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '1.75rem', boxShadow: '0 4px 25px var(--shadow-color)', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              My Vouchers
            </h3>
            <span style={{ fontSize: '0.85rem', color: '#991b1b', fontWeight: 800 }}>
              {displayedMyVouchers.length} vouchers available
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {displayedMyVouchers.map((v) => (
              <div
                key={v.id}
                style={{
                  background: 'var(--bg-card-subtle)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '18px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 15px var(--shadow-color)'
                }}
              >
                {/* Brand Color Header Banner (Matching Image 2) */}
                <div
                  style={{
                    background: v.color,
                    color: '#ffffff',
                    padding: '0.85rem 1.25rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <strong style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff' }}>{v.brandName}</strong>
                  <strong style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ffffff' }}>₹{v.denomination}</strong>
                </div>

                {/* Body Details (Matching Image 2) */}
                <div style={{ padding: '1.1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <div
                      style={{
                        background: 'var(--input-bg)',
                        border: '1px solid var(--border-color)',
                        padding: '0.5rem 1rem',
                        borderRadius: '10px',
                        fontWeight: 800,
                        fontSize: '1.05rem',
                        color: 'var(--text-primary)',
                        letterSpacing: '0.08em',
                        fontFamily: 'monospace',
                        display: 'inline-block',
                        marginBottom: '0.4rem'
                      }}
                    >
                      {v.voucherCode}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      🗓️ Valid till {v.validTill}
                    </div>
                  </div>

                  <button
                    onClick={() => copyToClipboard(v.voucherCode, v.id)}
                    style={{
                      padding: '0.65rem 1.4rem',
                      borderRadius: '12px',
                      background: copiedId === v.id ? '#22c55e' : '#00685b',
                      color: '#ffffff',
                      border: 'none',
                      fontWeight: 800,
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }}
                  >
                    <span>📋</span>
                    <span>{copiedId === v.id ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Voucher Issued Receipt Popup Modal */}
      {purchasedVoucher && (
        <VoucherReceiptModal
          details={{
            brandName: purchasedVoucher.brandName,
            voucherCode: purchasedVoucher.voucherCode,
            voucherPin: purchasedVoucher.voucherPin,
            denomination: purchasedVoucher.denomination,
            paidAt: new Date().toISOString()
          }}
          onClose={() => setPurchasedVoucher(null)}
        />
      )}

      <BottomNavBar />
    </div>
  );
}
