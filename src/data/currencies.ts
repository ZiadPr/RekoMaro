import { CurrencyCode, CurrencyConfig } from '../types/game';

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  USD: {
    code: 'USD',
    symbol: '$',
    symbolAr: '$',
    rateFromUSD: 1.0,
    decimals: 2,
  },
  SAR: {
    code: 'SAR',
    symbol: 'SAR',
    symbolAr: 'ر.س',
    rateFromUSD: 3.75,
    decimals: 2,
  },
  AED: {
    code: 'AED',
    symbol: 'AED',
    symbolAr: 'د.إ',
    rateFromUSD: 3.67,
    decimals: 2,
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    symbolAr: '€',
    rateFromUSD: 0.92,
    decimals: 2,
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    symbolAr: '£',
    rateFromUSD: 0.79,
    decimals: 2,
  },
  EGP: {
    code: 'EGP',
    symbol: 'EGP',
    symbolAr: 'ج.م',
    rateFromUSD: 49.20,
    decimals: 1,
  },
  TRY: {
    code: 'TRY',
    symbol: '₺',
    symbolAr: '₺',
    rateFromUSD: 34.50,
    decimals: 1,
  },
};

export function formatPrice(priceInUSD: number, currencyCode: CurrencyCode = 'USD', lang: 'ar' | 'en' = 'ar'): string {
  if (priceInUSD === 0) {
    return lang === 'ar' ? 'مجاني' : 'Free';
  }
  const config = CURRENCIES[currencyCode] || CURRENCIES.USD;
  const converted = priceInUSD * config.rateFromUSD;
  const numStr = converted.toFixed(config.decimals);
  const symbol = lang === 'ar' ? config.symbolAr : config.symbol;

  return lang === 'ar' ? `${numStr} ${symbol}` : `${symbol}${numStr}`;
}
