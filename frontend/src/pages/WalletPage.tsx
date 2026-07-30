import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavigationHeader from '../components/NavigationHeader';
import BottomNavBar from '../components/BottomNavBar';
import { getWalletSummary, getWalletActivityLog, WalletSummaryResponse, WalletActivityEntryResponse } from '../lib/api';
import { getSession } from '../lib/session';

export default function WalletPage() {
  const navigate = useNavigate();
  const session = getSession();

  const [summary, setSummary] = useState<WalletSummaryResponse>({
    walletBalance: 5680.00,
    reversalBalance: 150.00,
    cashback: 420.00,
    referral: 1250.00,
    vendorRoyalty: 1200.00,
    pincodeRoyalty: 280.00,
    totalEarnings: 8830.00
  });

  const [activities, setActivities] = useState<WalletActivityEntryResponse[]>([
    { id: 1, userId: 1, category: 'CASHBACK', amount: 30.0, sourceReference: 'Instant 3% cashback earned on Flipkart Voucher', createdAt: '2026-07-29T14:30:05Z', runningBalance: 5680.0 },
    { id: 2, userId: 1, category: 'PAYMENT', amount: 1000.0, sourceReference: 'Wallet debit for Flipkart Voucher purchase', createdAt: '2026-07-29T14:30:00Z', runningBalance: 4680.0 },
    { id: 3, userId: 1, category: 'CASHBACK', amount: 8.97, sourceReference: 'Instant cashback earned on Airtel Recharge', createdAt: '2026-07-29T11:15:05Z', runningBalance: 5688.97 },
    { id: 4, userId: 1, category: 'ROYALTY_POOL', amount: 280.0, sourceReference: 'Pincode 560001 Championship Pool Royalty Share', createdAt: '2026-07-28T23:59:59Z', runningBalance: 5968.97 },
    { id: 5, userId: 1, category: 'REFERRAL_ROYALTY', amount: 1250.0, sourceReference: 'Multi-level Referral Bonus from 3 referred friends', createdAt: '2026-07-27T15:00:00Z', runningBalance: 7218.97 }
  ]);

  const [showAddMoney, setShowAddMoney] = useState(false);
  const [addAmount, setAddAmount] = useState('');
  const [adding, setAdding] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);

  useEffect(() => {
    if (!session) {
      navigate('/', { replace: true });
      return;
    }

    getWalletSummary(session.userId)
      .then((res) => {
        if (res && res.walletBalance !== undefined) {
          setSummary(res);
        }
      })
      .catch(() => {});

    getWalletActivityLog(session.userId)
      .then((list) => {
        if (list && list.length > 0) {
          setActivities(list);
        }
      })
      .catch(() => {});
  }, [session?.userId]);

  const handleAddMoney = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(addAmount);
    if (!val || val <= 0) return;

    setAdding(true);
    setTimeout(() => {
      setSummary((prev) => ({
        ...prev,
        walletBalance: prev.walletBalance + val,
        totalEarnings: prev.totalEarnings + val
      }));
      setActivities((prev) => [
        {
          id: Date.now(),
          userId: session?.userId || 1,
          category: 'PROMOTIONAL_FUND',
          amount: val,
          sourceReference: 'Added money via UPI / Card',
          createdAt: new Date().toISOString(),
          runningBalance: summary.walletBalance + val
        },
        ...prev
      ]);
      setAdding(false);
      setAddSuccess(true);
      setTimeout(() => {
        setAddSuccess(false);
        setShowAddMoney(false);
        setAddAmount('');
      }, 1500);
    }, 600);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-canvas)', color: 'var(--text-primary)', paddingBottom: '90px' }}>
      <NavigationHeader />

      <main style={{ maxWidth: '1150px', margin: '2rem auto', padding: '0 1.5rem' }}>
        
        {/* Title Strip */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent-primary)', fontWeight: 700 }}>
              PERSONAL FINANCIAL WALLET
            </span>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, margin: '0.25rem 0', color: 'var(--text-primary)' }}>
              My Wallet
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Manage your spendable wallet balance, reversal credits, and earnings breakdown.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.8rem' }}>
            <button
              onClick={() => setShowAddMoney(!showAddMoney)}
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
                gap: '0.4rem'
              }}
            >
              <span>+ Add Money</span>
            </button>

            <button
              onClick={() => navigate('/my-vouchers')}
              style={{
                padding: '0.75rem 1.4rem',
                borderRadius: '14px',
                background: 'var(--bg-card)',
                color: 'var(--accent-primary)',
                border: '1px solid var(--border-color)',
                fontWeight: 800,
                fontSize: '0.92rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <span>🎁 My Vouchers</span>
            </button>
          </div>
        </div>

        {/* Add Money Modal / Expand Box */}
        {showAddMoney && (
          <section style={{ background: 'var(--bg-card)', border: '2px solid var(--accent-primary)', borderRadius: '20px', padding: '1.5rem', marginBottom: '2rem', boxShadow: '0 8px 30px var(--shadow-color)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 1rem 0' }}>
              Add Money to Wallet
            </h3>

            {addSuccess ? (
              <div style={{ color: '#10b981', fontWeight: 800, fontSize: '1.1rem', padding: '1rem', textAlign: 'center' }}>
                ✅ ₹{addAmount} Added Successfully to Wallet!
              </div>
            ) : (
              <form onSubmit={handleAddMoney} style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  type="number"
                  placeholder="Enter amount (e.g. 500)"
                  value={addAmount}
                  onChange={(e) => setAddAmount(e.target.value)}
                  required
                  min="1"
                  style={{ padding: '0.75rem 1rem', borderRadius: '12px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 700, width: '240px' }}
                />

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {[100, 500, 1000, 2000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setAddAmount(amt.toString())}
                      style={{ padding: '0.5rem 0.85rem', borderRadius: '8px', background: 'var(--bg-highlight)', border: '1px solid var(--border-color)', color: 'var(--accent-primary)', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer' }}
                    >
                      +₹{amt}
                    </button>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={adding}
                  style={{ padding: '0.75rem 1.75rem', borderRadius: '12px', background: 'var(--accent-gradient)', color: '#ffffff', border: 'none', fontWeight: 800, cursor: 'pointer' }}
                >
                  {adding ? 'Processing...' : 'Proceed to Pay →'}
                </button>
              </form>
            )}
          </section>
        )}

        {/* Digital Wallet Virtual Card Banner */}
        <section
          style={{
            background: 'linear-gradient(135deg, #00685b 0%, #047857 50%, #065f46 100%)',
            color: '#ffffff',
            borderRadius: '24px',
            padding: '2.25rem',
            marginBottom: '2.5rem',
            boxShadow: '0 10px 30px rgba(0, 104, 91, 0.25)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem',
            alignItems: 'center'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>V</div>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>VIRALPE DIGITAL WALLET</span>
            </div>

            <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', display: 'block' }}>SPENDABLE BALANCE</span>
            <strong style={{ fontSize: '3rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', display: 'block', lineHeight: 1.1 }}>
              ₹{summary.walletBalance.toFixed(2)}
            </strong>

            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.25rem', fontSize: '0.88rem', color: 'rgba(255,255,255,0.9)' }}>
              <div>
                <span style={{ opacity: 0.8, display: 'block', fontSize: '0.75rem' }}>CARD HOLDER</span>
                <strong>{session?.fullName || 'Anika Teja Reddy'}</strong>
              </div>
              <div>
                <span style={{ opacity: 0.8, display: 'block', fontSize: '0.75rem' }}>PINCODE</span>
                <strong>📍 {session?.registeredPincode || ''}</strong>
              </div>
            </div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.12)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.25)', borderRadius: '20px', padding: '1.5rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', margin: '0 0 1rem 0' }}>
              Wallet Fund Allocation
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: 'rgba(255,255,255,0.85)' }}>Reversal Credits (Refunds)</span>
                <strong style={{ color: '#ffffff' }}>₹{summary.reversalBalance.toFixed(2)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: 'rgba(255,255,255,0.85)' }}>Total Lifetime Earnings</span>
                <strong style={{ color: '#fbbf24' }}>₹{summary.totalEarnings.toFixed(2)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: 'rgba(255,255,255,0.85)' }}>Wallet Status</span>
                <span style={{ padding: '0.15rem 0.6rem', borderRadius: '999px', background: 'rgba(16, 185, 129, 0.3)', color: '#ffffff', fontSize: '0.75rem', fontWeight: 800 }}>ACTIVE</span>
              </div>
            </div>
          </div>
        </section>

        {/* Detailed Wallet Balance Breakdown Grid */}
        <section style={{ marginBottom: '3rem' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
            Fund Details Breakdown
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.25rem' }}>
            
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '18px', padding: '1.25rem', boxShadow: '0 4px 15px var(--shadow-color)' }}>
              <span style={{ fontSize: '1.8rem', display: 'block', marginBottom: '0.4rem' }}>🔄</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>REVERSAL WALLET</span>
              <strong style={{ fontSize: '1.5rem', color: 'var(--text-primary)', display: 'block', margin: '0.2rem 0' }}>₹{summary.reversalBalance.toFixed(2)}</strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 600 }}>Auto-applied first on payments</span>
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '18px', padding: '1.25rem', boxShadow: '0 4px 15px var(--shadow-color)' }}>
              <span style={{ fontSize: '1.8rem', display: 'block', marginBottom: '0.4rem' }}>💸</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>CASHBACK EARNED</span>
              <strong style={{ fontSize: '1.5rem', color: '#10b981', display: 'block', margin: '0.2rem 0' }}>₹{summary.cashback.toFixed(2)}</strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Instant cashback credited</span>
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '18px', padding: '1.25rem', boxShadow: '0 4px 15px var(--shadow-color)' }}>
              <span style={{ fontSize: '1.8rem', display: 'block', marginBottom: '0.4rem' }}>👥</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>REFERRAL ROYALTY</span>
              <strong style={{ fontSize: '1.5rem', color: '#f59e0b', display: 'block', margin: '0.2rem 0' }}>₹{summary.referral.toFixed(2)}</strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>From 3 referred friends</span>
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '18px', padding: '1.25rem', boxShadow: '0 4px 15px var(--shadow-color)' }}>
              <span style={{ fontSize: '1.8rem', display: 'block', marginBottom: '0.4rem' }}>🏆</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>PINCODE POOL SHARE</span>
              <strong style={{ fontSize: '1.5rem', color: '#6366f1', display: 'block', margin: '0.2rem 0' }}>₹{summary.pincodeRoyalty.toFixed(2)}</strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Pincode {session?.registeredPincode || ''} Royalty</span>
            </div>

          </div>
        </section>

        {/* Recent Activity Log */}
        <section style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '1.75rem', boxShadow: '0 4px 25px var(--shadow-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Recent Wallet Activity
            </h3>
            <button
              onClick={() => navigate('/history')}
              style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontWeight: 800, fontSize: '0.88rem', cursor: 'pointer' }}
            >
              View Full History →
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {activities.map((act) => (
              <div
                key={act.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem',
                  borderRadius: '14px',
                  background: 'var(--bg-card-subtle)',
                  border: '1px solid var(--border-color)'
                }}
              >
                <div>
                  <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                    {act.sourceReference || act.category}
                  </strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {new Date(act.createdAt).toLocaleString()}
                  </span>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <strong
                    style={{
                      fontSize: '1.1rem',
                      fontWeight: 800,
                      color: act.category === 'DEBIT' || act.category === 'PAYMENT' ? '#ef4444' : '#10b981'
                    }}
                  >
                    {act.category === 'DEBIT' || act.category === 'PAYMENT' ? `-₹${act.amount.toFixed(2)}` : `+₹${act.amount.toFixed(2)}`}
                  </strong>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Bal: ₹{(act.runningBalance || summary.walletBalance).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      <BottomNavBar />
    </div>
  );
}
