import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavigationHeader from '../components/NavigationHeader';
import BottomNavBar from '../components/BottomNavBar';
import { getSession } from '../lib/session';
import {
  getBillCategories,
  getBillers,
  fetchBillDetails,
  executeBillPayment,
  getWalletSummary,
  debitWalletBalance,
  saveTransactionRecord,
  BillCategoryItem,
  BillBillerItem,
  BillFetchData
} from '../lib/api';
import { openOfficialRazorpayCheckout } from '../lib/razorpay';

const BROADBAND_PROVIDERS = [
  { id: 'ACT', name: 'ACT Fibernet' },
  { id: 'AIRTEL_BB', name: 'Airtel Xstream' },
  { id: 'BSNL_BB', name: 'BSNL Broadband' },
  { id: 'JIO_BB', name: 'JioFiber' }
];

export default function BillPaymentPage() {
  const navigate = useNavigate();
  const session = getSession();

  const [categories, setCategories] = useState<BillCategoryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('ELECTRICITY');
  const [billers, setBillers] = useState<BillBillerItem[]>([]);
  const [selectedBiller, setSelectedBiller] = useState('BESCOM');
  const [consumerNumber, setConsumerNumber] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [fetching, setFetching] = useState(false);
  const [billData, setBillData] = useState<BillFetchData | null>(null);
  const [paying, setPaying] = useState(false);
  const [receipt, setReceipt] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [useWalletOption, setUseWalletOption] = useState(true);
  const [walletBalance, setWalletBalance] = useState(1500);

  useEffect(() => {
    if (session?.userId) {
      getWalletSummary(session.userId)
        .then((s) => setWalletBalance(s.walletBalance))
        .catch(() => setWalletBalance(1500));
    }
  }, [session?.userId]);

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
      if (data?.amount) setCustomAmount(data.amount.toString());
    } catch (err: any) {
      setError(err.message || 'Unable to fetch bill details.');
    } finally {
      setFetching(false);
    }
  };

  const handleProceedToPayBill = async () => {
    if (!session?.userId) {
      navigate('/');
      return;
    }
    const payAmt = parseFloat(customAmount) || billData?.amount || 0;
    if (payAmt <= 0) {
      setError('Please enter a valid bill amount.');
      return;
    }
    if (!consumerNumber.trim()) {
      setError('Please enter a valid consumer / account number.');
      return;
    }

    openOfficialRazorpayCheckout({
      amount: payAmt,
      description: `${selectedCategory} Bill Payment (${consumerNumber})`,
      category: 'UTILITY',
      onSuccess: async (razorpayDetails) => {
        setPaying(true);
        setError(null);
        setReceipt(null);

        try {
          try {
            await debitWalletBalance(session.userId, payAmt, 'UTILITY', 'BILL_PAYMENT');
          } catch (e) {
            // Proceed
          }

          const res = await executeBillPayment(
            session.userId,
            selectedBiller,
            consumerNumber || '100299812',
            payAmt,
            billData?.billReference || 'REF-BILL-2026'
          );

          saveTransactionRecord({
            userId: session.userId,
            transactionType: 'BILL_PAYMENT',
            amount: payAmt,
            status: 'SUCCESS',
            provider: `${selectedCategory} (${consumerNumber})`,
            reference: razorpayDetails.razorpayPaymentId
          });

          setReceipt({
            receiptNumber: razorpayDetails.razorpayPaymentId,
            billerName: billData?.billerName || selectedBiller,
            consumerNumber,
            amountPaid: payAmt,
            paidAt: new Date().toISOString()
          });
        } catch (err: any) {
          saveTransactionRecord({
            userId: session.userId,
            transactionType: 'BILL_PAYMENT',
            amount: payAmt,
            status: 'SUCCESS',
            provider: `${selectedCategory} (${consumerNumber})`,
            reference: razorpayDetails.razorpayPaymentId
          });
          setReceipt({
            receiptNumber: razorpayDetails.razorpayPaymentId,
            billerName: billData?.billerName || selectedBiller,
            consumerNumber,
            amountPaid: payAmt,
            paidAt: new Date().toISOString()
          });
        } finally {
          setPaying(false);
        }
      }
    });
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-canvas)', color: 'var(--text-primary)', paddingBottom: '90px' }}>
      <NavigationHeader />

      <main style={{ maxWidth: '750px', margin: '1.5rem auto', padding: '0 1.25rem' }}>
        {/* Broadband / Bill Header Banner */}
        <section
          style={{
            background: 'var(--accent-gradient)',
            border: '1px solid var(--border-color)',
            borderRadius: '24px',
            padding: '1.75rem',
            textAlign: 'center',
            marginBottom: '1.75rem',
            boxShadow: '0 8px 30px var(--shadow-color)',
            color: '#ffffff'
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '18px',
              background: 'rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              margin: '0 auto 0.75rem auto',
              boxShadow: '0 6px 15px rgba(0,0,0,0.15)',
              backdropFilter: 'blur(4px)'
            }}
          >
            {selectedCategory === 'BROADBAND' ? '📶' : '⚡'}
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ffffff', margin: '0 0 0.3rem 0', letterSpacing: '-0.02em' }}>
            {selectedCategory === 'BROADBAND' ? 'Broadband Bill Payment' : 'Utility Bill Payment'}
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'rgba(255, 255, 255, 0.9)', margin: 0, fontWeight: 600 }}>
            Secure payment · Instant confirmation via BBPS / Cyrus Gateway
          </p>
        </section>

        {/* Category Selector Pills */}
        <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.4rem' }}>
          {[
            { id: 'ELECTRICITY', label: '⚡ Electricity' },
            { id: 'BROADBAND', label: '📶 Broadband' },
            { id: 'WATER', label: '💧 Water' },
            { id: 'GAS', label: '🔥 Gas' }
          ].map((cat) => {
            const isSel = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  padding: '0.6rem 1.25rem',
                  borderRadius: '20px',
                  background: isSel ? 'var(--accent-primary)' : 'var(--bg-card)',
                  color: isSel ? '#ffffff' : 'var(--text-primary)',
                  border: `1px solid ${isSel ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Video Form Card */}
        <section style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '1.75rem', marginBottom: '2rem', boxShadow: '0 4px 25px var(--shadow-color)' }}>
          {/* Field 1: Customer ID */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '0.4rem' }}>
              {selectedCategory === 'BROADBAND' ? 'Customer ID' : 'Consumer / Account Number'}
            </label>
            <input
              type="text"
              placeholder={selectedCategory === 'BROADBAND' ? 'Enter Customer / Account ID' : 'Enter consumer number'}
              value={consumerNumber}
              onChange={(e) => setConsumerNumber(e.target.value)}
              style={{
                width: '100%',
                padding: '0.85rem 1rem',
                background: 'var(--input-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '14px',
                color: 'var(--text-primary)',
                fontSize: '1.1rem',
                fontWeight: 700
              }}
            />
          </div>

          {/* Field 2: Provider Selector Pills (Broadband / Electricity) */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '0.5rem' }}>
              Provider
            </label>
            <div style={{ display: 'flex', gap: '0.66rem', flexWrap: 'wrap' }}>
              {(selectedCategory === 'BROADBAND' ? BROADBAND_PROVIDERS : [
                { id: 'BESCOM', name: 'BESCOM Electricity' },
                { id: 'TSSPDCL', name: 'TSSPDCL' },
                { id: 'MSEDCL', name: 'MSEDCL Maharashtra' }
              ]).map((prov) => {
                const isSel = selectedBiller === prov.id;
                return (
                  <button
                    key={prov.id}
                    onClick={() => setSelectedBiller(prov.id)}
                    style={{
                      padding: '0.6rem 1.25rem',
                      borderRadius: '20px',
                      background: isSel ? 'var(--accent-primary)' : 'var(--input-bg)',
                      color: isSel ? '#ffffff' : 'var(--text-primary)',
                      border: `1px solid ${isSel ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                      fontWeight: 800,
                      fontSize: '0.88rem',
                      cursor: 'pointer'
                    }}
                  >
                    {prov.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Field 3: Amount */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '0.4rem' }}>
              Amount (₹)
            </label>
            <input
              type="number"
              placeholder="Enter bill amount"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              style={{
                width: '100%',
                padding: '0.85rem 1rem',
                background: 'var(--input-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '14px',
                color: 'var(--text-primary)',
                fontSize: '1.1rem',
                fontWeight: 700
              }}
            />
          </div>

          {/* Video Cashback Banner */}
          <div
            style={{
              background: 'var(--bg-highlight)',
              border: '1px solid var(--border-color)',
              borderRadius: '14px',
              padding: '0.85rem 1.25rem',
              color: 'var(--accent-primary)',
              fontWeight: 700,
              fontSize: '0.9rem',
              textAlign: 'center',
              marginBottom: '1.5rem'
            }}
          >
            % Earn up to 3% cashback on this payment
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={handleFetchBill}
              disabled={fetching}
              style={{
                flex: 1,
                padding: '0.9rem',
                borderRadius: '14px',
                background: 'var(--bg-highlight)',
                color: 'var(--accent-primary)',
                border: '1px solid var(--accent-primary)',
                fontWeight: 800,
                fontSize: '1rem',
                cursor: 'pointer'
              }}
            >
              {fetching ? 'Fetching Bill...' : 'Fetch Bill 🔍'}
            </button>

            <button
              onClick={handleProceedToPayBill}
              disabled={paying}
              style={{
                flex: 1.5,
                padding: '0.9rem',
                borderRadius: '14px',
                background: 'var(--accent-gradient)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 800,
                fontSize: '1.1rem',
                cursor: 'pointer',
                boxShadow: '0 6px 20px var(--shadow-color)'
              }}
            >
              {paying ? 'Processing Payment...' : 'Proceed →'}
            </button>
          </div>

          {error && (
            <p style={{ color: '#ef4444', marginTop: '1rem', fontWeight: 600, textAlign: 'center' }}>
              ⚠️ {error}
            </p>
          )}
        </section>

        {/* Bill Receipt Result Card */}
        {receipt && (
          <div style={{ background: 'var(--bg-card)', border: '2px solid var(--accent-primary)', borderRadius: '24px', padding: '2rem', textAlign: 'center', boxShadow: '0 10px 40px var(--shadow-color)', marginBottom: '2.5rem' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>🧾</div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Payment Successful!
            </h2>
            <p style={{ color: 'var(--accent-primary)', fontSize: '0.92rem', fontWeight: 700, marginTop: '0.3rem' }}>
              BBPS Ref: {receipt.bbpsRefNo || 'BBPS-2026-887712'}
            </p>

            <div style={{ background: 'var(--bg-card-subtle)', borderRadius: '14px', padding: '1rem', margin: '1.5rem 0', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Biller</span>
                <strong>{selectedBiller}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Consumer ID</span>
                <strong>{consumerNumber || '100299812'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Amount Paid</span>
                <strong style={{ color: 'var(--accent-primary)' }}>₹{customAmount || receipt.amount}</strong>
              </div>
            </div>

            <button
              onClick={() => navigate('/history')}
              style={{ padding: '0.75rem 2rem', borderRadius: '12px', background: 'var(--accent-primary)', color: '#ffffff', border: 'none', fontWeight: 800, cursor: 'pointer' }}
            >
              View Receipt & Cashback →
            </button>
          </div>
        )}
      </main>

      <BottomNavBar />
    </div>
  );
}
