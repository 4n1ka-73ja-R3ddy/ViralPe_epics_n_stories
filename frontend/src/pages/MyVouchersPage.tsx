import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavigationHeader from '../components/NavigationHeader';
import BottomNavBar from '../components/BottomNavBar';
import { getVoucherHistory, VoucherPurchaseRecord } from '../lib/api';
import { getSession } from '../lib/session';

interface CategorizedVoucher {
  id: string | number;
  brandId: string;
  brandName: string;
  category: 'FOOD' | 'ENTERTAINMENT' | 'TRAVEL' | 'SHOPPING';
  categoryLabel: string;
  icon: string;
  voucherCode: string;
  voucherPin: string;
  denomination: number;
  validTill: string;
  color: string;
  status: 'ACTIVE' | 'REDEEMED';
}

const DEFAULT_MY_VOUCHERS: CategorizedVoucher[] = [
  {
    id: 'my-v1',
    brandId: 'amazon',
    brandName: 'Amazon',
    category: 'SHOPPING',
    categoryLabel: 'Shopping & Retail',
    icon: '🛍️',
    voucherCode: 'AMZN-X4K••••1234',
    voucherPin: '8899',
    denomination: 500,
    validTill: 'Dec 31, 2026',
    color: '#f59e0b',
    status: 'ACTIVE'
  },
  {
    id: 'my-v2',
    brandId: 'flipkart',
    brandName: 'Flipkart',
    category: 'SHOPPING',
    categoryLabel: 'Shopping & Retail',
    icon: '🛒',
    voucherCode: 'FKRT-Y8M••••5678',
    voucherPin: '4412',
    denomination: 1000,
    validTill: 'Nov 30, 2026',
    color: '#2563eb',
    status: 'ACTIVE'
  },
  {
    id: 'my-v3',
    brandId: 'dominos',
    brandName: "Domino's",
    category: 'FOOD',
    categoryLabel: 'Food & Dining',
    icon: '🍕',
    voucherCode: 'DOMI-D5S••••6789',
    voucherPin: '1102',
    denomination: 200,
    validTill: 'Aug 31, 2026',
    color: '#0284c7',
    status: 'ACTIVE'
  },
  {
    id: 'my-v4',
    brandId: 'kfc',
    brandName: 'KFC',
    category: 'FOOD',
    categoryLabel: 'Food & Dining',
    icon: '🍗',
    voucherCode: 'KFCI-E2T••••0123',
    voucherPin: '9981',
    denomination: 300,
    validTill: 'Sep 15, 2026',
    color: '#ef4444',
    status: 'ACTIVE'
  },
  {
    id: 'my-v5',
    brandId: 'swiggy',
    brandName: 'Swiggy',
    category: 'FOOD',
    categoryLabel: 'Food & Dining',
    icon: '🍔',
    voucherCode: 'SWIG-Z3N••••9012',
    voucherPin: '3321',
    denomination: 250,
    validTill: 'Oct 15, 2026',
    color: '#f97316',
    status: 'ACTIVE'
  },
  {
    id: 'my-v6',
    brandId: 'zomato',
    brandName: 'Zomato Pro',
    category: 'FOOD',
    categoryLabel: 'Food & Dining',
    icon: '🍟',
    voucherCode: 'ZOMA-Z99••••1823',
    voucherPin: '5541',
    denomination: 250,
    validTill: 'Dec 15, 2026',
    color: '#cb202d',
    status: 'ACTIVE'
  },
  {
    id: 'my-v7',
    brandId: 'googleplay',
    brandName: 'Google Play',
    category: 'ENTERTAINMENT',
    categoryLabel: 'Entertainment',
    icon: '🎮',
    voucherCode: 'GPLY-G77••••1239',
    voucherPin: '1092',
    denomination: 300,
    validTill: 'Jan 31, 2027',
    color: '#1e293b',
    status: 'ACTIVE'
  },
  {
    id: 'my-v8',
    brandId: 'uber',
    brandName: 'Uber Rides',
    category: 'TRAVEL',
    categoryLabel: 'Travel & Cab',
    icon: '🚕',
    voucherCode: 'UBER-U44••••8811',
    voucherPin: '7766',
    denomination: 500,
    validTill: 'Feb 28, 2027',
    color: '#18181b',
    status: 'ACTIVE'
  }
];

export default function MyVouchersPage() {
  const navigate = useNavigate();
  const session = getSession();

  const [vouchers, setVouchers] = useState<CategorizedVoucher[]>(DEFAULT_MY_VOUCHERS);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | number | null>(null);

  useEffect(() => {
    if (!session) {
      navigate('/', { replace: true });
      return;
    }

    const fetchHistory = async () => {
      try {
        const data = await getVoucherHistory(session.userId);
        if (data && data.length > 0) {
          const mapped: CategorizedVoucher[] = data.map((item, idx) => {
            const bId = (item.brandId || 'amazon').toLowerCase();
            let cat: 'FOOD' | 'ENTERTAINMENT' | 'TRAVEL' | 'SHOPPING' = 'SHOPPING';
            let catLabel = 'Shopping & Retail';
            let icon = '🎁';
            let color = '#f59e0b';
            let name = item.brandName || 'Gift Voucher';

            if (bId.includes('domino') || bId.includes('zomato') || bId.includes('swiggy') || bId.includes('kfc')) {
              cat = 'FOOD';
              catLabel = 'Food & Dining';
              icon = '🍔';
              color = bId.includes('kfc') ? '#ef4444' : bId.includes('zomato') ? '#cb202d' : bId.includes('swiggy') ? '#f97316' : '#0284c7';
            } else if (bId.includes('google') || bId.includes('bookmyshow') || bId.includes('play')) {
              cat = 'ENTERTAINMENT';
              catLabel = 'Entertainment';
              icon = '🎬';
              color = '#1e293b';
            } else if (bId.includes('uber') || bId.includes('travel') || bId.includes('makemytrip')) {
              cat = 'TRAVEL';
              catLabel = 'Travel & Cab';
              icon = '✈️';
              color = '#18181b';
            } else if (bId.includes('flipkart')) {
              color = '#2563eb';
            }

            return {
              id: item.id || `v-${idx}`,
              brandId: item.brandId || 'brand',
              brandName: name,
              category: cat,
              categoryLabel: catLabel,
              icon,
              voucherCode: item.voucherCode || 'VOUCH-2026-88771',
              voucherPin: item.voucherPin || '8849',
              denomination: item.denomination || 500,
              validTill: 'Dec 31, 2026',
              color,
              status: 'ACTIVE'
            };
          });

          setVouchers(mapped);
        }
      } catch (err) {
        console.error('Error fetching user vouchers:', err);
      }
    };

    void fetchHistory();
  }, [session?.userId]);

  const copyToClipboard = (text: string, id: string | number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredVouchers = vouchers.filter((v) => {
    if (selectedCategory === 'ALL') return true;
    return v.category === selectedCategory;
  });

  const categories = [
    { key: 'ALL', label: 'All Vouchers', icon: '🎁', count: vouchers.length },
    { key: 'FOOD', label: 'Food & Dining', icon: '🍔', count: vouchers.filter((v) => v.category === 'FOOD').length },
    { key: 'ENTERTAINMENT', label: 'Entertainment', icon: '🎬', count: vouchers.filter((v) => v.category === 'ENTERTAINMENT').length },
    { key: 'TRAVEL', label: 'Travel & Cab', icon: '✈️', count: vouchers.filter((v) => v.category === 'TRAVEL').length },
    { key: 'SHOPPING', label: 'Shopping & Retail', icon: '🛒', count: vouchers.filter((v) => v.category === 'SHOPPING').length }
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-canvas)', color: 'var(--text-primary)', paddingBottom: '90px' }}>
      <NavigationHeader />

      <main style={{ maxWidth: '1100px', margin: '1.5rem auto', padding: '0 1.25rem' }}>
        {/* Title & Action Strip */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent-primary)', fontWeight: 700 }}>
              MY DIGITAL WALLET
            </span>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, margin: '0.25rem 0', color: 'var(--text-primary)' }}>
              My Vouchers
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Your active purchased gift cards & vouchers, organized cleanly by category.
            </p>
          </div>

          <button
            onClick={() => navigate('/vouchers')}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '14px',
              background: 'var(--accent-gradient)',
              color: '#ffffff',
              border: 'none',
              fontWeight: 800,
              fontSize: '0.92rem',
              cursor: 'pointer',
              boxShadow: '0 4px 15px var(--shadow-color)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <span>+ Buy New Vouchers</span>
          </button>
        </div>

        {/* Category Selector Tabs */}
        <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '2rem' }}>
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              style={{
                padding: '0.65rem 1.25rem',
                borderRadius: '14px',
                border: selectedCategory === cat.key ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                background: selectedCategory === cat.key ? 'var(--bg-highlight)' : 'var(--bg-card)',
                color: selectedCategory === cat.key ? 'var(--accent-primary)' : 'var(--text-secondary)',
                fontWeight: selectedCategory === cat.key ? 800 : 600,
                fontSize: '0.88rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.15s'
              }}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
              <span
                style={{
                  padding: '0.15rem 0.55rem',
                  borderRadius: '999px',
                  background: selectedCategory === cat.key ? 'var(--accent-primary)' : 'var(--border-color)',
                  color: selectedCategory === cat.key ? '#ffffff' : 'var(--text-secondary)',
                  fontSize: '0.75rem',
                  fontWeight: 800
                }}
              >
                {cat.count}
              </span>
            </button>
          ))}
        </div>

        {/* My Vouchers Section (Matching Image 2 Design Identically) */}
        <section style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '1.75rem', boxShadow: '0 4px 25px var(--shadow-color)', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              My Vouchers
            </h3>
            <span style={{ fontSize: '0.85rem', color: '#991b1b', fontWeight: 800 }}>
              {filteredVouchers.length} vouchers available
            </span>
          </div>

          {filteredVouchers.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {filteredVouchers.map((item) => (
                <div
                  key={item.id}
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
                      background: item.color,
                      color: '#ffffff',
                      padding: '0.85rem 1.25rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <strong style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff' }}>{item.brandName}</strong>
                    <strong style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ffffff' }}>₹{item.denomination}</strong>
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
                        {item.voucherCode}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        🗓️ Valid till {item.validTill}
                      </div>
                    </div>

                    <button
                      onClick={() => copyToClipboard(item.voucherCode, item.id)}
                      style={{
                        padding: '0.65rem 1.4rem',
                        borderRadius: '12px',
                        background: copiedId === item.id ? '#22c55e' : '#00685b',
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
                      <span>{copiedId === item.id ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
              <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }}>🎁</span>
              <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>No vouchers found in this category</strong>
            </div>
          )}
        </section>
      </main>

      <BottomNavBar />
    </div>
  );
}
