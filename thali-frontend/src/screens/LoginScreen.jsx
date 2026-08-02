import { useState } from 'react';
import { C, F } from '../tokens';
import { auth } from '../api/client';
import { storeSession } from '../store/auth';

export default function LoginScreen({ onLogin, onSignup }) {
  const [mode, setMode]         = useState('login'); // 'login' | 'signup'
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);

  const handleSubmit = async () => {
    if (!email || !password) return;
    setLoading(true);
    setError(null);
    try {
      let res;
      if (mode === 'login') {
        res = await auth.login(email, password);
      } else {
        if (!name.trim()) { setError('Name is required'); setLoading(false); return; }
        res = await auth.register({ name: name.trim(), email, password });
      }
      const { user, accessToken, refreshToken } = res.data;
      storeSession(user, accessToken, refreshToken);
      if (mode === 'login') onLogin(user);
      else onSignup(user);
    } catch (e) {
      setError(e.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '14px 16px',
    background: 'rgba(255,255,255,0.05)',
    border: `1px solid ${C.border}`, borderRadius: 12,
    fontFamily: F.body, fontSize: 15, color: C.cream, outline: 'none',
    boxSizing: 'border-box',
  };

  return (
    <div style={{
      minHeight: '100dvh', background: C.bg,
      display: 'flex', flexDirection: 'column',
      justifyContent: 'center', padding: '40px 28px',
    }}>
      {/* Wordmark */}
      <div style={{ marginBottom: 48, textAlign: 'center' }}>
        <span style={{ fontFamily: F.display, fontStyle: 'italic', fontSize: 42, fontWeight: 700, color: C.cream, letterSpacing: -1 }}>
          Thali
        </span>
        <p style={{ fontFamily: F.body, fontSize: 14, color: C.muted, marginTop: 6 }}>
          Your AI-powered meal companion
        </p>
      </div>

      {/* Toggle */}
      <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: 4, marginBottom: 28 }}>
        {['login', 'signup'].map(m => (
          <button key={m} onClick={() => { setMode(m); setError(null); }} style={{
            flex: 1, padding: '10px 0',
            fontFamily: F.body, fontSize: 14, fontWeight: 600,
            color: mode === m ? C.bg : C.muted,
            background: mode === m ? C.cream : 'transparent',
            border: 'none', borderRadius: 7, cursor: 'pointer', transition: 'all 0.15s',
          }}>
            {m === 'login' ? 'Sign in' : 'Create account'}
          </button>
        ))}
      </div>

      {/* Form */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {mode === 'signup' && (
          <input
            type="text" placeholder="Full name" value={name}
            onChange={e => setName(e.target.value)} style={inputStyle}
          />
        )}
        <input
          type="email" placeholder="Email address" value={email}
          onChange={e => setEmail(e.target.value)} style={inputStyle}
        />
        <input
          type="password" placeholder="Password" value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          style={inputStyle}
        />
      </div>

      {error && (
        <p style={{ fontFamily: F.body, fontSize: 13, color: C.danger, marginTop: 12 }}>{error}</p>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading || !email || !password}
        style={{
          marginTop: 24, width: '100%', padding: '16px 0',
          fontFamily: F.body, fontSize: 16, fontWeight: 700,
          color: C.bg, background: C.saffron,
          border: 'none', borderRadius: 14,
          cursor: loading ? 'wait' : 'pointer',
          opacity: loading ? 0.7 : 1,
          boxShadow: '0 4px 24px rgba(232,121,58,0.3)',
          transition: 'opacity 0.15s',
        }}
      >
        {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
      </button>

      {mode === 'signup' && (
        <p style={{ fontFamily: F.body, fontSize: 12, color: C.muted, textAlign: 'center', marginTop: 20, lineHeight: 1.6 }}>
          After signing up, you''ll set your meal preferences.
        </p>
      )}
    </div>
  );
}
