import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavigationHeader from '../components/NavigationHeader';
import { getSession } from '../lib/session';
import {
  getBillCategories,
  getBillers,
  fetchBillDetails,
  executeBillPayment,
  BillCategoryItem,
  BillBillerItem,
  BillFetchData
} from '../lib/api';

export default function BillPaymentPage() {
  const navigate = useNavigate();
  const session = getSession();

  const [categories, setCategories] = useState<BillCategoryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('ELECTRICITY');
  const [billers, setBillers] = useState<BillBillerItem[]>([]);
  const [selectedBiller, setSelectedBiller] = useState('BESCOM');
  const [consumerNumber, setConsumerNumber] = useState('');
  const [fetching, setFetching] = useState(false);
  const [billData, setBillData] = useState<BillFetchData | null>(null);
  const [paying, setPaying] = useState(false);
  const [receipt, setReceipt] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getBillCategories().then(setCategories).catch(() => {});
    getBillers().then((all) => {
      setBillers(all);
      const first = all.find(b => b.category === selectedCategory);
      if (first) setSelectedBiller(first.id);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const first = billers.find(b => b.category === selectedCategory);
    if (first) setSelectedBiller(first.id);
    setBillData(null);
  }, [selectedCategory, billers]);

  const handleFetchBill = async () => {
    if (!consumerNumber.trim()) {
      setError('Please enter a consumer / account number');
      return;
    }
    setFetching(true);
    setError(null);
    setBillData(null);

    try {
      const data = await fetchBillDetails(selectedBiller, consumerNumber);
      setBillData(data);
    } catch (err: any) {
      setError(err.message || 'Unable to fetch bill. Please check the consumer number.');
    } finally {
      setFetching(false);
    }
  };

  const handlePayBill = async () => {
    if (!session?.userId || !billData) return;

    setPaying(true);
    setError(null);

    try {
      const res = await executeBillPayment(
        session.userId,
        selectedBiller,
        consumerNumber,
        billData.amount,
        billData.billReference
      );
      setReceipt(res);
    } catch (err: any) {
      setError(err.message || 'Bill payment failed. Please check wallet balance.');
    } finally {
      setPaying(false);
    }
  };

  const currentCategoryBillers = billers.filter(b => b.category === selectedCategory);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-canvas)', color: 'var(--text-primary)' }}>
      <NavigationHeader />

      <main style={{ maxWidth: '1000px', margin: '2rem auto', padding: '0 1.5rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent-primary)', fontWeight: 700 }}>
            BBPS AGGREGATOR GATEWAY
          </span>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.2rem 0' }}>
            Utility Bill Payments (BBPS)
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Pay Electricity, Water, Gas, and Broadband bills via Cyrus BBPS integration and earn liquid cashbacks.
          </p>
        </div>

        {/* Category Selector Tabs */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          {(categories.length ? categories : [
            { id: 'ELECTRICITY', name: 'Electricity ⚡' },
            { id: 'WATER', name: 'Water 💧' },
            { id: 'GAS', name: 'Gas 🔥' },
            { id: 'BROADBAND', name: 'Broadband 🌐' },
            { id: 'DTH', name: 'DTH 📺' }
          ]).map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                padding: '0.65rem 1.25rem',
                borderRadius: '12px',
                background: selectedCategory === cat.id ? 'var(--accent-primary)' : 'var(--bg-card)',
                color: selectedCategory === cat.id ? '#ffffff' : 'var(--text-secondary)',
                border: '1px solid var(--border-color)',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Biller & Consumer Number Selection */}
        <section style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '1.75rem', marginBottom: '2rem', boxShadow: '0 4px 20px var(--shadow-color)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '0.4rem' }}>
                Select Biller Board
              </label>
              <select
                value={selectedBiller}
                onChange={(e) => setSelectedBiller(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'var(--input-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  color: 'var(--text-primary)',
                  fontSize: '1rem',
                  fontWeight: 600
                }}
              >
                {currentCategoryBillers.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '0.4rem' }}>
                Consumer Number / Account ID
              </label>
              <input
                type="text"
                placeholder="e.g. 1029384756"
                value={consumerNumber}
                onChange={(e) => setConsumerNumber(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'var(--input-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  color: 'var(--text-primary)',
                  fontSize: '1rem',
                  fontWeight: 600
                }}
              />
            </div>

            <button
              onClick={handleFetchBill}
              disabled={fetching || !consumerNumber}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '12px',
                background: 'var(--accent-primary)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
                boxShadow: '0 4px 14px var(--shadow-color)'
              }}
            >
              {fetching ? 'Fetching BBPS Bill...' : 'Fetch Bill Details →'}
            </button>
          </div>

          {error && (
            <p style={{ color: '#fca5a5', marginTop: '1rem', fontWeight: 600 }}>
              ⚠️ {error}
            </p>
          )}
        </section>

        {/* Fetched Bill Card & Payment Action */}
        {billData && (
          <section style={{ background: 'var(--bg-highlight)', border: '2px solid var(--accent-primary)', borderRadius: '20px', padding: '1.75rem', marginBottom: '2.5rem', boxShadow: '0 4px 20px var(--shadow-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--accent-primary)', fontWeight: 800 }}>
                  BBPS OUTSTANDING BILL DETECTED
                </span>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  {billData.customerName}
                </h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Biller: {billData.billerName} · Consumer #: {billData.consumerNumber}
                </span>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>Due Date: {billData.dueDate}</span>
                <h2 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--accent-primary)', margin: 0 }}>
                  ₹{billData.amount.toFixed(2)}
                </h2>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <button
                onClick={handlePayBill}
                disabled={paying}
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
                {paying ? 'Processing BBPS Payment...' : `Pay Outstanding Bill (₹${billData.amount.toFixed(2)})`}
              </button>
            </div>
          </section>
        )}

        {/* Bill Receipt Modal */}
        {receipt && (
          <section style={{ background: 'var(--bg-card)', border: '2px solid var(--accent-primary)', borderRadius: '20px', padding: '2rem', textAlign: 'center', boxShadow: '0 4px 30px var(--shadow-color)' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--badge-credit-bg)', color: 'var(--badge-credit-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 1rem auto' }}>
              ✓
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              BBPS Bill Paid Successfully!
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.3rem' }}>
              Transaction confirmation from Cyrus BBPS Aggregator
            </p>

            <div style={{ background: 'var(--bg-card-subtle)', borderRadius: '12px', padding: '1.25rem', margin: '1.5rem 0', textAlign: 'left', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Biller Board</span>
                <strong style={{ display: 'block', color: 'var(--text-primary)' }}>{selectedBiller}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Consumer Number</span>
                <strong style={{ display: 'block', color: 'var(--text-primary)' }}>{consumerNumber}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Receipt Number</span>
                <strong style={{ display: 'block', color: 'var(--accent-primary)' }}>{receipt.receiptNumber || 'RCPT-884912'}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>BBPS Reference</span>
                <strong style={{ display: 'block', color: 'var(--text-primary)' }}>{receipt.providerReference || 'BBPS-984512'}</strong>
              </div>
            </div>

            <button
              onClick={() => navigate('/dashboard')}
              style={{ padding: '0.75rem 1.5rem', background: 'var(--accent-primary)', color: '#ffffff', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}
            >
              Return to Dashboard
            </button>
          </section>
        )}
      </main>
    </div>
  );
}
