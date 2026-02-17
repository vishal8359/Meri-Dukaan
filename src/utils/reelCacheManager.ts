// src/utils/reelCacheManager.ts
/**
 * Reel Cache Manager
 * Implements multilevel caching and predictive preloading for optimal performance
 */

interface CachedReel {
  reel: any;
  timestamp: number;
  preloadedChunks: number; // Number of 3-second chunks preloaded
}

interface PreloadQueue {
  reelId: string;
  priority: number;
  timestamp: number;
}

class ReelCacheManager {
  private cache: Map<string, CachedReel> = new Map();
  private preloadQueue: PreloadQueue[] = [];
  private readonly MAX_CACHE_SIZE = 50; // Max reels to keep in memory
  private readonly CACHE_TTL = 30 * 60 * 1000; // 30 minutes
  private readonly PRELOAD_AHEAD_COUNT = 3; // Preload 3 reels ahead

  /**
   * Get a reel from cache
   */
  getFromCache(reelId: string): any | null {
    const cached = this.cache.get(reelId);
    if (!cached) return null;

    // Check if cache is expired
    if (Date.now() - cached.timestamp > this.CACHE_TTL) {
      this.cache.delete(reelId);
      return null;
    }

    return cached.reel;
  }

  /**
   * Add a reel to cache
   */
  addToCache(reelId: string, reel: any): void {
    // Implement LRU (Least Recently Used) eviction
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      let oldestKey: string | null = null;
      let oldestTime: number = Date.now();

      for (const [key, value] of this.cache.entries()) {
        if (value.timestamp < oldestTime) {
          oldestTime = value.timestamp;
          oldestKey = key;
        }
      }

      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(reelId, {
      reel,
      timestamp: Date.now(),
      preloadedChunks: 1, // First chunk (3 seconds) is preloaded
    });
  }

  /**
   * Add reels to preload queue
   */
  queueForPreload(reels: Array<{ _id: string }>, currentIndex: number): void {
    this.preloadQueue = [];

    // Queue the next PRELOAD_AHEAD_COUNT reels with priority
    for (let i = 1; i <= this.PRELOAD_AHEAD_COUNT; i++) {
      const reelIndex = currentIndex + i;
      if (reelIndex < reels.length) {
        this.preloadQueue.push({
          reelId: reels[reelIndex]._id,
          priority: i, // 1 = highest priority (next reel), 2 = lower, etc.
          timestamp: Date.now(),
        });
      }
    }
  }

  /**
   * Get next reel to preload
   */
  getNextPreloadReel(): string | null {
    if (this.preloadQueue.length === 0) return null;

    // Sort by priority (lower priority number = higher priority)
    this.preloadQueue.sort((a, b) => a.priority - b.priority);

    const nextReel = this.preloadQueue.shift();
    return nextReel?.reelId || null;
  }

  /**
   * Clear all cache
   */
  clearCache(): void {
    this.cache.clear();
    this.preloadQueue = [];
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      cachedReels: this.cache.size,
      queuedForPreload: this.preloadQueue.length,
      memoryUsage: `~${(this.cache.size * 2).toFixed(2)}MB`, // Rough estimate
    };
  }

  /**
   * Update preload progress for a reel
   */
  updatePreloadedChunks(reelId: string, chunks: number): void {
    const cached = this.cache.get(reelId);
    if (cached) {
      cached.preloadedChunks = chunks;
    }
  }

  /**
   * Check if a reel is already in cache
   */
  isCached(reelId: string): boolean {
    return this.cache.has(reelId) && this.getFromCache(reelId) !== null;
  }
}

// Singleton instance
export const reelCache = new ReelCacheManager();

export default reelCache;
