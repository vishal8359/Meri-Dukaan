// src/context/ReelContext.tsx
import React, { createContext, ReactNode, useContext, useState } from "react";

interface ReelSessionState {
  currentReelIndex: number;
  playbackTime: number;
  isPaused: boolean;
  reelId: string | null;
}

interface ReelContextType {
  reelState: ReelSessionState;
  setReelState: (state: Partial<ReelSessionState>) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  clearSession: () => void;
}

const ReelContext = createContext<ReelContextType | undefined>(undefined);

const DEFAULT_STATE: ReelSessionState = {
  currentReelIndex: 0,
  playbackTime: 0,
  isPaused: false,
  reelId: null,
};

export const ReelProvider = ({ children }: { children: ReactNode }) => {
  const [reelState, setReelStateInternal] =
    useState<ReelSessionState>(DEFAULT_STATE);

  const setReelState = (state: Partial<ReelSessionState>) => {
    setReelStateInternal((prev) => ({ ...prev, ...state }));
  };

  const pauseSession = () => {
    setReelStateInternal((prev) => ({ ...prev, isPaused: true }));
  };

  const resumeSession = () => {
    setReelStateInternal((prev) => ({ ...prev, isPaused: false }));
  };

  const clearSession = () => {
    setReelStateInternal(DEFAULT_STATE);
  };

  return (
    <ReelContext.Provider
      value={{
        reelState,
        setReelState,
        pauseSession,
        resumeSession,
        clearSession,
      }}
    >
      {children}
    </ReelContext.Provider>
  );
};

export const useReelSession = () => {
  const context = useContext(ReelContext);
  if (context === undefined) {
    throw new Error("useReelSession must be used within a ReelProvider");
  }
  return context;
};
