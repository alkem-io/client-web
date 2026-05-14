import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';

type BannerOverlayContextValue = {
  active: boolean;
  setActive: (value: boolean) => void;
};

const BannerOverlayContext = createContext<BannerOverlayContextValue | null>(null);

export function BannerOverlayProvider({ children }: { children: ReactNode }) {
  const [active, setActiveRaw] = useState(false);

  // Shallow-equal guard avoids re-publish cycles when callers re-mount
  // <EnableBannerOverlay /> across renders.
  const setActive = (next: boolean) => {
    setActiveRaw(prev => (prev === next ? prev : next));
  };

  const value = { active, setActive };
  return <BannerOverlayContext.Provider value={value}>{children}</BannerOverlayContext.Provider>;
}

export function useBannerOverlay(): boolean {
  const ctx = useContext(BannerOverlayContext);
  if (!ctx) throw new Error('useBannerOverlay must be used within BannerOverlayProvider');
  return ctx.active;
}

export function useEnableBannerOverlay() {
  const ctx = useContext(BannerOverlayContext);
  if (!ctx) throw new Error('useEnableBannerOverlay must be used within BannerOverlayProvider');
  const { setActive } = ctx;

  // Publish on mount. The provider's equality guard turns repeated true→true
  // updates into no-ops, so re-renders are cheap.
  useEffect(() => {
    setActive(true);
  }, [setActive]);

  // Clear only on unmount. Kept separate from the publish effect so a re-render
  // doesn't cycle state through [true → false → true].
  useEffect(() => {
    return () => setActive(false);
  }, [setActive]);
}
