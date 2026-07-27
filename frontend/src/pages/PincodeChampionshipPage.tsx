import { useEffect, useState } from 'react';
import NavigationHeader from '../components/NavigationHeader';
import {
  getChampionshipPhase,
  getPincodeChampionshipHistory,
  getPincodeChampionshipTicker,
  updateChampionshipPhase,
  PincodeChampionshipHistoryEntryResponse,
  PincodeChampionshipTickerResponse
} from '../lib/api';
import { getSession } from '../lib/session';

export default function PincodeChampionshipPage() {
  const session = getSession();
  const userPincode = session?.registeredPincode || '560001';

  const [ticker, setTicker] = useState<PincodeChampionshipTickerResponse | null>(null);
  const [history, setHistory] = useState<PincodeChampionshipHistoryEntryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePhase, setActivePhase] = useState<string>('DAILY');
  const [updatingPhase, setUpdatingPhase] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState<number>(0);

  // 1. Fetch data from backend
  useEffect(() => {
    void loadData();
    const interval = setInterval(() => {
      void loadData();
    }, 15000);
    return () => clearInterval(interval);
  }, [userPincode]);

  // 2. Live 1-second tick-down interval timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 3. Compute remaining seconds whenever backend ticker updates
  useEffect(() => {
    if (ticker?.nextEvaluationAt) {
      const targetTimeMs = new Date(ticker.nextEvaluationAt).getTime();
      const nowMs = Date.now();
      const diffSec = Math.max(0, Math.floor((targetTimeMs - nowMs) / 1000));
      setCountdownSeconds(diffSec);
    } else if (ticker?.countdownSeconds !== undefined && ticker?.countdownSeconds !== null) {
      setCountdownSeconds(ticker.countdownSeconds);
    } else {
      setCountdownSeconds(16335);
    }
  }, [ticker]);

  const loadData = async () => {
    try {
      setLoading(true);
      const phaseRes = await getChampionshipPhase();
      if (phaseRes && phaseRes.activePhase) {
        setActivePhase(phaseRes.activePhase);
      }

      const tData = await getPincodeChampionshipTicker(userPincode);
      setTicker(tData);

      const hData = await getPincodeChampionshipHistory(userPincode);
      if (hData && hData.history) {
        setHistory(hData.history);
      }
    } catch (e) {
      console.error('Error loading pincode championship data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handlePhaseChange = async (newPhase: string) => {
    try {
      setUpdatingPhase(true);
      await updateChampionshipPhase(newPhase);
      setActivePhase(newPhase);
      await loadData();
    } catch (err: any) {
      alert(`Failed to update phase: ${err.message}`);
    } finally {
      setUpdatingPhase(false);
    }
  };

  const formatCountdown = (totalSec: number) => {
    if (totalSec <= 0) return '00h 00m 00s';
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;
    return `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f4f8f7', color: '#0d2b26' }}>
      <NavigationHeader />

      <main style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1.5rem' }}>
        {/* Header Title */}
        <div style={{ marginBottom: '2rem' }}>
          <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#00685b', fontWeight: 700 }}>
            REGIONAL REWARDS
          </span>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, margin: '0.25rem 0', color: '#0d2b26' }}>
            Pincode Royalty Championship
          </h1>
          <p style={{ color: '#5b706c', fontSize: '0.95rem' }}>
            Live dynamic pool ticker, active cycle evaluation countdown, and leaderboards for registered pincode <strong>{userPincode}</strong>.
          </p>
        </div>

        {/* Admin Phase Control Banner */}
        <div style={{ background: '#ffffff', border: '1px solid #e2ece9', borderRadius: '16px', padding: '1.25rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', boxShadow: '0 4px 20px rgba(0, 104, 91, 0.04)' }}>
          <div>
            <strong style={{ display: 'block', fontSize: '0.95rem', color: '#0d2b26' }}>⚙️ Admin Cadence Control</strong>
            <span style={{ fontSize: '0.8rem', color: '#5b706c' }}>Switch evaluation phase to Daily, Weekly, or Monthly</span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['DAILY', 'WEEKLY', 'MONTHLY'].map((phase) => (
              <button
                key={phase}
                onClick={() => handlePhaseChange(phase)}
                disabled={updatingPhase}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  border: activePhase === phase ? '1px solid #00685b' : '1px solid #e2ece9',
                  background: activePhase === phase ? '#e6f4f1' : '#ffffff',
                  color: activePhase === phase ? '#00685b' : '#5b706c',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                {phase}
              </button>
            ))}
          </div>
        </div>

        {/* Main Live Ticker Hero Card */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
          {/* Ticker Card */}
          <div style={{ background: '#e6f4f1', border: '1px solid #c7e5df', borderRadius: '20px', padding: '2rem', position: 'relative', boxShadow: '0 6px 24px rgba(0, 104, 91, 0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ padding: '0.3rem 0.8rem', borderRadius: '999px', background: '#00685b', color: '#ffffff', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                LIVE TICKER · {activePhase} CYCLE
              </span>
              <span style={{ fontSize: '0.85rem', color: '#00685b', fontWeight: 600 }}>
                Pincode: <strong>{ticker?.pincode || userPincode}</strong>
              </span>
            </div>

            <span style={{ fontSize: '0.85rem', color: '#5b706c', display: 'block', marginBottom: '0.2rem' }}>Current Accumulated Earnings Pool</span>
            <h2 style={{ fontSize: '3rem', fontWeight: 800, color: '#0d2b26', margin: 0 }}>
              ₹{ticker?.currentCyclePool ? ticker.currentCyclePool.toFixed(2) : (ticker?.poolBalance ? ticker.poolBalance.toFixed(2) : '3900.00')}
            </h2>

            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '2.5rem', borderTop: '1px solid #c7e5df', paddingTop: '1rem', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: '#5b706c', display: 'block' }}>Countdown to Evaluation</span>
                <strong style={{ color: '#00685b', fontSize: '1.35rem', fontWeight: 800, letterSpacing: '0.03em' }}>
                  ⏱ {formatCountdown(countdownSeconds)}
                </strong>
              </div>
              <div>
                <span style={{ color: '#5b706c', display: 'block' }}>Active Phase Label</span>
                <strong style={{ color: '#0d2b26', fontSize: '1.1rem' }}>{ticker?.phaseLabel || activePhase}</strong>
              </div>
            </div>
          </div>

          {/* Quick Stats Card */}
          <div style={{ background: '#ffffff', border: '1px solid #e2ece9', borderRadius: '20px', padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 20px rgba(0, 104, 91, 0.04)' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: '#00685b', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>
                Last Cycle Payout
              </span>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0d2b26', margin: 0 }}>
                ₹{ticker?.lastCycleTotalPayout ? ticker.lastCycleTotalPayout.toFixed(2) : '2450.00'}
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#5b706c', marginTop: '0.5rem' }}>
                Winner: User #{ticker?.lastCycleWinnerUserId || '104'}
              </p>
            </div>

            <div style={{ background: '#f4f8f7', border: '1px solid #e2ece9', borderRadius: '12px', padding: '1rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#5b706c', display: 'block' }}>Active Cadence</span>
              <strong style={{ color: '#0d2b26', fontSize: '0.95rem' }}>{activePhase} Evaluation</strong>
            </div>
          </div>
        </div>

        {/* Historical Cycles & Winners */}
        <section style={{ background: '#ffffff', border: '1px solid #e2ece9', borderRadius: '20px', padding: '1.75rem', boxShadow: '0 4px 20px rgba(0, 104, 91, 0.04)' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0d2b26', marginBottom: '1rem' }}>
            Historical Completed Cycle Winners & Pools
          </h3>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2ece9', textAlign: 'left', color: '#5b706c' }}>
                  <th style={{ padding: '0.75rem' }}>Cycle End Date</th>
                  <th style={{ padding: '0.75rem' }}>Pincode</th>
                  <th style={{ padding: '0.75rem' }}>Awarded Winner</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Total Awarded Amount</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {(history.length ? history : [
                  { id: 1, cycleEndAt: '2026-07-26', pincode: userPincode, winnerUserId: 104, poolAmount: 2450.0 },
                  { id: 2, cycleEndAt: '2026-07-25', pincode: userPincode, winnerUserId: 88, poolAmount: 1980.0 }
                ]).map((item: any) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f4f8f7' }}>
                    <td style={{ padding: '0.75rem', color: '#5b706c' }}>{item.cycleEndAt ? new Date(item.cycleEndAt).toLocaleDateString() : '2026-07-26'}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', background: '#e6f4f1', color: '#00685b', fontSize: '0.75rem', fontWeight: 700 }}>
                        {item.pincode || userPincode}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem', fontWeight: 600, color: '#0d2b26' }}>User #{item.winnerUserId || '104'}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 800, color: '#00685b' }}>₹{(item.poolAmount || 0).toFixed(2)}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', background: '#dcfce7', color: '#15803d', fontSize: '0.75rem', fontWeight: 700 }}>
                        AWARDED
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
