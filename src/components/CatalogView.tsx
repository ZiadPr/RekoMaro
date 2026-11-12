import React from 'react';
import { useRekoMaro } from '../context/RekoMaroContext';
import { Gta6Hero } from './Gta6Hero';
import { GameCard } from './GameCard';
import { Search, X, SlidersHorizontal, Flame, Sparkles, Loader2, Building2 } from 'lucide-react';
import { PlatformId } from '../types/game';

export const CatalogView: React.FC = () => {
  const {
    games,
    allPublishers,
    searchQuery,
    setSearchQuery,
    selectedPublisher,
    setSelectedPublisher,
    selectedPlatform,
    setSelectedPlatform,
    dealsOnly,
    setDealsOnly,
    sortBy,
    setSortBy,
    preferences,
    isSearchingLive,
  } = useRekoMaro();

  const isAr = preferences.language === 'ar';

  const platforms: { id: PlatformId | 'all'; label: string }[] = [
    { id: 'all', label: isAr ? 'كل المنصات' : 'All Platforms' },
    { id: 'pc', label: 'PC' },
    { id: 'playstation', label: 'PlayStation' },
    { id: 'xbox', label: 'Xbox' },
    { id: 'switch', label: 'Nintendo Switch' },
  ];

  // Filter games based on publisher, platform, search, and deals
  const filteredGames = games
    .filter((game) => {
      // Publisher
      if (selectedPublisher !== 'all') {
        const target = selectedPublisher.toLowerCase();
        const gamePubId = (game.publisherId || '').toLowerCase();
        const gamePubNameId = (game.publisher || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const matchesPublisher =
          gamePubId === target ||
          gamePubNameId === target ||
          gamePubId.includes(target) ||
          target.includes(gamePubId);
        if (!matchesPublisher) return false;
      }

      // Platform
      if (selectedPlatform !== 'all' && !game.platforms.includes(selectedPlatform)) {
        return false;
      }

      // Deals only
      if (dealsOnly && (game.highestDiscount === 0 || game.isUpcoming)) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          game.title.toLowerCase().includes(q) ||
          game.titleAr.toLowerCase().includes(q) ||
          game.publisher.toLowerCase().includes(q) ||
          game.series.toLowerCase().includes(q) ||
          game.tags.some((t) => t.toLowerCase().includes(q)) ||
          game.tagsAr.some((t) => t.toLowerCase().includes(q));
        if (!matches) return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'discount') {
        if (a.isUpcoming) return 1;
        if (b.isUpcoming) return -1;
        return b.highestDiscount - a.highestDiscount;
      }
      if (sortBy === 'price_low') {
        return a.lowestPrice - b.lowestPrice;
      }
      if (sortBy === 'release') {
        return b.releaseYear - a.releaseYear;
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

  return (
    <div className="space-y-6">
      {/* GTA VI Hero Spotlight Card (Shows for All or Rockstar) */}
      {(selectedPublisher === 'all' || selectedPublisher === 'rockstar') && !searchQuery && (
        <Gta6Hero />
      )}

      {/* Publisher Filter Strip (Covering all publishers) */}
      <div className="bg-[#141414] border border-[#242424] rounded-3xl p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#FFAB00]" />
            <h3 className="font-bold text-sm text-white font-thmanyah">
              {isAr ? 'اختر الناشر (Publishers)' : 'Game Publishers'}
            </h3>
          </div>
          <span className="text-[11px] text-gray-500 font-num">
            {allPublishers.length} {isAr ? 'ناشرين عالميين' : 'Publishers'}
          </span>
        </div>

        {/* Publisher Buttons Carousel */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedPublisher('all')}
            className={`px-3.5 py-2 text-xs font-bold rounded-2xl whitespace-nowrap shrink-0 transition-all font-thmanyah ${
              selectedPublisher === 'all'
                ? 'bg-[#FFAB00] text-black shadow-md shadow-[#FFAB00]/20'
                : 'bg-[#1C1C1C] hover:bg-[#252525] text-gray-300 border border-[#2A2A2A]'
            }`}
          >
            {isAr ? 'جميع الناشرين' : 'All Publishers'}
          </button>

          {allPublishers.map((pub) => {
            const isSelected = selectedPublisher === pub.id;
            return (
              <button
                key={pub.id}
                onClick={() => setSelectedPublisher(pub.id)}
                className={`px-3.5 py-2 text-xs font-bold rounded-2xl whitespace-nowrap shrink-0 transition-all flex items-center gap-2 font-thmanyah ${
                  isSelected
                    ? 'bg-white text-black shadow-md'
                    : 'bg-[#1C1C1C] hover:bg-[#252525] text-gray-300 border border-[#2A2A2A]'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: pub.color }}
                />
                <span>{isAr ? pub.nameAr : pub.name}</span>
                {typeof pub.count === 'number' && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-num ${
                      isSelected ? 'bg-black/10 text-black font-bold' : 'bg-[#282828] text-gray-400'
                    }`}
                  >
                    {pub.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search & Multi-filter Bar */}
      <div className="bg-[#141414] border border-[#242424] rounded-3xl p-4 sm:p-5 space-y-4">
        {/* Search input + Live Search Status + Deals Toggle */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search bar with automated live search indicator */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute top-1/2 -translate-y-1/2 left-3.5 rtl:left-auto rtl:right-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                isAr
                  ? 'ابحث عن أي لعبة لأي ناشر (GTA, Cyberpunk, Elden Ring, God of War, FC 25...)'
                  : 'Search any game from any publisher (GTA, Witcher, Spider-Man, Elden Ring...)'
              }
              className="w-full bg-[#1C1C1C] border border-[#2E2E2E] rounded-2xl py-2.5 px-10 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#FFAB00] transition-colors font-thmanyah"
            />
            {isSearchingLive ? (
              <div className="absolute top-1/2 -translate-y-1/2 right-3.5 rtl:right-auto rtl:left-3.5 text-[#FFAB00] flex items-center gap-1.5 text-xs">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            ) : searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute top-1/2 -translate-y-1/2 right-3.5 rtl:right-auto rtl:left-3.5 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            ) : null}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Deals Only Toggle */}
            <button
              onClick={() => setDealsOnly(!dealsOnly)}
              className={`h-10 px-3.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all font-thmanyah ${
                dealsOnly
                  ? 'bg-[#00E676] text-black shadow-md shadow-[#00E676]/20'
                  : 'bg-[#1C1C1C] hover:bg-[#252525] text-gray-300 border border-[#2E2E2E]'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>{isAr ? 'التخفيضات فقط' : 'Deals Only'}</span>
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-[#1C1C1C] border border-[#2E2E2E] rounded-2xl px-3 py-2 text-xs">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#FFAB00]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-gray-200 font-bold focus:outline-none cursor-pointer font-thmanyah"
              >
                <option value="discount">{isAr ? 'الأعلى خصماً' : 'Highest Discount'}</option>
                <option value="price_low">{isAr ? 'الأقل سعراً' : 'Lowest Price'}</option>
                <option value="release">{isAr ? 'سنة الإصدار' : 'Release Year'}</option>
                <option value="title">{isAr ? 'أبجدياً' : 'Alphabetical'}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Platform Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] text-gray-500 font-medium px-1 whitespace-nowrap font-thmanyah">
            {isAr ? 'المنصة المحددة:' : 'Platform:'}
          </span>
          {platforms.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPlatform(p.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap shrink-0 transition-colors font-thmanyah ${
                selectedPlatform === p.id
                  ? 'bg-white text-black font-bold shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-[#202020] border border-[#222]'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filter status & live discovery notice */}
      <div className="flex items-center justify-between text-xs text-gray-400 px-1">
        <span className="font-thmanyah">
          {isAr
            ? `عرض ${filteredGames.length} لعبة موثقة في الدليل`
            : `Showing ${filteredGames.length} games`}
        </span>

        {filteredGames.some((g) => g.highestDiscount > 0) && (
          <span className="text-[#00E676] font-semibold flex items-center gap-1 font-thmanyah">
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {isAr
                ? `${filteredGames.filter((g) => g.highestDiscount > 0).length} ألعاب عليها تخفيضات نشطة`
                : `${filteredGames.filter((g) => g.highestDiscount > 0).length} on active sale`}
            </span>
          </span>
        )}
      </div>

      {/* Games Grid */}
      {filteredGames.length === 0 ? (
        <div className="bg-[#121212] border border-[#222] rounded-3xl p-10 text-center flex flex-col items-center justify-center max-w-md mx-auto my-8">
          <Search className="w-8 h-8 text-gray-500 mb-3" />
          <h3 className="font-bold text-white text-base mb-1 font-thmanyah">
            {isAr ? 'لم يتم العثور على ألعاب مطابقة' : 'No Matching Games Found'}
          </h3>
          <p className="text-xs text-gray-400 leading-relaxed mb-4 font-thmanyah">
            {isAr
              ? 'يقوم النظام بالبحث التلقائي في واجهات المتاجر الرقمية العالمية. جرب البحث باسم لعبة أخرى.'
              : 'Try searching for any other game title or reset the publisher filter.'}
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedPublisher('all');
              setSelectedPlatform('all');
              setDealsOnly(false);
            }}
            className="h-10 px-5 rounded-2xl bg-[#FFAB00] text-black text-xs font-bold font-thmanyah shadow-md"
          >
            {isAr ? 'إعادة ضبط الفلاتر' : 'Reset Filters'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredGames.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      )}
    </div>
  );
};
