import { useState, useEffect } from 'react';
import { C, F } from '../../tokens';

function fmt(s) {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

export default function PriceAlertBanner({ oldPrice, newPrice, reason, timeLeftSeconds, onKeep, onAISuggest, onPickAnother }) {
  const [secs, setSecs] = useState(timeLeftSeconds);

  useEffect(() => { setSecs(timeLeftSeconds); }, [timeLeftSeconds]);
  useEffect(() => {
    if (secs <= 0) return;
    const id = setInterval(() => setSecs(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, []);

  const pct = Math.round(((newPrice - oldPrice) / oldPrice) * 100);

  return (
    <>
      {/* Page dim */}
      <div style={{
        position: 'fixed', inset: 0, background: 'rgba(15,14,12,0.6)',
        zIndex: 40, pointerEvents: 'none',
      }} className="fade-in" />

      {/* Banner */}
      <div className="fade-in" style={{
        position: 'relative', zIndex: 45,
        background: C.card, borderRadius: 16,
        borderLeft: `3px solid ${C.saffron}`,
        border: `1px solid rgba(232,121,58,0.25)`,
        borderLeftWidth: 3,
        overflow: 'hidden',
        boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
      }}>
        <div style={{ padding: '16px 18px 18px' }}>

          {/* Top row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {/* Pulsing dot */}
              <span className="pulse-dot" style={{
                width: 8, height: 8, borderRadius: '50%', background: C.saffron, display: 'block',
              }} />
              <span style={{ fontFamily: F.body, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: C.saffron }}>
                Price Alert
              </span>
              <span style={{
                fontFamily: F.mono, fontSize: 11, fontWeight: 600,
                color: C.danger, background: 'rgba(192,57,43,0.15)',
                border: '1px solid rgba(192,57,43,0.3)',
                borderRadius: 99, padding: '2px 8px',
              }}>+{pct}%</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: F.body, fontSize: 10, color: C.muted, marginBottom: 2 }}>Auto-switch in</div>
              <div style={{ fontFamily: F.mono, fontSize: 18, fontWeight: 700, color: C.cream, letterSpacing: -0.5 }}>
                {fmt(secs)}
              </div>
            </div>
          </div>

          {/* Reason */}
          <p style={{ fontFamily: F.body, fontSize: 13, color: C.muted, marginBottom: 14, lineHeight: 1.5 }}>
            <span style={{ color: C.danger, fontWeight: 600 }}>{reason}</span> is driving up your meal cost.
          </p>

          {/* Price pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{
              flex: 1, textAlign: 'center', background: 'rgba(255,255,255,0.05)',
              borderRadius: 10, padding: '10px 0',
            }}>
              <div style={{ fontFamily: F.body, fontSize: 10, color: C.muted, marginBottom: 2 }}>Was</div>
              <div style={{ fontFamily: F.mono, fontSize: 20, fontWeight: 700, color: C.cream }}>₹{oldPrice}</div>
            </div>
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={C.saffron} strokeWidth={2}>
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
            <div style={{
              flex: 1, textAlign: 'center',
              background: 'rgba(192,57,43,0.1)', border: '1px solid rgba(192,57,43,0.25)',
              borderRadius: 10, padding: '10px 0',
            }}>
              <div style={{ fontFamily: F.body, fontSize: 10, color: 'rgba(192,57,43,0.7)', marginBottom: 2 }}>Now</div>
              <div style={{ fontFamily: F.mono, fontSize: 20, fontWeight: 700, color: C.danger }}>₹{newPrice}</div>
            </div>
          </div>

          {/* Buttons */}
          <button onClick={onAISuggest} style={{
            width: '100%', padding: '13px 0', marginBottom: 8,
            fontFamily: F.body, fontSize: 14, fontWeight: 700,
            background: C.saffron, color: C.bg,
            border: 'none', borderRadius: 12, cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(232,121,58,0.35)',
          }}>
            See AI Suggestion
          </button>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button onClick={onKeep} style={{
              padding: '11px 0', fontFamily: F.body, fontSize: 13, fontWeight: 500,
              color: C.muted, background: 'rgba(255,255,255,0.05)',
              border: `1px solid ${C.border}`, borderRadius: 10, cursor: 'pointer',
            }}>Keep · ₹{newPrice}</button>
            <button onClick={onPickAnother} style={{
              padding: '11px 0', fontFamily: F.body, fontSize: 13, fontWeight: 500,
              color: C.muted, background: 'rgba(255,255,255,0.05)',
              border: `1px solid ${C.border}`, borderRadius: 10, cursor: 'pointer',
            }}>Pick another</button>
          </div>
        </div>
      </div>
    </>
  );
}
