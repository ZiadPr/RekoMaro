import React, { useState } from 'react';
import { Game, PlatformId, StoreDeal } from '../types/game';
import { useRekoMaro } from '../context/RekoMaroContext';
import {
  X,
  Heart,
  ExternalLink,
  Tag,
  TrendingDown,
  Calendar,
  Building,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  Bell,
  Share2,
} from 'lucide-react';

interface GameDetailModalProps {
  game: Game;
  onClose: () => void;
}

export const GameDetailModal: React.FC<GameDetailModalProps> = ({ game, onClose }) => {
  const { formatPrice, isWatchlisted, toggleWatchlist, updateWatchlistAlert, preferences } = useRekoMaro();
  const isAr = preferences.language === 'ar';
  const tracked = isWatchlisted(game.id);

  const [activePlatformFilter, setActivePlatformFilter] = useState<PlatformId | 'all'>('all');
  const [customTargetPrice, setCustomTargetPrice] = useState<string>(
    game.lowestPrice > 0 ? (game.lowestPrice * 0.8).toFixed(2) : '14.99'
  );
  const [minDiscountThreshold, setMinDiscountThreshold] = useState<number>(30);
  const [copiedLink, setCopiedLink] = useState(false);

  const filteredDeals =
    activePlatformFilter === 'all'
      ? game.deals
      : game.deals.filter((d) => d.platform === activePlatformFilter);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const renderPlatformName = (p: PlatformId) => {
    switch (p) {
      case 'pc':
        return 'PC (Steam / Epic / Rockstar)';
      case 'playstation':
        return 'PlayStation (PS5 / PS4)';
      case 'xbox':
        return 'Xbox (Series X|S / One)';
      case 'switch':
        return 'Nintendo Switch';
      default:
        return p;
    }
  };

  // Calculate SVG price history points
  const maxPrice = Math.max(...game.priceHistory.map((p) => p.price), 60);
  const minPrice = Math.min(...game.priceHistory.map((p) => p.price), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div
        className="relative w-full max-w-4xl bg-[#141414] border border-[#2E2E2E] rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Hero Banner */}
        <div className="relative h-48 sm:h-64 md:h-72 w-full overflow-hidden bg-black shrink-0">
          <img
            src={game.heroBanner}
            alt={game.title}
            className="w-full h-full object-cover object-center"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/src/assets/images/gta_los_santos_skyline_1794349786163.jpg';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/60 to-transparent" />

          {/* Close & Share Buttons */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
            <button
              onClick={handleShare}
              className="p-2.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-gray-200 border border-white/10 transition-colors flex items-center gap-1.5 text-xs font-semibold"
            >
              <Share2 className="w-4 h-4 text-[#FFAB00]" />
              <span>{copiedLink ? (isAr ? 'تم النسخ!' : 'Copied!') : isAr ? 'مشاركة' : 'Share'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-gray-200 border border-white/10 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Floating Game Title & Status */}
          <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3 z-10">
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="bg-[#FFAB00] text-black font-rockstar text-xs font-black px-2.5 py-0.5 rounded uppercase">
                  {game.series.toUpperCase()}
                </span>
                <span className="text-xs text-gray-300 font-medium">
                  {game.releaseYear} · {game.developer}
                </span>
                {game.isUpcoming && (
                  <span className="bg-[#FF3B30] text-white text-xs font-bold px-2 py-0.5 rounded">
                    {isAr ? 'قريباً في 19 نوفمبر 2026' : 'Coming Nov 19, 2026'}
                  </span>
                )}
              </div>

              <h1 className="font-rockstar text-2xl sm:text-4xl text-white tracking-wide">
                {isAr ? game.titleAr : game.title}
              </h1>
            </div>

            {/* Favorite / Watch button */}
            <button
              onClick={() => toggleWatchlist(game.id, parseFloat(customTargetPrice))}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shrink-0 ${
                tracked
                  ? 'bg-[#FF3B30] text-white shadow-lg shadow-[#FF3B30]/30'
                  : 'bg-[#FFAB00] hover:bg-[#FFB81C] text-black shadow-lg shadow-[#FFAB00]/20'
              }`}
            >
              <Heart className={`w-4 h-4 ${tracked ? 'fill-white' : ''}`} />
              <span>
                {tracked
                  ? isAr
                    ? 'في قائمة المتابعة'
                    : 'Watching for Drops'
                  : isAr
                  ? 'متابعة التخفيضات'
                  : 'Track Price'}
              </span>
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-6 md:p-8 overflow-y-auto space-y-6">
          {/* Overview & Key Stats Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#1C1C1C] border border-[#2A2A2A] rounded-2xl p-3.5">
              <span className="text-[11px] text-gray-400 block mb-1">
                {game.isUpcoming ? (isAr ? 'السعر التقديري' : 'Target MSRP') : isAr ? 'أفضل سعر حالياً' : 'Best Current Price'}
              </span>
              <span className="font-num text-xl font-bold text-[#00E676]">
                {game.isUpcoming ? formatPrice(69.99) : formatPrice(game.lowestPrice)}
              </span>
              <span className="text-[10px] text-gray-500 block mt-0.5 truncate">
                {game.cheapestStore}
              </span>
            </div>

            <div className="bg-[#1C1C1C] border border-[#2A2A2A] rounded-2xl p-3.5">
              <span className="text-[11px] text-gray-400 block mb-1">
                {isAr ? 'أعلى نسبة خصم' : 'Highest Discount'}
              </span>
              <span className="font-num text-xl font-bold text-[#FFAB00]">
                {game.isUpcoming ? '0%' : `-${game.highestDiscount}%`}
              </span>
              <span className="text-[10px] text-gray-500 block mt-0.5">
                {game.highestDiscount > 0 ? (isAr ? 'تخفيض نشط' : 'Active Sale') : (isAr ? 'بدون خصم' : 'Regular')}
              </span>
            </div>

            <div className="bg-[#1C1C1C] border border-[#2A2A2A] rounded-2xl p-3.5">
              <span className="text-[11px] text-gray-400 block mb-1">
                {isAr ? 'أدنى سعر تاريخي' : 'Historical Low'}
              </span>
              <span className="font-num text-xl font-bold text-white">
                {formatPrice(game.historicalLow.price)}
              </span>
              <span className="text-[10px] text-gray-500 block mt-0.5 truncate">
                {game.historicalLow.store}
              </span>
            </div>

            <div className="bg-[#1C1C1C] border border-[#2A2A2A] rounded-2xl p-3.5">
              <span className="text-[11px] text-gray-400 block mb-1">
                {isAr ? 'الناشر الرسمي' : 'Official Publisher'}
              </span>
              <span className="font-bold text-sm text-gray-200 block truncate font-thmanyah">
                {game.publisher}
              </span>
              <span className="text-[10px] text-gray-500 block mt-0.5">
                {game.releaseYear}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="bg-[#181818] border border-[#262626] rounded-2xl p-4">
            <h3 className="text-sm font-bold text-gray-200 mb-2 font-thmanyah">
              {isAr ? 'نبذة عن اللعبة' : 'Game Synopsis'}
            </h3>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-normal font-thmanyah">
              {isAr ? game.descriptionAr : game.description}
            </p>

            {/* Tags unboxed */}
            <div className="mt-3 flex items-center gap-1.5 flex-wrap text-xs text-gray-400">
              <Tag className="w-3.5 h-3.5 text-[#FFAB00]" />
              {(isAr ? game.tagsAr : game.tags).map((tag, idx) => (
                <span key={tag}>
                  {tag}
                  {idx < game.tags.length - 1 && <span className="mx-1 text-gray-600">·</span>}
                </span>
              ))}
            </div>
          </div>

          {/* All Platforms Pricing Table (The Core Feature) */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>{isAr ? 'مقارنة الأسعار عبر جميع المتاجر والمنصات' : 'Multi-Platform Store Comparison'}</span>
                  <span className="text-xs font-normal text-gray-400 font-num">
                    ({filteredDeals.length} {isAr ? 'متجر' : 'stores'})
                  </span>
                </h3>
                <p className="text-xs text-gray-400">
                  {isAr ? 'بيانات حقيقية محدثة من واجهات برمجة المتاجر الرسمية' : 'Verified live prices from official store APIs'}
                </p>
              </div>

              {/* Platform filter tabs */}
              <div className="flex items-center gap-1 p-1 bg-[#1C1C1C] rounded-lg border border-[#2A2A2A] overflow-x-auto">
                <button
                  onClick={() => setActivePlatformFilter('all')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                    activePlatformFilter === 'all'
                      ? 'bg-[#FFAB00] text-black shadow-sm'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {isAr ? 'الكل' : 'All'}
                </button>
                {game.platforms.map((p) => (
                  <button
                    key={p}
                    onClick={() => setActivePlatformFilter(p)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                      activePlatformFilter === p
                        ? 'bg-[#FFAB00] text-black shadow-sm'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {p.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Deals List / Table */}
            <div className="divide-y divide-[#222] bg-[#181818] border border-[#262626] rounded-2xl overflow-hidden">
              {filteredDeals.map((deal, idx) => {
                const isBest = deal.currentPrice === game.lowestPrice && deal.currentPrice > 0;
                return (
                  <div
                    key={`${deal.storeId}-${idx}`}
                    className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#1E1E1E] transition-colors"
                  >
                    {/* Left: Store, Edition, Platform */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#222] border border-[#333] flex items-center justify-center font-bold text-xs text-[#FFAB00] shrink-0">
                        {deal.storeName.slice(0, 2).toUpperCase()}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">
                            {deal.storeName}
                          </span>
                          {isBest && (
                            <span className="bg-[#00E676]/20 text-[#00E676] text-[10px] font-bold px-2 py-0.5 rounded border border-[#00E676]/30">
                              {isAr ? 'أفضل سعر' : 'Best Price'}
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                          <span>{renderPlatformName(deal.platform)}</span>
                          {deal.edition && (
                            <>
                              <span className="text-gray-600">·</span>
                              <span className="text-gray-300">{deal.edition}</span>
                            </>
                          )}
                          <span className="text-gray-600">·</span>
                          <span className="text-gray-500 text-[11px]">{deal.lastUpdated || 'API Verified'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Prices & Direct Outbound Button */}
                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                      <div className="text-end">
                        <div className="flex items-center gap-2 justify-end">
                          <span className="font-num text-lg font-bold text-white">
                            {formatPrice(deal.currentPrice)}
                          </span>
                          {deal.discountPercent > 0 && (
                            <span className="bg-[#00E676] text-black font-num font-extrabold text-xs px-1.5 py-0.5 rounded">
                              -{deal.discountPercent}%
                            </span>
                          )}
                        </div>

                        {deal.discountPercent > 0 && (
                          <span className="font-num text-xs text-gray-500 line-through block">
                            {formatPrice(deal.regularPrice)}
                          </span>
                        )}
                      </div>

                      {/* Store Redirect Button */}
                      <a
                        href={deal.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-10 px-4 rounded-xl bg-[#242424] hover:bg-[#FFAB00] hover:text-black text-gray-200 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                      >
                        <span>{isAr ? 'الانتقال للمتجر' : 'Visit Store'}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Price History Chart */}
          <div className="bg-[#181818] border border-[#262626] rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                  <TrendingDown className="w-4 h-4 text-[#00E676]" />
                  <span>{isAr ? 'تاريخ وسجل الأسعار في مواسم التخفيضات' : 'Price History & Seasonal Sales'}</span>
                </h4>
                <p className="text-[11px] text-gray-400">
                  {isAr ? 'تتبع تغير السعر خلال التخفيضات الكبرى (الربيع، الصيف، الجمعة البيضاء)' : 'Historical lowest sales patterns'}
                </p>
              </div>

              <div className="text-end">
                <span className="text-[10px] text-gray-400 block">{isAr ? 'أدنى سعر مسجل' : 'All-time Low'}</span>
                <span className="font-num text-xs font-bold text-[#00E676]">
                  {formatPrice(game.historicalLow.price)}
                </span>
              </div>
            </div>

            {/* SVG Visual Line Chart */}
            <div className="relative h-28 w-full mt-4">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 500 100" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="priceGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#FFAB00" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#FFAB00" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal grid lines */}
                <line x1="0" y1="20" x2="500" y2="20" stroke="#262626" strokeDasharray="3 3" />
                <line x1="0" y1="50" x2="500" y2="50" stroke="#262626" strokeDasharray="3 3" />
                <line x1="0" y1="80" x2="500" y2="80" stroke="#262626" strokeDasharray="3 3" />

                {/* Area fill */}
                {(() => {
                  const pts = game.priceHistory.map((p, i) => {
                    const x = (i / (game.priceHistory.length - 1)) * 500;
                    const y = 90 - ((p.price - minPrice) / (maxPrice - minPrice || 1)) * 70;
                    return `${x},${y}`;
                  });
                  const pathD = `M 0,100 L ${pts.join(' L ')} L 500,100 Z`;
                  const lineD = `M ${pts.join(' L ')}`;
                  return (
                    <>
                      <path d={pathD} fill="url(#priceGrad)" />
                      <path d={lineD} fill="none" stroke="#FFAB00" strokeWidth="2.5" />
                      {game.priceHistory.map((p, i) => {
                        const x = (i / (game.priceHistory.length - 1)) * 500;
                        const y = 90 - ((p.price - minPrice) / (maxPrice - minPrice || 1)) * 70;
                        return (
                          <g key={i}>
                            <circle cx={x} cy={y} r="4" fill="#0A0A0A" stroke="#FFAB00" strokeWidth="2" />
                          </g>
                        );
                      })}
                    </>
                  );
                })()}
              </svg>

              {/* X axis dates */}
              <div className="flex justify-between text-[10px] text-gray-500 font-num mt-2">
                {game.priceHistory.map((p, i) => (
                  <span key={i} className="truncate max-w-[80px]">
                    {p.date.slice(5)} ({p.storeName})
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Key Game Features List */}
          <div className="bg-[#181818] border border-[#262626] rounded-2xl p-4 sm:p-5">
            <h4 className="text-sm font-bold text-white mb-3">
              {isAr ? 'مزايا وإصدارات اللعبة' : 'Key Game Features & Tech Specs'}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {(isAr ? game.featuresAr : game.features).map((feat, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-[#FFAB00] shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Price Alert Config Form */}
          <div className="bg-[#1A1A1A] border border-[#FFAB00]/30 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-2">
              <Bell className="w-4 h-4 text-[#FFAB00]" />
              <h4 className="text-sm font-bold text-white">
                {isAr ? 'تخصيص تنبيهات هذه اللعبة' : 'Custom Price Alert Settings'}
              </h4>
            </div>
            <p className="text-xs text-gray-400 mb-4">
              {isAr
                ? 'حدد السعر أو نسبة الخصم التي تود أن تتلقى إشعاراً فورياً عند وصول اللعبة إليها.'
                : 'Receive a push alert when this game drops below your target price.'}
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="flex-1 w-full">
                <label className="text-[11px] text-gray-400 block mb-1">
                  {isAr ? 'نبهني إذا انخفض السعر عن (بالدولار):' : 'Alert me if price drops below (USD):'}
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={customTargetPrice}
                  onChange={(e) => setCustomTargetPrice(e.target.value)}
                  className="w-full bg-[#121212] border border-[#333] rounded-xl px-3 py-2 text-sm font-num text-white focus:outline-none focus:border-[#FFAB00]"
                />
              </div>

              <div className="flex-1 w-full">
                <label className="text-[11px] text-gray-400 block mb-1">
                  {isAr ? 'أو إذا بلغت نسبة الخصم:' : 'Or if discount reaches at least:'}
                </label>
                <select
                  value={minDiscountThreshold}
                  onChange={(e) => setMinDiscountThreshold(parseInt(e.target.value, 10))}
                  className="w-full bg-[#121212] border border-[#333] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFAB00] cursor-pointer"
                >
                  <option value={20}>{isAr ? '20% أو أكثر' : '20% or more'}</option>
                  <option value={40}>{isAr ? '40% أو أكثر' : '40% or more'}</option>
                  <option value={50}>{isAr ? '50% أو أكثر (نصف السعر)' : '50% or more (Half Price)'}</option>
                  <option value={65}>{isAr ? '65% أو أكثر (خصم ضخم)' : '65% or more (Mega Deal)'}</option>
                </select>
              </div>

              <div className="sm:self-end w-full sm:w-auto">
                <button
                  onClick={() => {
                    updateWatchlistAlert(game.id, minDiscountThreshold, parseFloat(customTargetPrice));
                    if (!tracked) toggleWatchlist(game.id, parseFloat(customTargetPrice));
                  }}
                  className="w-full sm:w-auto h-10 px-5 rounded-xl bg-[#FFAB00] hover:bg-[#FFB81C] text-black text-xs font-bold transition-all shadow-md"
                >
                  {isAr ? 'حفظ إعدادات التنبيه' : 'Save Alert Rule'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
