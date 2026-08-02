import { C, F } from '../../tokens';

const TYPE_DOT = { veg: C.mint, 'non-veg': C.saffron, vegan: '#a78bfa' };

export default function MealCard({ meal, onClick, compact = false }) {
  return (
    <button onClick={() => onClick?.(meal)} style={{
      background: C.card, border: `1px solid ${C.border}`,
      borderRadius: 16, overflow: 'hidden', cursor: 'pointer',
      display: 'flex', flexDirection: 'column',
      textAlign: 'left', width: compact ? 180 : '100%',
      flexShrink: compact ? 0 : undefined,
      transition: 'border-color 0.15s',
    }}>
      {/* Image area */}
      <div style={{
        height: compact ? 110 : 130,
        background: meal.color + '18',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', borderBottom: `1px solid ${C.border}`,
      }}>
        <span style={{
          fontFamily: F.display, fontStyle: 'italic', fontWeight: 700,
          fontSize: compact ? 52 : 64, color: meal.color + 'BB',
          userSelect: 'none', lineHeight: 1,
        }}>{meal.name[0]}</span>

        {/* Type dot */}
        <span style={{
          position: 'absolute', top: 10, right: 10,
          width: 8, height: 8, borderRadius: '50%',
          background: TYPE_DOT[meal.type] || C.muted,
          boxShadow: `0 0 6px ${TYPE_DOT[meal.type] || C.muted}`,
        }} />
      </div>

      {/* Info */}
      <div style={{ padding: compact ? '10px 12px 12px' : '12px 14px 14px', flex: 1 }}>
        <p style={{
          fontFamily: F.display, fontStyle: 'italic', fontWeight: 600,
          fontSize: compact ? 14 : 16, color: C.cream, lineHeight: 1.25,
          marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{meal.name}</p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{
            fontFamily: F.body, fontSize: 11, color: C.muted,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{meal.cuisine}</span>
          <span style={{ fontFamily: F.mono, fontSize: 13, fontWeight: 600, color: C.cream, flexShrink: 0, marginLeft: 4 }}>
            ₹{meal.price}
          </span>
        </div>

        {!compact && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
            <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth={2}>
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            <span style={{ fontFamily: F.body, fontSize: 11, color: C.muted }}>{meal.deliveryTime}</span>
          </div>
        )}
      </div>
    </button>
  );
}
