import { useState, useEffect } from 'react';
import { C, F } from '../tokens';
import AuditEntry from '../components/orders/AuditEntry';
import { orders as ordersApi } from '../api/client';

export default function OrdersScreen() {
  const [ordersList, setOrdersList] = useState([]);
  const [summary, setSummary]       = useState(null);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    ordersApi.history({ period: 'month' })
      .then(res => {
        setOrdersList(res.data ?? []);
        setSummary(res.summary ?? null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const aiCount = ordersList.filter(o => o.aiDecision).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', background: C.bg }}>
      <header style={{ padding: '56px 20px 16px', borderBottom: `1px solid ${C.border}` }}>
        <h1 style={{ fontFamily: F.display, fontStyle: 'italic', fontSize: 26, fontWeight: 700, color: C.cream, marginBottom: 4 }}>History</h1>
        <p style={{ fontFamily: F.body, fontSize: 13, color: C.muted }}>
          {aiCount} AI decision{aiCount !== 1 ? 's' : ''} this month
        </p>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px 88px' }}>
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

        {loading ? (
          <div style={{ textAlign: 'center', color: C.muted, fontFamily: F.body, fontSize: 14, paddingTop: 40 }}>Loading…</div>
        ) : ordersList.length === 0 ? (
          <div style={{ textAlign: 'center', color: C.muted, fontFamily: F.body, fontSize: 14, paddingTop: 40 }}>No orders yet</div>
        ) : (
          <div>
            {ordersList.map((o, i) => (
              <AuditEntry key={o.id} order={o} isLast={i === ordersList.length - 1} />
            ))}
          </div>
        )}

        {summary && (
          <div style={{ marginTop: 24, background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: '18px 20px' }}>
            <p style={{ fontFamily: F.body, fontSize: 11, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: C.muted, marginBottom: 14 }}>
              This month
            </p>
            {[
              { label: 'Total spent', value: `₹${summary.totalSpent?.toLocaleString('en-IN') ?? 0}`, color: C.cream },
              { label: 'Saved via AI swaps', value: `₹${summary.savedViaAiSwaps?.toLocaleString('en-IN') ?? 0}`, color: C.mint },
              { label: 'AI-selected meals', value: `${summary.aiSelectedMeals ?? 0} of ${summary.totalOrders ?? 0}`, color: C.saffron },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontFamily: F.body, fontSize: 14, color: C.muted }}>{s.label}</span>
                <span style={{ fontFamily: F.mono, fontSize: 15, fontWeight: 700, color: s.color }}>{s.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
