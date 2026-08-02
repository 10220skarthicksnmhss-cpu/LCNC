import { useState, useEffect } from 'react';
import { C, F } from '../tokens';
import SubscriptionCard from '../components/subscription/SubscriptionCard';
import { subscriptions as subsApi } from '../api/client';

function CancelModal({ sub, onConfirm, onDismiss }) {
  return (
    <>
      <div onClick={onDismiss} className="fade-in" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', zIndex: 60 }} />
      <div className="slide-up" style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 430,
        background: '#161614', borderRadius: '20px 20px 0 0',
        border: `1px solid ${C.border}`, borderBottom: 'none',
        padding: '24px 24px 40px', zIndex: 61,
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%',
          background: 'rgba(192,57,43,0.1)', border: '1px solid rgba(192,57,43,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18,
        }}>
          <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={C.danger} strokeWidth={2}>
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6m4-6v6"/><path d="M9 6V4h6v2"/>
          </svg>
        </div>
        <h3 style={{ fontFamily: F.display, fontStyle: 'italic', fontSize: 24, color: C.cream, marginBottom: 8 }}>
          Cancel subscription?
        </h3>
        <p style={{ fontFamily: F.body, fontSize: 14, color: C.muted, marginBottom: 4 }}>
          <span style={{ color: C.cream, fontWeight: 500 }}>{sub?.meal}</span> won't be prepared.
        </p>
        <p style={{ fontFamily: F.body, fontSize: 14, color: C.danger, marginBottom: 28 }}>This can't be undone.</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <button onClick={onDismiss} style={{
            padding: '14px 0', fontFamily: F.body, fontSize: 15, fontWeight: 500,
            color: C.muted, background: 'rgba(255,255,255,0.05)',
            border: `1px solid ${C.border}`, borderRadius: 14, cursor: 'pointer',
          }}>Keep it</button>
          <button onClick={() => onConfirm(sub)} style={{
            padding: '14px 0', fontFamily: F.body, fontSize: 15, fontWeight: 700,
            color: '#fff', background: C.danger,
            border: 'none', borderRadius: 14, cursor: 'pointer',
          }}>Yes, cancel</button>
        </div>
      </div>
    </>
  );
}

export default function SubscriptionScreen() {
  const [subs, setSubs]               = useState([]);
  const [loading, setLoading]         = useState(true);
  const [cancelTarget, setCancelTarget] = useState(null);

  useEffect(() => {
    subsApi.list()
      .then(res => setSubs(res.data ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleUpdate = async (id, patch) => {
    try {
      const res = await subsApi.update(id, patch);
      setSubs(p => p.map(s => s.id === id ? { ...s, ...res.data } : s));
    } catch (e) { console.error(e); }
  };

  const handleCancel = async (sub) => {
    try {
      await subsApi.cancel(sub.id);
      setSubs(p => p.filter(s => s.id !== sub.id));
      setCancelTarget(null);
    } catch (e) { console.error(e); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', background: C.bg }}>
      <header style={{ padding: '56px 20px 16px', borderBottom: `1px solid ${C.border}` }}>
        <h1 style={{ fontFamily: F.display, fontStyle: 'italic', fontSize: 26, fontWeight: 700, color: C.cream, marginBottom: 4 }}>My Subscriptions</h1>
        <p style={{ fontFamily: F.body, fontSize: 13, color: C.muted }}>
          {subs.filter(s => s.status === 'active').length} active · {subs.filter(s => s.status === 'paused').length} paused
        </p>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 88px' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80, color: C.muted, fontFamily: F.body, fontSize: 14 }}>Loading…</div>
        ) : subs.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 80, color: C.muted }}>
            <p style={{ fontFamily: F.body, fontSize: 15 }}>No subscriptions yet</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {subs.map(s => (
              <SubscriptionCard key={s.id} sub={s}
                onUpdate={patch => handleUpdate(s.id, patch)}
                onCancel={setCancelTarget}
              />
            ))}
          </div>
        )}

        <button style={{
          width: '100%', marginTop: 12, padding: '16px 0',
          fontFamily: F.body, fontSize: 14, color: C.muted,
          background: 'transparent', border: `1px dashed ${C.border}`,
          borderRadius: 16, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth={2}>
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add a subscription
        </button>
      </div>

      {cancelTarget && (
        <CancelModal
          sub={cancelTarget}
          onConfirm={handleCancel}
          onDismiss={() => setCancelTarget(null)}
        />
      )}
    </div>
  );
}
