import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavigationHeader from '../components/NavigationHeader';
import BottomNavBar from '../components/BottomNavBar';
import { getSession } from '../lib/session';
import {
  getProviderConfigs,
  updateProviderConfig,
  getGlobalRoutingStrategy,
  updateGlobalRoutingStrategy,
  executeOrchestratedPayment,
  ProviderConfigItem,
  ProviderExecuteResponseData
} from '../lib/api';

export default function AdminProviderOrchestrationPage() {
  const navigate = useNavigate();
  const session = getSession();

  const [providers, setProviders] = useState<ProviderConfigItem[]>([]);
  const [routingStrategy, setRoutingStrategy] = useState<'PRIORITY_BASED' | 'OFFER_MARGIN_BASED'>('PRIORITY_BASED');
  const [loading, setLoading] = useState(true);

  // Test Sandbox State
  const [testService, setTestService] = useState('RECHARGE');
  const [testBiller, setTestBiller] = useState('JIO');
  const [testAccount, setTestAccount] = useState('9876543210');
  const [testAmount, setTestAmount] = useState('299');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<ProviderExecuteResponseData | null>(null);

  useEffect(() => {
    if (!session || session.email !== 'anikatejareddy0003@gmail.com') {
      navigate('/dashboard', { replace: true });
      return;
    }
    loadConfigs();
  }, [navigate]);

  const loadConfigs = async () => {
    setLoading(true);
    try {
      const data = await getProviderConfigs();
      setProviders(data);
      const stratRes = await getGlobalRoutingStrategy();
      if (stratRes?.routingStrategy) {
        setRoutingStrategy(stratRes.routingStrategy as any);
      }
    } catch (e) {
      console.error('Error loading provider configs:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleStrategyChange = async (newStrategy: 'PRIORITY_BASED' | 'OFFER_MARGIN_BASED') => {
    try {
      await updateGlobalRoutingStrategy(newStrategy);
      setRoutingStrategy(newStrategy);
    } catch (e) {
      alert(`Failed to update routing strategy: ${(e as Error).message}`);
    }
  };

  const handleToggle = async (providerId: string, currentEnabled: boolean) => {
    const p = providers.find((item) => item.providerId === providerId);
    if (!p) return;
    const newEnabled = !currentEnabled;

    try {
      await updateProviderConfig(providerId, newEnabled, p.priority, p.offerMarginPercentage);
      setProviders((prev) =>
        prev.map((item) => (item.providerId === providerId ? { ...item, enabled: newEnabled } : item))
      );
    } catch (e) {
      alert(`Failed to update provider toggle: ${(e as Error).message}`);
    }
  };

  const handlePriorityChange = async (providerId: string, newPriority: number) => {
    const p = providers.find((item) => item.providerId === providerId);
    if (!p) return;

    try {
      await updateProviderConfig(providerId, p.enabled, newPriority, p.offerMarginPercentage);
      setProviders((prev) =>
        prev.map((item) => (item.providerId === providerId ? { ...item, priority: newPriority } : item))
      );
    } catch (e) {
      console.error('Priority update error:', e);
    }
  };

  const handleRunOrchestrationTest = async () => {
    if (!session) return;
    setTesting(true);
    setTestResult(null);

    try {
      const result = await executeOrchestratedPayment({
        userId: session.userId,
        serviceType: testService,
        billerOrOperatorCode: testBiller,
        accountNumberOrMobile: testAccount,
        amount: parseFloat(testAmount) || 299,
        idempotencyKey: 'SANDBOX-' + Date.now()
      });
      setTestResult(result);
    } catch (err: any) {
      alert(`Orchestration test failed: ${err.message}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-canvas)', color: 'var(--text-primary)', paddingBottom: '90px' }}>
      <NavigationHeader />

      <main style={{ maxWidth: '1000px', margin: '1.5rem auto', padding: '0 1.25rem' }}>
        {/* Page Header */}
        <section
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            boxShadow: '0 8px 30px var(--shadow-color)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                ADMIN CONTROL PANEL
              </span>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0.2rem 0', color: 'var(--text-primary)' }}>
                ⚙️ Provider Orchestration & Feature Toggles
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                Manage live Kwik & Goterr adapters, set priority-based routing, margin rules, and test automatic circuit-breaker failovers.
              </p>
            </div>

            <button
              onClick={() => navigate('/admin')}
              style={{
                padding: '0.55rem 1.25rem',
                borderRadius: '10px',
                background: 'var(--bg-highlight)',
                color: 'var(--accent-primary)',
                border: '1px solid var(--accent-primary)',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              ← Back to Main Admin
            </button>
          </div>
        </section>

        {/* Global Strategy Switcher */}
        <section
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '1.5rem',
            marginBottom: '2rem',
            boxShadow: '0 4px 20px var(--shadow-color)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--accent-primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                DYNAMIC ROUTING STRATEGY
              </span>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0.2rem 0', color: 'var(--text-primary)' }}>
                Active Mode: {routingStrategy === 'PRIORITY_BASED' ? '🎯 Priority-Based Ranking' : '💰 Offer Margin-Based Maximization'}
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
                {routingStrategy === 'PRIORITY_BASED'
                  ? 'Transactions route strictly according to Provider Priority Ranks (Priority 1 -> Priority 2 -> Priority 3).'
                  : 'Transactions route dynamically to whichever active gateway offers the highest Cash Offer Margin %.'}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => handleStrategyChange('PRIORITY_BASED')}
                style={{
                  padding: '0.6rem 1.2rem',
                  borderRadius: '10px',
                  background: routingStrategy === 'PRIORITY_BASED' ? 'var(--accent-primary)' : 'var(--input-bg)',
                  color: routingStrategy === 'PRIORITY_BASED' ? '#ffffff' : 'var(--text-primary)',
                  border: `1px solid ${routingStrategy === 'PRIORITY_BASED' ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                🎯 Priority-Based Mode
              </button>

              <button
                onClick={() => handleStrategyChange('OFFER_MARGIN_BASED')}
                style={{
                  padding: '0.6rem 1.2rem',
                  borderRadius: '10px',
                  background: routingStrategy === 'OFFER_MARGIN_BASED' ? 'var(--accent-primary)' : 'var(--input-bg)',
                  color: routingStrategy === 'OFFER_MARGIN_BASED' ? '#ffffff' : 'var(--text-primary)',
                  border: `1px solid ${routingStrategy === 'OFFER_MARGIN_BASED' ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                💰 Offer Margin Mode
              </button>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '1.25rem 0' }} />

          {/* Active Candidate Execution Pipeline Banner */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', fontSize: '0.88rem' }}>
            <span style={{ fontWeight: 800, color: 'var(--text-secondary)' }}>
              🚀 Live Candidate Execution Pipeline:
            </span>
            {(() => {
              const active = [...providers]
                .filter((p) => p.enabled && p.healthStatus !== 'DOWN')
                .sort((a, b) => {
                  if (routingStrategy === 'OFFER_MARGIN_BASED') {
                    return b.offerMarginPercentage - a.offerMarginPercentage;
                  }
                  return a.priority - b.priority;
                });

              if (active.length === 0) {
                return <span style={{ color: '#ef4444', fontWeight: 800 }}>⚠️ NO ACTIVE CANDIDATES (ALL DISABLED / DOWN)</span>;
              }

              return (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {active.map((p, idx) => (
                    <span
                      key={p.providerId}
                      style={{
                        padding: '0.35rem 0.75rem',
                        borderRadius: '20px',
                        background: idx === 0 ? 'rgba(34, 197, 94, 0.15)' : 'var(--input-bg)',
                        color: idx === 0 ? '#16a34a' : 'var(--text-primary)',
                        border: `1px solid ${idx === 0 ? '#22c55e' : 'var(--border-color)'}`,
                        fontWeight: 800,
                        fontSize: '0.82rem'
                      }}
                    >
                      {idx === 0 ? '1st ' : `${idx + 1}nd `} {p.providerName} ({p.providerId})
                      {routingStrategy === 'OFFER_MARGIN_BASED' ? ` [${p.offerMarginPercentage}% Margin]` : ` [Priority ${p.priority}]`}
                    </span>
                  ))}
                </div>
              );
            })()}
          </div>
        </section>

        {/* SECTION 1: Active Provider Adapters & Feature Toggles */}
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-primary)' }}>
            📡 Registered Gateway Adapters & Feature Toggles
          </h2>

          {loading ? (
            <p style={{ color: 'var(--text-secondary)' }}>Loading provider configurations...</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
              {providers.map((p) => {
                const isHealthy = p.healthStatus === 'HEALTHY';
                const isDegraded = p.healthStatus === 'DEGRADED';

                return (
                  <div
                    key={p.providerId}
                    style={{
                      background: 'var(--bg-card)',
                      border: `1px solid ${p.enabled ? 'var(--border-color)' : '#94a3b8'}`,
                      borderRadius: '16px',
                      padding: '1.5rem',
                      boxShadow: '0 4px 20px var(--shadow-color)',
                      opacity: p.enabled ? 1 : 0.65,
                      transition: 'all 0.2s ease-in-out'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                          style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '10px',
                            background: p.providerId === 'KWIK' ? '#3b82f6' : '#8b5cf6',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 900,
                            fontSize: '1.1rem'
                          }}
                        >
                          {p.providerId.substring(0, 2)}
                        </div>
                        <div>
                          <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)', display: 'block' }}>
                            {p.providerName}
                          </strong>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                            Provider ID: {p.providerId}
                          </span>
                        </div>
                      </div>

                      {/* Feature Toggle Switch */}
                      <button
                        onClick={() => handleToggle(p.providerId, p.enabled)}
                        style={{
                          padding: '0.45rem 1rem',
                          borderRadius: '20px',
                          background: p.enabled ? '#22c55e' : '#64748b',
                          color: '#ffffff',
                          border: 'none',
                          fontWeight: 800,
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                        }}
                      >
                        {p.enabled ? '● ENABLED' : '○ DISABLED'}
                      </button>
                    </div>

                    <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '1rem 0' }} />

                    {/* Controls Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.3rem' }}>
                          Priority Rank
                        </label>
                        <select
                          value={p.priority}
                          onChange={(e) => handlePriorityChange(p.providerId, parseInt(e.target.value))}
                          style={{
                            width: '100%',
                            padding: '0.45rem',
                            background: 'var(--input-bg)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '8px',
                            color: 'var(--text-primary)',
                            fontWeight: 700
                          }}
                        >
                          <option value={1}>Priority 1 (Primary)</option>
                          <option value={2}>Priority 2 (Secondary)</option>
                          <option value={3}>Priority 3 (Backup)</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.3rem' }}>
                          Offer Margin %
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={p.offerMarginPercentage}
                          readOnly
                          style={{
                            width: '100%',
                            padding: '0.45rem',
                            background: 'var(--input-bg)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '8px',
                            color: 'var(--text-primary)',
                            fontWeight: 700
                          }}
                        />
                      </div>
                    </div>

                    {/* Health Status Badge & Latency Info */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.82rem', marginTop: '0.5rem' }}>
                      <div>
                        <span style={{ color: 'var(--text-secondary)' }}>Health State: </span>
                        <span
                          style={{
                            fontWeight: 800,
                            color: isHealthy ? '#22c55e' : isDegraded ? '#f59e0b' : '#ef4444'
                          }}
                        >
                          {isHealthy ? '🟢 HEALTHY' : isDegraded ? '🟡 DEGRADED' : '🔴 DOWN'}
                        </span>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-secondary)' }}>24h Success: </span>
                        <strong style={{ color: 'var(--text-primary)' }}>{p.successRate24h}%</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-secondary)' }}>Avg Latency: </span>
                        <strong style={{ color: '#3b82f6' }}>{p.averageLatencyMs || 45}ms</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-secondary)' }}>Max Timeout: </span>
                        <strong style={{ color: '#eab308' }}>{p.maxTimeoutMs || 5000}ms</strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* SECTION 2: Interactive Priority Routing & Failover Sandbox */}
        <section
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '1.75rem',
            boxShadow: '0 4px 20px var(--shadow-color)'
          }}
        >
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
            🧪 Interactive Orchestration & Failover Test Sandbox
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
            Run live orchestrated transactions to verify priority routing, candidate provider selection, and circuit-breaker failovers.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.3rem' }}>
                Service Category
              </label>
              <select
                value={testService}
                onChange={(e) => setTestService(e.target.value)}
                style={{ width: '100%', padding: '0.55rem', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.85rem' }}
              >
                <option value="RECHARGE">Mobile Recharge</option>
                <option value="UTILITY">Utility Bill</option>
                <option value="VOUCHER">Brand Voucher</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.3rem' }}>
                Biller / Operator Code
              </label>
              <input
                type="text"
                value={testBiller}
                onChange={(e) => setTestBiller(e.target.value)}
                style={{ width: '100%', padding: '0.55rem', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.85rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.3rem' }}>
                Account / Mobile No.
              </label>
              <input
                type="text"
                value={testAccount}
                onChange={(e) => setTestAccount(e.target.value)}
                style={{ width: '100%', padding: '0.55rem', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.85rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.3rem' }}>
                Amount (₹)
              </label>
              <input
                type="number"
                value={testAmount}
                onChange={(e) => setTestAmount(e.target.value)}
                style={{ width: '100%', padding: '0.55rem', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          <button
            onClick={handleRunOrchestrationTest}
            disabled={testing}
            style={{
              padding: '0.75rem 1.75rem',
              borderRadius: '10px',
              background: 'var(--accent-gradient)',
              color: '#ffffff',
              border: 'none',
              fontWeight: 800,
              fontSize: '0.95rem',
              cursor: 'pointer',
              boxShadow: '0 4px 14px var(--shadow-color)'
            }}
          >
            {testing ? '⏳ Running Routing Engine...' : '⚡ Execute Orchestrated Payment Test'}
          </button>

          {/* Test Execution Output Box */}
          {testResult && (
            <div
              style={{
                marginTop: '1.5rem',
                background: 'var(--bg-canvas)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '1.25rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-secondary)' }}>
                  ORCHESTRATION TEST RESULT
                </span>
                <span
                  style={{
                    padding: '0.2rem 0.6rem',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    background: testResult.status === 'SUCCESS' ? '#dcfce7' : '#fee2e2',
                    color: testResult.status === 'SUCCESS' ? '#166534' : '#991b1b'
                  }}
                >
                  {testResult.status}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.88rem' }}>
                <div>
                  <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.75rem' }}>Assigned Provider</span>
                  <strong style={{ color: 'var(--accent-primary)', fontSize: '1.05rem' }}>
                    {testResult.assignedProviderId || 'None'}
                  </strong>
                </div>

                <div>
                  <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.75rem' }}>Failover Status</span>
                  <strong style={{ color: testResult.failoverOccurred ? '#f59e0b' : '#22c55e' }}>
                    {testResult.failoverOccurred ? '⚠️ FAILOVER OCCURRED' : '✓ Direct Primary Route'}
                  </strong>
                </div>

                <div>
                  <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.75rem' }}>Correlation ID</span>
                  <span style={{ fontFamily: 'monospace', color: 'var(--text-primary)' }}>{testResult.requestCorrelationId}</span>
                </div>

                <div>
                  <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.75rem' }}>Attempted Providers</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{testResult.attemptedProviders?.join(' → ')}</span>
                </div>

                <div>
                  <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.75rem' }}>Execution Latency</span>
                  <strong style={{ color: '#3b82f6' }}>{testResult.executionLatencyMs || 0} ms</strong>
                </div>

                <div>
                  <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.75rem' }}>Failover Reason</span>
                  <strong style={{ color: testResult.failoverReason === 'TIMEOUT_EXCEEDED' ? '#ef4444' : 'var(--text-primary)' }}>
                    {testResult.failoverReason || 'NONE'}
                  </strong>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      <BottomNavBar />
    </div>
  );
}
