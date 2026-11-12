export type PlatformId = 'pc' | 'playstation' | 'xbox' | 'switch';

export type PublisherId = string;

export interface PublisherInfo {
  id: string;
  name: string;
  nameAr: string;
  color: string;
  count?: number;
}

export interface StoreDeal {
  storeId: string;
  storeName: string;
  platform: PlatformId;
  regularPrice: number;
  currentPrice: number;
  discountPercent: number;
  url: string;
  isHistoricLow?: boolean;
  edition?: string;
  lastUpdated?: string;
}

export interface PriceHistoryPoint {
  date: string;
  price: number;
  storeName: string;
}

export interface Game {
  id: string;
  title: string;
  titleAr: string;
  slug: string;
  publisherId: PublisherId;
  series: string;
  releaseYear: number;
  developer: string;
  publisher: string;
  coverImage: string;
  heroBanner: string;
  description: string;
  descriptionAr: string;
  platforms: PlatformId[];
  isUpcoming?: boolean;
  releaseDateExact?: string;
  cheapSharkGameId?: string;
  steamAppId?: string;
  deals: StoreDeal[];
  lowestPrice: number;
  highestDiscount: number;
  cheapestStore: string;
  historicalLow: {
    price: number;
    date: string;
    store: string;
  };
  priceHistory: PriceHistoryPoint[];
  tags: string[];
  tagsAr: string[];
  features: string[];
  featuresAr: string[];
}

export interface WatchlistItem {
  gameId: string;
  targetPrice?: number;
  minDiscountPercent: number;
  notifyOnAnyDiscount: boolean;
  addedAt: string;
}

export interface NotificationRecord {
  id: string;
  gameId: string;
  gameTitle: string;
  gameTitleAr: string;
  message: string;
  messageAr: string;
  type: 'price_drop' | 'new_deal' | 'upcoming_update' | 'historic_low';
  discountPercent?: number;
  oldPrice?: number;
  newPrice?: number;
  storeName: string;
  platform: PlatformId;
  timestamp: string;
  read: boolean;
}

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'SAR' | 'AED' | 'EGP' | 'TRY';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  symbolAr: string;
  rateFromUSD: number;
  decimals: number;
}

export interface UserPreferences {
  currency: CurrencyCode;
  language: 'ar' | 'en';
  notificationsEnabled: boolean;
  minDiscountAlert: number; // e.g. 20 for 20%+
  onlyWatchlistAlerts: boolean;
  soundEnabled: boolean;
  deviceFrameMode: boolean; // toggle between full responsive and Android frame simulator
  autoSyncIntervalMinutes: number; // automated client polling interval
}
