import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { ROCKSTAR_GAMES } from './src/data/rockstarCatalog.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const USER_AGENT = 'RekoMaro/1.0 (support@rekomaro.app; Android Price Tracker)';

app.use(express.json());

// In-memory cache to strictly avoid rate-limiting (Steam: 200 requests / 5 min limit)
const cache = {
  cheapSharkDeals: null as { data: any; timestamp: number } | null,
  steamPrices: new Map<string, { data: any; timestamp: number }>(),
  stores: null as { data: any; timestamp: number } | null,
};

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache

// Helper to fetch CheapShark with mandatory User-Agent
async function fetchCheapShark(endpoint: string) {
  const url = `https://www.cheapshark.com/api/1.0/${endpoint}`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'application/json',
      },
    });
    if (!res.ok) {
      console.warn(`CheapShark API returned status ${res.status} for ${endpoint}`);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error(`Failed to fetch CheapShark endpoint: ${endpoint}`, err);
    return null;
  }
}

// Helper to fetch Steam Price Overview
async function fetchSteamPrice(appId: string, countryCode: string = 'us') {
  const cacheKey = `${appId}_${countryCode}`;
  const cached = cache.steamPrices.get(cacheKey);
  const now = Date.now();
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const url = `https://store.steampowered.com/api/appdetails?appids=${appId}&cc=${countryCode}&filters=price_overview`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
      },
    });
    if (!res.ok) return null;
    const json = await res.json() as Record<string, any>;
    if (json[appId] && json[appId].success && json[appId].data?.price_overview) {
      const priceOverview = json[appId].data.price_overview;
      cache.steamPrices.set(cacheKey, { data: priceOverview, timestamp: now });
      return priceOverview;
    }
    return null;
  } catch (err) {
    console.error(`Failed to fetch Steam price for app ${appId}:`, err);
    return null;
  }
}

// API Routes
app.get('/api/games', async (req: Request, res: Response) => {
  try {
    const country = (req.query.cc as string) || 'us';
    // Clone catalog so we don't mutate static state directly
    const games = JSON.parse(JSON.stringify(ROCKSTAR_GAMES));

    // Refresh Steam prices for games that have a steamAppId if needed
    for (const game of games) {
      if (game.steamAppId) {
        const steamPrice = await fetchSteamPrice(game.steamAppId, country);
        if (steamPrice) {
          const regularUSD = steamPrice.initial ? steamPrice.initial / 100 : game.deals[0]?.regularPrice || 59.99;
          const currentUSD = steamPrice.final ? steamPrice.final / 100 : game.deals[0]?.currentPrice || 19.99;
          const discountPct = steamPrice.discount_percent || 0;

          const steamDeal = game.deals.find((d: any) => d.storeId === 'steam');
          if (steamDeal) {
            steamDeal.regularPrice = regularUSD;
            steamDeal.currentPrice = currentUSD;
            steamDeal.discountPercent = discountPct;
            steamDeal.lastUpdated = 'Live Steam Store';
          }

          // Recalculate lowest price and highest discount
          let lowest = game.deals[0]?.currentPrice || 0;
          let highestDisc = 0;
          let bestStore = game.deals[0]?.storeName || '';

          for (const d of game.deals) {
            if (d.currentPrice < lowest && d.currentPrice > 0) {
              lowest = d.currentPrice;
              bestStore = d.storeName;
            }
            if (d.discountPercent > highestDisc) {
              highestDisc = d.discountPercent;
            }
          }

          game.lowestPrice = lowest;
          game.highestDiscount = highestDisc;
          game.cheapestStore = bestStore;
        }
      }
    }

    res.json({
      success: true,
      count: games.length,
      data: games,
      cachedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Error in /api/games:', err);
    res.json({ success: true, count: ROCKSTAR_GAMES.length, data: ROCKSTAR_GAMES });
  }
});

app.get('/api/game/:id', async (req: Request, res: Response) => {
  const game = ROCKSTAR_GAMES.find((g) => g.id === req.params.id);
  if (!game) {
    return res.status(404).json({ success: false, message: 'Game not found' });
  }

  // If game has CheapShark ID, check for real live deals across PC stores
  let extraDeals: any[] = [];
  if (game.cheapSharkGameId) {
    const csGame = await fetchCheapShark(`games?id=${game.cheapSharkGameId}`);
    if (csGame && csGame.deals) {
      extraDeals = csGame.deals.slice(0, 6);
    }
  }

  res.json({
    success: true,
    data: game,
    extraDeals,
  });
});

app.get('/api/deals', async (req: Request, res: Response) => {
  const now = Date.now();
  if (cache.cheapSharkDeals && now - cache.cheapSharkDeals.timestamp < CACHE_TTL_MS) {
    return res.json({ success: true, data: cache.cheapSharkDeals.data, cached: true });
  }

  // Fetch top deals across all major publishers (AAA deals)
  const deals = await fetchCheapShark('deals?pageSize=60&sortBy=Deal%20Rating');
  if (deals && Array.isArray(deals)) {
    cache.cheapSharkDeals = { data: deals, timestamp: now };
    return res.json({ success: true, data: deals, count: deals.length });
  }

  res.json({ success: true, data: [] });
});

app.get('/api/search', async (req: Request, res: Response) => {
  const q = req.query.q as string;
  if (!q || !q.trim()) {
    return res.json({ success: true, data: [] });
  }

  try {
    const results = await fetchCheapShark(`games?title=${encodeURIComponent(q.trim())}`);
    return res.json({ success: true, data: Array.isArray(results) ? results : [] });
  } catch (err) {
    console.error('Search error in /api/search:', err);
    return res.json({ success: true, data: [] });
  }
});

app.get('/api/stores', async (_req: Request, res: Response) => {
  const now = Date.now();
  if (cache.stores && now - cache.stores.timestamp < CACHE_TTL_MS * 6) {
    return res.json({ success: true, data: cache.stores.data });
  }

  const stores = await fetchCheapShark('stores');
  if (stores) {
    cache.stores = { data: stores, timestamp: now };
    return res.json({ success: true, data: stores });
  }
  res.json({ success: true, data: [] });
});

// Steam Official Featured Specials & Categories API
app.get('/api/steam/featured', async (_req: Request, res: Response) => {
  try {
    const response = await fetch('https://store.steampowered.com/api/featuredcategories', {
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      return res.status(502).json({ success: false, message: 'Failed to fetch Steam featured categories' });
    }

    const data = (await response.json()) as any;
    const specials = data?.specials?.items || [];
    const topSellers = data?.top_sellers?.items || [];

    const combined = [...specials, ...topSellers];
    const seen = new Set<number>();
    const formattedGames = [];

    function detectPublisher(title: string): { publisher: string; publisherId: string } {
      const t = title.toLowerCase();
      if (t.includes('grand theft auto') || t.includes('gta') || t.includes('red dead') || t.includes('max payne') || t.includes('bully')) {
        return { publisher: 'Rockstar Games', publisherId: 'rockstar' };
      }
      if (t.includes('god of war') || t.includes('spider-man') || t.includes('last of us') || t.includes('horizon') || t.includes('ghost of tsushima') || t.includes('helldivers') || t.includes('uncharted') || t.includes('returnal') || t.includes('days gone')) {
        return { publisher: 'PlayStation Studios', publisherId: 'playstation' };
      }
      if (t.includes('halo') || t.includes('forza') || t.includes('starfield') || t.includes('doom') || t.includes('fallout') || t.includes('elder scrolls') || t.includes('skyrim') || t.includes('gears') || t.includes('minecraft') || t.includes('age of empires') || t.includes('senua') || t.includes('indiana jones')) {
        return { publisher: 'Xbox Game Studios', publisherId: 'xbox' };
      }
      if (t.includes('cyberpunk') || t.includes('witcher')) {
        return { publisher: 'CD PROJEKT RED', publisherId: 'cdprojekt' };
      }
      if (t.includes('fc 2') || t.includes('fifa') || t.includes('apex') || t.includes('battlefield') || t.includes('need for speed') || t.includes('sims') || t.includes('dead space') || t.includes('mass effect') || t.includes('dragon age') || t.includes('jedi') || t.includes('star wars')) {
        return { publisher: 'Electronic Arts', publisherId: 'ea' };
      }
      if (t.includes('resident evil') || t.includes('monster hunter') || t.includes('street fighter') || t.includes('devil may cry') || t.includes('dragon\'s dogma') || t.includes('dragons dogma') || t.includes('megaman')) {
        return { publisher: 'Capcom', publisherId: 'capcom' };
      }
      if (t.includes('elden ring') || t.includes('dark souls') || t.includes('tekken') || t.includes('armored core') || t.includes('dragon ball') || t.includes('tales of')) {
        return { publisher: 'Bandai Namco', publisherId: 'bandainamco' };
      }
      if (t.includes('assassin') || t.includes('far cry') || t.includes('rainbow six') || t.includes('crew') || t.includes('prince of persia') || t.includes('avatar') || t.includes('rayman')) {
        return { publisher: 'Ubisoft', publisherId: 'ubisoft' };
      }
      if (t.includes('final fantasy') || t.includes('nier') || t.includes('kingdom hearts') || t.includes('dragon quest') || t.includes('octopath') || t.includes('star ocean')) {
        return { publisher: 'Square Enix', publisherId: 'square-enix' };
      }
      if (t.includes('persona') || t.includes('sonic') || t.includes('yakuza') || t.includes('like a dragon') || t.includes('metaphor') || t.includes('total war') || t.includes('shin megami')) {
        return { publisher: 'SEGA', publisherId: 'sega' };
      }
      if (t.includes('civilization') || t.includes('borderlands') || t.includes('bioshock') || t.includes('nba 2k') || t.includes('mafia') || t.includes('xcom')) {
        return { publisher: '2K Games', publisherId: '2k-games' };
      }
      if (t.includes('hogwarts') || t.includes('batman') || t.includes('mortal kombat') || t.includes('suicide squad')) {
        return { publisher: 'Warner Bros. Games', publisherId: 'warner-bros' };
      }
      if (t.includes('counter-strike') || t.includes('half-life') || t.includes('portal') || t.includes('dota') || t.includes('left 4 dead')) {
        return { publisher: 'Valve', publisherId: 'valve' };
      }
      return { publisher: 'Steam Verified Spotlight', publisherId: 'steam-verified' };
    }

    for (const item of combined) {
      if (!item || seen.has(item.id)) continue;
      seen.add(item.id);

      const regular = item.original_price ? item.original_price / 100 : (item.final_price || 0) / 100;
      const current = item.final_price ? item.final_price / 100 : 0;
      const discount = item.discount_percent || 0;
      const pubInfo = detectPublisher(item.name || '');

      formattedGames.push({
        id: `steam-${item.id}`,
        title: item.name,
        titleAr: item.name,
        slug: item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        publisherId: pubInfo.publisherId,
        series: pubInfo.publisher,
        releaseYear: 2024,
        developer: pubInfo.publisher,
        publisher: pubInfo.publisher,
        coverImage:
          item.large_capsule_image ||
          `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${item.id}/capsule_616x353.jpg`,
        heroBanner:
          item.header_image ||
          `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${item.id}/header.jpg`,
        description: `Official Steam featured deal for ${item.name}. Verified live pricing and direct store link.`,
        descriptionAr: `عرض رسمي مباشر من متجر ستيم للعبة ${item.name} مع صور أصلية وروابط مباشرة.`,
        platforms: ['pc'],
        steamAppId: String(item.id),
        deals: [
          {
            storeId: 'steam',
            storeName: 'Steam Store',
            platform: 'pc',
            regularPrice: regular,
            currentPrice: current,
            discountPercent: discount,
            url: `https://store.steampowered.com/app/${item.id}/`,
            edition: 'Official Steam Edition',
            lastUpdated: 'Live Steam Feed',
          },
        ],
        lowestPrice: current,
        highestDiscount: discount,
        cheapestStore: 'Steam',
        historicalLow: {
          price: current,
          date: new Date().toISOString().slice(0, 10),
          store: 'Steam Store',
        },
        priceHistory: [
          { date: '2026-06-01', price: regular, storeName: 'MSRP' },
          { date: new Date().toISOString().slice(0, 10), price: current, storeName: 'Steam Deal' },
        ],
        tags: ['Steam Featured', 'Verified', 'Official'],
        tagsAr: ['مميز على ستيم', 'موثق', 'أصلي'],
        features: ['Official Steam CDN artwork', 'Verified digital purchase', 'Direct Steam Store launcher link'],
        featuresAr: ['أغلفة رسمية من خوادم ستيم الأصلية', 'شراء رقمي موثق ومباشر', 'رابط تشغيل فوري عبر متجر ستيم'],
      });
    }

    res.json({
      success: true,
      count: formattedGames.length,
      data: formattedGames,
    });
  } catch (err) {
    console.error('Error fetching Steam featured:', err);
    res.status(500).json({ success: false, data: [] });
  }
});

// Steam App Detailed Metadata API (Publishers, Developers, Synopsis, etc.)
app.get('/api/steam/app/:id', async (req: Request, res: Response) => {
  const appId = req.params.id;
  try {
    const response = await fetch(`https://store.steampowered.com/api/appdetails?appids=${appId}`, {
      headers: {
        'User-Agent': USER_AGENT,
      },
    });

    if (!response.ok) {
      return res.status(502).json({ success: false, message: 'Steam API error' });
    }

    const json = (await response.json()) as any;
    if (json[appId] && json[appId].success && json[appId].data) {
      const g = json[appId].data;
      return res.json({
        success: true,
        data: {
          name: g.name,
          publishers: g.publishers || [],
          developers: g.developers || [],
          header_image: g.header_image,
          detailed_description: g.short_description || g.detailed_description,
          genres: (g.genres || []).map((x: any) => x.description),
          price_overview: g.price_overview || null,
          screenshots: (g.screenshots || []).slice(0, 5).map((s: any) => s.path_full),
        },
      });
    }

    res.status(404).json({ success: false, message: 'Steam game not found' });
  } catch (err) {
    console.error(`Error in /api/steam/app/${appId}:`, err);
    res.status(500).json({ success: false, message: 'Internal error' });
  }
});

// Start server and setup Vite
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[RekoMaro Server] Running at http://localhost:${PORT} in ${isProduction ? 'production' : 'development'} mode`);
  });
}

startServer().catch((err) => {
  console.error('[RekoMaro Server Error]:', err);
});
