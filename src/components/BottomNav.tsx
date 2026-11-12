import React from 'react';
import { useRekoMaro } from '../context/RekoMaroContext';
import { Gamepad2, Flame, Heart, Bell, Settings } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, unreadCount, preferences } = useRekoMaro();
  const isAr = preferences.language === 'ar';

  const tabs = [
    {
      id: 'catalog' as const,
      label: isAr ? 'الألعاب' : 'Catalog',
      icon: Gamepad2,
    },
    {
      id: 'deals' as const,
      label: isAr ? 'العروض' : 'Deals',
      icon: Flame,
    },
    {
      id: 'watchlist' as const,
      label: isAr ? 'المتابعة' : 'Watchlist',
      icon: Heart,
    },
    {
      id: 'notifications' as const,
      label: isAr ? 'التنبيهات' : 'Alerts',
      icon: Bell,
      badge: unreadCount,
    },
    {
      id: 'settings' as const,
      label: isAr ? 'الإعدادات' : 'Settings',
      icon: Settings,
    },
  ];

  return (
    <nav className="fixed md:hidden bottom-0 left-0 right-0 z-40 bg-[#121212]/95 backdrop-blur-lg border-t border-[#242424] px-2 py-1 safe-area-bottom">
      <div className="grid grid-cols-5 items-center justify-items-center h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="group flex flex-col items-center justify-center w-full h-full min-h-[44px] min-w-[44px] relative focus:outline-none transition-colors"
            >
              <div
                className={`relative px-4 py-1 rounded-full transition-all duration-200 ${
                  isActive ? 'bg-[#FFAB00]/15 text-[#FFAB00]' : 'text-gray-400 group-hover:text-gray-200'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {tab.badge && tab.badge > 0 ? (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF3B30] text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {tab.badge}
                  </span>
                ) : null}
              </div>
              <span
                className={`text-[10px] font-thmanyah font-medium tracking-tight mt-0.5 ${
                  isActive ? 'text-[#FFAB00] font-bold' : 'text-gray-400'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
