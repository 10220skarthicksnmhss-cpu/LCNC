import { useEffect } from 'react';
import { C, F } from '../../tokens';

export default function MealDrawer({ meal, onClose, onAdd }) {
  useEffect(() => {
    const fn = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [onClose]);

  if (!meal) return null;

  return (
    <>
      <div onClick={onClose} className="fade-in" style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(6px)', zIndex: 60,
      }} />
      <div className="slide-up" style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 430,
        background: '#161614', borderRadius: '20px 20px 0 0',
        border: `1px solid ${C.border}`, borderBottom: 'none',
        maxHeight: '88dvh', display: 'flex', flexDirection: 'column',
        zIndex: 61,
      }}>
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12, paddingBottom: 4 }}>
          <div style={{ width: 36, height: 4, borderRadius: 99, background: C.border }} />
        </div>

        <div style={{ overflowY: 'auto', flex: 1 }}>
          {/* Hero */}
          <div style={{
            margin: '8px 16px 16px', borderRadius: 14,
            height: 180, background: meal.color + '18',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', border: `1px solid ${C.border}`,
          }}>
            <span style={{
              fontFamily: F.display, fontStyle: 'italic', fontWeight: 700,
              fontSize: 96, color: meal.color + 'AA', lineHeight: 1,
            }}>{meal.name[0]}</span>
            <button onClick={onClose} style={{
              position: 'absolute', top: 12, right: 12,
              width: 32, height: 32, borderRadius: '50%',
              background: 'rgba(0,0,0,0.5)', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.muted,
            }}>
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <div style={{ padding: '0 20px 20px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
              <h2 style={{ fontFamily: F.display, fontStyle: 'italic', fontSize: 26, fontWeight: 700, color: C.cream, flex: 1, marginRight: 12 }}>
                {meal.name}
              </h2>
              <span style={{ fontFamily: F.mono, fontSize: 24, fontWeight: 700, color: C.cream, flexShrink: 0 }}>₹{meal.price}</span>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 24 }}>
              <span style={{ fontFamily: F.body, fontSize: 12, color: C.muted }}>{meal.cuisine}</span>
              <span style={{ color: C.border }}>·</span>
              <span style={{
                fontFamily: F.body, fontSize: 11, fontWeight: 600,
                color: meal.type === 'veg' ? C.mint : C.saffron,
                background: meal.type === 'veg' ? 'rgba(46,204,143,0.12)' : 'rgba(232,121,58,0.12)',
                padding: '2px 8px', borderRadius: 99,
              }}>{meal.type}</span>
              <span style={{ color: C.border }}>·</span>
              <span style={{ fontFamily: F.body, fontSize: 12, color: C.muted }}>{meal.deliveryTime}</span>
            </div>

            {/* Ingredients */}
            <p style={{ fontFamily: F.body, fontSize: 11, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: C.muted, marginBottom: 14 }}>
              Ingredient breakdown
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {meal.ingredients.map(ing => (
                <div key={ing.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontFamily: F.body, fontSize: 14, color: C.cream }}>{ing.name}</span>
                    <span style={{ fontFamily: F.mono, fontSize: 12, color: C.muted }}>{ing.pct}%</span>
                  </div>
                  <div style={{ height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 99,
                      width: `${ing.pct}%`, background: C.saffron,
                      opacity: 0.55 + (ing.pct / 100) * 0.45,
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={{ padding: '14px 20px 32px', borderTop: `1px solid ${C.border}` }}>
          <button onClick={() => { onAdd?.(meal); onClose(); }} style={{
            width: '100%', padding: '15px 0',
            fontFamily: F.body, fontSize: 15, fontWeight: 700,
            background: C.saffron, color: C.bg,
            border: 'none', borderRadius: 14, cursor: 'pointer',
            boxShadow: '0 4px 24px rgba(232,121,58,0.3)',
          }}>
            Add to Subscription — ₹{meal.price}/day
          </button>
        </div>
      </div>
    </>
  );
}
