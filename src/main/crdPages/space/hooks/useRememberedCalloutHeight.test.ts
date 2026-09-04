import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getRememberedCalloutHeight,
  rememberCalloutHeight,
  useRememberedCalloutHeight,
} from './useRememberedCalloutHeight';

/** Minimal ResizeObserver stand-in: records observed elements, lets a test fire the callback. */
class FakeResizeObserver {
  static instances: FakeResizeObserver[] = [];
  observed: Element[] = [];
  disconnected = false;
  constructor(private readonly callback: () => void) {
    FakeResizeObserver.instances.push(this);
  }
  observe(element: Element) {
    this.observed.push(element);
  }
  disconnect() {
    this.disconnected = true;
  }
  fire() {
    this.callback();
  }
}

const element = ({ width, height }: { width: number; height: number }) => {
  const div = document.createElement('div');
  Object.defineProperty(div, 'clientWidth', { value: width });
  Object.defineProperty(div, 'offsetHeight', { value: height });
  return div;
};

/** The observer created by the last `ref(element)` call. */
const lastObserver = () => FakeResizeObserver.instances[FakeResizeObserver.instances.length - 1];

describe('useRememberedCalloutHeight', () => {
  beforeEach(() => {
    sessionStorage.clear();
    FakeResizeObserver.instances = [];
    vi.stubGlobal('ResizeObserver', FakeResizeObserver);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  describe('store', () => {
    it('returns undefined for an unknown callout and the rounded height once remembered', () => {
      expect(getRememberedCalloutHeight('c1', 'feed', 800)).toBeUndefined();

      rememberCalloutHeight('c1', 'feed', 800, 412.6);

      expect(getRememberedCalloutHeight('c1', 'feed', 800)).toBe(413);
    });

    it('isolates heights by variant and by column width bucket, tolerating small width changes', () => {
      rememberCalloutHeight('c1', 'feed', 800, 900);

      expect(getRememberedCalloutHeight('c1', 'compact', 800)).toBeUndefined();
      expect(getRememberedCalloutHeight('c1', 'feed', 600)).toBeUndefined();
      expect(getRememberedCalloutHeight('c1', 'feed', 810)).toBe(900);
    });

    it('ignores non-positive heights and unreadable stored values', () => {
      rememberCalloutHeight('c1', 'feed', 800, 0);
      rememberCalloutHeight('c1', 'feed', 800, -5);
      sessionStorage.setItem('alkemio_callout_height:c2@feed@20', 'tall');

      expect(getRememberedCalloutHeight('c1', 'feed', 800)).toBeUndefined();
      expect(getRememberedCalloutHeight('c2', 'feed', 800)).toBeUndefined();
    });

    it('swallows storage failures', () => {
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('quota');
      });
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('denied');
      });

      expect(() => rememberCalloutHeight('c1', 'feed', 800, 300)).not.toThrow();
      expect(getRememberedCalloutHeight('c1', 'feed', 800)).toBeUndefined();
    });
  });

  describe('hook', () => {
    const column = element({ width: 800, height: 0 });

    const render = (paused = false) =>
      renderHook(({ paused }) => useRememberedCalloutHeight({ calloutId: 'c1', variant: 'feed', paused }), {
        initialProps: { paused },
      });

    it('resolves the remembered height for the mounted column width', () => {
      rememberCalloutHeight('c1', 'feed', 800, 350);
      // The column is measured in a layout effect, so it must be attached by the time the hook commits.
      const { result } = renderHook(() => {
        const hook = useRememberedCalloutHeight({ calloutId: 'c1', variant: 'feed' });
        hook.columnRef(column);
        return hook;
      });

      expect(result.current.height).toBe(350);
    });

    it('has no height until the column is measured', () => {
      rememberCalloutHeight('c1', 'feed', 800, 350);
      const { result } = render();

      expect(result.current.height).toBeUndefined();
    });

    it('observes the mounted card and records its height on every notification', () => {
      const { result } = render();
      const card = element({ width: 800, height: 640 });

      const cleanup = result.current.ref(card);
      const observer = lastObserver();
      expect(observer.observed).toEqual([card]);

      expect(getRememberedCalloutHeight('c1', 'feed', 800)).toBeUndefined();
      observer.fire();
      expect(getRememberedCalloutHeight('c1', 'feed', 800)).toBe(640);

      cleanup?.();
      expect(observer.disconnected).toBe(true);
    });

    it('does not record while paused, and records once unpaused', () => {
      const { result, rerender } = render(true);
      const card = element({ width: 800, height: 640 });
      result.current.ref(card);

      lastObserver().fire();
      expect(getRememberedCalloutHeight('c1', 'feed', 800)).toBeUndefined();

      rerender({ paused: false });

      expect(getRememberedCalloutHeight('c1', 'feed', 800)).toBe(640);
    });
  });
});
