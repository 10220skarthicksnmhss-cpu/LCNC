import { useState } from 'react';
import OnboardingScreen from './screens/OnboardingScreen';
import HomeScreen from './screens/HomeScreen';
import BrowseScreen from './screens/BrowseScreen';
import SubscriptionScreen from './screens/SubscriptionScreen';
import OrdersScreen from './screens/OrdersScreen';
import ProfileScreen from './screens/ProfileScreen';
import AISuggestScreen from './screens/AISuggestScreen';
import BottomNav from './components/layout/BottomNav';

export default function App() {
  const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem('onboarding_done'));
  const [activeTab, setActiveTab] = useState('home');
  const [modalScreen, setModalScreen] = useState(null); // 'ai-suggest' | null

  const handleOnboardingComplete = () => {
    localStorage.setItem('onboarding_done', '1');
    setShowOnboarding(false);
    setActiveTab('home');
  };

  const handleNavigate = (screen) => {
    if (screen === 'ai-suggest') {
      setModalScreen('ai-suggest');
    } else if (['home', 'browse', 'subscriptions', 'orders', 'profile'].includes(screen)) {
      setActiveTab(screen);
      setModalScreen(null);
    }
  };

  if (showOnboarding) {
    return (
      <div className="min-h-screen bg-bg-primary" style={{ maxWidth: '480px', margin: '0 auto' }}>
        <OnboardingScreen onComplete={handleOnboardingComplete} />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-bg-primary flex flex-col" style={{ maxWidth: '480px', margin: '0 auto' }}>
      {/* AI Suggest Modal — full-screen overlay */}
      {modalScreen === 'ai-suggest' && (
        <div className="absolute inset-0 z-50 bg-bg-primary flex flex-col">
          <AISuggestScreen
            onConfirm={() => {
              setModalScreen(null);
              setActiveTab('home');
            }}
            onKeepOriginal={() => {
              setModalScreen(null);
              setActiveTab('home');
            }}
          />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeTab === 'home' && (
          <HomeScreen onNavigate={handleNavigate} />
        )}
        {activeTab === 'browse' && <BrowseScreen />}
        {activeTab === 'subscriptions' && <SubscriptionScreen />}
        {activeTab === 'orders' && <OrdersScreen />}
        {activeTab === 'profile' && (
          <ProfileScreen onEditPreferences={() => setShowOnboarding(true)} />
        )}
      </div>

      {/* Bottom navigation */}
      <BottomNav active={activeTab} onChange={(tab) => { setActiveTab(tab); setModalScreen(null); }} />
    </div>
  );
}
