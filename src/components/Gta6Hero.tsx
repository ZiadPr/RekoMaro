import React, { useState, useEffect } from 'react';
import { useRekoMaro } from '../context/RekoMaroContext';
import { Game } from '../types/game';
import { Bell, CheckCircle2, Calendar, Flame, ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react';

export const Gta6Hero: React.FC = () => {
  const { games, setSelectedGame, isWatchlisted, toggleWatchlist, preferences } = useRekoMaro();
  const isAr = preferences.language === 'ar';

  const gta6 = games.find((g) => g.id === 'gta-6');

  // Countdown to November 19, 2026
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const targetDate = new Date('2026-11-19T00:00:00Z').getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!gta6) return null;

  const isTracked = isWatchlisted('gta-6');

  return (
    <div className="relative w-full rounded-3xl overflow-hidden bg-[#141414] border border-[#262626] shadow-2xl mb-8 group">
      {/* Background Hero Image with measured contrast scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src="/src/assets/images/gta6_neon_vice_hero_1794349786403.jpg"
          alt="Grand Theft Auto VI Vice City Sunset"
          className="w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-700 ease-out"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-[#0A0A0A]/60 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 p-5 sm:p-8 md:p-10 flex flex-col justify-between min-h-[420px]">
        {/* Top bar indicators */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="bg-[#FFAB00] text-black text-xs font-black px-3 py-1 rounded-md uppercase tracking-wider font-rockstar shadow-lg shadow-[#FFAB00]/30 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 fill-black" />
              {isAr ? 'قريباً / Coming Soon' : 'Coming Soon · Nov 19, 2026'}
            </span>

            <div className="flex items-center gap-2 text-xs text-gray-300 bg-black/60 backdrop-blur-md px-3 py-1 rounded-md border border-white/10">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00E676]" />
              <span>{isAr ? 'موعد رسمي مؤكد من روكستار' : 'Official Confirmed Date'}</span>
            </div>
          </div>

          {/* Platform support badges */}
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-300 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
            <span>PS5</span>
            <span className="text-gray-500">·</span>
            <span>Xbox Series X|S</span>
            <span className="text-gray-500">·</span>
            <span className="text-gray-400">{isAr ? 'الحاسب لاحقاً' : 'PC Later'}</span>
          </div>
        </div>

        {/* Middle: Title & Description */}
        <div className="my-6 max-w-2xl">
          <h2 className="font-rockstar text-3xl sm:text-5xl md:text-6xl text-white tracking-wider uppercase leading-none drop-shadow-md">
            Grand Theft Auto <span className="text-[#FFAB00]">VI</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-gray-300 leading-relaxed max-w-xl font-medium font-thmanyah">
            {isAr
              ? 'تتجه السلسلة إلى ولاية ليونيدا وشوارع فايس سيتي المليئة بالنيون والإثارة في أضخم إنتاج في تاريخ الترفيه التفاعلي.'
              : 'Heading to the state of Leonida and neon-soaked Vice City in the biggest, most immersive Rockstar experience yet.'}
          </p>

          {/* Clean unboxed metadata */}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-400 font-thmanyah">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#FFAB00]" />
              <span>19 {isAr ? 'نوفمبر 2026' : 'November 2026'}</span>
            </span>
            <span>·</span>
            <span>Vice City & Leonida</span>
            <span>·</span>
            <span>{isAr ? 'البطلان: لوسيا وجيسون' : 'Lucia & Jason'}</span>
            <span>·</span>
            <span>{isAr ? 'بدون أسعار وهمية حتى تفعيل المتاجر' : 'Real-time price feed primed'}</span>
          </div>
        </div>

        {/* Bottom: Countdown strip & Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-4 border-t border-white/10">
          {/* Countdown block */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex flex-col items-center bg-black/60 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 min-w-[58px]">
              <span className="font-num text-xl sm:text-2xl font-bold text-[#FFAB00] leading-none">
                {timeLeft.days}
              </span>
              <span className="text-[10px] text-gray-400 uppercase mt-1">{isAr ? 'يوم' : 'Days'}</span>
            </div>

            <div className="flex flex-col items-center bg-black/60 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 min-w-[58px]">
              <span className="font-num text-xl sm:text-2xl font-bold text-white leading-none">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="text-[10px] text-gray-400 uppercase mt-1">{isAr ? 'ساعة' : 'Hours'}</span>
            </div>

            <div className="flex flex-col items-center bg-black/60 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 min-w-[58px]">
              <span className="font-num text-xl sm:text-2xl font-bold text-white leading-none">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className="text-[10px] text-gray-400 uppercase mt-1">{isAr ? 'دقيقة' : 'Mins'}</span>
            </div>

            <div className="flex flex-col items-center bg-black/60 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 min-w-[58px]">
              <span className="font-num text-xl sm:text-2xl font-bold text-[#00E676] leading-none">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
              <span className="text-[10px] text-gray-400 uppercase mt-1">{isAr ? 'ثانية' : 'Secs'}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleWatchlist('gta-6')}
              className={`flex-1 sm:flex-initial h-11 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                isTracked
                  ? 'bg-[#00E676] text-black shadow-lg shadow-[#00E676]/20'
                  : 'bg-[#FFAB00] hover:bg-[#FFB81C] text-black shadow-lg shadow-[#FFAB00]/20'
              }`}
            >
              {isTracked ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isAr ? 'تم تفعيل التنبيه المسبق' : 'Pre-order Alert Active'}</span>
                </>
              ) : (
                <>
                  <Bell className="w-4 h-4" />
                  <span>{isAr ? 'تنبيهي فور توفر الطلب المسبق' : 'Alert Me on Pre-Order'}</span>
                </>
              )}
            </button>

            <button
              onClick={() => setSelectedGame(gta6)}
              className="h-11 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md border border-white/15 flex items-center justify-center gap-1 transition-colors"
            >
              <span>{isAr ? 'تفاصيل الإطلاق' : 'Launch Specs'}</span>
              {isAr ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
