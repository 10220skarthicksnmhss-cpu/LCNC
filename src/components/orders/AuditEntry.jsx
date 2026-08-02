import { useState } from 'react';
import { C, F } from '../../tokens';

export default function AuditEntry({ order, isLast }) {
  const [open, setOpen] = useState(false);
  const d = new Date(order.date);
  const dateStr = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  return (
    <div style={{ display: 'flex', gap: 16 }}>
      {/* Timeline spine */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, width: 16 }}>
        <div style={{
          width: 12, height: 12, borderRadius: '50%', marginTop: 4, flexShrink: 0,
          background: order.aiDecision ? C.saffron : C.card,
          border: `2px solid ${order.aiDecision ? C.saffron : C.border}`,
          boxShadow: order.aiDecision ? `0 0 8px rgba(232,121,58,0.5)` : 'none',
        }} />
        {!isLast && <div style={{ width: 1, flex: 1, background: C.border, margin: '4px 0' }} />}
      </div>

      {/* Content */}
      <div style={{ flex: 1, paddingBottom: isLast ? 0 : 20 }}>
        <p style={{ fontFamily: F.body, fontSize: 11, color: C.muted, marginBottom: 4 }}>{dateStr}</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <p style={{ fontFamily: F.display, fontStyle: 'italic', fontSize: 17, color: C.cream }}>{order.meal}</p>
          <span style={{ fontFamily: F.mono, fontSize: 14, fontWeight: 600, color: C.cream, flexShrink: 0, marginLeft: 8 }}>₹{order.finalPrice}</span>
        </div>

        {order.aiDecision && (
          <span style={{
            display: 'inline-block', fontFamily: F.body, fontSize: 10, fontWeight: 700,
            letterSpacing: 0.8, textTransform: 'uppercase', color: C.saffron,
            background: 'rgba(232,121,58,0.1)', border: '1px solid rgba(232,121,58,0.25)',
            borderRadius: 99, padding: '2px 8px', marginBottom: 8,
          }}>AI Decided</span>
        )}

        <button onClick={() => setOpen(v => !v)} style={{
          display: 'flex', alignItems: 'center', gap: 4,
          fontFamily: F.body, fontSize: 12, color: C.subtle,
          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
        }}>
          <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
            style={{ transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>
            <polyline points="9 18 15 12 9 6"/>
          </svg>
          {open ? 'Hide' : 'Show'} decision trail
        </button>

        {open && (
          <div className="fade-in" style={{
            marginTop: 8, background: 'rgba(255,255,255,0.03)',
            border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 14px',
          }}>
            <p style={{ fontFamily: F.body, fontSize: 13, color: C.muted, lineHeight: 1.6 }}>
              {order.decisionTrail}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
