import { act, render } from '@testing-library/react';
import { createElement } from 'react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { useElementWidth } from './useElementWidth';

// The global test-setup ResizeObserver stub (src/setupTests.ts) never calls its callback —
// it exists only so components that construct one don't throw in jsdom. To test the
// ResizeObserver-driven update path here we need a controllable double whose callback we
// can fire on demand.
class ControllableResizeObserver {
  static instances: ControllableResizeObserver[] = [];
  callback: ResizeObserverCallback;
  observed: Element | null = null;
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
    ControllableResizeObserver.instances.push(this);
  }
  observe(el: Element) {
    this.observed = el;
  }
  unobserve() {
    this.observed = null;
  }
  disconnect() {
    this.observed = null;
  }
  /**
   * Fire the callback the way a browser does: `borderBoxSize` carries the border
   * box, `contentRect` the (narrower) content box. Pass `borderBoxSize: false` to
   * mimic an entry without it.
   */
  fire(borderWidth: number, { borderBoxSize = true, contentWidth = borderWidth - 2 } = {}) {
    const entry = {
      target: this.observed,
      contentRect: { width: contentWidth },
      borderBoxSize: borderBoxSize ? [{ inlineSize: borderWidth, blockSize: 0 }] : undefined,
    } as unknown as ResizeObserverEntry;
    this.callback([entry], this as unknown as ResizeObserver);
  }
}

function TestComponent({ onWidth }: { onWidth: (w: number | undefined) => void }) {
  const [width, ref] = useElementWidth();
  onWidth(width);
  return createElement('div', { ref });
}

/** Never attaches the ref to a DOM node, so the hook's `node` stays null and it never measures. */
function TestComponentNoRef({ onWidth }: { onWidth: (w: number | undefined) => void }) {
  const [width] = useElementWidth();
  onWidth(width);
  return null;
}

/** The element's untransformed border box, as layout reports it — what the hook measures first. */
function mockOffsetWidth(width: number) {
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(width);
}

/** The element's on-screen box, which includes CSS transforms (e.g. a dialog's `scale(0.95)` zoom-in). */
function mockTransformedRectWidth(width: number) {
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
    width,
    height: 0,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    x: 0,
    y: 0,
    toJSON: () => {},
  });
}

describe('useElementWidth', () => {
  let originalResizeObserver: typeof ResizeObserver;

  beforeEach(() => {
    originalResizeObserver = globalThis.ResizeObserver;
    ControllableResizeObserver.instances = [];
    globalThis.ResizeObserver = ControllableResizeObserver as unknown as typeof ResizeObserver;
  });

  afterEach(() => {
    globalThis.ResizeObserver = originalResizeObserver;
    vi.restoreAllMocks();
  });

  test('returns undefined before measurement', () => {
    // The hook's ref is never attached to a DOM node, so it never measures
    // and width stays undefined.
    let latest: number | undefined = -1;
    render(createElement(TestComponentNoRef, { onWidth: (w: number | undefined) => (latest = w) }));
    expect(latest).toBeUndefined();
  });

  test('reports the observed width when the ResizeObserver callback fires', () => {
    let latest: number | undefined;
    render(createElement(TestComponent, { onWidth: (w: number | undefined) => (latest = w) }));
    expect(ControllableResizeObserver.instances).toHaveLength(1);
    act(() => {
      ControllableResizeObserver.instances[0].fire(742);
    });
    expect(latest).toBe(742);
  });

  test('the observer reads the border box, the same box as the synchronous first measurement', () => {
    // A bordered element measured 521 (border box) synchronously must not become
    // 519 (content box) on the observer's first notification — that would flip a
    // card sitting at the row/stacked threshold one frame after it painted.
    mockOffsetWidth(521);
    let latest: number | undefined;
    render(createElement(TestComponent, { onWidth: (w: number | undefined) => (latest = w) }));
    expect(latest).toBe(521);
    act(() => {
      ControllableResizeObserver.instances[0].fire(521, { contentWidth: 519 });
    });
    expect(latest).toBe(521);
  });

  test("falls back to the element's border box when an entry carries no borderBoxSize", () => {
    mockOffsetWidth(640);
    let latest: number | undefined;
    render(createElement(TestComponent, { onWidth: (w: number | undefined) => (latest = w) }));
    act(() => {
      ControllableResizeObserver.instances[0].fire(999, { borderBoxSize: false, contentWidth: 638 });
    });
    expect(latest).toBe(640);
  });

  test('disconnects on unmount', () => {
    const { unmount } = render(createElement(TestComponent, { onWidth: () => {} }));
    const instance = ControllableResizeObserver.instances[0];
    expect(instance.observed).not.toBeNull();
    unmount();
    expect(instance.observed).toBeNull();
  });

  test('with offsetWidth mocked to 800, the value is 800 synchronously after render() — no awaited tick, no observer callback needed', () => {
    mockOffsetWidth(800);
    let latest: number | undefined;
    render(createElement(TestComponent, { onWidth: (w: number | undefined) => (latest = w) }));
    expect(latest).toBe(800);
  });

  test("the first measurement ignores CSS transforms, matching the observer's untransformed border box", () => {
    // Inside the detail dialog's zoom-in (`scale(0.95)`), a 530px card reads 503.5px
    // on screen. Measuring the transformed box on frame 1 would paint the stacked
    // layout, then flip to the row layout once the observer reports 530.
    mockOffsetWidth(530);
    mockTransformedRectWidth(503.5);
    let latest: number | undefined;
    render(createElement(TestComponent, { onWidth: (w: number | undefined) => (latest = w) }));
    expect(latest).toBe(530);
  });
});
