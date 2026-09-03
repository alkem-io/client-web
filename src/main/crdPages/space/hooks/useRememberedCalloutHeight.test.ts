import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const STORAGE_KEY = 'alkemio_callout_heights';

type Hook = typeof import('./useRememberedCalloutHeight');

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

const setViewportWidth = (width: number) => {
  Object.defineProperty(window, 'innerWidth', { configurable: true, writable: true, value: width });
};

/** Writes of our key only — the test environment also touches storage. */
const storeWrites = (spy: ReturnType<typeof vi.spyOn>) => spy.mock.calls.filter(([key]) => key === STORAGE_KEY);

/** The store is module-level, so every test gets a fresh module instance. */
const load = async (): Promise<Hook> => {
  vi.resetModules();
  return import('./useRememberedCalloutHeight');
};

describe('useRememberedCalloutHeight store', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    sessionStorage.clear();
    setViewportWidth(1440);
    FakeResizeObserver.instances = [];
    vi.stubGlobal('ResizeObserver', FakeResizeObserver);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('returns undefined for an unknown callout and the rounded height once remembered', async () => {
    const { getRememberedCalloutHeight, rememberCalloutHeight } = await load();

    expect(getRememberedCalloutHeight('c1', 'feed')).toBeUndefined();

    rememberCalloutHeight('c1', 'feed', 412.6);

    expect(getRememberedCalloutHeight('c1', 'feed')).toBe(413);
  });

  it('isolates heights by rendering variant and by viewport width', async () => {
    const { getRememberedCalloutHeight, rememberCalloutHeight } = await load();

    rememberCalloutHeight('c1', 'feed', 900);

    expect(getRememberedCalloutHeight('c1', 'compact')).toBeUndefined();
    setViewportWidth(1024);
    expect(getRememberedCalloutHeight('c1', 'feed')).toBeUndefined();
    setViewportWidth(1440);
    expect(getRememberedCalloutHeight('c1', 'feed')).toBe(900);
  });

  it('ignores non-positive heights', async () => {
    const { getRememberedCalloutHeight, rememberCalloutHeight } = await load();

    rememberCalloutHeight('c1', 'feed', 0);
    rememberCalloutHeight('c1', 'feed', -5);

    expect(getRememberedCalloutHeight('c1', 'feed')).toBeUndefined();
  });

  it('hydrates from sessionStorage, dropping non-numeric entries', async () => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ 'c1@feed@1440': 500, 'c2@feed@1440': 'tall' }));
    const { getRememberedCalloutHeight } = await load();

    expect(getRememberedCalloutHeight('c1', 'feed')).toBe(500);
    expect(getRememberedCalloutHeight('c2', 'feed')).toBeUndefined();
  });

  it('starts empty when the stored value is corrupt', async () => {
    sessionStorage.setItem(STORAGE_KEY, '{not json');
    const { getRememberedCalloutHeight, rememberCalloutHeight } = await load();

    expect(getRememberedCalloutHeight('c1', 'feed')).toBeUndefined();

    rememberCalloutHeight('c1', 'feed', 300);
    vi.runAllTimers();

    expect(JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? '{}')).toEqual({ 'c1@feed@1440': 300 });
  });

  it('coalesces persistence into one write, flushed on pagehide', async () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    // Capture this module instance's own pagehide handler — earlier instances (other
    // tests) leave theirs on `window`, so dispatching the event would count them too.
    const pageHideHandlers: EventListener[] = [];
    vi.spyOn(window, 'addEventListener').mockImplementation((type, handler) => {
      if (type === 'pagehide') pageHideHandlers.push(handler as EventListener);
    });
    const { rememberCalloutHeight } = await load();

    rememberCalloutHeight('c1', 'feed', 100);
    rememberCalloutHeight('c2', 'feed', 200);
    rememberCalloutHeight('c1', 'feed', 150);

    expect(storeWrites(setItem)).toHaveLength(0);

    vi.advanceTimersByTime(250);

    expect(storeWrites(setItem)).toHaveLength(1);
    expect(JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? '{}')).toEqual({
      'c2@feed@1440': 200,
      'c1@feed@1440': 150,
    });

    rememberCalloutHeight('c3', 'feed', 300);
    expect(pageHideHandlers).toHaveLength(1);
    pageHideHandlers[0](new Event('pagehide'));

    expect(storeWrites(setItem)).toHaveLength(2);
    expect(JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? '{}')).toHaveProperty('c3@feed@1440', 300);
  });

  it('does not persist again when the height is unchanged', async () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    const { rememberCalloutHeight } = await load();

    rememberCalloutHeight('c1', 'feed', 100);
    vi.runAllTimers();
    rememberCalloutHeight('c1', 'feed', 100.2);
    vi.runAllTimers();

    expect(storeWrites(setItem)).toHaveLength(1);
  });

  it('evicts the least recently remembered entries past 300', async () => {
    const { getRememberedCalloutHeight, rememberCalloutHeight } = await load();

    for (let index = 0; index < 300; index++) {
      rememberCalloutHeight(`c${index}`, 'feed', 100 + index);
    }
    // Touch the oldest so it becomes the most recent.
    rememberCalloutHeight('c0', 'feed', 999);
    rememberCalloutHeight('c300', 'feed', 400);

    expect(getRememberedCalloutHeight('c0', 'feed')).toBe(999);
    expect(getRememberedCalloutHeight('c1', 'feed')).toBeUndefined();
    expect(getRememberedCalloutHeight('c2', 'feed')).toBe(102);
    expect(getRememberedCalloutHeight('c300', 'feed')).toBe(400);
  });

  describe('ref callback', () => {
    const element = (offsetHeight: number) => {
      const div = document.createElement('div');
      Object.defineProperty(div, 'offsetHeight', { value: offsetHeight });
      return div;
    };

    it('observes the mounted card, records its height and disconnects on cleanup', async () => {
      const { getRememberedCalloutHeight, useRememberedCalloutHeight } = await load();
      const { ref } = useRememberedCalloutHeight({ calloutId: 'c1', variant: 'feed' });

      const cleanup = ref(element(640));
      const [observer] = FakeResizeObserver.instances;
      observer.fire();

      expect(observer.observed).toHaveLength(1);
      expect(getRememberedCalloutHeight('c1', 'feed')).toBe(640);

      cleanup?.();

      expect(observer.disconnected).toBe(true);
    });

    it('does not observe while paused', async () => {
      const { useRememberedCalloutHeight } = await load();
      const { ref } = useRememberedCalloutHeight({ calloutId: 'c1', variant: 'feed', paused: true });

      expect(ref(element(640))).toBeUndefined();
      expect(FakeResizeObserver.instances).toHaveLength(0);
    });

    it('returns the remembered height for the same callout, variant and width', async () => {
      const { rememberCalloutHeight, useRememberedCalloutHeight } = await load();
      rememberCalloutHeight('c1', 'compact', 350);

      expect(useRememberedCalloutHeight({ calloutId: 'c1', variant: 'compact' }).height).toBe(350);
      expect(useRememberedCalloutHeight({ calloutId: 'c1', variant: 'feed' }).height).toBeUndefined();
    });
  });
});
