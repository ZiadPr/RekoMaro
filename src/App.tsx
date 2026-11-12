import React from 'react';
import { RekoMaroProvider, useRekoMaro } from './context/RekoMaroContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { AndroidFrame } from './components/AndroidFrame';
import { CatalogView } from './components/CatalogView';
import { WatchlistView } from './components/WatchlistView';
import { DealsView } from './components/DealsView';
import { NotificationsView } from './components/NotificationsView';
import { SettingsView } from './components/SettingsView';
import { GameDetailModal } from './components/GameDetailModal';
import { ShieldCheck, Flame, Heart, Bell } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { activeTab, selectedGame, setSelectedGame, preferences } = useRekoMaro();
  const isAr = preferences.language === 'ar';

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'catalog':
        return <CatalogView />;
      case 'watchlist':
        return <WatchlistView />;
      case 'deals':
        return <DealsView />;
      case 'notifications':
        return <NotificationsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <CatalogView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col justify-between selection:bg-[#FFAB00] selection:text-black">
      {/* Header */}
      <Header />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-12">
        {renderActiveTabContent()}
      </main>

      {/* Detail Modal Overlay */}
      {selectedGame && (
        <GameDetailModal game={selectedGame} onClose={() => setSelectedGame(null)} />
      )}

      {/* Bottom Navigation for Mobile & Android Touch */}
      <BottomNav />

      {/* Quiet Footer */}
      <footer className="border-t border-[#1C1C1C] bg-[#080808] py-8 text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-rockstar text-[#FFAB00] text-lg font-bold tracking-wider">
              REKOMARO
            </span>
            <span>·</span>
            <span className="font-thmanyah">{isAr ? 'رادار أسعار وتخفيضات ألعاب الفيديو العالمية' : 'Global Video Games Price & Deal Radar'}</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-gray-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00E676]" />
              <span>{isAr ? 'بيانات حقيقية 100% بدون قيم وهمية' : '100% Real Live Verified Data'}</span>
            </span>
            <span>·</span>
            <span>Steam · PS Store · Xbox · CheapShark</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <RekoMaroProvider>
      <AndroidFrameWrapper />
    </RekoMaroProvider>
  );
}

// Wrapper that connects AndroidFrame with preferences
const AndroidFrameWrapper: React.FC = () => {
  const { preferences } = useRekoMaro();

  if (preferences.deviceFrameMode) {
    return (
      <AndroidFrame>
        <MainAppContent />
      </AndroidFrame>
    );
  }

  return <MainAppContent />;
};
