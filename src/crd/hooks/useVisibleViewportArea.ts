import { useEffect, useState } from 'react';

type VisibleViewportArea = { top: number; height: number };

/**
 * The part of the layout viewport that is actually visible, for a full-screen
 * `position: fixed` surface. The on-screen keyboard shrinks the visual viewport
 * but not the layout viewport a fixed element is pinned to, so anything at the
 * bottom of such a surface would sit behind the keyboard. Following the visual
 * viewport keeps it on screen.
 *
 * Returns `undefined` while disabled, and in browsers without `visualViewport`.
 */
export function useVisibleViewportArea(enabled: boolean): VisibleViewportArea | undefined {
  const [area, setArea] = useState<VisibleViewportArea>();

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!enabled || !viewport) {
      return;
    }
    const update = () => setArea({ top: viewport.offsetTop, height: viewport.height });
    update();
    viewport.addEventListener('resize', update);
    viewport.addEventListener('scroll', update);
    return () => {
      viewport.removeEventListener('resize', update);
      viewport.removeEventListener('scroll', update);
      // Otherwise the next session would start from this one's area until it measures.
      setArea(undefined);
    };
  }, [enabled]);

  // The area measured while enabled is stale once the surface is no longer full screen.
  return enabled ? area : undefined;
}
