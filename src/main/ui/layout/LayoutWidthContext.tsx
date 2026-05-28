import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';

/**
 * Holds the *live* full-width state of the currently-mounted space page.
 *
 * The preference itself is owned per-space by the space page (persisted in
 * localStorage keyed by space id — see `useSpaceWidthPreference`). This context
 * only relays that live value upward so the global `Header` (an ancestor of the
 * route outlet) can keep its top bar aligned with a full-width body, exactly
 * the way `BannerOverlayContext` relays the transparent-header signal.
 */
type LayoutWidthContextValue = {
  /** Current full-width value pushed by the active space page. */
  wide: boolean;
  setWide: (value: boolean) => void;
  /** Whether a full-width-capable space page is currently mounted. */
  active: boolean;
  setActive: (value: boolean) => void;
};

const LayoutWidthContext = createContext<LayoutWidthContextValue | null>(null);

export function LayoutWidthProvider({ children }: { children: ReactNode }) {
  // `useState`'s setter is referentially stable, so the enable-on-mount effect
  // and the per-space sync effect stay cheap (same reasoning as
  // BannerOverlayContext).
  const [wide, setWide] = useState(false);
  const [active, setActive] = useState(false);

  const value = { wide, setWide, active, setActive };
  return <LayoutWidthContext.Provider value={value}>{children}</LayoutWidthContext.Provider>;
}

/**
 * The live full-width value + setter. Consumed by the space page, which is the
 * single owner of the (per-space, persisted) preference.
 */
export function useSpaceFullWidthState(): { wide: boolean; setWide: (value: boolean) => void } {
  const ctx = useContext(LayoutWidthContext);
  if (!ctx) throw new Error('useSpaceFullWidthState must be used within LayoutWidthProvider');
  return { wide: ctx.wide, setWide: ctx.setWide };
}

/**
 * Declares that the currently-mounted page is a full-width-capable space page.
 * Exact mirror of `useEnableBannerOverlay` — publish on mount, clear on unmount.
 */
export function useEnableSpaceFullWidth() {
  const ctx = useContext(LayoutWidthContext);
  if (!ctx) throw new Error('useEnableSpaceFullWidth must be used within LayoutWidthProvider');
  const { setActive } = ctx;

  // Publish on mount. The provider's equality guard turns repeated true→true
  // updates into no-ops, so re-renders are cheap.
  useEffect(() => {
    setActive(true);
  }, [setActive]);

  // Clear only on unmount. Kept separate so a re-render doesn't cycle state
  // through [true → false → true].
  useEffect(() => {
    return () => setActive(false);
  }, [setActive]);
}

/** True only when a space page is mounted AND it is currently full-width. */
export function useSpaceFullWidthActive(): boolean {
  const ctx = useContext(LayoutWidthContext);
  if (!ctx) throw new Error('useSpaceFullWidthActive must be used within LayoutWidthProvider');
  return ctx.wide && ctx.active;
}
