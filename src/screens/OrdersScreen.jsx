import { C, F } from '../tokens';
import AuditEntry from '../components/orders/AuditEntry';
import { orders } from '../data/mockData';

export default function OrdersScreen() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', background: C.bg }}>
      <header style={{ padding: '56px 20px 16px', borderBottom: `1px solid ${C.border}` }}>
        <h1 style={{ fontFamily: F.display, fontStyle: 'italic', fontSize: 26, fontWeight: 700, color: C.cream, marginBottom: 4 }}>History</h1>
        <p style={{ fontFamily: F.body, fontSize: 13, color: C.muted }}>
          {orders.filter(o => o.aiDecision).length} AI decisions this month
        </p>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px 88px' }}>
        {/* Legend */}
        <div style={{ display: 'flex', gap: 18, marginBottom: 24 }}>
          {[
            { dot: C.saffron, label: 'AI decided', glow: true },
            { dot: C.border, label: 'You decided', glow: false },
          ].map((l, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 10, height: 10, borderRadius: '50%',
                background: l.dot, border: `2px solid ${l.dot}`,
                boxShadow: l.glow ? `0 0 6px rgba(232,121,58,0.5)` : 'none',
              }} />
              <span style={{ fontFamily: F.body, fontSize: 12, color: C.muted }}>{l.label}</span>
            </div>
          ))}
        </div>

        {/* Timeline */}
        <div>
          {orders.map((o, i) => (
            <AuditEntry key={o.id} order={o} isLast={i === orders.length - 1} />
          ))}
        </div>

        {/* Summary */}
        <div style={{
          marginTop: 24, background: C.card, border: `1px solid ${C.border}`,
          borderRadius: 16, padding: '18px 20px',
        }}>
          <p style={{ fontFamily: F.body, fontSize: 11, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: C.muted, marginBottom: 14 }}>
            This month
          </p>
          {[
            { label: 'Total spent', value: '₹2,847', color: C.cream },
            { label: 'Saved via AI swaps', value: '₹412', color: C.mint },
            { label: 'AI-selected meals', value: '3 of 18', color: C.saffron },
          ].map(s => (
            <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, lastChild: { marginBottom: 0 } }}>
              <span style={{ fontFamily: F.body, fontSize: 14, color: C.muted }}>{s.label}</span>
              <span style={{ fontFamily: F.mono, fontSize: 15, fontWeight: 700, color: s.color }}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
