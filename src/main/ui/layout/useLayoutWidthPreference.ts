import { useLayoutEffect } from 'react';
import { useSpaceFullWidthState } from '@/main/ui/layout/LayoutWidthContext';

// Single, app-wide layout-width preference shared across all spaces, subspaces
// and innovation hubs. One key — expanding/collapsing the layout anywhere is
// remembered everywhere, the same way the subspace sidebar (`menuState`) and
// the dashboard view (`dashboardView`) are single global keys.
const STORAGE_KEY = 'alkemio-layout-width';

function readWide(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'wide';
  } catch {
    // Private-mode browsers may block localStorage.
    return false;
  }
}

function writeWide(wide: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY, wide ? 'wide' : 'default');
  } catch {
    // Ignore — privacy-mode browsers may block localStorage.
  }
}

/**
 * Owns the app-wide full-width preference and pushes the value into
 * `LayoutWidthContext` so the global header stays aligned with the body. The
 * preference is shared across every full-width-capable page (spaces, subspaces,
 * innovation hubs) under one localStorage key.
 *
 * Returns the current value and a `toggle` for the header expand/collapse button.
 */
export function useLayoutWidthPreference(): {
  wide: boolean;
  toggle: () => void;
} {
  const { wide, setWide } = useSpaceFullWidthState();

  // Initialize the live context value from the stored preference on mount.
  // `useLayoutEffect` so the correct width is applied before the browser paints
  // (no centered → wide flash on page load).
  useLayoutEffect(() => {
    setWide(readWide());
  }, [setWide]);

  const toggle = () => {
    const next = !wide;
    writeWide(next);
    setWide(next);
  };

  return { wide, toggle };
}
