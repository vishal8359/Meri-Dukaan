// src/hooks/useReelPreloader.ts
/**
 * Custom Hook: useReelPreloader
 * Integrates predictive preloading, multilevel caching, and chunked video
 * playback with minimal setup required
 */

import { preloadOrchestrator } from "@/src/utils/preloadingOrchestrator";
import { useCallback, useEffect, useState } from "react";

interface UseReelPreloaderConfig {
  predictiveDistance?: number; // How many reels ahead to preload (default: 3)
  networkQuality?: "slow" | "medium" | "fast"; // Network quality (default: medium)
}

interface ReelPreloadState {
  isReelReady: (reelId: string) => boolean;
  getMetrics: () => any;
  updateNetworkQuality: (quality: "slow" | "medium" | "fast") => void;
}

export const useReelPreloader = (
  reels: Array<{ _id: string; videoUrl: string }>,
  currentIndex: number,
  config?: UseReelPreloaderConfig,
): ReelPreloadState => {
  const [preloadProgress, setPreloadProgress] = useState<string[]>([]);

  // Initialize preloader with config
  useEffect(() => {
    if (config?.predictiveDistance) {
      preloadOrchestrator.configure({
        predictiveDistance: config.predictiveDistance,
      });
    }

    if (config?.networkQuality) {
      preloadOrchestrator.updateNetworkQuality(config.networkQuality);
    }
  }, [config]);

  // Orchestrate preloading whenever current index or reels change
  useEffect(() => {
    const handlePreloadProgress = (reelId: string, progress: number) => {
      if (progress === 100) {
        setPreloadProgress((prev) => [...new Set([...prev, reelId])]);
      }
    };

    preloadOrchestrator.orchestratePreload(
      reels,
      currentIndex,
      handlePreloadProgress,
    );
  }, [reels, currentIndex]);

  // Callback to check if a reel is ready
  const isReelReady = useCallback(
    (reelId: string): boolean => preloadOrchestrator.isReelReady(reelId),
    [],
  );

  // Callback to get metrics
  const getMetrics = useCallback(() => preloadOrchestrator.getMetrics(), []);

  // Callback to update network quality
  const updateNetworkQuality = useCallback(
    (quality: "slow" | "medium" | "fast") => {
      preloadOrchestrator.updateNetworkQuality(quality);
    },
    [],
  );

  return {
    isReelReady,
    getMetrics,
    updateNetworkQuality,
  };
};

export default useReelPreloader;
