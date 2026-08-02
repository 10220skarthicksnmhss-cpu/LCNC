import { useState, useEffect } from 'react';
import { C, F } from '../tokens';
import MealCard from '../components/meals/MealCard';
import PriceAlertBanner from '../components/alerts/PriceAlertBanner';
import { home } from '../api/client';

function StatChip({ label, value, accent }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '14px 16px', flex: 1 }}>
      <p style={{ fontFamily: F.body, fontSize: 11, color: C.muted, marginBottom: 6, letterSpacing: 0.3 }}>{label}</p>
      <p style={{ fontFamily: F.mono, fontSize: 20, fontWeight: 700, color: accent || C.cream }}>{value}</p>
    </div>
  );
}

export default function HomeScreen({ onNavigate, user }) {
  const [dashboard, setDashboard] = useState(null);
  const [alertDismissed, setAlertDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    home.dashboard()
      .then(res => setDashboard(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const initial = user?.name?.[0]?.toUpperCase() ?? '?';
  const activeAlert = !alertDismissed && dashboard?.activeAlert;
  const todayOrders = dashboard?.todayOrders ?? [];
  const recommendations = dashboard?.recommendations ?? [];
  const stats = dashboard?.stats ?? {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', background: C.bg }}>
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '56px 20px 16px',
        position: 'sticky', top: 0, zIndex: 30,
        background: 'rgba(15,14,12,0.92)', backdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${C.border}`,
      }}>
        <span style={{ fontFamily: F.display, fontStyle: 'italic', fontSize: 26, fontWeight: 700, color: C.cream, letterSpacing: -0.5 }}>
          {dashboard?.greeting ?? 'Thali'}
        </span>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'rgba(232,121,58,0.15)', border: `1px solid rgba(232,121,58,0.3)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontFamily: F.body, fontWeight: 700, fontSize: 14, color: C.saffron }}>{initial}</span>
        </div>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 88 }}>

        {/* Active price alert */}
        {activeAlert && (
          <div style={{ padding: '16px 16px 8px', position: 'relative', zIndex: 45 }}>
            <PriceAlertBanner
              oldPrice={activeAlert.oldPrice}
              newPrice={activeAlert.newPrice}
              reason={activeAlert.reason}
              timeLeftSeconds={Math.max(0, Math.floor((new Date(activeAlert.deadline).getTime() - Date.now()) / 1000))}
              onKeep={() => setAlertDismissed(true)}
              onAISuggest={() => { setAlertDismissed(true); onNavigate('ai-suggest', activeAlert); }}
              onPickAnother={() => { setAlertDismissed(true); onNavigate('browse'); }}
            />
          </div>
        )}

        {/* Today's deliveries */}
        {todayOrders.length > 0 && (
          <div style={{ padding: '24px 0 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', marginBottom: 14 }}>
              <h2 style={{ fontFamily: F.body, fontSize: 16, fontWeight: 700, color: C.cream }}>Today's deliveries</h2>
            </div>
            {todayOrders.map(o => (
              <div key={o.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 20px', marginBottom: 8,
                background: C.card, borderBottom: `1px solid ${C.border}`,
              }}>
                <div>
                  <p style={{ fontFamily: F.display, fontStyle: 'italic', fontSize: 16, color: C.cream, marginBottom: 2 }}>{o.meal}</p>
                  <p style={{ fontFamily: F.body, fontSize: 12, color: C.muted }}>{o.deliveryTime} · {o.status}</p>
                </div>
                <span style={{ fontFamily: F.mono, fontSize: 15, fontWeight: 600, color: C.cream }}>₹{o.price}</span>
              </div>
            ))}
          </div>
        )}

        {/* Recommendations */}
        <div style={{ padding: '24px 0 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', marginBottom: 14 }}>
            <h2 style={{ fontFamily: F.body, fontSize: 16, fontWeight: 700, color: C.cream }}>For you</h2>
            <button onClick={() => onNavigate('browse')} style={{ fontFamily: F.body, fontSize: 12, color: C.saffron, background: 'none', border: 'none', cursor: 'pointer' }}>
              Browse all →
            </button>
          </div>
          {loading ? (
            <div style={{ padding: '0 20px', color: C.muted, fontFamily: F.body, fontSize: 13 }}>Loading…</div>
          ) : (
            <div style={{ display: 'flex', gap: 12, overflowX: 'auto', padding: '0 20px 4px' }}>
              {recommendations.map(m => (
                <MealCard key={m.id} meal={m} compact onClick={() => onNavigate('browse')} />
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        <div style={{ padding: '28px 20px 0' }}>
          <p style={{ fontFamily: F.body, fontSize: 11, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: C.muted, marginBottom: 12 }}>
            This month
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <StatChip label="Spent" value={stats.totalSpent ? `₹${stats.totalSpent}` : '₹0'} />
            <StatChip label="Saved" value={stats.savedViaAiSwaps ? `₹${stats.savedViaAiSwaps}` : '₹0'} accent={C.mint} />
            <StatChip label="AI picks" value={stats.aiMeals ?? 0} accent={C.saffron} />
          </div>
        </div>

      </div>
    </div>
  );
}
