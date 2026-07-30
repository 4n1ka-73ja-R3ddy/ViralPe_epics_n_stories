import { useNavigate } from 'react-router-dom';
import NavigationHeader from '../components/NavigationHeader';
import BottomNavBar from '../components/BottomNavBar';

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-canvas)', color: 'var(--text-primary)', paddingBottom: '90px' }}>
      <NavigationHeader />

      {/* Hero Banner Section */}
      <section
        style={{
          background: 'linear-gradient(135deg, #00685b 0%, #047857 50%, #065f46 100%)',
          color: '#ffffff',
          padding: '4rem 1.5rem',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(0, 104, 91, 0.25)'
        }}
      >
        <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <span style={{ padding: '0.4rem 1rem', borderRadius: '999px', background: 'rgba(255, 255, 255, 0.2)', color: '#ffffff', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', backdropFilter: 'blur(4px)', display: 'inline-block', marginBottom: '1.25rem' }}>
            👑 Welcome to ViralPe
          </span>

          <h1 style={{ fontSize: '3rem', fontWeight: 900, letterSpacing: '-0.02em', margin: '0 0 1rem 0', color: '#ffffff', lineHeight: 1.15 }}>
            Empowering Every Rupee with Royalty, Cashback & Hyperlocal Rewards
          </h1>

          <p style={{ fontSize: '1.15rem', color: 'rgba(255, 255, 255, 0.9)', maxWidth: '750px', margin: '0 auto 2rem auto', lineHeight: 1.6, fontWeight: 500 }}>
            ViralPe is India's next-generation digital wallet platform connecting users, local merchants, and high-frequency utility payments through transparent cashback and pincode-level royalty pools.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                padding: '0.85rem 2rem',
                borderRadius: '14px',
                background: '#ffffff',
                color: '#00685b',
                border: 'none',
                fontWeight: 900,
                fontSize: '1rem',
                cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(0,0,0,0.2)'
              }}
            >
              Explore Dashboard →
            </button>

            <button
              onClick={() => navigate('/vouchers')}
              style={{
                padding: '0.85rem 2rem',
                borderRadius: '14px',
                background: 'rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                fontWeight: 800,
                fontSize: '1rem',
                cursor: 'pointer',
                backdropFilter: 'blur(4px)'
              }}
            >
              Browse Gift Cards 🎁
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main style={{ maxWidth: '1150px', margin: '3rem auto', padding: '0 1.5rem' }}>
        
        {/* Stat Highlights Bar */}
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.5rem',
            marginBottom: '3.5rem'
          }}
        >
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '1.75rem', textAlign: 'center', boxShadow: '0 4px 20px var(--shadow-color)' }}>
            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.3rem' }}>💸</span>
            <strong style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--accent-primary)', display: 'block' }}>₹25,00,000+</strong>
            <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Cashback Distributed</span>
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '1.75rem', textAlign: 'center', boxShadow: '0 4px 20px var(--shadow-color)' }}>
            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.3rem' }}>📍</span>
            <strong style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--accent-primary)', display: 'block' }}>50,000+</strong>
            <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Active Pincodes Covered</span>
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '1.75rem', textAlign: 'center', boxShadow: '0 4px 20px var(--shadow-color)' }}>
            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.3rem' }}>⚡</span>
            <strong style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--accent-primary)', display: 'block' }}>99.9%</strong>
            <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Instant Success Rate</span>
          </div>
        </section>

        {/* Core Value Pillars */}
        <section style={{ marginBottom: '4rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent-primary)', fontWeight: 800 }}>
              OUR PLATFORM ADVANTAGES
            </span>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.3rem 0' }}>
              Why Choose ViralPe?
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Designed to turn every bill payment and recharge into real spendable wallet rewards.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.75rem' }}>
            
            {/* Pillar 1 */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 20px var(--shadow-color)' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'var(--bg-highlight)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', marginBottom: '1.25rem' }}>
                💳
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>
                Instant Wallet Payments
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
                Pay Mobile Recharges, Electricity, DTH, and Broadband instantly with zero convenience fees and direct real-time wallet debiting.
              </p>
            </div>

            {/* Pillar 2 */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 20px var(--shadow-color)' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'var(--bg-highlight)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', marginBottom: '1.25rem' }}>
                🏆
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>
                Pincode Championship
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
                Participate in your neighborhood's active royalty pool. Transactions in your pincode build pool bonuses distributed directly to active community members.
              </p>
            </div>

            {/* Pillar 3 */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 20px var(--shadow-color)' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'var(--bg-highlight)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', marginBottom: '1.25rem' }}>
                🎁
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>
                Top Brand Gift Cards
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
                Instant digital gift cards for Amazon Pay, Flipkart, Domino's, Zomato, Swiggy & Uber with guaranteed cashback on every purchase.
              </p>
            </div>

            {/* Pillar 4 */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 20px var(--shadow-color)' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'var(--bg-highlight)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', marginBottom: '1.25rem' }}>
                👥
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>
                Viral Referral Royalty
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
                Share your referral code and earn multi-level royalty bonuses automatically every single time your referred friends pay on ViralPe.
              </p>
            </div>

          </div>
        </section>

        {/* 4-Step User Journey Timeline */}
        <section style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '2.5rem', boxShadow: '0 4px 25px var(--shadow-color)', marginBottom: '3.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent-primary)', fontWeight: 800 }}>
              HOW IT WORKS
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.3rem 0' }}>
              Your Seamless Journey on ViralPe
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
            <div style={{ background: 'var(--bg-card-subtle)', borderRadius: '16px', padding: '1.5rem', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--accent-primary)', textTransform: 'uppercase' }}>Step 1</span>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.4rem 0' }}>Quick Sign-In</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>Sign in with Google or Apple and set your local Pincode.</p>
            </div>

            <div style={{ background: 'var(--bg-card-subtle)', borderRadius: '16px', padding: '1.5rem', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--accent-primary)', textTransform: 'uppercase' }}>Step 2</span>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.4rem 0' }}>Pay & Recharge</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>Select your Mobile Recharge plan, Utility Bill, or Gift Voucher.</p>
            </div>

            <div style={{ background: 'var(--bg-card-subtle)', borderRadius: '16px', padding: '1.5rem', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--accent-primary)', textTransform: 'uppercase' }}>Step 3</span>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.4rem 0' }}>Earn Cashback</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>Get instant cashback credited straight to your Wallet Balance.</p>
            </div>

            <div style={{ background: 'var(--bg-card-subtle)', borderRadius: '16px', padding: '1.5rem', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--accent-primary)', textTransform: 'uppercase' }}>Step 4</span>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.4rem 0' }}>Win Pincode Pools</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>Earn pool bonuses and referral royalties on every friend's spend.</p>
            </div>
          </div>
        </section>

      </main>

      <BottomNavBar />
    </div>
  );
}
