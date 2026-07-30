import { useState } from 'react';
import { getSession } from '../lib/session';
import { createReceiptPDFBlob } from '../lib/pdfGenerator';

export interface TransactionReceiptDetails {
  status: string;
  amount: number;
  mobileNumber?: string;
  operator?: string;
  paidOn?: string;
  fundingMode?: string;
  paidByGateway?: number;
  paidByWallet?: number;
  description?: string;
  referenceId: string;
  cashbackEarned?: number;
  pincodeRoyaltyEarned?: number;
  userPincode?: string;
  userName?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  details: TransactionReceiptDetails | null;
}

export default function TransactionReceiptModal({ isOpen, onClose, details }: Props) {
  const [showDetails, setShowDetails] = useState(true);
  const [copiedRef, setCopiedRef] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  if (!isOpen || !details) return null;

  const session = getSession();
  const userName = details.userName || session?.fullName || 'Valued Member';
  const userPincode = details.userPincode || session?.registeredPincode || '560001';

  const cashback = details.cashbackEarned ?? Math.round(details.amount * 0.02 * 100) / 100;
  const pincodeRoyalty = details.pincodeRoyaltyEarned ?? Math.round(details.amount * 0.005 * 100) / 100;
  const totalGenerated = (cashback + pincodeRoyalty).toFixed(2);

  const formattedDate = details.paidOn || new Date().toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const handleCopyRef = () => {
    navigator.clipboard.writeText(details.referenceId);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const handleDownloadReceipt = async () => {
    const pdfBlob = await createReceiptPDFBlob(details, userName, userPincode);
    const fileName = `ViralPe_Receipt_${details.referenceId.substring(0, 8)}.pdf`;
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    const pdfBlob = await createReceiptPDFBlob(details, userName, userPincode);
    const fileName = `ViralPe_Receipt_${details.referenceId.substring(0, 8)}.pdf`;
    const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });

    // 1. Try Native Web Share API to attach actual .pdf file directly
    if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
      try {
        await navigator.share({
          files: [pdfFile],
          title: 'ViralPe Payment Receipt',
          text: `🧾 Payment Receipt for ₹${details.amount.toFixed(2)} (${details.operator || 'Recharge'})`
        });
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2500);
        return;
      } catch (e) {
        // Fallback to Web link if user dismissed
      }
    }

    // 2. Web WhatsApp Fallback
    await handleDownloadReceipt();
    const pdfUrl = `http://localhost:8080/api/receipt/pdf/${details.referenceId}?amount=${details.amount}&operator=${encodeURIComponent(details.operator || 'Recharge')}`;
    const shareText = `🧾 *ViralPe Payment Receipt*\n\nStatus: *${details.status}*\nAmount: *₹${details.amount.toFixed(2)}*\nPaid On: ${formattedDate}\nRef ID: \`${details.referenceId}\`\n\n📄 *View PDF Receipt*:\n${pdfUrl}`;

    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(waUrl, '_blank');

    setShareSuccess(true);
    setTimeout(() => setShareSuccess(false), 2500);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        overflowY: 'auto'
      }}
    >
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '28px',
          width: '100%',
          maxWidth: '440px',
          padding: '1.75rem',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          position: 'relative',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        {/* Close Icon Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'var(--bg-highlight)',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            color: 'var(--text-secondary)',
            fontSize: '1.1rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ✕
        </button>

        {/* Green Success Badge Icon */}
        <div style={{ textAlign: 'center', marginTop: '0.5rem', marginBottom: '1rem' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'var(--accent-primary)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              margin: '0 auto',
              boxShadow: '0 8px 24px rgba(0, 104, 91, 0.35)'
            }}
          >
            ✓
          </div>
        </div>

        {/* Transaction Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.4rem 0' }}>
            Transaction Successful!
          </h2>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--accent-primary)', lineHeight: 1 }}>
            ₹{details.amount.toFixed(2)}
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.4rem 0 0 0', fontWeight: 600 }}>
            On {details.operator || 'Prepaid'} Recharge {details.mobileNumber ? `· ${details.mobileNumber}` : ''}
          </p>
        </div>

        {/* Congratulations & Royalty Earnings Banner */}
        <div
          style={{
            background: 'var(--bg-highlight)',
            border: '1px solid var(--border-color)',
            borderRadius: '20px',
            padding: '1.25rem',
            textAlign: 'center',
            marginBottom: '1.25rem'
          }}
        >
          <div style={{ fontWeight: 800, fontSize: '0.98rem', color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
            Congratulations {userName}!
          </div>
          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--accent-primary)', marginBottom: '0.2rem' }}>
            You earned ₹{cashback} Cashback
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            Your Pincode {userPincode} earned ₹{pincodeRoyalty} Zonal Royalty
          </div>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', borderTop: '1px dashed var(--border-color)', paddingTop: '0.4rem' }}>
            Total generated by this payment <span style={{ color: 'var(--accent-primary)' }}>₹{totalGenerated}</span>
          </div>
        </div>

        {/* Action Buttons Row: Hide Details & Share */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <button
            onClick={() => setShowDetails(!showDetails)}
            style={{
              padding: '0.75rem',
              borderRadius: '14px',
              background: 'var(--bg-highlight)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem'
            }}
          >
            👁️ {showDetails ? 'Hide Details' : 'View Details'}
          </button>

          <button
            onClick={handleShare}
            style={{
              padding: '0.75rem',
              borderRadius: '14px',
              background: 'var(--accent-gradient)',
              color: '#ffffff',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              boxShadow: '0 4px 14px var(--shadow-color)'
            }}
          >
            📤 {shareSuccess ? 'Copied Link!' : 'Share'}
          </button>
        </div>

        {/* Full-width Download Receipt Button */}
        <button
          onClick={handleDownloadReceipt}
          style={{
            width: '100%',
            padding: '0.85rem',
            borderRadius: '14px',
            background: 'var(--bg-highlight)',
            color: 'var(--accent-primary)',
            border: '1.5px solid var(--border-color)',
            fontWeight: 800,
            fontSize: '0.92rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            marginBottom: '1.25rem'
          }}
        >
          📥 Download Receipt
        </button>

        {/* Detailed Receipt Table */}
        {showDetails && (
          <div
            style={{
              background: 'var(--bg-highlight)',
              border: '1px solid var(--border-color)',
              borderRadius: '20px',
              padding: '1.1rem',
              marginBottom: '1.25rem',
              fontSize: '0.84rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>STATUS</span>
              <span
                style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: 'var(--accent-primary)',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  padding: '0.2rem 0.65rem',
                  borderRadius: '12px',
                  border: '1px solid var(--accent-primary)'
                }}
              >
                {details.status}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>PAID ON</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{formattedDate}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>FUNDING</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{details.fundingMode || 'GATEWAY'}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>PAID BY GATEWAY</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>₹{(details.paidByGateway ?? details.amount).toFixed(2)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>DESCRIPTION</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 700, textAlign: 'right', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {details.description || `Mobile recharge ${details.mobileNumber}`}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.4rem', borderTop: '1px dashed var(--border-color)' }}>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>REFERENCE</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.78rem' }}>
                  {details.referenceId.length > 14 ? details.referenceId.substring(0, 14) + '...' : details.referenceId}
                </span>
                <button
                  onClick={handleCopyRef}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '0.2rem 0.5rem',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: 'var(--accent-primary)',
                    cursor: 'pointer'
                  }}
                >
                  {copiedRef ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Refer More, Earn More Banner matching screenshot */}
        <div
          style={{
            background: 'var(--accent-gradient)',
            borderRadius: '20px',
            padding: '1.1rem 1.25rem',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.25rem',
            boxShadow: '0 6px 20px var(--shadow-color)'
          }}
        >
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.98rem', marginBottom: '0.2rem' }}>
              Refer More, Earn More!
            </div>
            <div style={{ fontSize: '0.78rem', opacity: 0.9 }}>
              There's no limit on how much you can earn. Keep referring and keep earning.
            </div>
          </div>
          <div style={{ fontSize: '2.2rem', marginLeft: '0.75rem' }}>🎁</div>
        </div>

        {/* Back to Home Button */}
        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '0.85rem',
            background: 'transparent',
            color: 'var(--text-secondary)',
            border: 'none',
            fontWeight: 800,
            fontSize: '0.95rem',
            cursor: 'pointer'
          }}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
