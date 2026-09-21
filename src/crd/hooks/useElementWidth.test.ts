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
  fire(width: number) {
    this.callback([{ contentRect: { width } } as ResizeObserverEntry], this as unknown as ResizeObserver);
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
    // The hook's ref is never attached to a DOM node, so getBoundingClientRect never runs
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

  test('disconnects on unmount', () => {
    const { unmount } = render(createElement(TestComponent, { onWidth: () => {} }));
    const instance = ControllableResizeObserver.instances[0];
    expect(instance.observed).not.toBeNull();
    unmount();
    expect(instance.observed).toBeNull();
  });

  test('with getBoundingClientRect mocked to 800, the value is 800 synchronously after render() — no awaited tick, no observer callback needed', () => {
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
      width: 800,
      height: 0,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      x: 0,
      y: 0,
      toJSON: () => {},
    });
    let latest: number | undefined;
    render(createElement(TestComponent, { onWidth: (w: number | undefined) => (latest = w) }));
    expect(latest).toBe(800);
  });
});
