import { Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MAIN_CONTENT_ID } from '@/crd/lib/mainContent';
import { cn } from '@/crd/lib/utils';

const PULL_SLOP_PX = 10;
export const PULL_MAX_PX = 128;
const PULL_THRESHOLD_PX = 64;
const MIN_SPIN_MS = 600;
const MAX_SPIN_MS = 10_000;
const INDICATOR_PX = 40;

/** Rubber band: the indicator travels raw·MAX/(raw+MAX), never reaching MAX. */
export const resistPull = (raw: number): number => (raw <= 0 ? 0 : (raw * PULL_MAX_PX) / (raw + PULL_MAX_PX));

type Phase = 'idle' | 'pulling' | 'refreshing';

type PullToRefreshProps = {
  /** Called on an armed release. The indicator spins until it settles (min 600 ms, max 10 s). */
  onRefresh: () => Promise<unknown>;
};

const wait = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

/** Whether a touch on `target` may start a pull — spec FR-006, cheapest checks first. */
const canStartPull = (target: EventTarget | null): boolean => {
  if (!(target instanceof Element) || window.scrollY > 0) return false;
  const main = document.getElementById(MAIN_CONTENT_ID);
  if (!main?.contains(target) || target.closest('[contenteditable="true"]')) return false;
  for (let el: Element | null = target; el && el !== main; el = el.parentElement) {
    const { overflowY, position } = getComputedStyle(el);
    // Inline drawers, their backdrops and the inline fixed bottom bars live inside <main>
    // (the subspace flow tabs bar is portaled to <body>, so it already fails the <main> check).
    if (position === 'fixed') return false;
    // 1 px tolerance: a strip whose content pokes out by a pixel is not a scroller.
    if ((overflowY === 'auto' || overflowY === 'scroll') && el.scrollHeight - el.clientHeight > 1) return false;
  }
  return true;
};

/**
 * Pull to refresh: a one-finger downward drag from the top of the page shows a disc under
 * the header and, released past the threshold, calls `onRefresh`. The page content never
 * moves. Gesture model: 10 px slop, then the drag locks to vertical or gives up; the disc
 * travels a rubber band capped below 128 px and arms at 64 px; the spin lasts at least
 * 600 ms and at most 10 s. Dragging back to the start, the page scrolling, a second finger
 * or a touchcancel ends the pull without a refresh.
 *
 * Every exclusion is structural: a touch outside `<main>`, below a `position: fixed`
 * ancestor inside `<main>`, inside an overflowing inner scroller, on editable content,
 * with more than one finger, or while the page is not at the top never starts a pull.
 *
 * The disc is decorative; a visually hidden status announces the refresh. Under reduced
 * motion the disc does not spin or animate.
 *
 * Listeners are passive. Mounting turns the gesture on and switches off the native
 * overscroll feedback; unmounting restores both.
 */
export function PullToRefresh({ onRefresh }: PullToRefreshProps) {
  const { t } = useTranslation('crd-common');
  const [phase, setPhase] = useState<Phase>('idle');
  const [offset, setOffset] = useState(0);
  const onRefreshRef = useRef(onRefresh);
  useEffect(() => {
    onRefreshRef.current = onRefresh;
  });

  useEffect(() => {
    const root = document.documentElement;
    const savedOverscroll = root.style.overscrollBehaviorY;
    root.style.overscrollBehaviorY = 'none';

    let tracking = false;
    let pulling = false;
    let refreshing = false;
    let startX = 0;
    let startY = 0;
    let current = 0;

    const cancel = () => {
      pulling = false;
      tracking = false;
      current = 0;
      setOffset(0);
      setPhase('idle');
    };

    const refresh = async () => {
      refreshing = true;
      setOffset(PULL_THRESHOLD_PX);
      setPhase('refreshing');
      const settled = onRefreshRef.current().then(
        () => {},
        () => {}
      );
      await Promise.race([Promise.all([settled, wait(MIN_SPIN_MS)]), wait(MAX_SPIN_MS)]);
      refreshing = false;
      setOffset(0);
      setPhase('idle');
    };

    const onTouchStart = (e: TouchEvent) => {
      if (refreshing) return;
      // Every touch starts clean: the end of the previous one never reaches `window` when its
      // target was removed from the page mid-touch.
      cancel();
      if (e.touches.length !== 1 || !canStartPull(e.target)) return;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      tracking = true;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!tracking) return;
      if (e.touches.length !== 1) {
        cancel();
        return;
      }
      const dx = e.touches[0].clientX - startX;
      const dy = e.touches[0].clientY - startY;
      if (!pulling) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) < PULL_SLOP_PX) return;
        if (dy <= Math.abs(dx)) {
          tracking = false;
          return;
        }
        pulling = true;
      }
      if (dy <= 0 || window.scrollY > 0) {
        cancel();
        return;
      }
      current = resistPull(dy);
      setOffset(current);
      setPhase('pulling');
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!pulling) {
        tracking = false;
        return;
      }
      // The page may have scrolled since the last move; a pull only counts at the top.
      const armed = e.type === 'touchend' && current >= PULL_THRESHOLD_PX && window.scrollY <= 0;
      cancel();
      if (armed) void refresh();
    };

    const options = { passive: true };
    window.addEventListener('touchstart', onTouchStart, options);
    window.addEventListener('touchmove', onTouchMove, options);
    window.addEventListener('touchend', onTouchEnd, options);
    window.addEventListener('touchcancel', onTouchEnd, options);
    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
      root.style.overscrollBehaviorY = savedOverscroll;
    };
  }, []);

  const progress = Math.min(offset / PULL_THRESHOLD_PX, 1);
  return (
    <div className="pointer-events-none fixed inset-x-0 top-16 z-40 flex justify-center">
      <div
        data-slot="pull-to-refresh-indicator"
        data-state={phase}
        aria-hidden="true"
        className={cn(
          'flex size-10 items-center justify-center rounded-full border border-border bg-card shadow-lg',
          phase !== 'pulling' && 'transition-[transform,opacity] duration-200 motion-reduce:transition-none'
        )}
        style={{ transform: `translateY(${offset - INDICATOR_PX}px)`, opacity: progress }}
      >
        <Loader2
          className={cn('size-5 text-primary', phase === 'refreshing' && 'animate-spin motion-reduce:animate-none')}
        />
      </div>
      {/* Always mounted, so screen readers announce the text when it appears. */}
      <output className="sr-only">{phase === 'refreshing' ? t('loading') : ''}</output>
    </div>
  );
}
