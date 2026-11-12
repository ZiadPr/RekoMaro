import React from 'react';
import { useRekoMaro } from '../context/RekoMaroContext';
import { GameCard } from './GameCard';
import { Heart, Bell, TrendingDown, ArrowRight, PlayCircle, ShieldAlert } from 'lucide-react';

export const WatchlistView: React.FC = () => {
  const {
    games,
    watchlist,
    setActiveTab,
    simulateWorkManagerCheck,
    loading,
    formatPrice,
    preferences,
  } = useRekoMaro();
  const isAr = preferences.language === 'ar';

  const watchedGames = games.filter((g) => watchlist.some((w) => w.gameId === g.id));

  // Compute total potential savings
  const totalRegular = watchedGames.reduce((acc, g) => acc + (g.deals[0]?.regularPrice || 59.99), 0);
  const totalCurrent = watchedGames.reduce((acc, g) => acc + g.lowestPrice, 0);
  const totalSavings = Math.max(0, totalRegular - totalCurrent);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#141414] border border-[#262626] rounded-3xl p-5 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-[#FFAB00] text-black flex items-center justify-center">
              <Heart className="w-4 h-4 fill-black" />
            </div>
            <h2 className="font-rockstar text-2xl sm:text-3xl text-white">
              {isAr ? 'قائمة المتابعة والتخفيضات الخاصة بي' : 'My Watchlist & Deal Radar'}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 max-w-xl font-thmanyah">
            {isAr
              ? 'يراقب التطبيق الأسعار في الخلفية تلقائياً من جانب العميل. إذا انخفض سعر أي لعبة من ألعابك المفضلة، ستتلقى تنبيهاً فورياً.'
              : 'RekoMaro monitors these games across PC and console stores. Receive an instant alert when a price drops.'}
          </p>
        </div>

        {/* Potential Savings Counter & Periodic Prober */}
        <div className="flex items-center gap-3">
          <div className="bg-[#1C1C1C] border border-[#2E2E2E] px-4 py-2.5 rounded-2xl text-center min-w-[120px]">
            <span className="text-[10px] text-gray-400 block uppercase font-medium">
              {isAr ? 'وفرت حتى الآن' : 'Current Savings'}
            </span>
            <span className="font-num text-lg font-bold text-[#00E676]">
              {formatPrice(totalSavings)}
            </span>
          </div>

          <button
            onClick={() => simulateWorkManagerCheck()}
            disabled={loading}
            className="h-11 px-4 rounded-2xl bg-[#FFAB00] hover:bg-[#FFB81C] text-black text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-[#FFAB00]/20 disabled:opacity-50"
          >
            <PlayCircle className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{isAr ? 'فحص الأسعار الآن (WorkManager)' : 'Run Price Prober'}</span>
          </button>
        </div>
      </div>

      {/* Empty State or Grid */}
      {watchedGames.length === 0 ? (
        <div className="bg-[#121212] border border-[#222] rounded-3xl p-10 text-center flex flex-col items-center justify-center max-w-md mx-auto my-12">
          <div className="w-16 h-16 rounded-full bg-[#1C1C1C] flex items-center justify-center text-gray-500 mb-4">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-white text-lg mb-1">
            {isAr ? 'قائمة المتابعة فارغة حالياً' : 'Your Watchlist is Empty'}
          </h3>
          <p className="text-xs text-gray-400 leading-relaxed mb-6">
            {isAr
              ? 'تصفح دليل ألعاب روكستار واضغط على أيقونة القلب على أي لعبة ترغب في متابعة تخفيضاتها.'
              : 'Browse the Rockstar catalog and tap the heart icon on any game to monitor price drops.'}
          </p>
          <button
            onClick={() => setActiveTab('catalog')}
            className="h-10 px-5 rounded-xl bg-[#FFAB00] text-black text-xs font-bold flex items-center gap-1.5 shadow-md"
          >
            <span>{isAr ? 'استعراض ألعاب روكستار' : 'Browse Catalog'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between text-xs text-gray-400 mb-3 px-1">
            <span>
              {isAr ? `تتم متابعة ${watchedGames.length} ألعاب حالياً` : `Monitoring ${watchedGames.length} games`}
            </span>
            <span className="text-[#FFAB00]">
              {isAr ? 'يتم التحديث التلقائي بشكل دوري' : 'Auto-checking every 15 mins'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {watchedGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
