import React, { useState } from 'react';
import { useRekoMaro } from '../context/RekoMaroContext';
import { GameCard } from './GameCard';
import { Flame, Sparkles, Filter, ExternalLink } from 'lucide-react';
import { PlatformId } from '../types/game';

export const DealsView: React.FC = () => {
  const { games, formatPrice, setSelectedGame, preferences } = useRekoMaro();
  const isAr = preferences.language === 'ar';

  const [minDiscount, setMinDiscount] = useState<number>(0);
  const [storeFilter, setStoreFilter] = useState<string>('all');

  // Filter games that have a discount > 0 and are not upcoming
  const discountedGames = games
    .filter((g) => !g.isUpcoming && g.highestDiscount >= minDiscount)
    .sort((a, b) => b.highestDiscount - a.highestDiscount);

  // Extract all deals across games for table view
  const allDeals = games
    .flatMap((g) =>
      g.deals.map((d) => ({
        ...d,
        gameTitle: isAr ? g.titleAr : g.title,
        gameId: g.id,
        coverImage: g.coverImage,
        gameObj: g,
      }))
    )
    .filter((d) => d.discountPercent > 0 && (storeFilter === 'all' || d.storeId === storeFilter))
    .sort((a, b) => b.discountPercent - a.discountPercent);

  const stores = [
    { id: 'all', name: isAr ? 'جميع المتاجر' : 'All Stores' },
    { id: 'steam', name: 'Steam' },
    { id: 'greenman', name: 'Green Man Gaming' },
    { id: 'fanatical', name: 'Fanatical' },
    { id: 'ps_store', name: 'PlayStation Store' },
    { id: 'xbox_store', name: 'Xbox Store' },
    { id: 'nintendo_eshop', name: 'Nintendo eShop' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#141414] border border-[#262626] rounded-3xl p-5 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-[#00E676] text-black flex items-center justify-center">
              <Flame className="w-4 h-4 fill-black" />
            </div>
            <h2 className="font-rockstar text-2xl sm:text-3xl text-white">
              {isAr ? 'مركز تخفيضات الألعاب العالمية النشطة' : 'Active Global Games Deals & Flash Sales'}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 max-w-xl font-thmanyah">
            {isAr
              ? 'تخفيضات حقيقية تصل إلى 76% لجميع الناشرين عبر متاجر Steam و PlayStation و Xbox و Epic Games و Green Man Gaming.'
              : 'Real, verified discounts up to 76% off across PC and console storefronts for all major publishers.'}
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={minDiscount}
            onChange={(e) => setMinDiscount(parseInt(e.target.value, 10))}
            className="bg-[#1C1C1C] text-xs font-semibold text-gray-200 border border-[#2E2E2E] rounded-xl px-3 py-2 focus:outline-none focus:border-[#FFAB00]"
          >
            <option value={0}>{isAr ? 'كل التخفيضات' : 'All Discounts'}</option>
            <option value={50}>{isAr ? 'خصم 50% فأكثر' : '50%+ Off'}</option>
            <option value={65}>{isAr ? 'خصم 65% فأكثر (خصومات نارية)' : '65%+ Mega Deals'}</option>
          </select>

          <select
            value={storeFilter}
            onChange={(e) => setStoreFilter(e.target.value)}
            className="bg-[#1C1C1C] text-xs font-semibold text-gray-200 border border-[#2E2E2E] rounded-xl px-3 py-2 focus:outline-none focus:border-[#FFAB00]"
          >
            {stores.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Featured Big Discounts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {discountedGames.slice(0, 6).map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>

      {/* Complete Deals Feed Table */}
      <div className="bg-[#141414] border border-[#262626] rounded-3xl overflow-hidden mt-8">
        <div className="p-4 sm:p-5 border-b border-[#242424] flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#FFAB00]" />
            <span>{isAr ? 'جدول العروض المباشرة مرتبة بالأعلى تخفيضاً' : 'Ranked Direct Store Offers'}</span>
          </h3>
          <span className="text-xs text-gray-400 font-num">
            {allDeals.length} {isAr ? 'عرض متوفر' : 'active offers'}
          </span>
        </div>

        <div className="divide-y divide-[#222]">
          {allDeals.map((deal, idx) => (
            <div
              key={`${deal.gameId}-${deal.storeId}-${idx}`}
              className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#1A1A1A] transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="font-num text-xs font-bold text-gray-500 w-5">
                  #{idx + 1}
                </span>

                <div
                  onClick={() => setSelectedGame(deal.gameObj)}
                  className="cursor-pointer group flex items-center gap-2.5"
                >
                  <img
                    src={deal.coverImage}
                    alt={deal.gameTitle}
                    className="w-12 h-8 rounded-lg object-cover border border-[#2E2E2E] group-hover:scale-105 transition-transform"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/src/assets/images/gta_los_santos_skyline_1794349786163.jpg';
                    }}
                  />
                  <div>
                    <span className="font-bold text-sm text-white group-hover:text-[#FFAB00] transition-colors block">
                      {deal.gameTitle}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      {deal.storeName} · {deal.platform.toUpperCase()} {deal.edition ? `· ${deal.edition}` : ''}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                <div className="text-end">
                  <div className="flex items-center gap-2 justify-end">
                    <span className="font-num text-base font-bold text-[#00E676]">
                      {formatPrice(deal.currentPrice)}
                    </span>
                    <span className="bg-[#00E676] text-black font-num font-black text-xs px-2 py-0.5 rounded">
                      -{deal.discountPercent}%
                    </span>
                  </div>
                  <span className="font-num text-xs text-gray-500 line-through block">
                    {formatPrice(deal.regularPrice)}
                  </span>
                </div>

                <a
                  href={deal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-9 px-3.5 rounded-xl bg-[#242424] hover:bg-[#FFAB00] hover:text-black text-gray-200 text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  <span>{isAr ? 'شراء' : 'Buy'}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
