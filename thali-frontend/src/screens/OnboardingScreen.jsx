import { useState } from 'react';
import { C, F } from '../tokens';
import StepOne from '../components/onboarding/StepOne';
import StepTwo from '../components/onboarding/StepTwo';
import StepThree from '../components/onboarding/StepThree';

export default function OnboardingScreen({ onComplete }) {
  const [step, setStep]     = useState(1);
  const [loading, setLoading] = useState(false);
  const [data, setData]     = useState({
    cuisines:   ['Indian', 'South Indian'],
    dietary:    'veg',
    budget:     150,
    threshold:  20,
    autoSwitch: true,
  });

  const canContinue = step === 1 ? data.cuisines.length > 0 : true;
  const isLast = step === 3;

  const handleCta = async () => {
    if (!canContinue || loading) return;
    if (!isLast) { setStep(s => s + 1); return; }
    setLoading(true);
    try {
      await onComplete(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100dvh', background: C.bg,
      display: 'flex', flexDirection: 'column',
      paddingTop: 60, paddingBottom: 32,
    }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 48 }}>
        {[1, 2, 3].map(n => (
          <div key={n} style={{
            height: 4, borderRadius: 99,
            width: n === step ? 24 : 6,
            background: n <= step ? C.saffron : C.border,
            transition: 'all 0.3s',
          }} />
        ))}
      </div>

      <div style={{ flex: 1 }}>
        {step === 1 && <StepOne data={data} onChange={setData} />}
        {step === 2 && <StepTwo data={data} onChange={setData} />}
        {step === 3 && <StepThree data={data} onChange={setData} />}
      </div>

      <div style={{ padding: '24px 24px 0' }}>
        <button
          onClick={handleCta}
          disabled={!canContinue || loading}
          style={{
            width: '100%', padding: '16px 0',
            fontFamily: F.body, fontSize: 16, fontWeight: 600,
            color: canContinue ? C.bg : C.subtle,
            background: canContinue ? C.saffron : 'rgba(255,255,255,0.06)',
            border: 'none', borderRadius: 14,
            cursor: (canContinue && !loading) ? 'pointer' : 'not-allowed',
            boxShadow: canContinue ? '0 4px 24px rgba(232,121,58,0.3)' : 'none',
            opacity: loading ? 0.7 : 1,
            transition: 'all 0.2s',
          }}
        >
          {loading ? 'Saving…' : isLast ? 'Start my plan' : 'Continue'}
        </button>
        {step > 1 && !loading && (
          <button onClick={() => setStep(s => s - 1)} style={{
            width: '100%', marginTop: 12, padding: '12px 0',
            fontFamily: F.body, fontSize: 14, color: C.muted,
            background: 'none', border: 'none', cursor: 'pointer',
          }}>← Back</button>
        )}
      </div>
    </div>
  );
}
