import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { Game, WatchlistItem, NotificationRecord, UserPreferences, PlatformId, PublisherId, PublisherInfo, CurrencyCode } from '../types/game';
import { ALL_GAMES } from '../data/rockstarCatalog';
import { formatPrice as formatCurrencyPrice } from '../data/currencies';
import { soundEffects } from '../utils/audio';
import { requestNotificationPermission, sendBrowserNotification } from '../utils/notifications';
import { clientSearchGames, extractPublishersFromGames, fetchSteamFeatured } from '../services/clientAutoFetch';

interface RekoMaroContextType {
  games: Game[];
  allPublishers: PublisherInfo[];
  loading: boolean;
  refreshing: boolean;
  lastUpdated: string;
  lastAutomatedSync: string;
  isAutoSyncActive: boolean;
  setIsAutoSyncActive: (active: boolean) => void;
  activeTab: 'catalog' | 'watchlist' | 'deals' | 'notifications' | 'settings';
  setActiveTab: (tab: 'catalog' | 'watchlist' | 'deals' | 'notifications' | 'settings') => void;
  selectedGame: Game | null;
  setSelectedGame: (game: Game | null) => void;
  watchlist: WatchlistItem[];
  toggleWatchlist: (gameId: string, targetPrice?: number) => void;
  isWatchlisted: (gameId: string) => boolean;
  updateWatchlistAlert: (gameId: string, minDiscount: number, targetPrice?: number) => void;
  notifications: NotificationRecord[];
  unreadCount: number;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
  preferences: UserPreferences;
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedPublisher: PublisherId | 'all';
  setSelectedPublisher: (pub: PublisherId | 'all') => void;
  selectedSeries: string;
  setSelectedSeries: (series: string) => void;
  selectedPlatform: PlatformId | 'all';
  setSelectedPlatform: (p: PlatformId | 'all') => void;
  dealsOnly: boolean;
  setDealsOnly: (val: boolean) => void;
  sortBy: 'discount' | 'price_low' | 'release' | 'title';
  setSortBy: (sort: 'discount' | 'price_low' | 'release' | 'title') => void;
  refreshCatalog: () => Promise<void>;
  simulateWorkManagerCheck: () => Promise<number>;
  formatPrice: (priceUSD: number) => string;
  isSearchingLive: boolean;
}

const STORAGE_KEYS = {
  WATCHLIST: 'rekomaro_watchlist_v2',
  NOTIFICATIONS: 'rekomaro_notifications_v2',
  PREFERENCES: 'rekomaro_preferences_v2',
  CUSTOM_GAMES: 'rekomaro_dynamic_games_v2',
};

const DEFAULT_PREFERENCES: UserPreferences = {
  currency: 'USD',
  language: 'ar',
  notificationsEnabled: true,
  minDiscountAlert: 20,
  onlyWatchlistAlerts: false,
  soundEnabled: true,
  deviceFrameMode: false,
  autoSyncIntervalMinutes: 1,
};

const INITIAL_NOTIFICATIONS: NotificationRecord[] = [
  {
    id: 'notif-1',
    gameId: 'witcher-3',
    gameTitle: 'The Witcher 3: Wild Hunt',
    gameTitleAr: 'ذا ويتشر 3: الصيد البري',
    message: 'Huge 75% discount live on Steam & GOG! Only $12.49',
    messageAr: 'خصم ضخم 75% متاح حالياً على ستيم و GOG بسعر 12.49$ فقط!',
    type: 'historic_low',
    discountPercent: 75,
    oldPrice: 49.99,
    newPrice: 12.49,
    storeName: 'Steam & GOG',
    platform: 'pc',
    timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
    read: false,
  },
  {
    id: 'notif-2',
    gameId: 'max-payne-3',
    gameTitle: 'Max Payne 3',
    gameTitleAr: 'ماكس باين 3',
    message: 'Record low price on Green Man Gaming! 74% off ($5.10)',
    messageAr: 'تخفيض قياسي على متجر Green Man Gaming بنسبة 74% بسعر 5.10$!',
    type: 'historic_low',
    discountPercent: 74,
    oldPrice: 19.99,
    newPrice: 5.10,
    storeName: 'Green Man Gaming',
    platform: 'pc',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    read: false,
  },
  {
    id: 'notif-3',
    gameId: 'rdr-2',
    gameTitle: 'Red Dead Redemption 2',
    gameTitleAr: 'ريد ديد ريدمبشن 2',
    message: 'Major discount on Steam and PlayStation Store: 67% off ($19.79)',
    messageAr: 'تخفيض كبير على ستيم وبلايستيشن ستور بنسبة 67% بسعر 19.79$!',
    type: 'price_drop',
    discountPercent: 67,
    oldPrice: 59.99,
    newPrice: 19.79,
    storeName: 'Steam & PS Store',
    platform: 'pc',
    timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
    read: true,
  },
  {
    id: 'notif-4',
    gameId: 'gta-6',
    gameTitle: 'Grand Theft Auto VI',
    gameTitleAr: 'جراند ثفت أوتو 6',
    message: 'Official launch confirmed for Nov 19, 2026. Pre-order trackers are active.',
    messageAr: 'تم تأكيد موعد الإطلاق الرسمي في 19 نوفمبر 2026، ورادار الحجز المسبق نشط.',
    type: 'upcoming_update',
    storeName: 'Rockstar Games Official',
    platform: 'playstation',
    timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
    read: true,
  },
];

const RekoMaroContext = createContext<RekoMaroContextType | undefined>(undefined);

export const RekoMaroProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [baseGames, setBaseGames] = useState<Game[]>(ALL_GAMES);
  const [dynamicGames, setDynamicGames] = useState<Game[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CUSTOM_GAMES);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [isSearchingLive, setIsSearchingLive] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleTimeString());
  const [lastAutomatedSync, setLastAutomatedSync] = useState<string>(new Date().toLocaleTimeString());
  const [isAutoSyncActive, setIsAutoSyncActive] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'catalog' | 'watchlist' | 'deals' | 'notifications' | 'settings'>('catalog');
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPublisher, setSelectedPublisher] = useState<PublisherId | 'all'>('all');
  const [selectedSeries, setSelectedSeries] = useState<string>('all');
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformId | 'all'>('all');
  const [dealsOnly, setDealsOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'discount' | 'price_low' | 'release' | 'title'>('discount');

  // Watchlist
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WATCHLIST);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [
      { gameId: 'gta-6', minDiscountPercent: 0, notifyOnAnyDiscount: true, addedAt: new Date().toISOString() },
      { gameId: 'rdr-2', targetPrice: 15.0, minDiscountPercent: 60, notifyOnAnyDiscount: true, addedAt: new Date().toISOString() },
      { gameId: 'witcher-3', targetPrice: 15.0, minDiscountPercent: 70, notifyOnAnyDiscount: true, addedAt: new Date().toISOString() },
      { gameId: 'god-of-war', targetPrice: 15.0, minDiscountPercent: 50, notifyOnAnyDiscount: true, addedAt: new Date().toISOString() },
    ];
  });

  // Notifications
  const [notifications, setNotifications] = useState<NotificationRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_NOTIFICATIONS;
  });

  // Preferences
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
      if (saved) return { ...DEFAULT_PREFERENCES, ...JSON.parse(saved) };
    } catch {
      // ignore
    }
    return DEFAULT_PREFERENCES;
  });

  // Combined games
  const allCurrentGames = useMemo(() => {
    const map = new Map<string, Game>();
    baseGames.forEach((g) => map.set(g.id, g));
    dynamicGames.forEach((g) => {
      if (!map.has(g.id)) map.set(g.id, g);
    });
    return Array.from(map.values());
  }, [baseGames, dynamicGames]);

  // Dynamically extract all discovered publishers across base & live fetched games
  const allPublishers = useMemo(() => {
    return extractPublishersFromGames(allCurrentGames);
  }, [allCurrentGames]);

  // Keep HTML lang & dir synced
  useEffect(() => {
    document.documentElement.lang = preferences.language;
    document.documentElement.dir = preferences.language === 'ar' ? 'rtl' : 'ltr';
  }, [preferences.language]);

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(watchlist));
    } catch {
      // ignore
    }
  }, [watchlist]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    } catch {
      // ignore
    }
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(preferences));
    } catch {
      // ignore
    }
  }, [preferences]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_GAMES, JSON.stringify(dynamicGames.slice(-30)));
    } catch {
      // ignore
    }
  }, [dynamicGames]);

  // Automated Client-Side Live Search debounced
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (trimmed.length < 2) return;

    // Check if we already have matching games in memory
    const hasLocalMatch = allCurrentGames.some(
      (g) => g.title.toLowerCase().includes(trimmed.toLowerCase()) || g.titleAr.toLowerCase().includes(trimmed.toLowerCase())
    );

    if (hasLocalMatch) return;

    // Client-side automated live discovery
    const timer = setTimeout(async () => {
      setIsSearchingLive(true);
      try {
        const liveResults = await clientSearchGames(trimmed);
        if (liveResults.length > 0) {
          setDynamicGames((prev) => {
            const existingIds = new Set(prev.map((g) => g.id));
            const newOnes = liveResults.filter((g) => !existingIds.has(g.id));
            return [...prev, ...newOnes];
          });
        }
      } catch (err) {
        console.warn('Live search error:', err);
      } finally {
        setIsSearchingLive(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery, allCurrentGames]);

  // Automated Background Sync on Client Side (every 60s)
  useEffect(() => {
    if (!isAutoSyncActive) return;

    const intervalMs = Math.max(30, (preferences.autoSyncIntervalMinutes || 1) * 60) * 1000;

    const interval = setInterval(async () => {
      try {
        // Fetch latest prices and check watchlist
        const res = await fetch('/api/games');
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            setBaseGames(json.data);
            setLastAutomatedSync(new Date().toLocaleTimeString());
          }
        }
      } catch {
        // silent client background error handling
      }
    }, intervalMs);

    return () => clearInterval(interval);
  }, [isAutoSyncActive, preferences.autoSyncIntervalMinutes]);

  // Fetch live prices on mount from /api/games and live Steam featured categories
  const loadSteamFeatured = async () => {
    try {
      const steamGames = await fetchSteamFeatured();
      if (steamGames && steamGames.length > 0) {
        setDynamicGames((prev) => {
          const existingIds = new Set([...baseGames.map((g) => g.id), ...prev.map((g) => g.id)]);
          const newOnes = steamGames.filter((g) => !existingIds.has(g.id));
          if (newOnes.length === 0) return prev;
          return [...prev, ...newOnes];
        });
      }
    } catch (err) {
      console.warn('Steam auto-fetch error:', err);
    }
  };

  const refreshCatalog = async () => {
    setRefreshing(true);
    soundEffects.playTap(preferences.soundEnabled);
    try {
      const [res] = await Promise.allSettled([
        fetch('/api/games'),
        loadSteamFeatured(),
      ]);

      if (res.status === 'fulfilled' && res.value.ok) {
        const json = await res.value.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setBaseGames(json.data);
          setLastUpdated(new Date().toLocaleTimeString());
          setLastAutomatedSync(new Date().toLocaleTimeString());
        }
      }
    } catch (err) {
      console.warn('Could not fetch /api/games, keeping catalog fallback:', err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    refreshCatalog();
    loadSteamFeatured();
  }, []);

  const updatePreferences = (updates: Partial<UserPreferences>) => {
    soundEffects.playTap(preferences.soundEnabled);
    setPreferences((prev) => {
      const next = { ...prev, ...updates };
      if (updates.notificationsEnabled && !prev.notificationsEnabled) {
        requestNotificationPermission();
      }
      return next;
    });
  };

  const isWatchlisted = (gameId: string) => {
    return watchlist.some((item) => item.gameId === gameId);
  };

  const toggleWatchlist = (gameId: string, targetPrice?: number) => {
    soundEffects.playTap(preferences.soundEnabled);
    setWatchlist((prev) => {
      const exists = prev.find((item) => item.gameId === gameId);
      if (exists) {
        return prev.filter((item) => item.gameId !== gameId);
      } else {
        return [
          ...prev,
          {
            gameId,
            targetPrice,
            minDiscountPercent: preferences.minDiscountAlert,
            notifyOnAnyDiscount: true,
            addedAt: new Date().toISOString(),
          },
        ];
      }
    });
  };

  const updateWatchlistAlert = (gameId: string, minDiscount: number, targetPrice?: number) => {
    soundEffects.playTap(preferences.soundEnabled);
    setWatchlist((prev) =>
      prev.map((item) => (item.gameId === gameId ? { ...item, minDiscountPercent: minDiscount, targetPrice } : item))
    );
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    soundEffects.playTap(preferences.soundEnabled);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    soundEffects.playTap(preferences.soundEnabled);
    setNotifications([]);
  };

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  // Periodic price evaluation simulation
  const simulateWorkManagerCheck = async (): Promise<number> => {
    setLoading(true);
    soundEffects.playTap(preferences.soundEnabled);
    await new Promise((resolve) => setTimeout(resolve, 600));

    let triggeredCount = 0;
    const newAlerts: NotificationRecord[] = [];

    const targetPool = preferences.onlyWatchlistAlerts
      ? allCurrentGames.filter((g) => isWatchlisted(g.id))
      : allCurrentGames;

    for (const game of targetPool) {
      if (game.highestDiscount >= preferences.minDiscountAlert && game.lowestPrice > 0) {
        const alreadyNotified = notifications.some(
          (n) => n.gameId === game.id && n.discountPercent === game.highestDiscount
        );

        if (!alreadyNotified) {
          triggeredCount++;
          const alertItem: NotificationRecord = {
            id: `alert-${Date.now()}-${game.id}`,
            gameId: game.id,
            gameTitle: game.title,
            gameTitleAr: game.titleAr,
            message: `New discount found for ${game.title}: ${game.highestDiscount}% off at ${game.cheapestStore}!`,
            messageAr: `تخفيض جديد متوفر على ${game.titleAr}: خصم ${game.highestDiscount}% على متجر ${game.cheapestStore}!`,
            type: game.highestDiscount >= 70 ? 'historic_low' : 'price_drop',
            discountPercent: game.highestDiscount,
            oldPrice: game.deals[0]?.regularPrice || 59.99,
            newPrice: game.lowestPrice,
            storeName: game.cheapestStore,
            platform: game.platforms[0] || 'pc',
            timestamp: new Date().toISOString(),
            read: false,
          };
          newAlerts.push(alertItem);
        }
      }
    }

    if (newAlerts.length > 0) {
      setNotifications((prev) => [...newAlerts, ...prev]);
      soundEffects.playAlert(preferences.soundEnabled);

      if (preferences.notificationsEnabled) {
        const first = newAlerts[0];
        const title = preferences.language === 'ar' ? 'تنبيه تخفيضات ريكومارو' : 'RekoMaro Price Drop Alert';
        const body = preferences.language === 'ar' ? first.messageAr : first.message;
        sendBrowserNotification(title, { body });
      }
    }

    setLastAutomatedSync(new Date().toLocaleTimeString());
    setLoading(false);
    return triggeredCount;
  };

  const formatPrice = (priceUSD: number) => {
    return formatCurrencyPrice(priceUSD, preferences.currency, preferences.language);
  };

  return (
    <RekoMaroContext.Provider
      value={{
        games: allCurrentGames,
        allPublishers,
        loading,
        refreshing,
        lastUpdated,
        lastAutomatedSync,
        isAutoSyncActive,
        setIsAutoSyncActive,
        activeTab,
        setActiveTab: (tab) => {
          soundEffects.playTap(preferences.soundEnabled);
          setActiveTab(tab);
        },
        selectedGame,
        setSelectedGame: (game) => {
          soundEffects.playTap(preferences.soundEnabled);
          setSelectedGame(game);
        },
        watchlist,
        toggleWatchlist,
        isWatchlisted,
        updateWatchlistAlert,
        notifications,
        unreadCount,
        markNotificationRead,
        markAllNotificationsRead,
        clearNotifications,
        preferences,
        updatePreferences,
        searchQuery,
        setSearchQuery,
        selectedPublisher,
        setSelectedPublisher,
        selectedSeries,
        setSelectedSeries,
        selectedPlatform,
        setSelectedPlatform,
        dealsOnly,
        setDealsOnly,
        sortBy,
        setSortBy,
        refreshCatalog,
        simulateWorkManagerCheck,
        formatPrice,
        isSearchingLive,
      }}
    >
      {children}
    </RekoMaroContext.Provider>
  );
};

export const useRekoMaro = (): RekoMaroContextType => {
  const context = useContext(RekoMaroContext);
  if (!context) {
    throw new Error('useRekoMaro must be used within a RekoMaroProvider');
  }
  return context;
};
