import { useState } from 'react';
import { C, F } from '../tokens';
import { alerts as alertsApi } from '../api/client';

function reasonPills(reasons) {
  if (!reasons) return [];
  return [
    { l: 'Budget ✓', ok: reasons.withinBudget },
    { l: 'Cuisine ✓', ok: reasons.matchesCuisine },
    { l: 'Dietary ✓', ok: reasons.matchesDietary },
    { l: 'Available ✓', ok: reasons.available },
  ];
}

export default function AISuggestScreen({ alert, onConfirm, onKeepOriginal }) {
  const [responding, setResponding] = useState(false);

  const suggestions = alert?.suggestions ?? [];
  const top = suggestions[0];

  const handleAiSwap = async () => {
    if (!alert || !top || responding) return;
    setResponding(true);
    try {
      await alertsApi.respond(alert.id, 'ai_swap');
      onConfirm?.();
    } catch (e) {
      console.error(e);
    } finally {
      setResponding(false);
    }
  };

  const handleKeep = async () => {
    if (!alert || responding) return;
    setResponding(true);
    try {
      await alertsApi.respond(alert.id, 'keep');
      onKeepOriginal?.();
    } catch (e) {
      console.error(e);
    } finally {
      setResponding(false);
    }
  };

  if (!alert) {
    return (
      <div style={{ minHeight: '100dvh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.muted, fontFamily: F.body }}>
        No active price alert
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', background: C.bg }}>
      <header style={{ padding: '56px 20px 20px', borderBottom: `1px solid ${C.border}` }}>
        <p style={{ fontFamily: F.body, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: C.saffron, marginBottom: 10 }}>
          Price Alert · {alert.reason}
        </p>
        <h1 style={{ fontFamily: F.display, fontStyle: 'italic', fontSize: 28, fontWeight: 700, color: C.cream, lineHeight: 1.2 }}>
          Here's what we'd swap it with
        </h1>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px 140px' }}>
        {suggestions.length === 0 ? (
          <div style={{ textAlign: 'center', color: C.muted, fontFamily: F.body, fontSize: 14, paddingTop: 40 }}>
            Generating suggestions…
          </div>
        ) : (
          suggestions.map((meal, i) => (
            <div key={meal.mealId} style={{ position: 'relative', marginBottom: 16 }}>
              <span style={{
                position: 'absolute', right: -4, top: -16,
                fontFamily: F.mono, fontWeight: 700, fontSize: 80, lineHeight: 1,
                color: 'rgba(255,255,255,0.04)', pointerEvents: 'none', userSelect: 'none', zIndex: 0,
              }}>{meal.rank}</span>

              <div style={{
                position: 'relative', zIndex: 1,
                background: C.card, border: `1px solid ${i === 0 ? 'rgba(232,121,58,0.3)' : C.border}`,
                borderRadius: 16, overflow: 'hidden',
              }}>
                {i === 0 && <div style={{ height: 2, background: C.saffron }} />}
                <div style={{ padding: '16px 16px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        fontFamily: F.mono, fontSize: 11, fontWeight: 700,
                        color: i === 0 ? C.saffron : C.muted,
                        background: i === 0 ? 'rgba(232,121,58,0.12)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${i === 0 ? 'rgba(232,121,58,0.3)' : C.border}`,
                        borderRadius: 99, padding: '3px 9px',
                      }}>#{meal.rank}</span>
                      {i === 0 && <span style={{ fontFamily: F.body, fontSize: 12, color: C.saffron, fontWeight: 600 }}>Best match</span>}
                    </div>
                    <span style={{ fontFamily: F.mono, fontSize: 13, fontWeight: 700, color: C.saffron }}>{meal.matchScore}%</span>
                  </div>

                  <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 14 }}>
                    <div style={{
                      width: 56, height: 56, borderRadius: 12, flexShrink: 0,
                      background: (meal.color ?? '#888') + '20',
                      border: `1px solid ${(meal.color ?? '#888')}33`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span style={{ fontFamily: F.display, fontStyle: 'italic', fontWeight: 700, fontSize: 28, color: (meal.color ?? '#888') + 'BB' }}>
                        {meal.mealName[0]}
                      </span>
                    </div>
                    <div>
                      <p style={{ fontFamily: F.display, fontStyle: 'italic', fontSize: 18, fontWeight: 600, color: C.cream, marginBottom: 2 }}>{meal.mealName}</p>
                      <p style={{ fontFamily: F.body, fontSize: 12, color: C.muted, marginBottom: 4 }}>{meal.cuisine}</p>
                      <span style={{ fontFamily: F.mono, fontSize: 16, fontWeight: 700, color: C.cream }}>₹{meal.price}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {reasonPills(meal.reasons).map(r => (
                      <span key={r.l} style={{
                        fontFamily: F.body, fontSize: 12, fontWeight: 500,
                        color: r.ok ? C.mint : C.muted,
                        background: r.ok ? 'rgba(46,204,143,0.1)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${r.ok ? 'rgba(46,204,143,0.3)' : C.border}`,
                        borderRadius: 99, padding: '4px 10px',
                        textDecoration: r.ok ? 'none' : 'line-through',
                      }}>{r.l}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 430,
        background: 'rgba(15,14,12,0.95)', backdropFilter: 'blur(16px)',
        borderTop: `1px solid ${C.border}`,
        padding: '14px 20px 32px', display: 'flex', flexDirection: 'column', gap: 10, zIndex: 50,
      }}>
        <button
          onClick={handleAiSwap}
          disabled={!top || responding}
          style={{
            width: '100%', padding: '15px 0',
            fontFamily: F.body, fontSize: 15, fontWeight: 700,
            background: C.saffron, color: C.bg, border: 'none',
            borderRadius: 14, cursor: top ? 'pointer' : 'not-allowed',
            opacity: responding ? 0.7 : 1,
            boxShadow: '0 4px 24px rgba(232,121,58,0.3)',
          }}>
          {responding ? 'Confirming…' : `Confirm Swap — ${top?.mealName ?? '…'}`}
        </button>
        <button
          onClick={handleKeep}
          disabled={responding}
          style={{
            width: '100%', padding: '13px 0',
            fontFamily: F.body, fontSize: 14, fontWeight: 500,
            color: C.muted, background: 'rgba(255,255,255,0.05)',
            border: `1px solid ${C.border}`, borderRadius: 14, cursor: 'pointer',
            opacity: responding ? 0.7 : 1,
          }}>
          Keep original · ₹{alert.newPrice}
        </button>
      </div>
    </div>
  );
}
