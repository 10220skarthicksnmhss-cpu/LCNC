import { useState } from 'react';
import { C, F } from '../tokens';
import MealCard from '../components/meals/MealCard';
import PriceAlertBanner from '../components/alerts/PriceAlertBanner';
import { meals, priceAlertData } from '../data/mockData';

function StatChip({ label, value, accent }) {
  return (
    <div style={{
      background: C.card, border: `1px solid ${C.border}`,
      borderRadius: 14, padding: '14px 16px', flex: 1,
    }}>
      <p style={{ fontFamily: F.body, fontSize: 11, color: C.muted, marginBottom: 6, letterSpacing: 0.3 }}>{label}</p>
      <p style={{ fontFamily: F.mono, fontSize: 20, fontWeight: 700, color: accent || C.cream }}>{value}</p>
    </div>
  );
}

export default function HomeScreen({ onNavigate }) {
  const [alertActive, setAlertActive] = useState(true);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', background: C.bg }}>
      {/* Header */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '56px 20px 16px',
        position: 'sticky', top: 0, zIndex: 30,
        background: 'rgba(15,14,12,0.92)', backdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${C.border}`,
      }}>
        <span style={{ fontFamily: F.display, fontStyle: 'italic', fontSize: 26, fontWeight: 700, color: C.cream, letterSpacing: -0.5 }}>
          Thali
        </span>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'rgba(232,121,58,0.15)', border: `1px solid rgba(232,121,58,0.3)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontFamily: F.body, fontWeight: 700, fontSize: 14, color: C.saffron }}>K</span>
        </div>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 88 }}>

        {/* Alert Banner */}
        {alertActive && (
          <div style={{ padding: '16px 16px 8px', position: 'relative', zIndex: 45 }}>
            <PriceAlertBanner
              {...priceAlertData}
              onKeep={() => setAlertActive(false)}
              onAISuggest={() => { setAlertActive(false); onNavigate('ai-suggest'); }}
              onPickAnother={() => { setAlertActive(false); onNavigate('browse'); }}
            />
          </div>
        )}

        {!alertActive && (
          <button onClick={() => setAlertActive(true)} style={{
            margin: '12px 16px 0', width: 'calc(100% - 32px)',
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.2)',
            borderRadius: 12, padding: '11px 14px', cursor: 'pointer',
          }}>
            <span className="pulse-dot" style={{ width: 7, height: 7, borderRadius: '50%', background: C.danger, flexShrink: 0 }} />
            <span style={{ fontFamily: F.body, fontSize: 13, color: C.danger }}>Price alert active for Dal Makhani — tap to review</span>
          </button>
        )}

        {/* Today's meals */}
        <div style={{ padding: '24px 0 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', marginBottom: 14 }}>
            <h2 style={{ fontFamily: F.body, fontSize: 16, fontWeight: 700, color: C.cream }}>Today's meals</h2>
            <button onClick={() => onNavigate('browse')} style={{
              fontFamily: F.body, fontSize: 12, color: C.saffron, background: 'none', border: 'none', cursor: 'pointer',
            }}>Browse all →</button>
          </div>
          <div style={{ display: 'flex', gap: 12, overflowX: 'auto', padding: '0 20px 4px' }}>
            {meals.slice(0, 6).map(m => (
              <MealCard key={m.id} meal={m} compact onClick={() => onNavigate('browse')} />
            ))}
          </div>
        </div>

        {/* Stats */}
        <div style={{ padding: '28px 20px 0' }}>
          <p style={{ fontFamily: F.body, fontSize: 11, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: C.muted, marginBottom: 12 }}>
            This week
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <StatChip label="Spent" value="₹847" />
            <StatChip label="Saved" value="₹212" accent={C.mint} />
            <StatChip label="AI picks" value="3" accent={C.saffron} />
          </div>
        </div>

        {/* Recent orders */}
        <div style={{ padding: '28px 20px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <p style={{ fontFamily: F.body, fontSize: 11, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: C.muted }}>
              Recent orders
            </p>
            <button onClick={() => onNavigate('orders')} style={{ fontFamily: F.body, fontSize: 12, color: C.saffron, background: 'none', border: 'none', cursor: 'pointer' }}>
              Full log →
            </button>
          </div>
          {[
            { meal: 'Lemon Rice', price: 79, ai: true, when: 'Today' },
            { meal: 'Masala Dosa', price: 89, ai: false, when: 'Yesterday' },
          ].map((o, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 16px', marginBottom: 8,
              background: C.card, border: `1px solid ${C.border}`, borderRadius: 14,
            }}>
              <div>
                <p style={{ fontFamily: F.display, fontStyle: 'italic', fontSize: 16, color: C.cream, marginBottom: 2 }}>{o.meal}</p>
                <p style={{ fontFamily: F.body, fontSize: 12, color: C.muted }}>{o.when}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {o.ai && (
                  <span style={{
                    fontFamily: F.body, fontSize: 10, fontWeight: 700, letterSpacing: 0.5,
                    color: C.saffron, background: 'rgba(232,121,58,0.12)',
                    border: '1px solid rgba(232,121,58,0.25)', borderRadius: 99, padding: '2px 7px',
                  }}>AI</span>
                )}
                <span style={{ fontFamily: F.mono, fontSize: 15, fontWeight: 600, color: C.cream }}>₹{o.price}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
