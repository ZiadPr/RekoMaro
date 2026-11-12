import React from 'react';
import { Game, PlatformId } from '../types/game';
import { useRekoMaro } from '../context/RekoMaroContext';
import { Heart, ExternalLink, Sparkles, Building2 } from 'lucide-react';

interface GameCardProps {
  game: Game;
}

export const GameCard: React.FC<GameCardProps> = ({ game }) => {
  const { setSelectedGame, isWatchlisted, toggleWatchlist, formatPrice, preferences } = useRekoMaro();
  const isAr = preferences.language === 'ar';
  const tracked = isWatchlisted(game.id);

  const regularPriceUSD = game.deals[0]?.regularPrice || 59.99;
  const isFree = game.lowestPrice === 0;
  const hasDiscount = game.highestDiscount > 0;
  const isUpcoming = game.isUpcoming;

  const renderPlatformBadge = (platform: PlatformId) => {
    switch (platform) {
      case 'pc':
        return <span key="pc" className="text-gray-300 text-[11px] font-semibold">PC</span>;
      case 'playstation':
        return <span key="ps" className="text-blue-400 text-[11px] font-semibold">PlayStation</span>;
      case 'xbox':
        return <span key="xbox" className="text-emerald-400 text-[11px] font-semibold">Xbox</span>;
      case 'switch':
        return <span key="switch" className="text-red-400 text-[11px] font-semibold">Switch</span>;
      default:
        return null;
    }
  };

  return (
    <div
      onClick={() => setSelectedGame(game)}
      className="group relative bg-[#141414] hover:bg-[#1A1A1A] border border-[#242424] hover:border-[#383838] rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 flex flex-col justify-between shadow-lg hover:shadow-xl hover:shadow-black/50"
    >
      {/* Cover Artwork Container */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#0D0D0D]">
        <img
          src={game.coverImage}
          alt={game.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          referrerPolicy="no-referrer"
          loading="lazy"
          onError={(e) => {
            // Fallback gracefully if any image CDN has a transient network failure
            (e.target as HTMLImageElement).src = '/src/assets/images/gta_los_santos_skyline_1794349786163.jpg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-black/30" />

        {/* Top Badges overlay */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2 z-10">
          {/* Discount or Upcoming Badge */}
          {isUpcoming ? (
            <span className="bg-[#FFAB00] text-black font-rockstar text-[11px] font-black px-2.5 py-1 rounded-md shadow-md uppercase tracking-wide">
              {isAr ? 'قريباً 2026' : 'Upcoming 2026'}
            </span>
          ) : hasDiscount ? (
            <div className="flex items-center gap-1.5">
              <span className="bg-[#00E676] text-black font-num font-black text-xs px-2 py-0.5 rounded-md shadow-md">
                -{game.highestDiscount}%
              </span>
              {game.lowestPrice <= game.historicalLow.price && (
                <span className="bg-[#FF3B30] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-md flex items-center gap-1 font-thmanyah">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>{isAr ? 'أدنى سعر' : 'Historic Low'}</span>
                </span>
              )}
            </div>
          ) : (
            <span className="bg-[#242424]/90 text-gray-300 text-[10px] font-semibold px-2 py-0.5 rounded-md backdrop-blur-sm font-thmanyah">
              {isAr ? 'سعر قياسي' : 'Standard MSRP'}
            </span>
          )}

          {/* Watchlist Quick Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleWatchlist(game.id);
            }}
            className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-transform active:scale-90 ${
              tracked
                ? 'bg-[#FF3B30] text-white shadow-md'
                : 'bg-black/60 text-gray-300 hover:text-white hover:bg-black/80'
            }`}
            title={tracked ? (isAr ? 'إزالة من المتابعة' : 'Remove from Watchlist') : (isAr ? 'إضافة للمتابعة' : 'Add to Watchlist')}
          >
            <Heart className={`w-4 h-4 ${tracked ? 'fill-white' : ''}`} />
          </button>
        </div>

        {/* Bottom store and publisher indicator */}
        <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-[11px] text-gray-300 font-thmanyah">
          <span className="bg-black/70 backdrop-blur-sm px-2 py-0.5 rounded border border-white/5 truncate max-w-[170px]">
            {isUpcoming ? game.publisher : `${isAr ? 'الأرخص في' : 'Best on'}: ${game.cheapestStore}`}
          </span>
          <span className="font-num text-gray-400 text-[10px]">{game.releaseYear}</span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Unboxed Publisher & Platform Metadata */}
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1.5 flex-wrap font-thmanyah">
            <span className="text-[#FFAB00] font-semibold truncate max-w-[140px]">{game.publisher}</span>
            <span className="text-gray-600">·</span>
            <div className="flex items-center gap-1">
              {game.platforms.map((p, idx) => (
                <React.Fragment key={p}>
                  {renderPlatformBadge(p)}
                  {idx < game.platforms.length - 1 && <span className="text-gray-600">·</span>}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Title */}
          <h3 className="font-bold text-white text-base leading-tight group-hover:text-[#FFAB00] transition-colors line-clamp-1 font-thmanyah">
            {isAr ? game.titleAr : game.title}
          </h3>

          <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed font-thmanyah">
            {isAr ? game.descriptionAr : game.description}
          </p>
        </div>

        {/* Pricing Block */}
        <div className="mt-4 pt-3 border-t border-[#222] flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-thmanyah">
              {isUpcoming ? (isAr ? 'السعر المتوقع' : 'Estimated MSRP') : (isAr ? 'أفضل سعر حالي' : 'Current Best')}
            </span>

            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="font-num text-lg font-bold text-white tracking-tight">
                {isUpcoming
                  ? formatPrice(69.99)
                  : isFree
                  ? (isAr ? 'مجاني' : 'Free')
                  : formatPrice(game.lowestPrice)}
              </span>

              {hasDiscount && !isUpcoming && (
                <span className="font-num text-xs text-gray-500 line-through">
                  {formatPrice(regularPriceUSD)}
                </span>
              )}
            </div>
          </div>

          {/* Action pill */}
          <div className="flex items-center gap-1 text-xs font-semibold text-[#FFAB00] group-hover:underline font-thmanyah">
            <span>{isAr ? 'مقارنة المتاجر' : 'Compare'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
};
