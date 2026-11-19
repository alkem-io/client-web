import { act, cleanup, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { PULL_MAX_PX, PullToRefresh, resistPull } from './PullToRefresh';

type Point = { clientX: number; clientY: number };

const fire = (target: Element, type: string, list: Point[]) =>
  act(() => {
    const ev = new Event(type, { bubbles: true, cancelable: true });
    Object.defineProperty(ev, 'touches', { value: list });
    Object.defineProperty(ev, 'changedTouches', { value: list });
    target.dispatchEvent(ev);
  });

const at = (dx: number, dy: number): Point[] => [{ clientX: 100 + dx, clientY: 100 + dy }];

const pull = (target: Element, dy: number, { dx = 0, end = 'touchend' }: { dx?: number; end?: string } = {}) => {
  fire(target, 'touchstart', at(0, 0));
  const steps = Math.max(1, Math.ceil(Math.abs(dy) / 20));
  for (let i = 1; i <= steps; i++) fire(target, 'touchmove', at((dx * i) / steps, (dy * i) / steps));
  fire(target, end, []);
};

const moveTo = (target: Element, dy: number) => {
  fire(target, 'touchstart', at(0, 0));
  for (let y = 20; y <= dy; y += 20) fire(target, 'touchmove', at(0, y));
};

const deferred = () => {
  let resolve!: () => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

const advance = (ms: number) =>
  act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });

const setScrollY = (value: number) => Object.defineProperty(window, 'scrollY', { value, configurable: true });

const state = () => document.querySelector('[data-slot="pull-to-refresh-indicator"]')?.getAttribute('data-state');

const setup = (inMain: ReactNode, onRefresh = vi.fn(() => new Promise<void>(() => {}))) => {
  render(
    <>
      <main id="crd-main-content">{inMain}</main>
      <p data-testid="outside">outside</p>
      <PullToRefresh onRefresh={onRefresh} />
    </>
  );
  return onRefresh;
};

const target = () => document.querySelector('[data-testid="target"]') as Element;

describe('PullToRefresh', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    setScrollY(0);
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    setScrollY(0);
    document.documentElement.style.overscrollBehaviorY = '';
  });

  test('(a) an armed pull refreshes and spins for at least 600 ms', async () => {
    const d = deferred();
    const onRefresh = setup(
      <p data-testid="target">content</p>,
      vi.fn(() => d.promise)
    );
    pull(target(), 200);
    expect(state()).toBe('refreshing');
    expect(onRefresh).toHaveBeenCalledTimes(1);
    await advance(100);
    await act(async () => d.resolve());
    await advance(499);
    expect(state()).toBe('refreshing');
    await advance(1);
    expect(state()).toBe('idle');
  });

  test('(a2) the indicator waits for onRefresh to settle', async () => {
    const d = deferred();
    setup(
      <p data-testid="target">content</p>,
      vi.fn(() => d.promise)
    );
    pull(target(), 200);
    await advance(1999);
    expect(state()).toBe('refreshing');
    await act(async () => d.resolve());
    await advance(1);
    expect(state()).toBe('idle');
  });

  test('(b) a short pull does not refresh', () => {
    const onRefresh = setup(<p data-testid="target">content</p>);
    pull(target(), 60);
    expect(onRefresh).not.toHaveBeenCalled();
    expect(state()).toBe('idle');
  });

  test('(c) dragging back below the threshold does not refresh', () => {
    const onRefresh = setup(<p data-testid="target">content</p>);
    moveTo(target(), 200);
    for (let y = 180; y >= 40; y -= 20) fire(target(), 'touchmove', at(0, y));
    fire(target(), 'touchend', []);
    expect(onRefresh).not.toHaveBeenCalled();
  });

  test('(c2) the page scrolling during a pull cancels it', () => {
    const onRefresh = setup(<p data-testid="target">content</p>);
    moveTo(target(), 200);
    expect(state()).toBe('pulling');
    setScrollY(10);
    fire(target(), 'touchmove', at(0, 210));
    expect(state()).toBe('idle');
    fire(target(), 'touchend', []);
    expect(onRefresh).not.toHaveBeenCalled();
  });

  test('(c3) moving above the start point cancels the pull', () => {
    const onRefresh = setup(<p data-testid="target">content</p>);
    moveTo(target(), 200);
    fire(target(), 'touchmove', at(0, -5));
    expect(state()).toBe('idle');
    fire(target(), 'touchend', []);
    expect(onRefresh).not.toHaveBeenCalled();
  });

  test('(d) a horizontal first move locks the gesture out', () => {
    const onRefresh = setup(<p data-testid="target">content</p>);
    fire(target(), 'touchstart', at(0, 0));
    fire(target(), 'touchmove', at(40, 10));
    for (let y = 20; y <= 200; y += 20) {
      fire(target(), 'touchmove', at(40, y));
      expect(state()).not.toBe('pulling');
    }
    fire(target(), 'touchend', []);
    expect(onRefresh).not.toHaveBeenCalled();
  });

  test('(e) a touch that starts mid-page never pulls, even once the page reaches the top', () => {
    const onRefresh = setup(<div data-testid="target">content</div>);
    setScrollY(100);
    fire(target(), 'touchstart', at(0, 0));
    setScrollY(0);
    for (let y = 20; y <= 200; y += 20) fire(target(), 'touchmove', at(0, y));
    fire(target(), 'touchend', []);
    expect(onRefresh).not.toHaveBeenCalled();
    expect(state()).toBe('idle');
  });

  test('(c4) a page that scrolled after the last move does not refresh on release', () => {
    const onRefresh = setup(<div data-testid="target">content</div>);
    moveTo(target(), 200);
    setScrollY(10);
    fire(target(), 'touchend', []);
    expect(onRefresh).not.toHaveBeenCalled();
    expect(state()).toBe('idle');
  });

  test('(s2) a status announces the refresh, and only while it runs', async () => {
    const refresh = deferred();
    setup(
      <div data-testid="target">content</div>,
      vi.fn(() => refresh.promise)
    );
    const status = () => document.querySelector('output')?.textContent;
    expect(status()).toBe('');
    pull(target(), 200);
    expect(status()).not.toBe('');
    refresh.resolve();
    await advance(600);
    expect(status()).toBe('');
  });

  test('(e3) a pull whose end was lost does not turn the next tap into a refresh', () => {
    const onRefresh = setup(<div data-testid="target">content</div>);
    moveTo(target(), 200);
    setScrollY(100);
    fire(target(), 'touchstart', at(0, 0));
    expect(state()).toBe('idle');
    fire(target(), 'touchend', []);
    expect(onRefresh).not.toHaveBeenCalled();
  });

  test('(e2) an iOS bounce (negative scrollY) still counts as the top', () => {
    const onRefresh = setup(<p data-testid="target">content</p>);
    setScrollY(-20);
    pull(target(), 200);
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  test('(f) no gesture outside <main>', () => {
    const onRefresh = setup(<p>content</p>);
    pull(document.querySelector('[data-testid="outside"]') as Element, 200);
    expect(onRefresh).not.toHaveBeenCalled();
  });

  const scroller = (overflowY: 'auto' | 'scroll', scrollHeight: number, clientHeight: number) => (
    <div
      style={{ overflowY }}
      ref={el => {
        if (!el) return;
        Object.defineProperty(el, 'scrollHeight', { value: scrollHeight, configurable: true });
        Object.defineProperty(el, 'clientHeight', { value: clientHeight, configurable: true });
      }}
    >
      <p data-testid="target">content</p>
    </div>
  );

  test('(h) no gesture inside an overflowing auto scroller', () => {
    const onRefresh = setup(scroller('auto', 500, 100));
    pull(target(), 200);
    expect(onRefresh).not.toHaveBeenCalled();
  });

  test('(h) no gesture inside an overflowing scroll scroller', () => {
    const onRefresh = setup(scroller('scroll', 500, 100));
    pull(target(), 200);
    expect(onRefresh).not.toHaveBeenCalled();
  });

  test('(h) a 1 px overflow is not a scroller', () => {
    const onRefresh = setup(scroller('auto', 101, 100));
    pull(target(), 200);
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  test('(i) no gesture on editable content', () => {
    const onRefresh = setup(
      <div contentEditable="true" suppressContentEditableWarning={true}>
        <p data-testid="target">content</p>
      </div>
    );
    pull(target(), 200);
    expect(onRefresh).not.toHaveBeenCalled();
  });

  test('(u) no gesture inside a fixed element within <main>', () => {
    const onRefresh = setup(
      <div style={{ position: 'fixed' }}>
        <p data-testid="target">content</p>
      </div>
    );
    pull(target(), 200);
    expect(onRefresh).not.toHaveBeenCalled();
  });

  test('(u) a sticky element stays pullable', () => {
    const onRefresh = setup(
      <div style={{ position: 'sticky' }}>
        <p data-testid="target">content</p>
      </div>
    );
    pull(target(), 200);
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  test('(j0) a two-finger sequence never pulls', () => {
    const onRefresh = setup(<p data-testid="target">content</p>);
    const two = (dy: number): Point[] => [
      { clientX: 100, clientY: 100 + dy },
      { clientX: 200, clientY: 100 + dy },
    ];
    fire(target(), 'touchstart', two(0));
    for (let y = 20; y <= 200; y += 20) {
      fire(target(), 'touchmove', two(y));
      expect(state()).not.toBe('pulling');
    }
    fire(target(), 'touchend', []);
    expect(onRefresh).not.toHaveBeenCalled();
  });

  test('(j) a second finger landing during a pull cancels it', () => {
    const onRefresh = setup(<p data-testid="target">content</p>);
    moveTo(target(), 200);
    fire(target(), 'touchstart', [...at(0, 200), { clientX: 200, clientY: 100 }]);
    expect(state()).toBe('idle');
    fire(target(), 'touchend', []);
    expect(onRefresh).not.toHaveBeenCalled();
  });

  test('(j2) a two-finger move during a pull cancels it', () => {
    const onRefresh = setup(<p data-testid="target">content</p>);
    moveTo(target(), 200);
    fire(target(), 'touchmove', [...at(0, 210), { clientX: 200, clientY: 100 }]);
    expect(state()).toBe('idle');
    fire(target(), 'touchend', []);
    expect(onRefresh).not.toHaveBeenCalled();
  });

  test('(m) a refresh in progress ignores new pulls and second fingers', () => {
    const onRefresh = setup(<p data-testid="target">content</p>);
    pull(target(), 200);
    pull(target(), 200);
    expect(onRefresh).toHaveBeenCalledTimes(1);
    fire(target(), 'touchstart', [...at(0, 0), { clientX: 200, clientY: 100 }]);
    expect(state()).toBe('refreshing');
  });

  test('(n) a rejected refresh is swallowed and retracts after 600 ms', async () => {
    setup(
      <p data-testid="target">content</p>,
      vi.fn(() => Promise.reject(new Error('network')))
    );
    pull(target(), 200);
    await advance(599);
    expect(state()).toBe('refreshing');
    await advance(1);
    expect(state()).toBe('idle');
  });

  test('(o) a refresh that never settles retracts after 10 s', async () => {
    const onRefresh = setup(<p data-testid="target">content</p>);
    pull(target(), 200);
    await advance(9999);
    expect(state()).toBe('refreshing');
    await advance(1);
    expect(state()).toBe('idle');
    pull(target(), 200);
    expect(onRefresh).toHaveBeenCalledTimes(2);
  });

  test('(p) touchcancel never refreshes', () => {
    const onRefresh = setup(<p data-testid="target">content</p>);
    pull(target(), 200, { end: 'touchcancel' });
    expect(onRefresh).not.toHaveBeenCalled();
    expect(state()).toBe('idle');
  });

  test('(q) overscroll-behavior-y is turned off while mounted and restored after', () => {
    document.documentElement.style.overscrollBehaviorY = 'auto';
    const { unmount } = render(<PullToRefresh onRefresh={vi.fn()} />);
    expect(document.documentElement.style.overscrollBehaviorY).toBe('none');
    unmount();
    expect(document.documentElement.style.overscrollBehaviorY).toBe('auto');
  });

  test('(r) resistPull is a rubber band below PULL_MAX_PX', () => {
    expect(resistPull(0)).toBe(0);
    expect(resistPull(128)).toBe(64);
    expect(resistPull(100)).toBeGreaterThan(resistPull(50));
    expect(resistPull(10_000)).toBeLessThan(PULL_MAX_PX);
  });

  test('(s) the indicator is hidden from assistive technology', () => {
    setup(<p data-testid="target">content</p>);
    expect(document.querySelector('[data-slot="pull-to-refresh-indicator"]')).toHaveAttribute('aria-hidden', 'true');
  });
});
