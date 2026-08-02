import { useState, useRef, useEffect } from 'react';
import { C, F } from '../../tokens';

export default function SubscriptionCard({ sub, onUpdate, onCancel }) {
  const [threshold, setThreshold] = useState(sub.threshold);
  const [autoSwitch, setAutoSwitch] = useState(sub.autoSwitch);
  const [status, setStatus] = useState(sub.status);
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleStatus = () => {
    const next = status === 'active' ? 'paused' : 'active';
    setStatus(next);
    onUpdate?.({ ...sub, threshold, autoSwitch, status: next });
  };

  const isActive = status === 'active';

  return (
    <div style={{
      background: C.card, border: `1px solid ${C.border}`,
      borderRadius: 16, overflow: 'hidden',
    }}>
      {isActive && <div style={{ height: 2, background: C.mint }} />}

      <div style={{ padding: '16px 16px 18px' }}>
        {/* Top row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ flex: 1, minWidth: 0, paddingRight: 8 }}>
            <p style={{ fontFamily: F.display, fontStyle: 'italic', fontSize: 18, fontWeight: 600, color: C.cream, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {sub.meal}
            </p>
            <p style={{ fontFamily: F.body, fontSize: 12, color: C.muted }}>{sub.cuisine} · {sub.deliveryTime}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <span style={{
              fontFamily: F.body, fontSize: 11, fontWeight: 700,
              color: isActive ? C.mint : C.muted,
              background: isActive ? 'rgba(46,204,143,0.1)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${isActive ? 'rgba(46,204,143,0.25)' : C.border}`,
              borderRadius: 99, padding: '3px 9px',
            }}>{isActive ? 'Active' : 'Paused'}</span>

            <div style={{ position: 'relative' }}>
              <button onClick={() => setMenuOpen(v => !v)} style={{
                width: 32, height: 32, borderRadius: 8, border: `1px solid ${C.border}`,
                background: menuOpen ? 'rgba(255,255,255,0.08)' : 'transparent',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.muted,
              }}>
                <svg width={14} height={14} viewBox="0 0 24 24" fill={C.muted}>
                  <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
                </svg>
              </button>
              {menuOpen && (
                <>
                  <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setMenuOpen(false)} />
                  <div style={{
                    position: 'absolute', right: 0, top: 38, zIndex: 20,
                    background: '#1C1B18', border: `1px solid ${C.border}`,
                    borderRadius: 12, overflow: 'hidden', minWidth: 140,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                  }}>
                    <button onClick={() => { toggleStatus(); setMenuOpen(false); }} style={{
                      width: '100%', textAlign: 'left', padding: '11px 14px',
                      fontFamily: F.body, fontSize: 14, color: C.cream,
                      background: 'none', border: 'none', cursor: 'pointer',
                      borderBottom: `1px solid ${C.border}`,
                    }}>{isActive ? 'Pause' : 'Resume'}</button>
                    <button onClick={() => { setMenuOpen(false); onCancel?.(sub); }} style={{
                      width: '100%', textAlign: 'left', padding: '11px 14px',
                      fontFamily: F.body, fontSize: 14, color: C.danger,
                      background: 'none', border: 'none', cursor: 'pointer',
                    }}>Cancel</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Price */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 18 }}>
          <span style={{ fontFamily: F.mono, fontSize: 22, fontWeight: 700, color: C.cream }}>₹{sub.price}</span>
          <span style={{ fontFamily: F.body, fontSize: 12, color: C.muted }}>/day</span>
        </div>

        {/* Threshold slider */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontFamily: F.body, fontSize: 12, color: C.muted }}>Alert threshold</span>
            <span style={{ fontFamily: F.mono, fontSize: 14, fontWeight: 600, color: C.saffron }}>+{threshold}%</span>
          </div>
          <input type="range" min={5} max={50} step={5} value={threshold}
            onChange={e => { const v = Number(e.target.value); setThreshold(v); onUpdate?.({ ...sub, threshold: v, autoSwitch, status }); }} />
        </div>

        {/* Auto-switch */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontFamily: F.body, fontSize: 14, color: C.cream, marginBottom: 2 }}>Auto-switch</p>
            <p style={{ fontFamily: F.body, fontSize: 11, color: C.muted }}>AI picks if no reply in 2h</p>
          </div>
          <button onClick={() => { const v = !autoSwitch; setAutoSwitch(v); onUpdate?.({ ...sub, threshold, autoSwitch: v, status }); }} style={{
            width: 44, height: 24, borderRadius: 99, border: 'none', cursor: 'pointer',
            background: autoSwitch ? C.saffron : 'rgba(255,255,255,0.1)',
            position: 'relative', transition: 'background 0.2s',
          }}>
            <span style={{
              position: 'absolute', top: 2, width: 20, height: 20,
              left: autoSwitch ? 22 : 2, background: '#fff', borderRadius: 99,
              transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
            }} />
          </button>
        </div>
      </div>
    </div>
  );
}
