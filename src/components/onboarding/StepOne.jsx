import { C, F } from '../../tokens';

const CUISINES = ['Indian', 'South Indian', 'Chinese', 'Italian', 'Mediterranean'];

export default function StepOne({ data, onChange }) {
  const toggle = (c) => {
    const next = data.cuisines.includes(c)
      ? data.cuisines.filter(x => x !== c)
      : [...data.cuisines, c];
    onChange({ ...data, cuisines: next });
  };

  return (
    <div style={{ padding: '0 24px' }}>
      <p style={{ fontFamily: F.body, fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: C.saffron, marginBottom: 12 }}>
        Step 1 of 3
      </p>
      <h2 style={{ fontFamily: F.display, fontStyle: 'italic', fontSize: 32, fontWeight: 700, color: C.cream, lineHeight: 1.2, marginBottom: 8 }}>
        What do you love?
      </h2>
      <p style={{ fontFamily: F.body, fontSize: 14, color: C.muted, lineHeight: 1.6, marginBottom: 32 }}>
        Pick your favourite cuisines. We'll only suggest meals you'd actually enjoy.
      </p>

      <p style={{ fontFamily: F.body, fontSize: 11, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: C.muted, marginBottom: 12 }}>
        Cuisines
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 36 }}>
        {CUISINES.map(c => {
          const on = data.cuisines.includes(c);
          return (
            <button key={c} onClick={() => toggle(c)} style={{
              fontFamily: F.body, fontSize: 14, fontWeight: on ? 600 : 400,
              color: on ? C.saffron : C.muted,
              background: on ? 'rgba(232,121,58,0.12)' : 'transparent',
              border: `1px solid ${on ? C.saffron : C.border}`,
              borderRadius: 99, padding: '10px 18px',
              cursor: 'pointer', transition: 'all 0.15s',
            }}>{c}</button>
          );
        })}
      </div>

      <p style={{ fontFamily: F.body, fontSize: 11, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: C.muted, marginBottom: 12 }}>
        Dietary preference
      </p>
      <div style={{
        display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: 12,
        padding: 4, gap: 4,
      }}>
        {['Veg', 'Non-Veg', 'Vegan'].map(d => {
          const val = d.toLowerCase().replace('-', '-');
          const on = data.dietary === d.toLowerCase() || (d === 'Non-Veg' && data.dietary === 'non-veg') || (d === 'Veg' && data.dietary === 'veg') || (d === 'Vegan' && data.dietary === 'vegan');
          return (
            <button key={d} onClick={() => onChange({ ...data, dietary: d === 'Non-Veg' ? 'non-veg' : d.toLowerCase() })} style={{
              flex: 1, fontFamily: F.body, fontSize: 14, fontWeight: on ? 600 : 400,
              color: on ? C.bg : C.muted,
              background: on ? C.saffron : 'transparent',
              border: 'none', borderRadius: 9, padding: '10px 0',
              cursor: 'pointer', transition: 'all 0.15s',
            }}>{d}</button>
          );
        })}
      </div>
    </div>
  );
}
