import { useState } from 'react';
import { C, F } from '../tokens';

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <p style={{ fontFamily: F.body, fontSize: 11, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: C.muted, padding: '0 20px', marginBottom: 10, marginTop: 20 }}>
        {title}
      </p>
      <div style={{ background: C.card, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
        {children}
      </div>
    </div>
  );
}

function Row({ label, value, action, last }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 20px',
      borderBottom: last ? 'none' : `1px solid ${C.border}`,
    }}>
      <span style={{ fontFamily: F.body, fontSize: 14, color: C.cream }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {value && <span style={{ fontFamily: F.mono, fontSize: 13, color: C.muted }}>{value}</span>}
        {action}
      </div>
    </div>
  );
}

function Toggle({ value, onChange }) {
  return (
    <button onClick={onChange} style={{
      width: 40, height: 22, borderRadius: 99, border: 'none', cursor: 'pointer',
      background: value ? C.saffron : 'rgba(255,255,255,0.1)',
      position: 'relative', transition: 'background 0.2s', flexShrink: 0,
    }}>
      <span style={{
        position: 'absolute', top: 2, width: 18, height: 18,
        left: value ? 20 : 2, background: '#fff', borderRadius: 99,
        transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
      }} />
    </button>
  );
}

export default function ProfileScreen({ onEditPreferences }) {
  const [notifs, setNotifs] = useState({ Push: true, SMS: false, Email: true, WhatsApp: true });
  const [budget, setBudget] = useState(150);
  const [threshold, setThreshold] = useState(20);

  const linkStyle = { fontFamily: F.body, fontSize: 13, color: C.saffron, background: 'none', border: 'none', cursor: 'pointer' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', background: C.bg }}>
      <header style={{ padding: '56px 20px 20px', borderBottom: `1px solid ${C.border}` }}>
        <h1 style={{ fontFamily: F.display, fontStyle: 'italic', fontSize: 26, fontWeight: 700, color: C.cream }}>Profile</h1>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 88 }}>
        {/* Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '20px 20px 20px', borderBottom: `1px solid ${C.border}` }}>
          <div style={{
            width: 60, height: 60, borderRadius: '50%',
            background: 'rgba(232,121,58,0.12)', border: '1px solid rgba(232,121,58,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <span style={{ fontFamily: F.display, fontStyle: 'italic', fontWeight: 700, fontSize: 24, color: C.saffron }}>K</span>
          </div>
          <div>
            <p style={{ fontFamily: F.body, fontWeight: 600, fontSize: 17, color: C.cream, marginBottom: 2 }}>Karthick</p>
            <p style={{ fontFamily: F.body, fontSize: 13, color: C.muted }}>10220s.karthicksnmhss@gmail.com</p>
          </div>
        </div>

        <Section title="Payment">
          <Row label="Card" value="•••• 4242" action={<button style={linkStyle}>Change</button>} last />
        </Section>

        <Section title="Delivery">
          <Row
            label="Block 4, Sector 12, Anna Nagar"
            action={<button style={linkStyle}>Edit</button>}
            last
          />
        </Section>

        <Section title="Notifications">
          {['Push', 'SMS', 'Email', 'WhatsApp'].map((n, i, arr) => (
            <Row key={n} label={n}
              action={<Toggle value={notifs[n]} onChange={() => setNotifs(p => ({ ...p, [n]: !p[n] }))} />}
              last={i === arr.length - 1}
            />
          ))}
        </Section>

        <Section title="Preferences">
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontFamily: F.body, fontSize: 14, color: C.muted }}>Daily budget</span>
              <span style={{ fontFamily: F.mono, fontSize: 14, fontWeight: 600, color: C.saffron }}>₹{budget}</span>
            </div>
            <input type="range" min={80} max={400} step={10} value={budget} onChange={e => setBudget(Number(e.target.value))} />
          </div>
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontFamily: F.body, fontSize: 14, color: C.muted }}>Alert threshold</span>
              <span style={{ fontFamily: F.mono, fontSize: 14, fontWeight: 600, color: C.saffron }}>+{threshold}%</span>
            </div>
            <input type="range" min={5} max={50} step={5} value={threshold} onChange={e => setThreshold(Number(e.target.value))} />
          </div>
          <Row label="Edit all preferences" action={<button onClick={onEditPreferences} style={linkStyle}>→</button>} last />
        </Section>

        <div style={{ padding: '16px 20px' }}>
          <button style={{
            width: '100%', padding: '14px 0',
            fontFamily: F.body, fontSize: 15, color: C.danger,
            background: 'rgba(192,57,43,0.06)', border: '1px solid rgba(192,57,43,0.15)',
            borderRadius: 14, cursor: 'pointer',
          }}>Sign out</button>
        </div>
      </div>
    </div>
  );
}
