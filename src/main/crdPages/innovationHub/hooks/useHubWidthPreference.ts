import { useLayoutEffect } from 'react';
import { useSpaceFullWidthState } from '@/main/ui/layout/LayoutWidthContext';

// Per-hub preference: each Innovation Hub remembers its own expand/collapse
// choice — mirrors `useSpaceWidthPreference`. Keys are namespaced separately
// so a hub and a space with the same id never collide.
const KEY_PREFIX = 'alkemio-hub-width:';

function readWide(hubId: string): boolean {
  try {
    return localStorage.getItem(`${KEY_PREFIX}${hubId}`) === 'wide';
  } catch {
    // Private-mode browsers may block localStorage.
    return false;
  }
}

function writeWide(hubId: string, wide: boolean): void {
  try {
    localStorage.setItem(`${KEY_PREFIX}${hubId}`, wide ? 'wide' : 'default');
  } catch {
    // Ignore — privacy-mode browsers may block localStorage.
  }
}

/**
 * Owns the full-width preference for a single Innovation Hub. Reads/writes
 * localStorage keyed by `hubId` and pushes the value into `LayoutWidthContext`
 * so the global header stays aligned with the body — same pattern as
 * `useSpaceWidthPreference`.
 *
 * Returns the current value and a `toggle` for the header expand/collapse button.
 */
export function useHubWidthPreference(hubId: string | undefined): {
  wide: boolean;
  toggle: () => void;
} {
  const { wide, setWide } = useSpaceFullWidthState();

  // Sync the live context value from this hub's stored preference whenever
  // the hub changes. `useLayoutEffect` so the correct width is applied before
  // the browser paints (no centered → wide flash on hub load).
  useLayoutEffect(() => {
    setWide(hubId ? readWide(hubId) : false);
  }, [hubId, setWide]);

  const toggle = () => {
    const next = !wide;
    if (hubId) {
      writeWide(hubId, next);
    }
    setWide(next);
  };

  return { wide, toggle };
}
