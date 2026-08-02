import { C, F } from '../../tokens';

export default function StepThree({ data, onChange }) {
  const on = data.autoSwitch;
  return (
    <div style={{ padding: '0 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
      <p style={{ fontFamily: F.body, fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: C.saffron, marginBottom: 12 }}>
        Step 3 of 3
      </p>
      <h2 style={{ fontFamily: F.display, fontStyle: 'italic', fontSize: 32, fontWeight: 700, color: C.cream, lineHeight: 1.2, marginBottom: 12 }}>
        Let AI handle it?
      </h2>
      <p style={{ fontFamily: F.body, fontSize: 14, color: C.muted, lineHeight: 1.7, marginBottom: 40, maxWidth: 300 }}>
        When a price spike hits, we alert you. No reply in 2 hours? AI picks the best alternative automatically.
      </p>

      {/* Toggle */}
      <button onClick={() => onChange({ ...data, autoSwitch: !on })} style={{
        width: 72, height: 36, borderRadius: 99, border: 'none', cursor: 'pointer',
        background: on ? C.saffron : 'rgba(255,255,255,0.1)',
        position: 'relative', transition: 'background 0.25s',
        boxShadow: on ? `0 0 24px rgba(232,121,58,0.35)` : 'none',
        marginBottom: 16,
      }}>
        <span style={{
          position: 'absolute', top: 3, width: 30, height: 30,
          left: on ? 39 : 3, background: '#fff', borderRadius: 99,
          transition: 'left 0.25s', boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
        }} />
      </button>

      <p style={{ fontFamily: F.body, fontSize: 16, fontWeight: 600, color: on ? C.saffron : C.muted, marginBottom: 32, transition: 'color 0.2s' }}>
        {on ? 'Auto-switch ON' : 'Auto-switch OFF'}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, width: '100%' }}>
        {[
          { icon: '✓', label: 'Meals always confirmed. No missed lunches.', color: C.mint, active: on },
          { icon: '↩', label: 'You stay in full control of every order.', color: C.saffron, active: !on },
        ].map((item, i) => (
          <div key={i} style={{
            background: item.active ? `rgba(${i === 0 ? '46,204,143' : '232,121,58'},0.07)` : 'rgba(255,255,255,0.03)',
            border: `1px solid ${item.active ? `rgba(${i === 0 ? '46,204,143' : '232,121,58'},0.25)` : C.border}`,
            borderRadius: 12, padding: 16, textAlign: 'left',
            opacity: item.active ? 1 : 0.5, transition: 'all 0.2s',
          }}>
            <div style={{ fontSize: 20, marginBottom: 8, color: item.color }}>{item.icon}</div>
            <p style={{ fontFamily: F.body, fontSize: 13, color: C.muted, lineHeight: 1.5 }}>{item.label}</p>
          </div>
        ))}
      </div>

      <p style={{ fontFamily: F.body, fontSize: 12, color: C.subtle, marginTop: 24 }}>
        Change this anytime in Settings or per meal.
      </p>
    </div>
  );
}
