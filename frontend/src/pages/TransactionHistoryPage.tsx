import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavigationHeader from '../components/NavigationHeader';
import BottomNavBar from '../components/BottomNavBar';
import {
  getFilteredTransactions,
  getWalletActivityLog,
  TransactionDetailResponse,
  WalletActivityEntryResponse
} from '../lib/api';
import { getSession } from '../lib/session';

const formatCurrency = (val?: number) => `₹${(val ?? 0).toFixed(2)}`;

export default function TransactionHistoryPage() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'TRANSACTIONS' | 'ACTIVITY'>('TRANSACTIONS');

  // Story 11.1 Filters & State
  const [txType, setTxType] = useState('ALL');
  const [txStatus, setTxStatus] = useState('ALL');
  const [txFromDate, setTxFromDate] = useState('');
  const [txToDate, setTxToDate] = useState('');
  const [transactions, setTransactions] = useState<TransactionDetailResponse[]>([]);
  const [txLoading, setTxLoading] = useState(true);

  // Story 11.2 Filters & State
  const [actCategory, setActCategory] = useState('ALL');
  const [actFromDate, setActFromDate] = useState('');
  const [actToDate, setActToDate] = useState('');
  const [activities, setActivities] = useState<WalletActivityEntryResponse[]>([]);
  const [actLoading, setActLoading] = useState(true);

  const [expandedTxId, setExpandedTxId] = useState<number | null>(null);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      navigate('/', { replace: true });
      return;
    }
    void loadTransactions(session.userId);
    void loadWalletActivity(session.userId);
  }, [navigate]);

  const loadTransactions = async (userId: number, filterType = txType) => {
    try {
      setTxLoading(true);
      const fromIso = txFromDate ? `${txFromDate}T00:00:00Z` : undefined;
      const toIso = txToDate ? `${txToDate}T23:59:59Z` : undefined;
      const data = await getFilteredTransactions(userId, filterType, txStatus, fromIso, toIso);
      setTransactions(data || []);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setTxLoading(false);
    }
  };

  const loadWalletActivity = async (userId: number) => {
    try {
      setActLoading(true);
      const data = await getWalletActivityLog(userId, actFromDate, actToDate, actCategory);
      setActivities(data || []);
    } catch (err) {
      console.error('Error fetching wallet activity log:', err);
    } finally {
      setActLoading(false);
    }
  };

  const handleApplyTxFilter = () => {
    const session = getSession();
    if (session) void loadTransactions(session.userId);
  };

  const handleApplyActFilter = () => {
    const session = getSession();
    if (session) void loadWalletActivity(session.userId);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-canvas)', color: 'var(--text-primary)', transition: 'background 0.2s ease-in-out' }}>
      <NavigationHeader />

      <main style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1.5rem' }}>
        {/* Header Banner */}
        <section
          style={{
            background: 'var(--bg-card)',
            border: '2px solid var(--accent-primary)',
            borderRadius: '24px',
            padding: '1.75rem',
            color: 'var(--text-primary)',
            marginBottom: '2rem',
            boxShadow: '0 8px 30px var(--shadow-color)'
          }}
        >
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
              AUDIT & TRANSACTIONS
            </span>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0.2rem 0', color: 'var(--text-primary)' }}>
              Transaction History
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
              View all real-time payment transactions, status logs, and cashback ledger entries.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1.5rem', overflowX: 'auto', paddingBottom: '0.2rem' }}>
            {[
              { id: 'ALL', label: 'All' },
              { id: 'RECHARGE', label: 'Recharge' },
              { id: 'BILL_PAYMENT', label: 'Bills' },
              { id: 'CHECKOUT', label: 'Shopping' },
              { id: 'VOUCHER', label: 'Vouchers' }
            ].map((cat) => {
              const isSel = txType === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setTxType(cat.id);
                    const session = getSession();
                    if (session) void getFilteredTransactions(session.userId, cat.id, txStatus).then(setTransactions);
                  }}
                  style={{
                    padding: '0.45rem 1.25rem',
                    borderRadius: '20px',
                    background: isSel ? 'var(--accent-primary)' : 'var(--input-bg)',
                    color: isSel ? '#ffffff' : 'var(--text-primary)',
                    border: `1px solid ${isSel ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* Tab Selector */}
        <div style={{ display: 'flex', gap: '0.75rem', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem', paddingBottom: '0.5rem' }}>
          <button
            onClick={() => setActiveTab('TRANSACTIONS')}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              fontWeight: 700,
              cursor: 'pointer',
              background: activeTab === 'TRANSACTIONS' ? 'var(--bg-highlight)' : 'transparent',
              color: activeTab === 'TRANSACTIONS' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              border: activeTab === 'TRANSACTIONS' ? '1px solid var(--accent-primary)' : 'none',
              transition: 'all 0.15s'
            }}
          >
            🧾 Transaction History
          </button>
          <button
            onClick={() => setActiveTab('ACTIVITY')}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              fontWeight: 700,
              cursor: 'pointer',
              background: activeTab === 'ACTIVITY' ? 'var(--bg-highlight)' : 'transparent',
              color: activeTab === 'ACTIVITY' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              border: activeTab === 'ACTIVITY' ? '1px solid var(--accent-primary)' : 'none',
              transition: 'all 0.15s'
            }}
          >
            📜 Wallet Activity Log
          </button>
        </div>

        {/* TAB 1: Transaction History */}
        {activeTab === 'TRANSACTIONS' && (
          <div>
            {/* Filter Bar */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', boxShadow: '0 4px 20px var(--shadow-color)' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.3rem', fontWeight: 600 }}>Type</label>
                <select
                  value={txType}
                  onChange={(e) => setTxType(e.target.value)}
                  style={{ padding: '0.5rem 0.8rem', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                >
                  <option value="ALL">All Types</option>
                  <option value="CHECKOUT">Checkout</option>
                  <option value="RECHARGE">Recharge</option>
                  <option value="BILL_PAYMENT">Bill Payment</option>
                  <option value="VOUCHER">Voucher</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.3rem', fontWeight: 600 }}>Status</label>
                <select
                  value={txStatus}
                  onChange={(e) => setTxStatus(e.target.value)}
                  style={{ padding: '0.5rem 0.8rem', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="SUCCESS">Success</option>
                  <option value="FAILED">Failed</option>
                  <option value="PENDING">Pending</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.3rem', fontWeight: 600 }}>Start Date</label>
                <input
                  type="date"
                  value={txFromDate}
                  onChange={(e) => setTxFromDate(e.target.value)}
                  style={{ padding: '0.45rem 0.8rem', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.3rem', fontWeight: 600 }}>End Date</label>
                <input
                  type="date"
                  value={txToDate}
                  onChange={(e) => setTxToDate(e.target.value)}
                  style={{ padding: '0.45rem 0.8rem', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                />
              </div>

              <button
                onClick={handleApplyTxFilter}
                style={{ padding: '0.55rem 1.25rem', background: 'var(--accent-primary)', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', marginTop: 'auto' }}
              >
                Filter Transactions
              </button>
            </div>

            {/* Transaction List */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 20px var(--shadow-color)' }}>
              {txLoading ? (
                <p style={{ color: 'var(--text-secondary)' }}>Loading transaction history...</p>
              ) : transactions.length ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {transactions.map((tx) => {
                    const isSuccess = tx.status === 'SUCCESS';
                    const isFailed = tx.status === 'FAILED';
                    const isExpanded = expandedTxId === tx.id;

                    return (
                      <div
                        key={tx.id}
                        style={{
                          background: 'var(--bg-card-subtle)',
                          border: `1px solid ${isFailed ? '#fca5a5' : 'var(--border-color)'}`,
                          borderRadius: '12px',
                          padding: '1.25rem',
                          transition: 'all 0.2s'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{
                              width: '42px',
                              height: '42px',
                              borderRadius: '10px',
                              background: isFailed ? '#fee2e2' : 'var(--bg-highlight)',
                              color: isFailed ? '#b91c1c' : 'var(--accent-primary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                              fontSize: '1.1rem'
                            }}>
                              {isFailed ? '✕' : '✓'}
                            </div>
                            <div>
                              <strong style={{ fontSize: '1rem', color: 'var(--text-primary)', display: 'block' }}>
                                {tx.transactionType}
                              </strong>
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                Ref #{tx.id} · {tx.createdAt ? new Date(tx.createdAt).toLocaleString() : ''} · Provider: {tx.provider || 'Gateway'}
                              </span>
                            </div>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <strong style={{ fontSize: '1.1rem', color: isFailed ? '#fca5a5' : 'var(--text-primary)', display: 'block' }}>
                              {formatCurrency(tx.amount)}
                            </strong>
                            <span style={{
                              padding: '0.2rem 0.6rem',
                              borderRadius: '999px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              background: isSuccess ? 'var(--badge-credit-bg)' : isFailed ? 'var(--badge-debit-bg)' : '#451a03',
                              color: isSuccess ? 'var(--badge-credit-text)' : isFailed ? 'var(--badge-debit-text)' : '#fde047'
                            }}>
                              {tx.status}
                            </span>
                          </div>
                        </div>

                        {/* Breakdown Toggle Button */}
                        <div style={{ marginTop: '0.85rem', paddingTop: '0.85rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <button
                            onClick={() => setExpandedTxId(isExpanded ? null : tx.id)}
                            style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600, padding: 0 }}
                          >
                            {isExpanded ? '▲ Hide Payment Breakdown' : '▼ View Payment Breakdown'}
                          </button>

                          {isFailed && (
                            <span style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 600 }}>
                              ↺ Failed — Refund credited to Reversal Wallet
                            </span>
                          )}
                        </div>

                        {/* Payment Breakdown Card */}
                        {isExpanded && (
                          <div style={{ marginTop: '0.85rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '1rem', borderRadius: '10px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', fontSize: '0.85rem' }}>
                            <div>
                              <span style={{ color: 'var(--text-secondary)', display: 'block' }}>Reversal Wallet Used</span>
                              <strong style={{ color: 'var(--accent-primary)' }}>{formatCurrency(tx.reversalAmountApplied)}</strong>
                            </div>
                            <div>
                              <span style={{ color: 'var(--text-secondary)', display: 'block' }}>Wallet Balance Used</span>
                              <strong style={{ color: '#10b981' }}>{formatCurrency(tx.walletAmountApplied)}</strong>
                            </div>
                            <div>
                              <span style={{ color: 'var(--text-secondary)', display: 'block' }}>PG Gateway Amount</span>
                              <strong style={{ color: '#f59e0b' }}>{formatCurrency(tx.paymentGatewayAmount)}</strong>
                            </div>
                            {isFailed && (
                              <div>
                                <span style={{ color: 'var(--text-secondary)', display: 'block' }}>Reversal Refund Credit</span>
                                <strong style={{ color: '#ef4444' }}>{formatCurrency(tx.refundToReversal || (tx.walletAmountApplied || 0) + (tx.reversalAmountApplied || 0))}</strong>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
                  <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>🧾</span>
                  <strong style={{ color: 'var(--text-primary)', fontSize: '1.1rem', display: 'block', marginBottom: '0.3rem' }}>
                    No transactions recorded yet
                  </strong>
                  <p style={{ fontSize: '0.85rem', margin: 0 }}>
                    Every successful or failed payment transaction will be automatically logged here.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: Consolidated Wallet Activity Log */}
        {activeTab === 'ACTIVITY' && (
          <div>
            {/* Filter Bar */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', boxShadow: '0 4px 20px var(--shadow-color)' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.3rem', fontWeight: 600 }}>Category</label>
                <select
                  value={actCategory}
                  onChange={(e) => setActCategory(e.target.value)}
                  style={{ padding: '0.5rem 0.8rem', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                >
                  <option value="ALL">All Categories</option>
                  <option value="CASHBACK">Cashback</option>
                  <option value="REFERRAL">Referral Bonus</option>
                  <option value="VENDOR_ROYALTY">Vendor Royalty</option>
                  <option value="PINCODE_CHAMPIONSHIP">Pincode Championship Win</option>
                  <option value="PAYMENT">Payment</option>
                  <option value="PAYMENT_FAILED">Failed Payment</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.3rem', fontWeight: 600 }}>Start Date</label>
                <input
                  type="date"
                  value={actFromDate}
                  onChange={(e) => setActFromDate(e.target.value)}
                  style={{ padding: '0.45rem 0.8rem', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.3rem', fontWeight: 600 }}>End Date</label>
                <input
                  type="date"
                  value={actToDate}
                  onChange={(e) => setActToDate(e.target.value)}
                  style={{ padding: '0.45rem 0.8rem', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                />
              </div>

              <button
                onClick={handleApplyActFilter}
                style={{ padding: '0.55rem 1.25rem', background: 'var(--accent-primary)', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', marginTop: 'auto' }}
              >
                Filter Activity Log
              </button>
            </div>

            {/* Wallet Activity Log Table */}
            <section style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.75rem', boxShadow: '0 4px 20px var(--shadow-color)' }}>
              {actLoading ? (
                <p style={{ color: 'var(--text-secondary)' }}>Loading wallet activity log...</p>
              ) : activities.length ? (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                        <th style={{ padding: '0.75rem' }}>Date & Time</th>
                        <th style={{ padding: '0.75rem' }}>Category</th>
                        <th style={{ padding: '0.75rem' }}>Reference</th>
                        <th style={{ padding: '0.75rem', textAlign: 'right' }}>Amount</th>
                        <th style={{ padding: '0.75rem', textAlign: 'right' }}>Running Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activities.map((act) => {
                        const isCredit = act.amount > 0;

                        return (
                          <tr key={act.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>
                              {act.createdAt ? new Date(act.createdAt).toLocaleString() : '-'}
                            </td>
                            <td style={{ padding: '0.75rem' }}>
                              <span style={{
                                padding: '0.25rem 0.6rem',
                                borderRadius: '6px',
                                background: isCredit ? 'var(--badge-credit-bg)' : 'var(--badge-debit-bg)',
                                color: isCredit ? 'var(--badge-credit-text)' : 'var(--badge-debit-text)',
                                fontWeight: 700,
                                fontSize: '0.8rem',
                                display: 'inline-block'
                              }}>
                                {act.category}
                              </span>
                            </td>
                            <td style={{ padding: '0.75rem', color: 'var(--text-primary)' }}>
                              {act.sourceReference || '-'}
                            </td>
                            <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 700, color: isCredit ? 'var(--accent-primary)' : '#fca5a5' }}>
                              {isCredit ? `+₹${act.amount.toFixed(2)}` : `-₹${Math.abs(act.amount).toFixed(2)}`}
                            </td>
                            <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 800, color: 'var(--text-primary)' }}>
                              ₹{act.runningBalance.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
                  <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>📜</span>
                  <strong style={{ color: 'var(--text-primary)', fontSize: '1.1rem', display: 'block', marginBottom: '0.3rem' }}>
                    No wallet activity logged yet
                  </strong>
                  <p style={{ fontSize: '0.85rem', margin: 0 }}>
                    Every transaction and wallet balance movement will be logged here.
                  </p>
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      <BottomNavBar />
    </div>
  );
}
