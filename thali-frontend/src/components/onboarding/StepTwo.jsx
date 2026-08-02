import { C, F } from '../../tokens';

function SliderRow({ label, value, display, min, max, step, onChange, hint }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
        <span style={{ fontFamily: F.body, fontSize: 14, color: C.muted }}>{label}</span>
        <span style={{ fontFamily: F.mono, fontSize: 20, fontWeight: 600, color: C.cream }}>{display}</span>
      </div>
      {hint && <p style={{ fontFamily: F.body, fontSize: 12, color: C.subtle, marginBottom: 10 }}>{hint}</p>}
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))} />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
        <span style={{ fontFamily: F.mono, fontSize: 11, color: C.subtle }}>{min === 80 ? `₹${min}` : `${min}%`}</span>
        <span style={{ fontFamily: F.mono, fontSize: 11, color: C.subtle }}>{min === 80 ? `₹${max}` : `${max}%`}</span>
      </div>
    </div>
  );
}

export default function StepTwo({ data, onChange }) {
  return (
    <div style={{ padding: '0 24px' }}>
      <p style={{ fontFamily: F.body, fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: C.saffron, marginBottom: 12 }}>
        Step 2 of 3
      </p>
      <h2 style={{ fontFamily: F.display, fontStyle: 'italic', fontSize: 32, fontWeight: 700, color: C.cream, lineHeight: 1.2, marginBottom: 8 }}>
        Set your limits
      </h2>
      <p style={{ fontFamily: F.body, fontSize: 14, color: C.muted, lineHeight: 1.6, marginBottom: 36 }}>
        We'll alert you when prices cross these thresholds.
      </p>

      <SliderRow
        label="Daily budget"
        display={`₹${data.budget}`}
        value={data.budget} min={80} max={400} step={10}
        onChange={v => onChange({ ...data, budget: v })}
      />
      <SliderRow
        label="Alert if price rises more than"
        display={`${data.threshold}%`}
        value={data.threshold} min={5} max={50} step={5}
        hint="We'll pause and notify you. No meal is ordered without your say."
        onChange={v => onChange({ ...data, threshold: v })}
      />

      {/* Live example */}
      <div style={{
        background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`,
        borderRadius: 12, padding: 16, marginTop: 4,
      }}>
        <p style={{ fontFamily: F.body, fontSize: 11, color: C.subtle, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1.2 }}>
          Example
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: F.mono, fontSize: 16, color: C.muted }}>₹{data.budget}</span>
          <span style={{ color: C.saffron, fontSize: 18 }}>→</span>
          <span style={{ fontFamily: F.mono, fontSize: 16, color: C.danger }}>₹{Math.round(data.budget * (1 + data.threshold / 100))}</span>
          <span style={{ fontFamily: F.body, fontSize: 12, color: C.subtle }}> triggers alert</span>
        </div>
      </div>
    </div>
  );
}
