import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavigationHeader from '../components/NavigationHeader';
import BottomNavBar from '../components/BottomNavBar';
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
import VoucherReceiptModal from '../components/VoucherReceiptModal';

const DEMO_ADMIN_USERS = [
  {
    userId: 1,
    fullName: 'Anika Teja Reddy',
    email: 'anikatejareddy0003@gmail.com',
    role: 'SUPER_ADMIN',
    profileComplete: true,
    registeredPincode: '560001',
    city: 'Bengaluru',
    state: 'Karnataka',
    authProvider: 'GOOGLE',
    walletBalance: 2450.00,
    totalEarnings: 8900.00,
    vouchers: [
      { brandName: 'Amazon Pay Gift Card', voucherCode: 'AMZN-TK99mQPB', voucherPin: '8899', denomination: 500, validTill: 'Dec 31, 2026' },
      { brandName: 'Flipkart Gift Voucher', voucherCode: 'FKRT-Y8M01923', voucherPin: '4412', denomination: 1000, validTill: 'Nov 30, 2026' },
      { brandName: 'Myntra Fashion Voucher', voucherCode: 'MYNT-TK03mQPBM67pSH', voucherPin: '5341', denomination: 1000, validTill: 'Dec 15, 2026' }
    ]
  },
  {
    userId: 2,
    fullName: 'Standard User',
    email: 'user.demo@gmail.com',
    role: 'USER',
    profileComplete: true,
    registeredPincode: '560001',
    city: 'Bengaluru',
    state: 'Karnataka',
    authProvider: 'GOOGLE',
    walletBalance: 1200.00,
    totalEarnings: 3200.00,
    vouchers: [
      { brandName: 'Swiggy Money Voucher', voucherCode: 'SWIG-Z3N88123', voucherPin: '3321', denomination: 250, validTill: 'Oct 15, 2026' },
      { brandName: 'Zomato Pro Voucher', voucherCode: 'ZOMA-Z9918234', voucherPin: '5541', denomination: 250, validTill: 'Dec 15, 2026' }
    ]
  },
  {
    userId: 3,
    fullName: 'Rajesh Sharma',
    email: 'rajesh.sharma@gmail.com',
    role: 'USER',
    profileComplete: true,
    registeredPincode: '110001',
    city: 'New Delhi',
    state: 'Delhi',
    authProvider: 'GOOGLE',
    walletBalance: 850.00,
    totalEarnings: 1950.00,
    vouchers: [
      { brandName: 'Uber Rides Voucher', voucherCode: 'UBER-U4488112', voucherPin: '7766', denomination: 500, validTill: 'Feb 28, 2027' },
      { brandName: 'Domino\'s Pizza Voucher', voucherCode: 'DOMI-D5S67891', voucherPin: '1102', denomination: 200, validTill: 'Aug 31, 2026' }
    ]
  },
  {
    userId: 4,
    fullName: 'Priya Patel',
    email: 'priya.patel@gmail.com',
    role: 'USER',
    profileComplete: true,
    registeredPincode: '400001',
    city: 'Mumbai',
    state: 'Maharashtra',
    authProvider: 'APPLE',
    walletBalance: 600.00,
    totalEarnings: 1400.00,
    vouchers: [
      { brandName: 'Google Play Recharge Code', voucherCode: 'GPLY-G7712390', voucherPin: '1092', denomination: 300, validTill: 'Jan 31, 2027' },
      { brandName: 'KFC Food Voucher', voucherCode: 'KFCI-E2T01234', voucherPin: '9981', denomination: 300, validTill: 'Sep 15, 2026' }
    ]
  }
];

const VENDOR_DIRECTORY = [
  {
    id: 'v-101',
    name: 'Daily Needs Supermarket',
    category: 'GROCERY & RETAIL',
    icon: '🏪',
    pincode: '560001',
    city: 'Bengaluru',
    royaltyPercent: 3.5,
    rating: 4.9,
    totalPayout: 45200.00,
    status: 'ACTIVE'
  },
  {
    id: 'v-204',
    name: 'Royal Spice Restaurant',
    category: 'DINING & CAFE',
    icon: '🍽️',
    pincode: '560001',
    city: 'Bengaluru',
    royaltyPercent: 4.0,
    rating: 4.8,
    totalPayout: 38900.00,
    status: 'ACTIVE'
  },
  {
    id: 'v-305',
    name: 'MedPlus Express Pharmacy',
    category: 'MEDICAL & HEALTH',
    icon: '💊',
    pincode: '560001',
    city: 'Bengaluru',
    royaltyPercent: 3.0,
    rating: 4.7,
    totalPayout: 29400.00,
    status: 'ACTIVE'
  },
  {
    id: 'v-402',
    name: 'Reliance Digital Outlet',
    category: 'ELECTRONICS & GADGETS',
    icon: '⚡',
    pincode: '560001',
    city: 'Bengaluru',
    royaltyPercent: 2.5,
    rating: 4.9,
    totalPayout: 62100.00,
    status: 'ACTIVE'
  },
  {
    id: 'v-501',
    name: 'HPCL Auto Care Fuel Station',
    category: 'FUEL & AUTOMOTIVE',
    icon: '⛽',
    pincode: '560001',
    city: 'Bengaluru',
    royaltyPercent: 2.0,
    rating: 4.8,
    totalPayout: 51800.00,
    status: 'ACTIVE'
  }
];

export default function AdminPlatformPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'USERS' | 'VENDORS' | 'FUNDS' | 'PINCODES' | 'ROYALTY'>('USERS');

  const [selectedUserVoucher, setSelectedUserVoucher] = useState<any | null>(null);
  const [userSearchText, setUserSearchText] = useState('');

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
    <div style={{ minHeight: '100vh', background: 'var(--bg-canvas)', color: 'var(--text-primary)', transition: 'background 0.2s ease-in-out' }}>
      <NavigationHeader />

      {/* Hero Header Banner */}
      <section
        style={{
          background: 'linear-gradient(135deg, #00685b 0%, #047857 50%, #065f46 100%)',
          color: '#ffffff',
          padding: '2.5rem 1.5rem',
          boxShadow: '0 8px 30px rgba(0, 104, 91, 0.2)'
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
            <span style={{ padding: '0.35rem 0.85rem', borderRadius: '999px', background: 'rgba(255, 255, 255, 0.2)', color: '#ffffff', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', backdropFilter: 'blur(4px)' }}>
              👑 SUPER ADMIN PORTAL
            </span>
            <span style={{ padding: '0.35rem 0.85rem', borderRadius: '999px', background: '#071713', color: '#34d399', border: '1px solid #1c4d40', fontSize: '0.78rem', fontWeight: 800 }}>
              Logged in as: anikatejareddy0003@gmail.com
            </span>
          </div>

          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: '0 0 0.5rem 0', color: '#ffffff', letterSpacing: '-0.02em' }}>
            Platform & Vendor Management Portal
          </h1>

          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1rem', maxWidth: '750px', margin: 0, lineHeight: 1.5 }}>
            Onboard local merchants, manage pincode territory coverage, inject promotional funds with mandatory audit notes, and configure vertical royalty splits.
          </p>
        </div>
      </section>

      <main style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1.5rem', paddingBottom: '90px' }}>
        
        {/* Top Quick Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '1.4rem', boxShadow: '0 4px 15px var(--shadow-color)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 800 }}>ACTIVE VENDORS</span>
            <strong style={{ display: 'block', fontSize: '1.8rem', color: 'var(--accent-primary)', fontWeight: 900, marginTop: '0.2rem' }}>
              {VENDOR_DIRECTORY.length} Outlets
            </strong>
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '1.4rem', boxShadow: '0 4px 15px var(--shadow-color)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 800 }}>REGISTERED USERS</span>
            <strong style={{ display: 'block', fontSize: '1.8rem', color: 'var(--text-primary)', fontWeight: 900, marginTop: '0.2rem' }}>
              {users.length} Users
            </strong>
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '1.4rem', boxShadow: '0 4px 15px var(--shadow-color)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 800 }}>COVERED PINCODES</span>
            <strong style={{ display: 'block', fontSize: '1.8rem', color: 'var(--accent-primary)', fontWeight: 900, marginTop: '0.2rem' }}>
              {pincodes.length} Pincodes
            </strong>
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '1.4rem', boxShadow: '0 4px 15px var(--shadow-color)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 800 }}>ROYALTY RULES</span>
            <strong style={{ display: 'block', fontSize: '1.8rem', color: '#10b981', fontWeight: 900, marginTop: '0.2rem' }}>
              {royaltyConfigs.length} Verticals
            </strong>
          </div>
        </div>

        {/* Tab Selector Pills */}
        <div style={{ display: 'flex', gap: '0.75rem', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem', paddingBottom: '0.5rem', overflowX: 'auto' }}>
          <button
            onClick={() => setActiveTab('USERS')}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '14px',
              fontWeight: 800,
              cursor: 'pointer',
              background: activeTab === 'USERS' ? 'var(--accent-primary)' : 'var(--bg-card)',
              color: activeTab === 'USERS' ? '#ffffff' : 'var(--text-primary)',
              border: `1px solid ${activeTab === 'USERS' ? 'var(--accent-primary)' : 'var(--border-color)'}`,
              transition: 'all 0.15s',
              whiteSpace: 'nowrap'
            }}
          >
            👥 Registered Users & Vouchers
          </button>
          <button
            onClick={() => setActiveTab('VENDORS')}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '14px',
              fontWeight: 800,
              cursor: 'pointer',
              background: activeTab === 'VENDORS' ? 'var(--accent-primary)' : 'var(--bg-card)',
              color: activeTab === 'VENDORS' ? '#ffffff' : 'var(--text-primary)',
              border: `1px solid ${activeTab === 'VENDORS' ? 'var(--accent-primary)' : 'var(--border-color)'}`,
              transition: 'all 0.15s',
              whiteSpace: 'nowrap'
            }}
          >
            🏪 Local Vendors & Outlets
          </button>
          <button
            onClick={() => setActiveTab('FUNDS')}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '14px',
              fontWeight: 800,
              cursor: 'pointer',
              background: activeTab === 'FUNDS' ? 'var(--accent-primary)' : 'var(--bg-card)',
              color: activeTab === 'FUNDS' ? '#ffffff' : 'var(--text-primary)',
              border: `1px solid ${activeTab === 'FUNDS' ? 'var(--accent-primary)' : 'var(--border-color)'}`,
              transition: 'all 0.15s',
              whiteSpace: 'nowrap'
            }}
          >
            💵 Promotional Fund Injection
          </button>
          <button
            onClick={() => setActiveTab('PINCODES')}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '14px',
              fontWeight: 800,
              cursor: 'pointer',
              background: activeTab === 'PINCODES' ? 'var(--accent-primary)' : 'var(--bg-card)',
              color: activeTab === 'PINCODES' ? '#ffffff' : 'var(--text-primary)',
              border: `1px solid ${activeTab === 'PINCODES' ? 'var(--accent-primary)' : 'var(--border-color)'}`,
              transition: 'all 0.15s',
              whiteSpace: 'nowrap'
            }}
          >
            📍 Master Pincode Directory
          </button>
          <button
            onClick={() => setActiveTab('ROYALTY')}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '14px',
              fontWeight: 800,
              cursor: 'pointer',
              background: activeTab === 'ROYALTY' ? 'var(--accent-primary)' : 'var(--bg-card)',
              color: activeTab === 'ROYALTY' ? '#ffffff' : 'var(--text-primary)',
              border: `1px solid ${activeTab === 'ROYALTY' ? 'var(--accent-primary)' : 'var(--border-color)'}`,
              transition: 'all 0.15s',
              whiteSpace: 'nowrap'
            }}
          >
            📊 Vertical Royalty Splits
          </button>
          <button
            onClick={() => navigate('/admin/orchestration')}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '14px',
              fontWeight: 800,
              cursor: 'pointer',
              background: '#3b82f6',
              color: '#ffffff',
              border: 'none',
              transition: 'all 0.15s',
              whiteSpace: 'nowrap'
            }}
          >
            ⚙️ Provider Orchestration
          </button>
        </div>

        {/* TAB 0: Users & Held Vouchers Directory */}
        {activeTab === 'USERS' && (
          <section style={{ marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
                  Registered Users & Held Vouchers Directory
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: '0.2rem 0 0 0' }}>
                  View all registered Gmail accounts, names, pincodes, wallet balances, and active digital brand vouchers.
                </p>
              </div>

              {/* User Search Bar */}
              <div style={{ minWidth: '280px' }}>
                <input
                  type="text"
                  placeholder="🔍 Search by Gmail, Name, or Pincode..."
                  value={userSearchText}
                  onChange={(e) => setUserSearchText(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.7rem 1rem',
                    background: 'var(--input-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    fontWeight: 700
                  }}
                />
              </div>
            </div>

            {/* Users Directory Table */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {DEMO_ADMIN_USERS.filter((u) => {
                if (!userSearchText) return true;
                const q = userSearchText.toLowerCase();
                return (
                  u.fullName.toLowerCase().includes(q) ||
                  u.email.toLowerCase().includes(q) ||
                  u.registeredPincode.includes(q) ||
                  (u.city && u.city.toLowerCase().includes(q))
                );
              }).map((u) => (
                <div
                  key={u.userId}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '20px',
                    padding: '1.5rem',
                    boxShadow: '0 6px 20px var(--shadow-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.25rem'
                  }}
                >
                  {/* Top Bar: User Info + Badges */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '14px',
                          background: u.role === 'SUPER_ADMIN' ? 'var(--accent-gradient)' : 'var(--bg-highlight)',
                          color: u.role === 'SUPER_ADMIN' ? '#ffffff' : 'var(--accent-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 900,
                          fontSize: '1.2rem'
                        }}
                      >
                        {u.role === 'SUPER_ADMIN' ? '👑' : '👤'}
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <strong style={{ fontSize: '1.15rem', color: 'var(--text-primary)', fontWeight: 900 }}>
                            {u.fullName}
                          </strong>
                          {u.role === 'SUPER_ADMIN' && (
                            <span style={{ padding: '0.15rem 0.6rem', borderRadius: '999px', background: 'var(--accent-gradient)', color: '#ffffff', fontSize: '0.72rem', fontWeight: 800 }}>
                              SUPER ADMIN
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: '0.88rem', color: 'var(--accent-primary)', fontWeight: 700, fontFamily: 'monospace' }}>
                          ✉️ {u.email}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <span style={{ padding: '0.3rem 0.75rem', borderRadius: '10px', background: 'var(--bg-card-subtle)', border: '1px solid var(--border-color)', fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        📍 Pincode {u.registeredPincode} ({u.city}, {u.state})
                      </span>
                      <span style={{ padding: '0.3rem 0.75rem', borderRadius: '10px', background: 'var(--bg-highlight)', border: '1px solid var(--border-color)', fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
                        {u.authProvider} Sign-in
                      </span>
                    </div>
                  </div>

                  {/* Financial Stats Bar */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', background: 'var(--bg-card-subtle)', borderRadius: '14px', padding: '1rem 1.25rem', border: '1px solid var(--border-color)' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 800 }}>SPENDABLE WALLET BALANCE</span>
                      <strong style={{ display: 'block', fontSize: '1.3rem', color: 'var(--accent-primary)', fontWeight: 900, marginTop: '0.1rem' }}>
                        ₹{u.walletBalance.toFixed(2)}
                      </strong>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 800 }}>TOTAL NETWORK EARNINGS</span>
                      <strong style={{ display: 'block', fontSize: '1.3rem', color: '#10b981', fontWeight: 900, marginTop: '0.1rem' }}>
                        ₹{u.totalEarnings.toFixed(2)}
                      </strong>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 800 }}>ACTIVE DIGITAL VOUCHERS</span>
                      <strong style={{ display: 'block', fontSize: '1.3rem', color: 'var(--text-primary)', fontWeight: 900, marginTop: '0.1rem' }}>
                        {u.vouchers.length} Vouchers Held
                      </strong>
                    </div>
                  </div>

                  {/* User Vouchers List */}
                  <div>
                    <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.75rem' }}>
                      🎁 Held Digital Vouchers (Tap to View / Share / Download PDF):
                    </span>

                    <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
                      {u.vouchers.map((v, vIdx) => (
                        <div
                          key={vIdx}
                          onClick={() => setSelectedUserVoucher(v)}
                          style={{
                            background: 'var(--input-bg)',
                            border: '1.5px solid var(--border-color)',
                            borderRadius: '14px',
                            padding: '0.75rem 1rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            boxShadow: '0 2px 8px var(--shadow-color)',
                            transition: 'transform 0.15s ease'
                          }}
                        >
                          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--bg-highlight)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
                            🎁
                          </div>

                          <div>
                            <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)', display: 'block' }}>
                              {v.brandName}
                            </strong>
                            <div style={{ fontSize: '0.78rem', color: 'var(--accent-primary)', fontWeight: 800, fontFamily: 'monospace' }}>
                              ₹{v.denomination} · {v.voucherCode}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TAB 0: Vendors & Outlets Directory */}
        {activeTab === 'VENDORS' && (
          <section style={{ marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Partner Merchants & Vendors
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: '0.2rem 0 0 0' }}>
                  Local merchants registered under Pincode 560001 earning vendor royalty commissions.
                </p>
              </div>

              <button
                onClick={() => alert('New Vendor Onboarding Portal ready!')}
                style={{ padding: '0.65rem 1.3rem', borderRadius: '12px', background: 'var(--accent-gradient)', color: '#ffffff', border: 'none', fontWeight: 800, cursor: 'pointer' }}
              >
                + Register New Vendor
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {VENDOR_DIRECTORY.map((v) => (
                <div
                  key={v.id}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '20px',
                    padding: '1.5rem',
                    boxShadow: '0 6px 20px var(--shadow-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'var(--bg-highlight)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem' }}>
                          {v.icon}
                        </div>
                        <div>
                          <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)', display: 'block', lineHeight: 1.2 }}>
                            {v.name}
                          </strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700 }}>
                            {v.category}
                          </span>
                        </div>
                      </div>

                      <span style={{ padding: '0.2rem 0.6rem', borderRadius: '8px', background: 'var(--bg-highlight)', color: '#f59e0b', fontSize: '0.8rem', fontWeight: 800 }}>
                        ⭐ {v.rating}
                      </span>
                    </div>

                    <div style={{ background: 'var(--bg-card-subtle)', borderRadius: '12px', padding: '0.85rem', marginBottom: '1.25rem', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.82rem' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Territory Pincode</span>
                        <strong style={{ color: 'var(--text-primary)' }}>📍 {v.pincode} ({v.city})</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.82rem' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Royalty Commission</span>
                        <strong style={{ color: 'var(--accent-primary)' }}>{v.royaltyPercent}% Per Sale</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Total Payout Disbursed</span>
                        <strong style={{ color: '#10b981' }}>₹{v.totalPayout.toFixed(2)}</strong>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                      onClick={() => navigate('/checkout')}
                      style={{ flex: 1, padding: '0.65rem', borderRadius: '10px', background: 'var(--accent-gradient)', color: '#ffffff', border: 'none', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer' }}
                    >
                      Pay Merchant →
                    </button>
                    <button
                      onClick={() => alert(`Vendor ${v.name} status: Active`)}
                      style={{ padding: '0.65rem 1rem', borderRadius: '10px', background: 'var(--bg-card-subtle)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TAB 1: Promotional Fund Injection (Story 10.1) */}
        {activeTab === 'FUNDS' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
            <section style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 20px var(--shadow-color)' }}>
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent-primary)', fontWeight: 700 }}>
                STORY 10.1
              </span>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0.3rem 0 1rem 0', color: 'var(--text-primary)' }}>
                Promotional Fund Injection
              </h2>

              {fundSuccess && (
                <div style={{ background: '#d1fae5', color: '#065f46', border: '1px solid #34d399', borderRadius: '10px', padding: '1rem', marginBottom: '1.25rem', fontSize: '0.88rem', fontWeight: 600 }}>
                  ✅ {fundSuccess}
                </div>
              )}

              {fundError && (
                <div style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #f87171', borderRadius: '10px', padding: '1rem', marginBottom: '1.25rem', fontSize: '0.88rem', fontWeight: 600 }}>
                  ⚠️ {fundError}
                </div>
              )}

              <form onSubmit={handleFundSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 600 }}>
                    Search & Select Target User
                  </label>
                  <input
                    type="text"
                    placeholder="Type name, email, or user ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-primary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}
                  />

                  <div style={{ maxHeight: '160px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '10px', background: 'var(--bg-card-subtle)' }}>
                    {filteredUsers.length === 0 ? (
                      <div style={{ padding: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>No matching users found</div>
                    ) : (
                      filteredUsers.map((u) => {
                        const tid = u.userId ?? u.id;
                        const isSel = selectedUserId === tid;
                        return (
                          <div
                            key={tid}
                            onClick={() => setSelectedUserId(tid || null)}
                            style={{
                              padding: '0.6rem 0.85rem',
                              cursor: 'pointer',
                              background: isSel ? 'var(--bg-highlight)' : 'transparent',
                              borderBottom: '1px solid var(--border-color)',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}
                          >
                            <div>
                              <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)', display: 'block' }}>{u.fullName || 'User'}</strong>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{u.email}</span>
                            </div>
                            <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '6px', background: isSel ? 'var(--accent-primary)' : 'var(--border-color)', color: isSel ? '#ffffff' : 'var(--text-secondary)', fontWeight: 700 }}>
                              ID #{tid}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 600 }}>
                    Add-on Credit Amount (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="Enter credit amount (e.g. 500)"
                    value={fundAmount}
                    onChange={(e) => setFundAmount(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.75rem', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 700 }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 600 }}>
                    Mandatory Audit Note / Campaign Reason
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide justification note for audit logs..."
                    value={fundReason}
                    onChange={(e) => setFundReason(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.75rem', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-primary)', fontSize: '0.88rem', resize: 'vertical' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={fundLoading || !selectedUserId}
                  style={{
                    width: '100%',
                    padding: '0.85rem',
                    background: selectedUserId ? 'var(--accent-gradient)' : 'var(--border-color)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    cursor: selectedUserId ? 'pointer' : 'not-allowed'
                  }}
                >
                  {fundLoading ? 'Injecting Funds...' : 'Credit Promotional Funds →'}
                </button>
              </form>
            </section>

            {/* Audit Logs */}
            <section style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 20px var(--shadow-color)' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 1rem 0', color: 'var(--text-primary)' }}>
                System Audit Logs
              </h3>

              <div style={{ maxHeight: '420px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {auditLogs.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No audit logs recorded yet</div>
                ) : (
                  auditLogs.map((log) => (
                    <div key={log.id} style={{ background: 'var(--bg-card-subtle)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '0.85rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                        <strong style={{ fontSize: '0.85rem', color: 'var(--accent-primary)' }}>{log.action}</strong>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{new Date(log.createdAt || '').toLocaleString()}</span>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-primary)', margin: 0 }}>
                        {log.details || `Admin #${log.adminUserId} performed ${log.action} on User #${log.targetUserId}`}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        )}

        {/* TAB 2: Pincodes Management (Story 10.2) */}
        {activeTab === 'PINCODES' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
            <section style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 20px var(--shadow-color)' }}>
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent-primary)', fontWeight: 700 }}>
                STORY 10.2
              </span>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0.3rem 0 1rem 0', color: 'var(--text-primary)' }}>
                Add Master Pincode
              </h2>

              {pincodeMsg && (
                <div style={{ background: 'var(--bg-highlight)', color: 'var(--accent-primary)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '0.85rem', marginBottom: '1rem', fontSize: '0.85rem', fontWeight: 700 }}>
                  {pincodeMsg}
                </div>
              )}

              <form onSubmit={handleCreatePincode} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem', fontWeight: 600 }}>Pincode (6 digits)</label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="e.g. 560001"
                    value={newPincode.pincode}
                    onChange={(e) => setNewPincode({ ...newPincode, pincode: e.target.value.replace(/\D/g, '') })}
                    required
                    style={{ width: '100%', padding: '0.75rem', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 700 }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem', fontWeight: 600 }}>City</label>
                    <input
                      type="text"
                      placeholder="e.g. Bengaluru"
                      value={newPincode.city}
                      onChange={(e) => setNewPincode({ ...newPincode, city: e.target.value })}
                      required
                      style={{ width: '100%', padding: '0.65rem', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.88rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem', fontWeight: 600 }}>District</label>
                    <input
                      type="text"
                      placeholder="e.g. Bengaluru Urban"
                      value={newPincode.district}
                      onChange={(e) => setNewPincode({ ...newPincode, district: e.target.value })}
                      required
                      style={{ width: '100%', padding: '0.65rem', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.88rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem', fontWeight: 600 }}>State</label>
                  <input
                    type="text"
                    placeholder="e.g. Karnataka"
                    value={newPincode.state}
                    onChange={(e) => setNewPincode({ ...newPincode, state: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.65rem', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.88rem' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={pincodeLoading}
                  style={{
                    width: '100%',
                    padding: '0.85rem',
                    background: 'var(--accent-gradient)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    cursor: 'pointer'
                  }}
                >
                  {pincodeLoading ? 'Creating...' : '+ Create Master Pincode'}
                </button>
              </form>
            </section>

            {/* Pincode List */}
            <section style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 20px var(--shadow-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Master Pincodes
                </h3>
                <input
                  type="text"
                  placeholder="Filter pincode/city..."
                  value={pincodeSearch}
                  onChange={(e) => setPincodeSearch(e.target.value)}
                  style={{ padding: '0.45rem 0.75rem', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.82rem' }}
                />
              </div>

              <div style={{ maxHeight: '420px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {filteredPincodes.map((p) => (
                  <div key={p.pincode} style={{ background: 'var(--bg-card-subtle)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ fontSize: '1rem', color: 'var(--accent-primary)', display: 'block' }}>📍 {p.pincode}</strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 600 }}>{p.city}, {p.state}</span>
                    </div>

                    <button
                      onClick={() => void handleTogglePincode(p.pincode)}
                      style={{
                        padding: '0.35rem 0.85rem',
                        borderRadius: '8px',
                        background: p.active ? '#10b981' : '#ef4444',
                        color: '#ffffff',
                        border: 'none',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        cursor: 'pointer'
                      }}
                    >
                      {p.active ? 'ACTIVE' : 'INACTIVE'}
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* TAB 3: Royalty Percentage Configuration (Story 10.3) */}
        {activeTab === 'ROYALTY' && (
          <div>
            {royaltyMsg && (
              <div style={{ background: 'var(--bg-highlight)', color: 'var(--accent-primary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem', fontSize: '0.88rem', fontWeight: 700 }}>
                {royaltyMsg}
              </div>
            )}

            <section style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 20px var(--shadow-color)', marginBottom: '2rem' }}>
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent-primary)', fontWeight: 700 }}>
                STORY 10.3
              </span>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0.3rem 0 1.25rem 0', color: 'var(--text-primary)' }}>
                Vertical Royalty Percentage Configuration
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                {royaltyConfigs.map((cfg) => (
                  <div key={cfg.category} style={{ background: 'var(--bg-card-subtle)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                      <strong style={{ fontSize: '1.1rem', color: 'var(--accent-primary)', textTransform: 'uppercase' }}>{cfg.category}</strong>
                      <span style={{ padding: '0.2rem 0.6rem', borderRadius: '6px', background: 'var(--bg-highlight)', color: 'var(--text-primary)', fontSize: '0.75rem', fontWeight: 700 }}>ACTIVE</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Cashback:</span>
                        <strong>{cfg.cashbackPercentage}%</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Referral:</span>
                        <strong>{cfg.referralPercentage}%</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Vendor Royalty:</span>
                        <strong>{cfg.vendorRoyaltyPercentage}%</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Profit Margin:</span>
                        <strong>{cfg.profitMarginPercentage}%</strong>
                      </div>
                    </div>

                    <button
                      onClick={() => setEditingConfig({ ...cfg })}
                      style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', background: 'var(--accent-primary)', color: '#ffffff', border: 'none', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
                    >
                      Edit Percentages
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Edit Modal / Slide In Box */}
            {editingConfig && (
              <section style={{ background: 'var(--bg-card)', border: '2px solid var(--accent-primary)', borderRadius: '20px', padding: '2rem', boxShadow: '0 8px 30px var(--shadow-color)', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 1rem 0' }}>
                  Editing Category: {editingConfig.category}
                </h3>

                <form onSubmit={handleSaveRoyalty} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem', fontWeight: 600 }}>Cashback %</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingConfig.cashbackPercentage || 0}
                      onChange={(e) => setEditingConfig({ ...editingConfig, cashbackPercentage: parseFloat(e.target.value) })}
                      style={{ width: '100%', padding: '0.65rem', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', fontWeight: 700 }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem', fontWeight: 600 }}>Referral %</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingConfig.referralPercentage || 0}
                      onChange={(e) => setEditingConfig({ ...editingConfig, referralPercentage: parseFloat(e.target.value) })}
                      style={{ width: '100%', padding: '0.65rem', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', fontWeight: 700 }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem', fontWeight: 600 }}>Vendor Royalty %</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingConfig.vendorRoyaltyPercentage || 0}
                      onChange={(e) => setEditingConfig({ ...editingConfig, vendorRoyaltyPercentage: parseFloat(e.target.value) })}
                      style={{ width: '100%', padding: '0.65rem', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', fontWeight: 700 }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem', fontWeight: 600 }}>Profit Margin %</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingConfig.profitMarginPercentage || 0}
                      onChange={(e) => setEditingConfig({ ...editingConfig, profitMarginPercentage: parseFloat(e.target.value) })}
                      style={{ width: '100%', padding: '0.65rem', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', fontWeight: 700 }}
                    />
                  </div>

                  <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button
                      type="submit"
                      style={{ padding: '0.75rem 1.5rem', borderRadius: '10px', background: 'var(--accent-gradient)', color: '#ffffff', border: 'none', fontWeight: 800, cursor: 'pointer' }}
                    >
                      Save Configuration
                    </button>

                    <button
                      type="button"
                      onClick={() => setEditingConfig(null)}
                      style={{ padding: '0.75rem 1.5rem', borderRadius: '10px', background: 'var(--bg-card-subtle)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </section>
            )}
          </div>
        )}

      </main>

      {/* Admin User Voucher Receipt Modal */}
      {selectedUserVoucher && (
        <VoucherReceiptModal
          details={{
            brandName: selectedUserVoucher.brandName,
            voucherCode: selectedUserVoucher.voucherCode,
            voucherPin: selectedUserVoucher.voucherPin,
            denomination: selectedUserVoucher.denomination,
            paidAt: new Date().toISOString()
          }}
          onClose={() => setSelectedUserVoucher(null)}
        />
      )}

      <BottomNavBar />
    </div>
  );
}
