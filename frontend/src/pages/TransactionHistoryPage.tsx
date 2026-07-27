import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavigationHeader from '../components/NavigationHeader';
import {
  getFilteredTransactions,
  getWalletActivityLog,
  loadDemoData,
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
  const [seedingDemo, setSeedingDemo] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      navigate('/', { replace: true });
      return;
    }
    void loadTransactions(session.userId);
    void loadWalletActivity(session.userId);
  }, [navigate]);

  const loadTransactions = async (userId: number) => {
    try {
      setTxLoading(true);
      const fromIso = txFromDate ? `${txFromDate}T00:00:00Z` : undefined;
      const toIso = txToDate ? `${txToDate}T23:59:59Z` : undefined;
      const data = await getFilteredTransactions(userId, txType, txStatus, fromIso, toIso);
      setTransactions(data);
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
      setActivities(data);
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

  const handleSeedDemoData = async () => {
    const session = getSession();
    if (!session) return;
    try {
      setSeedingDemo(true);
      await loadDemoData(session.userId);
      await loadTransactions(session.userId);
      await loadWalletActivity(session.userId);
    } catch (err: any) {
      alert(`Failed to load demo data: ${err.message}`);
    } finally {
      setSeedingDemo(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f4f8f7', color: '#0d2b26' }}>
      <NavigationHeader />

      <main style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1.5rem' }}>
        {/* Header Title */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#00685b', fontWeight: 700 }}>
              REPORTING & AUDIT
            </span>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, margin: '0.25rem 0', color: '#0d2b26' }}>
              Transaction History & Wallet Activity Log
            </h1>
            <p style={{ color: '#5b706c', fontSize: '0.95rem' }}>
              Track all service transactions, inspect multi-mode payment breakdowns, and audit running wallet balances.
            </p>
          </div>

          {/* Presentation Demo Data Seed Button */}
          <button
            onClick={handleSeedDemoData}
            disabled={seedingDemo}
            style={{
              padding: '0.75rem 1.25rem',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #00685b, #047857)',
              color: '#ffffff',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(0, 104, 91, 0.15)',
              transition: 'all 0.15s'
            }}
          >
            {seedingDemo ? 'Loading Multi-Date Demo Data...' : '⚡ Seed Demo Presentation Data'}
          </button>
        </div>

        {/* Tab Selector */}
        <div style={{ display: 'flex', gap: '0.75rem', borderBottom: '1px solid #e2ece9', marginBottom: '2rem', paddingBottom: '0.5rem' }}>
          <button
            onClick={() => setActiveTab('TRANSACTIONS')}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              fontWeight: 700,
              cursor: 'pointer',
              background: activeTab === 'TRANSACTIONS' ? '#e6f4f1' : 'transparent',
              color: activeTab === 'TRANSACTIONS' ? '#00685b' : '#5b706c',
              border: activeTab === 'TRANSACTIONS' ? '1px solid #00685b' : 'none',
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
              background: activeTab === 'ACTIVITY' ? '#e6f4f1' : 'transparent',
              color: activeTab === 'ACTIVITY' ? '#00685b' : '#5b706c',
              border: activeTab === 'ACTIVITY' ? '1px solid #00685b' : 'none',
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
            <div style={{ background: '#ffffff', border: '1px solid #e2ece9', borderRadius: '16px', padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', boxShadow: '0 4px 20px rgba(0, 104, 91, 0.04)' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#5b706c', marginBottom: '0.3rem', fontWeight: 600 }}>Type</label>
                <select
                  value={txType}
                  onChange={(e) => setTxType(e.target.value)}
                  style={{ padding: '0.5rem 0.8rem', background: '#ffffff', border: '1px solid #e2ece9', borderRadius: '8px', color: '#0d2b26', fontSize: '0.85rem' }}
                >
                  <option value="ALL">All Types</option>
                  <option value="CHECKOUT">Checkout</option>
                  <option value="RECHARGE">Recharge</option>
                  <option value="BILL_PAYMENT">Bill Payment</option>
                  <option value="VOUCHER">Voucher</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#5b706c', marginBottom: '0.3rem', fontWeight: 600 }}>Status</label>
                <select
                  value={txStatus}
                  onChange={(e) => setTxStatus(e.target.value)}
                  style={{ padding: '0.5rem 0.8rem', background: '#ffffff', border: '1px solid #e2ece9', borderRadius: '8px', color: '#0d2b26', fontSize: '0.85rem' }}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="SUCCESS">Success</option>
                  <option value="FAILED">Failed</option>
                  <option value="PENDING">Pending</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#5b706c', marginBottom: '0.3rem', fontWeight: 600 }}>Start Date</label>
                <input
                  type="date"
                  value={txFromDate}
                  onChange={(e) => setTxFromDate(e.target.value)}
                  style={{ padding: '0.45rem 0.8rem', background: '#ffffff', border: '1px solid #e2ece9', borderRadius: '8px', color: '#0d2b26', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#5b706c', marginBottom: '0.3rem', fontWeight: 600 }}>End Date</label>
                <input
                  type="date"
                  value={txToDate}
                  onChange={(e) => setTxToDate(e.target.value)}
                  style={{ padding: '0.45rem 0.8rem', background: '#ffffff', border: '1px solid #e2ece9', borderRadius: '8px', color: '#0d2b26', fontSize: '0.85rem' }}
                />
              </div>

              <button
                onClick={handleApplyTxFilter}
                style={{ padding: '0.55rem 1.25rem', background: '#00685b', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', marginTop: 'auto' }}
              >
                Filter Transactions
              </button>
            </div>

            {/* Transaction List */}
            <div style={{ background: '#ffffff', border: '1px solid #e2ece9', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0, 104, 91, 0.04)' }}>
              {txLoading ? (
                <p style={{ color: '#5b706c' }}>Loading transaction history...</p>
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
                          background: '#f4f8f7',
                          border: `1px solid ${isFailed ? '#fca5a5' : '#e2ece9'}`,
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
                              background: isFailed ? '#fee2e2' : '#e6f4f1',
                              color: isFailed ? '#b91c1c' : '#00685b',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                              fontSize: '1.1rem'
                            }}>
                              {isFailed ? '✕' : '✓'}
                            </div>
                            <div>
                              <strong style={{ fontSize: '1rem', color: '#0d2b26', display: 'block' }}>
                                {tx.transactionType}
                              </strong>
                              <span style={{ fontSize: '0.8rem', color: '#5b706c' }}>
                                Ref #{tx.id} · {tx.createdAt ? new Date(tx.createdAt).toLocaleString() : ''} · Provider: {tx.provider || 'Gateway'}
                              </span>
                            </div>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <strong style={{ fontSize: '1.1rem', color: isFailed ? '#b91c1c' : '#0d2b26', display: 'block' }}>
                              {formatCurrency(tx.amount)}
                            </strong>
                            <span style={{
                              padding: '0.2rem 0.6rem',
                              borderRadius: '999px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              background: isSuccess ? '#dcfce7' : isFailed ? '#fee2e2' : '#fef3c7',
                              color: isSuccess ? '#15803d' : isFailed ? '#b91c1c' : '#b45309'
                            }}>
                              {tx.status}
                            </span>
                          </div>
                        </div>

                        {/* Breakdown Toggle Button */}
                        <div style={{ marginTop: '0.85rem', paddingTop: '0.85rem', borderTop: '1px solid #e2ece9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <button
                            onClick={() => setExpandedTxId(isExpanded ? null : tx.id)}
                            style={{ background: 'none', border: 'none', color: '#00685b', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600, padding: 0 }}
                          >
                            {isExpanded ? '▲ Hide Payment Breakdown' : '▼ View Payment Breakdown'}
                          </button>

                          {isFailed && (
                            <span style={{ fontSize: '0.8rem', color: '#b91c1c', fontWeight: 600 }}>
                              ↺ Failed — Refund credited to Reversal Wallet
                            </span>
                          )}
                        </div>

                        {/* Payment Breakdown Card */}
                        {isExpanded && (
                          <div style={{ marginTop: '0.85rem', background: '#ffffff', border: '1px solid #e2ece9', padding: '1rem', borderRadius: '10px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', fontSize: '0.85rem' }}>
                            <div>
                              <span style={{ color: '#5b706c', display: 'block' }}>Reversal Wallet Used</span>
                              <strong style={{ color: '#00685b' }}>{formatCurrency(tx.reversalAmountApplied)}</strong>
                            </div>
                            <div>
                              <span style={{ color: '#5b706c', display: 'block' }}>Wallet Balance Used</span>
                              <strong style={{ color: '#059669' }}>{formatCurrency(tx.walletAmountApplied)}</strong>
                            </div>
                            <div>
                              <span style={{ color: '#5b706c', display: 'block' }}>PG Gateway Amount</span>
                              <strong style={{ color: '#d97706' }}>{formatCurrency(tx.paymentGatewayAmount)}</strong>
                            </div>
                            {isFailed && (
                              <div>
                                <span style={{ color: '#5b706c', display: 'block' }}>Reversal Refund Credit</span>
                                <strong style={{ color: '#b91c1c' }}>{formatCurrency(tx.refundToReversal || (tx.walletAmountApplied || 0) + (tx.reversalAmountApplied || 0))}</strong>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#5b706c' }}>
                  <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>🧾</span>
                  <strong>No transactions found</strong>
                  <p style={{ fontSize: '0.85rem' }}>Click <strong>⚡ Seed Demo Presentation Data</strong> above to populate multi-date transactions for your presentation.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: Consolidated Wallet Activity Log */}
        {activeTab === 'ACTIVITY' && (
          <div>
            {/* Filter Bar */}
            <div style={{ background: '#ffffff', border: '1px solid #e2ece9', borderRadius: '16px', padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', boxShadow: '0 4px 20px rgba(0, 104, 91, 0.04)' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#5b706c', marginBottom: '0.3rem', fontWeight: 600 }}>Category</label>
                <select
                  value={actCategory}
                  onChange={(e) => setActCategory(e.target.value)}
                  style={{ padding: '0.5rem 0.8rem', background: '#ffffff', border: '1px solid #e2ece9', borderRadius: '8px', color: '#0d2b26', fontSize: '0.85rem' }}
                >
                  <option value="ALL">All Categories</option>
                  <option value="CASHBACK">Cashback</option>
                  <option value="REFERRAL">Referral Bonus</option>
                  <option value="VENDOR_ROYALTY">Vendor Royalty</option>
                  <option value="PINCODE_CHAMPIONSHIP">Pincode Championship Win</option>
                  <option value="PROMOTIONAL_ADD_ON">Admin Promotional Add-On</option>
                  <option value="CHECKOUT">Checkout Debit</option>
                  <option value="REFUND">Refund</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#5b706c', marginBottom: '0.3rem', fontWeight: 600 }}>Start Date</label>
                <input
                  type="date"
                  value={actFromDate}
                  onChange={(e) => setActFromDate(e.target.value)}
                  style={{ padding: '0.45rem 0.8rem', background: '#ffffff', border: '1px solid #e2ece9', borderRadius: '8px', color: '#0d2b26', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#5b706c', marginBottom: '0.3rem', fontWeight: 600 }}>End Date</label>
                <input
                  type="date"
                  value={actToDate}
                  onChange={(e) => setActToDate(e.target.value)}
                  style={{ padding: '0.45rem 0.8rem', background: '#ffffff', border: '1px solid #e2ece9', borderRadius: '8px', color: '#0d2b26', fontSize: '0.85rem' }}
                />
              </div>

              <button
                onClick={handleApplyActFilter}
                style={{ padding: '0.55rem 1.25rem', background: '#00685b', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', marginTop: 'auto' }}
              >
                Filter Activity Log
              </button>
            </div>

            {/* Wallet Activity Log Table */}
            <section style={{ background: '#ffffff', border: '1px solid #e2ece9', borderRadius: '16px', padding: '1.75rem', boxShadow: '0 4px 20px rgba(0, 104, 91, 0.04)' }}>
              {actLoading ? (
                <p style={{ color: '#5b706c' }}>Loading wallet activity log...</p>
              ) : activities.length ? (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #e2ece9', textAlign: 'left', color: '#5b706c' }}>
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
                          <tr key={act.id} style={{ borderBottom: '1px solid #f4f8f7' }}>
                            <td style={{ padding: '0.75rem', color: '#5b706c' }}>
                              {act.createdAt ? new Date(act.createdAt).toLocaleString() : '-'}
                            </td>
                            <td style={{ padding: '0.75rem' }}>
                              <span style={{
                                padding: '0.25rem 0.6rem',
                                borderRadius: '6px',
                                background: isCredit ? '#dcfce7' : '#fee2e2',
                                color: isCredit ? '#15803d' : '#b91c1c',
                                fontWeight: 700,
                                fontSize: '0.8rem'
                              }}>
                                {act.category}
                              </span>
                            </td>
                            <td style={{ padding: '0.75rem', color: '#0d2b26' }}>
                              {act.sourceReference || '-'}
                            </td>
                            <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 700, color: isCredit ? '#059669' : '#dc2626' }}>
                              {isCredit ? `+₹${act.amount.toFixed(2)}` : `-₹${Math.abs(act.amount).toFixed(2)}`}
                            </td>
                            <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 800, color: '#0d2b26' }}>
                              ₹{act.runningBalance.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#5b706c' }}>
                  <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>📜</span>
                  <strong>No wallet activity entries found</strong>
                  <p style={{ fontSize: '0.85rem' }}>Click <strong>⚡ Seed Demo Presentation Data</strong> above to populate multi-date wallet log entries.</p>
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
