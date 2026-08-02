import { C, F } from '../../tokens';

const ITEMS = [
  { id: 'home',          label: 'Home',    path: 'M3 10.5L12 4l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1v-9.5z M9 21V13h6v8' },
  { id: 'browse',        label: 'Browse',  path: 'M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z' },
  { id: 'subscriptions', label: 'Plans',   path: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M12 11v4M10 13h4' },
  { id: 'orders',        label: 'History', path: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
  { id: 'profile',       label: 'Profile', path: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z' },
];

export default function BottomNav({ active, onChange }) {
  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: 430,
      background: 'rgba(15,14,12,0.92)',
      backdropFilter: 'blur(20px)',
      borderTop: `1px solid ${C.border}`,
      display: 'flex', alignItems: 'center',
      padding: '8px 4px 20px',
      zIndex: 50,
    }}>
      {ITEMS.map(item => {
        const on = active === item.id;
        return (
          <button key={item.id} onClick={() => onChange(item.id)} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 4, background: 'none', border: 'none', cursor: 'pointer',
            padding: '6px 0', position: 'relative',
          }}>
            {on && (
              <span style={{
                position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)',
                width: 20, height: 2, background: C.saffron, borderRadius: 99,
              }} />
            )}
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none"
              stroke={on ? C.saffron : C.muted} strokeWidth={1.8}
              strokeLinecap="round" strokeLinejoin="round">
              {item.path.split('M').filter(Boolean).map((p, i) => (
                <path key={i} d={'M' + p} />
              ))}
            </svg>
            <span style={{
              fontFamily: F.body, fontSize: 10, fontWeight: on ? 600 : 400,
              color: on ? C.saffron : C.muted, letterSpacing: 0.3,
            }}>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
