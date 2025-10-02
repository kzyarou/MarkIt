// Utility for per-user browsing history, saved listings, and simple recommendations
// Storage keys are namespaced by user id

type HarvestLite = {
  id: string;
  title: string;
  subcategory?: string;
  category?: string;
  images?: string[];
  basePrice?: number;
  quantity?: { amount: number; unit: string };
  location?: { address: string };
  quality?: { grade?: string; organic?: boolean; certifications?: string[] };
  farmerName?: string;
};

const key = (userId: string | undefined | null, name: string) => {
  const uid = userId || 'guest';
  return `markit:${uid}:${name}`;
};

function readArray<T>(k: string, fallback: T[] = []): T[] {
  try {
    const raw = localStorage.getItem(k);
    if (!raw) return fallback;
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : fallback;
  } catch {
    return fallback;
  }
}

function writeArray<T>(k: string, value: T[]): void {
  try {
    localStorage.setItem(k, JSON.stringify(value));
  } catch {
    // ignore storage errors
  }
}

// Browsing history (most recent first, unique by id)
export function addToHistory(userId: string | undefined | null, item: HarvestLite, maxItems: number = 50): void {
  const k = key(userId, 'history');
  const list = readArray<HarvestLite>(k);
  const filtered = list.filter(h => h.id !== item.id);
  const next = [{ ...item }, ...filtered].slice(0, maxItems);
  writeArray(k, next);
}

export function getHistory(userId: string | undefined | null): HarvestLite[] {
  return readArray<HarvestLite>(key(userId, 'history'));
}

// Saved listings (favorites)
export function toggleSaved(userId: string | undefined | null, item: HarvestLite): boolean {
  const k = key(userId, 'saved');
  const list = readArray<HarvestLite>(k);
  const exists = list.some(h => h.id === item.id);
  const next = exists ? list.filter(h => h.id !== item.id) : [{ ...item }, ...list];
  writeArray(k, next);
  return !exists;
}

export function isSaved(userId: string | undefined | null, id: string): boolean {
  const k = key(userId, 'saved');
  const list = readArray<HarvestLite>(k);
  return list.some(h => h.id === id);
}

export function getSaved(userId: string | undefined | null): HarvestLite[] {
  return readArray<HarvestLite>(key(userId, 'saved'));
}

// Simple recommendations: based on history and saved subcategories
// Cache recommendations to avoid recalculating on every render
const recommendationCache = new Map<string, { data: HarvestLite[], timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function getRecommendations(
  userId: string | undefined | null,
  allHarvests: HarvestLite[],
  maxItems: number = 12
): HarvestLite[] {
  const uid = userId || 'guest';
  const cacheKey = `${uid}-${allHarvests.length}-${maxItems}`;
  
  // Check cache first
  const cached = recommendationCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const history = getHistory(userId);
  const saved = getSaved(userId);
  const likedSubs = new Set<string>([
    ...history.map(h => h.subcategory).filter(Boolean) as string[],
    ...saved.map(h => h.subcategory).filter(Boolean) as string[],
  ]);

  // Rank by whether subcategory matches, then by recent in allHarvests order
  const ranked = allHarvests
    .filter(h => !history.some(hh => hh.id === h.id))
    .map(h => ({ h, score: likedSubs.has(h.subcategory || '') ? 2 : 0 }))
    .sort((a, b) => b.score - a.score)
    .map(x => x.h)
    .slice(0, maxItems);

  // Cache the result
  recommendationCache.set(cacheKey, { data: ranked, timestamp: Date.now() });
  
  // Clean old cache entries
  if (recommendationCache.size > 10) {
    const now = Date.now();
    for (const [key, value] of recommendationCache.entries()) {
      if (now - value.timestamp > CACHE_TTL) {
        recommendationCache.delete(key);
      }
    }
  }

  return ranked;
}

export type { HarvestLite as UserContentHarvest };



