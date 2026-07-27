import { FormEvent, useEffect, useState } from 'react';
import NavigationHeader from '../components/NavigationHeader';
import {
  createAdminPincode,
  fundUserPromotional,
  getAdminAuditLogs,
  getAdminPincodes,
  getRoyaltyHistory,
  getVerticalRoyaltyConfigs,
  searchAdminUsers,
  toggleAdminPincodeActive,
  updateVerticalRoyaltyConfig,
  AdminAuditLog,
  PincodeMaster,
  RoyaltyConfiguration,
  RoyaltyConfigurationHistory,
  UserProfileResponse
} from '../lib/api';

export default function AdminPlatformPage() {
  const [activeTab, setActiveTab] = useState<'FUNDS' | 'PINCODES' | 'ROYALTY'>('FUNDS');

  // Story 10.1 State
  const [users, setUsers] = useState<UserProfileResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [fundAmount, setFundAmount] = useState('');
  const [fundReason, setFundReason] = useState('');
  const [fundLoading, setFundLoading] = useState(false);
  const [fundSuccess, setFundSuccess] = useState('');
  const [fundError, setFundError] = useState('');
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);

  // Story 10.2 State
  const [pincodes, setPincodes] = useState<PincodeMaster[]>([]);
  const [pincodeSearch, setPincodeSearch] = useState('');
  const [newPincode, setNewPincode] = useState({ pincode: '', city: '', district: '', state: '', active: true });
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeMsg, setPincodeMsg] = useState('');

  // Story 10.3 State
  const [royaltyConfigs, setRoyaltyConfigs] = useState<RoyaltyConfiguration[]>([]);
  const [royaltyHistory, setRoyaltyHistory] = useState<RoyaltyConfigurationHistory[]>([]);
  const [editingConfig, setEditingConfig] = useState<Partial<RoyaltyConfiguration> | null>(null);
  const [royaltyMsg, setRoyaltyMsg] = useState('');

  useEffect(() => {
    void loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const [usersData, logsData, pincodesData, configsData, historyData] = await Promise.all([
        searchAdminUsers(),
        getAdminAuditLogs(),
        getAdminPincodes(),
        getVerticalRoyaltyConfigs(),
        getRoyaltyHistory()
      ]);
      setUsers(usersData);
      setAuditLogs(logsData);
      setPincodes(pincodesData);
      setRoyaltyConfigs(configsData);
      setRoyaltyHistory(historyData);
    } catch (e: any) {
      console.error('Error loading admin platform data:', e);
    }
  };

  // Fund Submission
  const handleFundSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) {
      setFundError('Please select a target user.');
      return;
    }
    const amt = parseFloat(fundAmount);
    if (isNaN(amt) || amt <= 0) {
      setFundError('Please enter a valid amount greater than 0.');
      return;
    }
    if (!fundReason.trim()) {
      setFundError('A reason or campaign note is mandatory.');
      return;
    }

    setFundLoading(true);
    setFundError('');
    setFundSuccess('');

    try {
      const res = await fundUserPromotional(selectedUserId, amt, fundReason.trim());
      setFundSuccess(`Successfully credited ₹${amt.toFixed(2)} to User #${selectedUserId}! New Wallet Balance: ₹${res.walletBalance.toFixed(2)}.`);
      setFundAmount('');
      setFundReason('');
      setSelectedUserId(null);
      await loadAllData();
    } catch (err: any) {
      setFundError(err.message || 'Failed to inject funds.');
    } finally {
      setFundLoading(false);
    }
  };

  // Pincode Actions
  const handleCreatePincode = async (e: FormEvent) => {
    e.preventDefault();
    if (!newPincode.pincode || newPincode.pincode.length !== 6) {
      setPincodeMsg('Pincode must be 6 digits.');
      return;
    }
    try {
      setPincodeLoading(true);
      await createAdminPincode(newPincode);
      setPincodeMsg(`Pincode ${newPincode.pincode} created successfully.`);
      setNewPincode({ pincode: '', city: '', district: '', state: '', active: true });
      await loadAllData();
    } catch (err: any) {
      setPincodeMsg(`Error: ${err.message}`);
    } finally {
      setPincodeLoading(false);
    }
  };

  const handleTogglePincode = async (pincodeVal: string) => {
    try {
      await toggleAdminPincodeActive(pincodeVal);
      await loadAllData();
    } catch (err: any) {
      setPincodeMsg(`Error toggling pincode: ${err.message}`);
    }
  };

  // Royalty Configuration update
  const handleSaveRoyalty = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingConfig || !editingConfig.category) return;
    try {
      setRoyaltyMsg('');
      await updateVerticalRoyaltyConfig(editingConfig as RoyaltyConfiguration);
      setRoyaltyMsg(`Updated ${editingConfig.category} percentage configuration successfully.`);
      setEditingConfig(null);
      await loadAllData();
    } catch (err: any) {
      setRoyaltyMsg(`Error updating config: ${err.message}`);
    }
  };

  const filteredUsers = users.filter((u) => {
    const targetId = u.userId ?? u.id;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (u.fullName && u.fullName.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (targetId && targetId.toString().includes(q))
    );
  });

  const filteredPincodes = pincodes.filter((p) => {
    if (!pincodeSearch) return true;
    const q = pincodeSearch.toLowerCase();
    return (
      p.pincode.includes(q) ||
      (p.city && p.city.toLowerCase().includes(q)) ||
      (p.state && p.state.toLowerCase().includes(q))
    );
  });

  return (
    <div style={{ minHeight: '100vh', background: '#f4f8f7', color: '#0d2b26' }}>
      <NavigationHeader />

      <main style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1.5rem' }}>
        {/* Header Title */}
        <div style={{ marginBottom: '2rem' }}>
          <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#00685b', fontWeight: 700 }}>
            ADMINISTRATION PLATFORM
          </span>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, margin: '0.25rem 0', color: '#0d2b26' }}>
            Admin Platform Management
          </h1>
          <p style={{ color: '#5b706c', fontSize: '0.95rem' }}>
            Inject promotional add-on funds with mandatory audit notes, manage master pincodes for onboarding, and configure royalty percentage splits.
          </p>
        </div>

        {/* Tab Selector */}
        <div style={{ display: 'flex', gap: '0.75rem', borderBottom: '1px solid #e2ece9', marginBottom: '2rem', paddingBottom: '0.5rem' }}>
          <button
            onClick={() => setActiveTab('FUNDS')}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              fontWeight: 700,
              cursor: 'pointer',
              background: activeTab === 'FUNDS' ? '#e6f4f1' : 'transparent',
              color: activeTab === 'FUNDS' ? '#00685b' : '#5b706c',
              border: activeTab === 'FUNDS' ? '1px solid #00685b' : 'none',
              transition: 'all 0.15s'
            }}
          >
            💵 Promotional Fund Injection
          </button>
          <button
            onClick={() => setActiveTab('PINCODES')}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              fontWeight: 700,
              cursor: 'pointer',
              background: activeTab === 'PINCODES' ? '#e6f4f1' : 'transparent',
              color: activeTab === 'PINCODES' ? '#00685b' : '#5b706c',
              border: activeTab === 'PINCODES' ? '1px solid #00685b' : 'none',
              transition: 'all 0.15s'
            }}
          >
            🗺️ Pincode Master Directory
          </button>
          <button
            onClick={() => setActiveTab('ROYALTY')}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              fontWeight: 700,
              cursor: 'pointer',
              background: activeTab === 'ROYALTY' ? '#e6f4f1' : 'transparent',
              color: activeTab === 'ROYALTY' ? '#00685b' : '#5b706c',
              border: activeTab === 'ROYALTY' ? '1px solid #00685b' : 'none',
              transition: 'all 0.15s'
            }}
          >
            ⚙️ Royalty Percentage Config
          </button>
        </div>

        {/* TAB 1: Fund Injection (Story 10.1) */}
        {activeTab === 'FUNDS' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <section style={{ background: '#ffffff', border: '1px solid #e2ece9', borderRadius: '16px', padding: '1.75rem', boxShadow: '0 4px 20px rgba(0, 104, 91, 0.04)' }}>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#0d2b26' }}>Inject Promotional Add-On Funds</h2>
              <form onSubmit={handleFundSubmit}>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#5b706c', marginBottom: '0.5rem', fontWeight: 600 }}>
                    1. Search & Select Target User *
                  </label>
                  <input
                    type="text"
                    placeholder="Search user by name, email or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem', background: '#ffffff', border: '1px solid #e2ece9', borderRadius: '8px', color: '#0d2b26', marginBottom: '0.5rem' }}
                  />
                  <select
                    size={4}
                    value={selectedUserId || ''}
                    onChange={(e) => setSelectedUserId(Number(e.target.value))}
                    style={{ width: '100%', padding: '0.5rem', background: '#ffffff', border: '1px solid #e2ece9', borderRadius: '8px', color: '#0d2b26' }}
                  >
                    {filteredUsers.map((u) => {
                      const idVal = u.userId ?? u.id;
                      return (
                        <option key={idVal} value={idVal}>
                          User #{idVal} — {u.fullName || 'No Name'} ({u.email || 'No email'})
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#5b706c', marginBottom: '0.5rem', fontWeight: 600 }}>
                    2. Credit Amount (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 500.00"
                    value={fundAmount}
                    onChange={(e) => setFundAmount(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem', background: '#ffffff', border: '1px solid #e2ece9', borderRadius: '8px', color: '#0d2b26' }}
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#5b706c', marginBottom: '0.5rem', fontWeight: 600 }}>
                    3. Reason / Campaign Note (Mandatory for Audit) *
                  </label>
                  <textarea
                    rows={3}
                    placeholder="State reason for fund injection (e.g. Festive Campaign Credit, Refund adjustment)..."
                    value={fundReason}
                    onChange={(e) => setFundReason(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem', background: '#ffffff', border: '1px solid #e2ece9', borderRadius: '8px', color: '#0d2b26' }}
                  />
                </div>

                {fundError && <p style={{ color: '#dc2626', marginBottom: '1rem', fontSize: '0.85rem', fontWeight: 600 }}>{fundError}</p>}
                {fundSuccess && <p style={{ color: '#059669', marginBottom: '1rem', fontSize: '0.85rem', fontWeight: 600 }}>{fundSuccess}</p>}

                <button
                  type="submit"
                  disabled={fundLoading}
                  style={{
                    width: '100%',
                    padding: '0.85rem',
                    background: 'linear-gradient(135deg, #00685b, #047857)',
                    color: '#ffffff',
                    fontWeight: 700,
                    borderRadius: '10px',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {fundLoading ? 'Processing...' : '💳 Credit Wallet Balance Immediately'}
                </button>
              </form>
            </section>

            {/* Audit Log Table */}
            <section style={{ background: '#ffffff', border: '1px solid #e2ece9', borderRadius: '16px', padding: '1.75rem', boxShadow: '0 4px 20px rgba(0, 104, 91, 0.04)' }}>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#0d2b26' }}>Admin Fund Audit Trail</h2>
              <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
                {auditLogs.length ? (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #e2ece9', textAlign: 'left', color: '#5b706c' }}>
                        <th style={{ padding: '0.5rem' }}>Time</th>
                        <th style={{ padding: '0.5rem' }}>Target</th>
                        <th style={{ padding: '0.5rem' }}>Amount</th>
                        <th style={{ padding: '0.5rem' }}>Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.map((log) => (
                        <tr key={log.id} style={{ borderBottom: '1px solid #f4f8f7' }}>
                          <td style={{ padding: '0.6rem', color: '#5b706c' }}>
                            {log.createdAt ? new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                          </td>
                          <td style={{ padding: '0.6rem', fontWeight: 600, color: '#0d2b26' }}>User #{log.targetUserId || '-'}</td>
                          <td style={{ padding: '0.6rem', color: '#059669', fontWeight: 700 }}>
                            {log.amount ? `+₹${log.amount.toFixed(2)}` : '-'}
                          </td>
                          <td style={{ padding: '0.6rem', color: '#0d2b26' }}>{log.reason || log.details || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p style={{ color: '#5b706c', fontSize: '0.9rem' }}>No audit trail logs recorded yet.</p>
                )}
              </div>
            </section>
          </div>
        )}

        {/* TAB 2: Pincode Master Directory (Story 10.2) */}
        {activeTab === 'PINCODES' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
            <section style={{ background: '#ffffff', border: '1px solid #e2ece9', borderRadius: '16px', padding: '1.75rem', height: 'fit-content', boxShadow: '0 4px 20px rgba(0, 104, 91, 0.04)' }}>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#0d2b26' }}>Add Pincode to Master</h2>
              <form onSubmit={handleCreatePincode}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#5b706c', marginBottom: '0.4rem', fontWeight: 600 }}>Pincode (6-digit) *</label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="e.g. 560001"
                    value={newPincode.pincode}
                    onChange={(e) => setNewPincode({ ...newPincode, pincode: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem', background: '#ffffff', border: '1px solid #e2ece9', borderRadius: '8px', color: '#0d2b26' }}
                  />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#5b706c', marginBottom: '0.4rem', fontWeight: 600 }}>City *</label>
                  <input
                    type="text"
                    placeholder="e.g. Bengaluru"
                    value={newPincode.city}
                    onChange={(e) => setNewPincode({ ...newPincode, city: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem', background: '#ffffff', border: '1px solid #e2ece9', borderRadius: '8px', color: '#0d2b26' }}
                  />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#5b706c', marginBottom: '0.4rem', fontWeight: 600 }}>District</label>
                  <input
                    type="text"
                    placeholder="e.g. Bengaluru Urban"
                    value={newPincode.district}
                    onChange={(e) => setNewPincode({ ...newPincode, district: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem', background: '#ffffff', border: '1px solid #e2ece9', borderRadius: '8px', color: '#0d2b26' }}
                  />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#5b706c', marginBottom: '0.4rem', fontWeight: 600 }}>State *</label>
                  <input
                    type="text"
                    placeholder="e.g. Karnataka"
                    value={newPincode.state}
                    onChange={(e) => setNewPincode({ ...newPincode, state: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem', background: '#ffffff', border: '1px solid #e2ece9', borderRadius: '8px', color: '#0d2b26' }}
                  />
                </div>

                {pincodeMsg && <p style={{ color: '#059669', fontSize: '0.85rem', marginBottom: '1rem', fontWeight: 600 }}>{pincodeMsg}</p>}

                <button
                  type="submit"
                  disabled={pincodeLoading}
                  style={{ width: '100%', padding: '0.75rem', background: '#00685b', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Save Pincode
                </button>
              </form>
            </section>

            <section style={{ background: '#ffffff', border: '1px solid #e2ece9', borderRadius: '16px', padding: '1.75rem', boxShadow: '0 4px 20px rgba(0, 104, 91, 0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.25rem', color: '#0d2b26' }}>Pincode Master Directory ({pincodes.length})</h2>
                <input
                  type="text"
                  placeholder="Filter pincodes..."
                  value={pincodeSearch}
                  onChange={(e) => setPincodeSearch(e.target.value)}
                  style={{ padding: '0.5rem 1rem', background: '#ffffff', border: '1px solid #e2ece9', borderRadius: '8px', color: '#0d2b26', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e2ece9', textAlign: 'left', color: '#5b706c' }}>
                      <th style={{ padding: '0.6rem' }}>Pincode</th>
                      <th style={{ padding: '0.6rem' }}>City</th>
                      <th style={{ padding: '0.6rem' }}>State</th>
                      <th style={{ padding: '0.6rem' }}>Status</th>
                      <th style={{ padding: '0.6rem' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPincodes.map((p) => (
                      <tr key={p.pincode} style={{ borderBottom: '1px solid #f4f8f7' }}>
                        <td style={{ padding: '0.6rem', fontWeight: 700, color: '#00685b' }}>{p.pincode}</td>
                        <td style={{ padding: '0.6rem', color: '#0d2b26' }}>{p.city}</td>
                        <td style={{ padding: '0.6rem', color: '#0d2b26' }}>{p.state}</td>
                        <td style={{ padding: '0.6rem' }}>
                          <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', background: p.active ? '#dcfce7' : '#fee2e2', color: p.active ? '#15803d' : '#b91c1c', fontSize: '0.75rem', fontWeight: 700 }}>
                            {p.active ? 'ACTIVE' : 'INACTIVE'}
                          </span>
                        </td>
                        <td style={{ padding: '0.6rem' }}>
                          <button
                            onClick={() => handleTogglePincode(p.pincode)}
                            style={{ padding: '0.35rem 0.75rem', background: '#e2ece9', color: '#0d2b26', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}
                          >
                            {p.active ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {/* TAB 3: Royalty Percentage Split Config (Story 10.3) */}
        {activeTab === 'ROYALTY' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <section style={{ background: '#ffffff', border: '1px solid #e2ece9', borderRadius: '16px', padding: '1.75rem', boxShadow: '0 4px 20px rgba(0, 104, 91, 0.04)' }}>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#0d2b26' }}>Active Royalty Percentage Configurations</h2>
              {royaltyMsg && <p style={{ color: '#059669', marginBottom: '1rem', fontWeight: 600 }}>{royaltyMsg}</p>}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                {royaltyConfigs.map((cfg) => (
                  <div key={cfg.category} style={{ background: '#f4f8f7', border: '1px solid #e2ece9', borderRadius: '12px', padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#00685b' }}>{cfg.category}</span>
                      <button
                        onClick={() => setEditingConfig(cfg)}
                        style={{ padding: '0.4rem 0.8rem', background: '#00685b', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}
                      >
                        Configure Splits
                      </button>
                    </div>

                    <div style={{ fontSize: '0.85rem', color: '#0d2b26', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <div>Profit Margin: <strong>{cfg.profitMarginPercentage ?? 0}%</strong></div>
                      <div>Vertical Royalty: <strong>{cfg.verticalRoyaltyPercentage ?? 0}%</strong></div>
                      <div>User Cashback: <strong>{cfg.cashbackPercentage ?? 0}%</strong></div>
                      <div>Referral Bonus: <strong>{cfg.referralPercentage ?? 0}%</strong></div>
                      <div>Vendor Royalty: <strong>{cfg.vendorRoyaltyPercentage ?? 0}%</strong></div>
                      <div>Pincode Cashback Fraction: <strong>{cfg.pincodeCashbackFraction ?? 0.1}</strong></div>
                      <div>Pincode Vendor Fraction: <strong>{cfg.pincodeVendorFraction ?? 0.1}</strong></div>
                      <div style={{ marginTop: '0.5rem', color: '#5b706c', fontSize: '0.75rem' }}>
                        Effective From: {cfg.effectiveFrom ? new Date(cfg.effectiveFrom).toLocaleString() : 'Active'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Config Editor Modal/Form */}
            {editingConfig && (
              <section style={{ background: '#e6f4f1', border: '1px solid #c7e5df', borderRadius: '16px', padding: '1.75rem' }}>
                <h3 style={{ color: '#00685b', marginBottom: '1rem', fontWeight: 800 }}>Update {editingConfig.category} Percentage Splits</h3>
                <form onSubmit={handleSaveRoyalty} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#0d2b26', fontWeight: 600 }}>Cashback %</label>
                    <input
                      type="number"
                      step="0.1"
                      value={editingConfig.cashbackPercentage || 0}
                      onChange={(e) => setEditingConfig({ ...editingConfig, cashbackPercentage: parseFloat(e.target.value) })}
                      style={{ width: '100%', padding: '0.5rem', background: '#ffffff', border: '1px solid #e2ece9', color: '#0d2b26', borderRadius: '6px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#0d2b26', fontWeight: 600 }}>Referral Bonus %</label>
                    <input
                      type="number"
                      step="0.1"
                      value={editingConfig.referralPercentage || 0}
                      onChange={(e) => setEditingConfig({ ...editingConfig, referralPercentage: parseFloat(e.target.value) })}
                      style={{ width: '100%', padding: '0.5rem', background: '#ffffff', border: '1px solid #e2ece9', color: '#0d2b26', borderRadius: '6px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#0d2b26', fontWeight: 600 }}>Vendor Royalty %</label>
                    <input
                      type="number"
                      step="0.1"
                      value={editingConfig.vendorRoyaltyPercentage || 0}
                      onChange={(e) => setEditingConfig({ ...editingConfig, vendorRoyaltyPercentage: parseFloat(e.target.value) })}
                      style={{ width: '100%', padding: '0.5rem', background: '#ffffff', border: '1px solid #e2ece9', color: '#0d2b26', borderRadius: '6px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#0d2b26', fontWeight: 600 }}>Vertical Royalty %</label>
                    <input
                      type="number"
                      step="0.1"
                      value={editingConfig.verticalRoyaltyPercentage || 0}
                      onChange={(e) => setEditingConfig({ ...editingConfig, verticalRoyaltyPercentage: parseFloat(e.target.value) })}
                      style={{ width: '100%', padding: '0.5rem', background: '#ffffff', border: '1px solid #e2ece9', color: '#0d2b26', borderRadius: '6px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#0d2b26', fontWeight: 600 }}>Pincode Cashback Fraction</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingConfig.pincodeCashbackFraction || 0.1}
                      onChange={(e) => setEditingConfig({ ...editingConfig, pincodeCashbackFraction: parseFloat(e.target.value) })}
                      style={{ width: '100%', padding: '0.5rem', background: '#ffffff', border: '1px solid #e2ece9', color: '#0d2b26', borderRadius: '6px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#0d2b26', fontWeight: 600 }}>Pincode Vendor Fraction</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingConfig.pincodeVendorFraction || 0.1}
                      onChange={(e) => setEditingConfig({ ...editingConfig, pincodeVendorFraction: parseFloat(e.target.value) })}
                      style={{ width: '100%', padding: '0.5rem', background: '#ffffff', border: '1px solid #e2ece9', color: '#0d2b26', borderRadius: '6px' }}
                    />
                  </div>

                  <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button type="submit" style={{ padding: '0.75rem 1.5rem', background: '#00685b', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                      Save & Apply to Future Transactions
                    </button>
                    <button type="button" onClick={() => setEditingConfig(null)} style={{ padding: '0.75rem 1.5rem', background: '#ffffff', color: '#0d2b26', border: '1px solid #e2ece9', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                      Cancel
                    </button>
                  </div>
                </form>
              </section>
            )}

            {/* Audit History */}
            <section style={{ background: '#ffffff', border: '1px solid #e2ece9', borderRadius: '16px', padding: '1.75rem', boxShadow: '0 4px 20px rgba(0, 104, 91, 0.04)' }}>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#0d2b26' }}>Percentage Configuration Audit History</h2>
              <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e2ece9', textAlign: 'left', color: '#5b706c' }}>
                      <th style={{ padding: '0.5rem' }}>Timestamp</th>
                      <th style={{ padding: '0.5rem' }}>Category</th>
                      <th style={{ padding: '0.5rem' }}>Cashback %</th>
                      <th style={{ padding: '0.5rem' }}>Referral %</th>
                      <th style={{ padding: '0.5rem' }}>Vendor %</th>
                      <th style={{ padding: '0.5rem' }}>Effective From</th>
                    </tr>
                  </thead>
                  <tbody>
                    {royaltyHistory.map((h) => (
                      <tr key={h.id} style={{ borderBottom: '1px solid #f4f8f7' }}>
                        <td style={{ padding: '0.6rem', color: '#5b706c' }}>
                          {h.createdAt ? new Date(h.createdAt).toLocaleString() : '-'}
                        </td>
                        <td style={{ padding: '0.6rem', fontWeight: 700, color: '#00685b' }}>{h.category}</td>
                        <td style={{ padding: '0.6rem', color: '#0d2b26' }}>{h.cashbackPercentage ?? 0}%</td>
                        <td style={{ padding: '0.6rem', color: '#0d2b26' }}>{h.referralPercentage ?? 0}%</td>
                        <td style={{ padding: '0.6rem', color: '#0d2b26' }}>{h.vendorRoyaltyPercentage ?? 0}%</td>
                        <td style={{ padding: '0.6rem', color: '#059669', fontWeight: 600 }}>
                          {h.effectiveFrom ? new Date(h.effectiveFrom).toLocaleDateString() : 'Immediate'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
