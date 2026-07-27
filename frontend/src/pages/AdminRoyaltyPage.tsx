import { FormEvent, useEffect, useState } from 'react';
import NavigationHeader from '../components/NavigationHeader';
import {
  getVerticalRoyaltyConfigs,
  simulateVerticalMargin,
  updateVerticalRoyaltyConfig,
  RoyaltyConfiguration,
  VerticalRoyaltyCalculationResult
} from '../lib/api';

const DEFAULT_VERTICALS: RoyaltyConfiguration[] = [
  {
    category: 'RECHARGE',
    profitMarginPercentage: 3.5,
    verticalRoyaltyPercentage: 0.5,
    cashbackPercentage: 50.0,
    referralPercentage: 20.0,
    vendorRoyaltyPercentage: 30.0,
    pincodeDeductionFraction: 0.1
  },
  {
    category: 'BILL_PAYMENT',
    profitMarginPercentage: 1.5,
    verticalRoyaltyPercentage: 0.2,
    cashbackPercentage: 40.0,
    referralPercentage: 25.0,
    vendorRoyaltyPercentage: 35.0,
    pincodeDeductionFraction: 0.1
  },
  {
    category: 'VOUCHER',
    profitMarginPercentage: 8.0,
    verticalRoyaltyPercentage: 1.5,
    cashbackPercentage: 60.0,
    referralPercentage: 15.0,
    vendorRoyaltyPercentage: 25.0,
    pincodeDeductionFraction: 0.15
  }
];

export default function AdminRoyaltyPage() {
  const [configs, setConfigs] = useState<RoyaltyConfiguration[]>(DEFAULT_VERTICALS);
  const [loading, setLoading] = useState(true);
  const [savingCategory, setSavingCategory] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Simulator State
  const [simCategory, setSimCategory] = useState<string>('RECHARGE');
  const [simAmount, setSimAmount] = useState<number>(1000);
  const [simApiCost, setSimApiCost] = useState<string>('');
  const [simResult, setSimResult] = useState<VerticalRoyaltyCalculationResult | null>(null);

  useEffect(() => {
    void loadConfigs();
  }, []);

  async function loadConfigs() {
    try {
      setLoading(true);
      const data = await getVerticalRoyaltyConfigs();
      if (data && data.length > 0) {
        const map = new Map(data.map((c) => [c.category.toUpperCase(), c]));
        const merged = DEFAULT_VERTICALS.map((def) => map.get(def.category) || def);
        setConfigs(merged);
      }
    } catch {
      // Use defaults if backend not yet seeded
    } finally {
      setLoading(false);
    }
  }

  const handleConfigChange = (category: string, field: keyof RoyaltyConfiguration, value: number) => {
    setConfigs((prev) =>
      prev.map((cfg) => (cfg.category === category ? { ...cfg, [field]: value } : cfg))
    );
  };

  const handleSave = async (cfg: RoyaltyConfiguration) => {
    try {
      setSavingCategory(cfg.category);
      setStatusMessage(null);
      const saved = await updateVerticalRoyaltyConfig(cfg);
      setConfigs((prev) => prev.map((item) => (item.category === saved.category ? saved : item)));
      setStatusMessage(`Successfully updated vertical configuration for ${cfg.category}!`);
    } catch (err: any) {
      setStatusMessage(`Error saving configuration: ${err.message || 'Server error'}`);
    } finally {
      setSavingCategory(null);
    }
  };

  useEffect(() => {
    void runSimulation();
  }, [simCategory, simAmount, simApiCost, configs]);

  const runSimulation = async () => {
    const cost = simApiCost ? parseFloat(simApiCost) : undefined;
    try {
      const res = await simulateVerticalMargin(simCategory, simAmount, cost);
      setSimResult(res);
    } catch {
      const cfg = configs.find((c) => c.category === simCategory) || configs[0];
      const margin = cfg?.profitMarginPercentage ?? 3.5;
      const vert = cfg?.verticalRoyaltyPercentage ?? 0.5;

      let gross = (simAmount * margin) / 100;
      if (cost && cost > 0 && simAmount > cost) {
        gross = simAmount - cost;
      }
      const deduction = (gross * vert) / 100;
      const effective = Math.max(0, gross - deduction);

      setSimResult({
        category: simCategory,
        transactionAmount: simAmount,
        profitMarginPercentage: margin,
        verticalRoyaltyPercentage: vert,
        grossProfitMargin: gross,
        verticalRoyaltyDeduction: deduction,
        effectiveProfitMargin: effective
      });
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f4f8f7', color: '#0d2b26' }}>
      <NavigationHeader />

      <main style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1.5rem' }}>
        {/* Header Title */}
        <div style={{ marginBottom: '2rem' }}>
          <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#00685b', fontWeight: 700 }}>
            ADMIN ROYALTY ENGINE
          </span>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, margin: '0.25rem 0', color: '#0d2b26' }}>
            Vertical Royalty Engine & Margin Configurator
          </h1>
          <p style={{ color: '#5b706c', fontSize: '0.95rem' }}>
            Configure root category margins before downstream splits (cashback, referral, vendor royalty, pincode pool).
          </p>
        </div>

        {statusMessage && (
          <div style={{ background: '#e6f4f1', border: '1px solid #c7e5df', color: '#00685b', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', fontWeight: 600 }}>
            {statusMessage}
          </div>
        )}

        {/* Vertical Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
          {configs.map((cfg) => {
            const isSaving = savingCategory === cfg.category;

            return (
              <div
                key={cfg.category}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2ece9',
                  borderRadius: '20px',
                  padding: '1.75rem',
                  boxShadow: '0 4px 20px rgba(0, 104, 91, 0.04)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#00685b', margin: 0 }}>{cfg.category}</h3>
                  <span style={{ padding: '0.25rem 0.6rem', borderRadius: '6px', background: '#e6f4f1', color: '#00685b', fontSize: '0.75rem', fontWeight: 700 }}>
                    ACTIVE VERTICAL
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#5b706c', marginBottom: '0.4rem', fontWeight: 600 }}>
                      Category Profit Margin (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={cfg.profitMarginPercentage ?? 0}
                      onChange={(e) => handleConfigChange(cfg.category, 'profitMarginPercentage', parseFloat(e.target.value))}
                      style={{ width: '100%', padding: '0.6rem', background: '#ffffff', border: '1px solid #e2ece9', borderRadius: '8px', color: '#0d2b26', fontWeight: 700 }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#5b706c', marginBottom: '0.4rem', fontWeight: 600 }}>
                      Root Vertical Royalty Deduction (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={cfg.verticalRoyaltyPercentage ?? 0}
                      onChange={(e) => handleConfigChange(cfg.category, 'verticalRoyaltyPercentage', parseFloat(e.target.value))}
                      style={{ width: '100%', padding: '0.6rem', background: '#ffffff', border: '1px solid #e2ece9', borderRadius: '8px', color: '#0d2b26', fontWeight: 700 }}
                    />
                  </div>

                  <button
                    onClick={() => handleSave(cfg)}
                    disabled={isSaving}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: 'linear-gradient(135deg, #00685b, #047857)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '10px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      marginTop: '0.5rem'
                    }}
                  >
                    {isSaving ? 'Saving...' : `Save ${cfg.category} Margin Rules`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Calculation Simulator */}
        <section style={{ background: '#ffffff', border: '1px solid #e2ece9', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 20px rgba(0, 104, 91, 0.04)' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0d2b26', marginBottom: '0.5rem' }}>
            🧮 Live Effective Margin Impact Simulator
          </h2>
          <p style={{ color: '#5b706c', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Test how vertical royalty deductions reduce gross profit to derive the effective margin base for downstream pools.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            {/* Controls */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#5b706c', marginBottom: '0.3rem', fontWeight: 600 }}>Select Category</label>
                <select
                  value={simCategory}
                  onChange={(e) => setSimCategory(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', background: '#ffffff', border: '1px solid #e2ece9', borderRadius: '8px', color: '#0d2b26', fontWeight: 600 }}
                >
                  <option value="RECHARGE">Recharge</option>
                  <option value="BILL_PAYMENT">Bill Payment</option>
                  <option value="VOUCHER">Voucher</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#5b706c', marginBottom: '0.3rem', fontWeight: 600 }}>Transaction Amount (₹)</label>
                <input
                  type="number"
                  value={simAmount}
                  onChange={(e) => setSimAmount(parseFloat(e.target.value) || 0)}
                  style={{ width: '100%', padding: '0.6rem', background: '#ffffff', border: '1px solid #e2ece9', borderRadius: '8px', color: '#0d2b26' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#5b706c', marginBottom: '0.3rem', fontWeight: 600 }}>API Provider Net Cost (Optional Override ₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 965.00"
                  value={simApiCost}
                  onChange={(e) => setSimApiCost(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', background: '#ffffff', border: '1px solid #e2ece9', borderRadius: '8px', color: '#0d2b26' }}
                />
              </div>
            </div>

            {/* Results Output */}
            {simResult && (
              <div style={{ background: '#e6f4f1', border: '1px solid #c7e5df', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: '#00685b', fontWeight: 700, textTransform: 'uppercase' }}>Simulation Breakdown</span>
                  <div style={{ fontSize: '0.9rem', marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#5b706c' }}>Gross Profit Margin:</span>
                      <strong style={{ color: '#0d2b26' }}>₹{simResult.grossProfitMargin.toFixed(2)}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#5b706c' }}>Root Vertical Deduction:</span>
                      <strong style={{ color: '#dc2626' }}>-₹{simResult.verticalRoyaltyDeduction.toFixed(2)} ({simResult.verticalRoyaltyPercentage}%)</strong>
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #c7e5df', paddingTop: '1rem', marginTop: '1rem' }}>
                  <span style={{ fontSize: '0.8rem', color: '#5b706c', display: 'block' }}>Effective Margin Base for Downstream Pools</span>
                  <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#00685b', margin: '0.2rem 0' }}>
                    ₹{simResult.effectiveProfitMargin.toFixed(2)}
                  </h3>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
