// src/utils/preloadingOrchestrator.ts
/**
 * Preloading Orchestrator
 * Coordinates predictive preloading, multilevel caching, and chunked video playback
 * for optimal performance and minimal latency
 */

import { reelCache } from "./reelCacheManager";
import {
    getAdaptiveChunkDuration,
    preloadNextReel,
} from "./videoLoadingOptimizer";

interface PreloadConfig {
  predictiveDistance: number; // How many reels ahead to preload (1-5)
  chunkSize: number; // Size of video chunks in seconds
  cacheSize: number; // Max number of reels to cache
  networkQuality: "slow" | "medium" | "fast";
}

const DEFAULT_CONFIG: PreloadConfig = {
  predictiveDistance: 3, // Preload next 3 reels
  chunkSize: 3, // 3-second chunks
  cacheSize: 50, // Maximum 50 reels in memory
  networkQuality: "medium",
};

class PreloadingOrchestrator {
  private config: PreloadConfig;
  private preloadingInProgress: Set<string> = new Set();
  private preloadMetrics = {
    totalPreloaded: 0,
    cacheHits: 0,
    cacheMisses: 0,
  };

  constructor(config?: Partial<PreloadConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Orchestrate preloading for a list of reels at a specific position
   * Handles caching, predictive preloading, and adaptive chunk loading
   */
  async orchestratePreload(
    reels: Array<{ _id: string; videoUrl: string }>,
    currentIndex: number,
    onProgress?: (reelId: string, progress: number) => void,
  ): Promise<void> {
    if (currentIndex < 0 || currentIndex >= reels.length) return;

    // Add current reel to cache
    const currentReel = reels[currentIndex];
    if (!reelCache.isCached(currentReel._id)) {
      reelCache.addToCache(currentReel._id, currentReel);
      this.preloadMetrics.cacheMisses++;
    } else {
      this.preloadMetrics.cacheHits++;
    }

    // Queue reels for predictive preloading
    reelCache.queueForPreload(reels, currentIndex);

    // Start preloading ahead
    this.startPredictivePreload(reels, currentIndex, onProgress);
  }

  /**
   * Start preloading reels ahead of current position
   * Respects predictiveDistance configuration
   */
  private async startPredictivePreload(
    reels: Array<{ _id: string; videoUrl: string }>,
    currentIndex: number,
    onProgress?: (reelId: string, progress: number) => void,
  ): Promise<void> {
    const endIndex = Math.min(
      currentIndex + this.config.predictiveDistance,
      reels.length,
    );

    for (let i = currentIndex + 1; i < endIndex; i++) {
      const reel = reels[i];

      // Skip if already preloading
      if (this.preloadingInProgress.has(reel._id)) continue;

      // Skip if already cached
      if (reelCache.isCached(reel._id)) {
        onProgress?.(reel._id, 100);
        continue;
      }

      this.preloadingInProgress.add(reel._id);

      try {
        // Preload the first chunk (3 seconds)
        await preloadNextReel(reel.videoUrl);
        reelCache.addToCache(reel._id, reel);
        this.preloadMetrics.totalPreloaded++;
        onProgress?.(reel._id, 100);
      } catch (error) {
        console.warn(`Failed to preload reel ${reel._id}:`, error);
        onProgress?.(reel._id, 0);
      } finally {
        this.preloadingInProgress.delete(reel._id);
      }
    }
  }

  /**
   * Get adaptive chunk duration based on network quality
   */
  getChunkDuration(): number {
    return getAdaptiveChunkDuration(this.config.networkQuality);
  }

  /**
   * Update network quality dynamically
   * Useful for responding to network changes
   */
  updateNetworkQuality(quality: "slow" | "medium" | "fast"): void {
    this.config.networkQuality = quality;
    console.log(`Preloading quality adjusted to: ${quality}`);
  }

  /**
   * Check if a reel is ready to play (cached and preloaded)
   */
  isReelReady(reelId: string): boolean {
    return reelCache.isCached(reelId);
  }

  /**
   * Get preload statistics
   */
  getMetrics() {
    const cacheStats = reelCache.getStats();
    return {
      ...this.preloadMetrics,
      cacheStats,
      config: this.config,
    };
  }

  /**
   * Clear all preload state and cache
   */
  reset(): void {
    reelCache.clearCache();
    this.preloadingInProgress.clear();
    this.preloadMetrics = {
      totalPreloaded: 0,
      cacheHits: 0,
      cacheMisses: 0,
    };
  }

  /**
   * Configure preloading behavior
   */
  configure(config: Partial<PreloadConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

// Singleton instance
export const preloadOrchestrator = new PreloadingOrchestrator();

export default preloadOrchestrator;
