export default function DashboardPage() {
  return (
    <div className="container">
      <div className="card">
        <h1>Dashboard</h1>
        <p>Your wallet and earnings data will appear here.</p>
        <div style={{ display: 'grid', gap: 16, marginTop: 20 }}>
          <div style={{ padding: 16, border: '1px solid #e2e8f0', borderRadius: 12 }}>
            <h2>Wallet Balance</h2>
            <p>₹0.00</p>
          </div>
          <div style={{ padding: 16, border: '1px solid #e2e8f0', borderRadius: 12 }}>
            <h2>Reversal Wallet</h2>
            <p>₹0.00 (expires today)</p>
          </div>
          <div style={{ padding: 16, border: '1px solid #e2e8f0', borderRadius: 12 }}>
            <h2>Read-only Ledgers</h2>
            <p>Cashback / Referral / Vendor Royalty / Pincode Royalty</p>
          </div>
        </div>
      </div>
    </div>
  );
}
