import { useLayoutEffect } from 'react';
import { useSpaceFullWidthState } from '@/main/ui/layout/LayoutWidthContext';

// Per-space preference: each space remembers its own expand/collapse choice.
const KEY_PREFIX = 'alkemio-space-width:';

function readWide(spaceId: string): boolean {
  try {
    return localStorage.getItem(`${KEY_PREFIX}${spaceId}`) === 'wide';
  } catch {
    // Private-mode browsers may block localStorage.
    return false;
  }
}

function writeWide(spaceId: string, wide: boolean): void {
  try {
    localStorage.setItem(`${KEY_PREFIX}${spaceId}`, wide ? 'wide' : 'default');
  } catch {
    // Ignore — privacy-mode browsers may block localStorage.
  }
}

/**
 * Owns the full-width preference for a single space. Reads/writes localStorage
 * keyed by `spaceId` and pushes the value into `LayoutWidthContext` so the
 * global header stays aligned with the body.
 *
 * Returns the current value and a `toggle` for the header expand/collapse button.
 */
export function useSpaceWidthPreference(spaceId: string | undefined): {
  wide: boolean;
  toggle: () => void;
} {
  const { wide, setWide } = useSpaceFullWidthState();

  // Sync the live context value from this space's stored preference whenever
  // the space changes. `useLayoutEffect` so the correct width is applied before
  // the browser paints (no centered → wide flash on space load).
  useLayoutEffect(() => {
    setWide(spaceId ? readWide(spaceId) : false);
  }, [spaceId, setWide]);

  const toggle = () => {
    const next = !wide;
    if (spaceId) {
      writeWide(spaceId, next);
    }
    setWide(next);
  };

  return { wide, toggle };
}
