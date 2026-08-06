import { useState } from 'react';
import {
  createVoucherPDFBlob,
  createVoucherPNGBlob,
  generateVoucherText
} from '../lib/pdfGenerator';
import { getSession } from '../lib/session';

export interface VoucherReceiptDetails {
  brandName: string;
  voucherCode: string;
  voucherPin: string;
  denomination: number;
  paidAt?: string;
}

interface VoucherReceiptModalProps {
  details: VoucherReceiptDetails;
  onClose: () => void;
}

export default function VoucherReceiptModal({ details, onClose }: VoucherReceiptModalProps) {
  const session = getSession();
  const userName = session?.fullName || 'Anika Teja Reddy';
  const userPincode = session?.registeredPincode || '560001';

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [sharingPng, setSharingPng] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(details.voucherCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // 1. Download Option as PDF
  const handleDownloadPDF = async () => {
    try {
      setDownloadingPdf(true);
      const pdfBlob = await createVoucherPDFBlob(details, userName, userPincode);
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ViralPe_Voucher_${details.brandName.replace(/\s+/g, '_')}_${details.voucherCode}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Error generating PDF voucher:', e);
      alert('Unable to generate PDF voucher.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  // 2. Share Option as PNG
  const handleSharePNG = async () => {
    try {
      setSharingPng(true);
      const pngBlob = await createVoucherPNGBlob(details, userName, userPincode);
      const fileName = `ViralPe_Voucher_${details.voucherCode}.png`;
      const pngFile = new File([pngBlob], fileName, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [pngFile] })) {
        await navigator.share({
          title: `${details.brandName} Gift Voucher`,
          text: `🎁 Payment Successful! Voucher Issued for ${details.brandName}!`,
          files: [pngFile]
        });
      } else {
        const url = URL.createObjectURL(pngBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        const textMessage = generateVoucherText(details, userName, userPincode);
        const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(textMessage)}`;
        window.open(whatsappUrl, '_blank');
      }
    } catch (e) {
      console.error('Error sharing PNG voucher:', e);
    } finally {
      setSharingPng(false);
    }
  };

  // 3. Text Option to Copy
  const handleCopyText = () => {
    const voucherText = generateVoucherText(details, userName, userPincode);
    navigator.clipboard.writeText(voucherText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2200);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        background: 'rgba(3, 12, 10, 0.85)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem'
      }}
    >
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1.5px solid var(--border-color)',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '560px',
          padding: '2rem 1.75rem',
          boxShadow: '0 25px 60px var(--shadow-color)',
          color: 'var(--text-primary)',
          textAlign: 'center',
          animation: 'fadeIn 0.25s ease-out'
        }}
      >
        {/* Gift Emoji Badge */}
        <div
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '20px',
            background: 'var(--bg-highlight)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            margin: '0 auto 1rem auto',
            boxShadow: '0 8px 20px var(--shadow-color)'
          }}
        >
          🎁
        </div>

        {/* Title */}
        <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 0.35rem 0', letterSpacing: '-0.02em' }}>
          Payment Successful! Voucher Issued!
        </h2>

        <div style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: 700, fontFamily: 'monospace', marginBottom: '1.5rem' }}>
          Ref: {details.voucherCode}
        </div>

        {/* Slate Details Table Card (Matching User Image) */}
        <div
          style={{
            background: 'var(--bg-card-subtle)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '1.25rem 1.5rem',
            marginBottom: '1.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.9rem',
            textAlign: 'left'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Brand</span>
            <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 800 }}>{details.brandName}</strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Voucher Code</span>
            <strong style={{ fontSize: '1rem', color: 'var(--accent-primary)', fontWeight: 900, fontFamily: 'monospace', letterSpacing: '0.05em' }}>
              {details.voucherCode}
            </strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>PIN Code</span>
            <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 800, fontFamily: 'monospace' }}>
              {details.voucherPin}
            </strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px dashed var(--border-color)' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Denomination</span>
            <strong style={{ fontSize: '1.4rem', color: 'var(--accent-primary)', fontWeight: 900 }}>
              ₹{details.denomination.toLocaleString('en-IN')}
            </strong>
          </div>
        </div>

        {/* Primary Action Button: Copy Voucher Code */}
        <button
          onClick={handleCopyCode}
          style={{
            width: '100%',
            padding: '0.85rem 1.5rem',
            borderRadius: '16px',
            background: copiedCode ? '#10b981' : 'var(--accent-gradient)',
            color: '#ffffff',
            border: 'none',
            fontWeight: 800,
            fontSize: '1rem',
            cursor: 'pointer',
            boxShadow: '0 4px 15px var(--shadow-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            marginBottom: '1rem',
            transition: 'all 0.2s ease-in-out'
          }}
        >
          <span>{copiedCode ? '✅ Voucher Code Copied!' : 'Copy Voucher Code 📋'}</span>
        </button>

        {/* 3 Action Buttons Grid: Download PDF, Share PNG, Copy Text */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem', marginBottom: '1.25rem' }}>
          <button
            onClick={handleDownloadPDF}
            disabled={downloadingPdf}
            style={{
              padding: '0.75rem 0.5rem',
              borderRadius: '14px',
              background: 'var(--bg-card-subtle)',
              color: 'var(--accent-primary)',
              border: '1.5px solid var(--border-color)',
              fontWeight: 800,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.25rem'
            }}
          >
            <span style={{ fontSize: '1.1rem' }}>📄</span>
            <span>{downloadingPdf ? 'Saving...' : 'Download PDF'}</span>
          </button>

          <button
            onClick={handleSharePNG}
            disabled={sharingPng}
            style={{
              padding: '0.75rem 0.5rem',
              borderRadius: '14px',
              background: '#25D366',
              color: '#ffffff',
              border: 'none',
              fontWeight: 800,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.25rem',
              boxShadow: '0 4px 12px rgba(37, 211, 102, 0.25)'
            }}
          >
            <span style={{ fontSize: '1.1rem' }}>🖼️</span>
            <span>{sharingPng ? 'Sharing...' : 'Share PNG'}</span>
          </button>

          <button
            onClick={handleCopyText}
            style={{
              padding: '0.75rem 0.5rem',
              borderRadius: '14px',
              background: copiedText ? '#10b981' : 'var(--bg-highlight)',
              color: copiedText ? '#ffffff' : 'var(--text-primary)',
              border: `1.5px solid ${copiedText ? '#10b981' : 'var(--border-color)'}`,
              fontWeight: 800,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.25rem'
            }}
          >
            <span style={{ fontSize: '1.1rem' }}>{copiedText ? '✅' : '📋'}</span>
            <span>{copiedText ? 'Copied!' : 'Copy Text'}</span>
          </button>
        </div>

        {/* Close Button */}

        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            padding: '0.5rem 1.25rem',
            background: 'transparent',
            color: 'var(--text-secondary)',
            border: 'none',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer'
          }}
        >
          Close Receipt
        </button>
      </div>
    </div>
  );
}
