import { useState, useEffect } from 'react';
import OnboardingScreen from './screens/OnboardingScreen';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import BrowseScreen from './screens/BrowseScreen';
import SubscriptionScreen from './screens/SubscriptionScreen';
import OrdersScreen from './screens/OrdersScreen';
import ProfileScreen from './screens/ProfileScreen';
import AISuggestScreen from './screens/AISuggestScreen';
import BottomNav from './components/layout/BottomNav';
import { C, F } from './tokens';
import { users, auth } from './api/client';
import { setRefreshFn, onUnauthorized } from './api/client';
import { restoreToken, storeSession, clearSession, getStoredRefresh } from './store/auth';

export default function App() {
  // 'loading' | 'unauthenticated' | 'authenticated'
  const [authStatus, setAuthStatus]     = useState('loading');
  const [user, setUser]                 = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeTab, setActiveTab]       = useState('home');
  const [activeAlert, setActiveAlert]   = useState(null);
  const [modalScreen, setModalScreen]   = useState(null);

  useEffect(() => {
    // Wire token refresh into the API client
    setRefreshFn(async () => {
      const rt = getStoredRefresh();
      if (!rt) return false;
      try {
        const res = await auth.refresh(rt);
        const { user: u, accessToken, refreshToken } = res.data;
        storeSession(u, accessToken, refreshToken);
        setUser(u);
        return true;
      } catch {
        return false;
      }
    });

    onUnauthorized(() => {
      clearSession();
      setUser(null);
      setAuthStatus('unauthenticated');
    });

    // Try to restore existing session
    const hasToken = restoreToken();
    if (!hasToken) { setAuthStatus('unauthenticated'); return; }

    users.me().then(res => {
      setUser(res.data);
      setAuthStatus('authenticated');
    }).catch(() => {
      clearSession();
      setAuthStatus('unauthenticated');
    });
  }, []);

  const handleLogin = (u) => {
    setUser(u);
    setAuthStatus('authenticated');
    setShowOnboarding(false);
  };

  const handleSignup = (u) => {
    setUser(u);
    setAuthStatus('authenticated');
    setShowOnboarding(true); // show preferences setup
  };

  const handleOnboardingComplete = async (prefs) => {
    try {
      const res = await users.updateMe({
        preferences: {
          cuisines:       prefs.cuisines,
          dietaryType:    prefs.dietary.toUpperCase(),
          dailyBudget:    prefs.budget,
          alertThreshold: prefs.threshold,
          autoSwitchPref: prefs.autoSwitch ? 'AI_AUTO_SWITCH' : 'ALWAYS_ASK',
        },
      });
      setUser(res.data);
    } catch (e) {
      console.error('Failed to save preferences:', e.message);
    }
    setShowOnboarding(false);
    setActiveTab('home');
  };

  const handleNavigate = (screen, data) => {
    if (screen === 'ai-suggest') {
      setActiveAlert(data ?? null);
      setModalScreen('ai-suggest');
    } else if (['home', 'browse', 'subscriptions', 'orders', 'profile'].includes(screen)) {
      setActiveTab(screen);
      setModalScreen(null);
    }
  };

  const handleSignOut = () => {
    const rt = getStoredRefresh();
    if (rt) auth.logout(rt).catch(() => {});
    clearSession();
    setUser(null);
    setAuthStatus('unauthenticated');
    setShowOnboarding(false);
  };

  // Loading splash
  if (authStatus === 'loading') {
    return (
      <div style={{ minHeight: '100dvh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: F.display, fontStyle: 'italic', fontSize: 36, fontWeight: 700, color: C.cream, opacity: 0.6 }}>
          Thali
        </span>
      </div>
    );
  }

  // Not authenticated
  if (authStatus === 'unauthenticated') {
    return (
      <div style={{ maxWidth: '480px', margin: '0 auto' }}>
        <LoginScreen onLogin={handleLogin} onSignup={handleSignup} />
      </div>
    );
  }

  // Authenticated but onboarding in progress
  if (showOnboarding) {
    return (
      <div style={{ maxWidth: '480px', margin: '0 auto' }}>
        <OnboardingScreen onComplete={handleOnboardingComplete} />
      </div>
    );
  }

  // Main app
  return (
    <div className="relative min-h-screen bg-bg-primary flex flex-col" style={{ maxWidth: '480px', margin: '0 auto' }}>
      {/* AI Suggest Modal — full-screen overlay */}
      {modalScreen === 'ai-suggest' && (
        <div className="absolute inset-0 z-50 bg-bg-primary flex flex-col">
          <AISuggestScreen
            alert={activeAlert}
            onConfirm={() => { setModalScreen(null); setActiveTab('home'); }}
            onKeepOriginal={() => { setModalScreen(null); setActiveTab('home'); }}
          />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeTab === 'home'          && <HomeScreen onNavigate={handleNavigate} user={user} />}
        {activeTab === 'browse'        && <BrowseScreen />}
        {activeTab === 'subscriptions' && <SubscriptionScreen />}
        {activeTab === 'orders'        && <OrdersScreen />}
        {activeTab === 'profile'       && (
          <ProfileScreen
            user={user}
            onEditPreferences={() => setShowOnboarding(true)}
            onSignOut={handleSignOut}
          />
        )}
      </div>

      <BottomNav active={activeTab} onChange={(tab) => { setActiveTab(tab); setModalScreen(null); }} />
    </div>
  );
}
