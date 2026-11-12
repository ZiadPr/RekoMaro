import React from 'react';
import { useRekoMaro } from '../context/RekoMaroContext';
import { CURRENCIES } from '../data/currencies';
import { CurrencyCode } from '../types/game';
import { Bell, RefreshCw, Globe, Sparkles } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    unreadCount,
    preferences,
    updatePreferences,
    refreshing,
    refreshCatalog,
    lastAutomatedSync,
    isAutoSyncActive,
  } = useRekoMaro();

  const isAr = preferences.language === 'ar';

  return (
    <header className="sticky top-0 z-40 bg-[#0A0A0A]/95 backdrop-blur-md border-b border-[#1E1E1E]">
      {/* Sizing & directional alignment container (targeted element) */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-17 flex items-center justify-between gap-2 sm:gap-4">
        {/* Zone 1: Wordmark Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('catalog')}
            className="flex items-center gap-2.5 group text-start focus:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FFAB00] to-[#E69500] text-black font-black flex items-center justify-center font-rockstar text-xl shadow-lg shadow-[#FFAB00]/25 group-hover:scale-105 transition-transform shrink-0">
              R
            </div>
            <div className="flex flex-col">
              <span className="font-rockstar text-2xl sm:text-2xl tracking-wider text-[#FFAB00] leading-tight">
                REKOMARO
              </span>
              <span className="text-[10px] text-gray-400 font-thmanyah font-medium tracking-tight truncate max-w-[170px] sm:max-w-none">
                {isAr ? 'رادار أسعار وتخفيضات الألعاب العالمية' : 'Global Games Deal Radar'}
              </span>
            </div>
          </button>

          {/* Automated live sync indicator */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#141414] border border-[#252525] text-[11px] text-gray-400">
            <span className="w-2 h-2 rounded-full bg-[#00E676] animate-pulse" />
            <span className="text-gray-300 font-medium">
              {isAr ? 'جلب تلقائي نشط' : 'Live Auto-Sync'}
            </span>
            <span className="text-gray-600">·</span>
            <span className="font-num text-gray-400 text-[10px]">{lastAutomatedSync}</span>
          </div>
        </div>

        {/* Zone 2: Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-1.5">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'catalog'
                ? 'bg-[#1C1C1C] text-[#FFAB00] border border-[#2A2A2A]'
                : 'text-gray-400 hover:text-white hover:bg-[#141414]'
            }`}
          >
            {isAr ? 'كل الألعاب' : 'All Games'}
          </button>

          <button
            onClick={() => setActiveTab('deals')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors whitespace-nowrap shrink-0 flex items-center gap-1 ${
              activeTab === 'deals'
                ? 'bg-[#1C1C1C] text-[#FFAB00] border border-[#2A2A2A]'
                : 'text-gray-400 hover:text-white hover:bg-[#141414]'
            }`}
          >
            <Sparkles className="w-3 h-3 text-[#00E676]" />
            <span>{isAr ? 'أقوى التخفيضات' : 'Top Deals'}</span>
          </button>

          <button
            onClick={() => setActiveTab('watchlist')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'watchlist'
                ? 'bg-[#1C1C1C] text-[#FFAB00] border border-[#2A2A2A]'
                : 'text-gray-400 hover:text-white hover:bg-[#141414]'
            }`}
          >
            {isAr ? 'قائمة المتابعة' : 'Watchlist'}
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`relative px-3 py-1.5 text-xs font-bold rounded-xl transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'notifications'
                ? 'bg-[#1C1C1C] text-[#FFAB00] border border-[#2A2A2A]'
                : 'text-gray-400 hover:text-white hover:bg-[#141414]'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>{isAr ? 'الإشعارات' : 'Alerts'}</span>
            {unreadCount > 0 && (
              <span className="w-4 h-4 bg-[#FF3B30] text-white text-[10px] font-bold rounded-full flex items-center justify-center font-num">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'settings'
                ? 'bg-[#1C1C1C] text-[#FFAB00] border border-[#2A2A2A]'
                : 'text-gray-400 hover:text-white hover:bg-[#141414]'
            }`}
          >
            {isAr ? 'الإعدادات' : 'Settings'}
          </button>
        </nav>

        {/* Zone 3: Utility Controls, Currency Switcher & Frame Simulator */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Currency selector */}
          <div className="relative">
            <select
              value={preferences.currency}
              onChange={(e) => updatePreferences({ currency: e.target.value as CurrencyCode })}
              className="bg-[#151515] hover:bg-[#1E1E1E] text-xs font-bold text-gray-200 border border-[#2A2A2A] rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-[#FFAB00] cursor-pointer"
            >
              {Object.keys(CURRENCIES).map((cur) => (
                <option key={cur} value={cur}>
                  {cur} ({isAr ? CURRENCIES[cur as CurrencyCode].symbolAr : CURRENCIES[cur as CurrencyCode].symbol})
                </option>
              ))}
            </select>
          </div>

          {/* Language Switch */}
          <button
            onClick={() => updatePreferences({ language: isAr ? 'en' : 'ar' })}
            title={isAr ? 'Switch to English' : 'التحويل للعربية'}
            className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl bg-[#151515] hover:bg-[#1E1E1E] text-gray-300 border border-[#2A2A2A] text-xs font-bold flex items-center gap-1 transition-colors min-h-[38px]"
          >
            <Globe className="w-3.5 h-3.5 text-[#FFAB00]" />
            <span className="hidden sm:inline font-thmanyah">{isAr ? 'EN' : 'عربي'}</span>
          </button>

          {/* Automated live refresh trigger */}
          <button
            onClick={refreshCatalog}
            disabled={refreshing}
            title={isAr ? 'تحديث الأسعار الآن' : 'Refresh live prices'}
            className="p-2 rounded-xl bg-[#151515] hover:bg-[#1E1E1E] text-gray-300 border border-[#2A2A2A] disabled:opacity-50 transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#FFAB00]' : ''}`} />
          </button>
        </div>
      </div>
    </header>
  );
};
