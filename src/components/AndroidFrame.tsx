import React, { ReactNode } from 'react';
import { useRekoMaro } from '../context/RekoMaroContext';
import { Wifi, Signal, Battery, Smartphone } from 'lucide-react';

interface AndroidFrameProps {
  children: ReactNode;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({ children }) => {
  const { preferences, updatePreferences } = useRekoMaro();
  const isAr = preferences.language === 'ar';

  if (!preferences.deviceFrameMode) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#050505] py-4 sm:py-8 px-2 flex flex-col items-center justify-center">
      {/* Frame Switcher Bar */}
      <div className="w-full max-w-[430px] mb-3 flex items-center justify-between text-xs text-gray-400 px-2">
        <div className="flex items-center gap-1.5 font-medium">
          <Smartphone className="w-4 h-4 text-[#FFAB00]" />
          <span>{isAr ? 'محاكي هاتف أندرويد (Google Pixel 8 Pro / Material 3)' : 'Android Material 3 Simulator'}</span>
        </div>
        <button
          onClick={() => updatePreferences({ deviceFrameMode: false })}
          className="text-[#FFAB00] hover:underline font-semibold"
        >
          {isAr ? 'العودة للشاشة الكاملة' : 'Full Screen'}
        </button>
      </div>

      {/* Phone chassis */}
      <div className="relative w-full max-w-[420px] h-[870px] bg-[#1A1A1A] rounded-[48px] p-3 shadow-2xl shadow-[#FFAB00]/10 border-4 border-[#2A2A2A] ring-1 ring-[#3A3A3A] flex flex-col overflow-hidden">
        {/* Physical buttons simulation */}
        <div className="absolute -left-[7px] top-28 w-[4px] h-12 bg-[#333] rounded-l-md" />
        <div className="absolute -left-[7px] top-44 w-[4px] h-12 bg-[#333] rounded-l-md" />
        <div className="absolute -right-[7px] top-32 w-[4px] h-16 bg-[#333] rounded-r-md" />

        {/* Screen inner container */}
        <div className="relative w-full h-full bg-[#0A0A0A] rounded-[38px] overflow-hidden flex flex-col border border-[#222]">
          {/* Android Status Bar */}
          <div className="h-8 bg-[#0A0A0A] px-6 flex items-center justify-between text-[11px] font-semibold text-gray-300 select-none z-50 shrink-0 border-b border-[#141414]">
            <span>12:30</span>
            {/* Camera punch-hole */}
            <div className="w-3.5 h-3.5 rounded-full bg-black border border-[#222] shadow-inner" />
            <div className="flex items-center gap-1.5 text-gray-300">
              <Signal className="w-3 h-3" />
              <Wifi className="w-3 h-3" />
              <Battery className="w-3.5 h-3.5 text-[#00E676]" />
            </div>
          </div>

          {/* Scrollable Android Viewport */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden relative scrollbar-none pb-16">
            {children}
          </div>

          {/* Android gesture navigation bar */}
          <div className="h-4 bg-[#0A0A0A] flex items-center justify-center shrink-0 z-50">
            <div className="w-28 h-1 bg-gray-500 rounded-full opacity-60" />
          </div>
        </div>
      </div>
    </div>
  );
};
