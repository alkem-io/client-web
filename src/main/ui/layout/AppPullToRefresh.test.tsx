import { act, cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { AppPullToRefresh } from './AppPullToRefresh';

const client = { refetchQueries: vi.fn().mockResolvedValue([]) };

vi.mock('@apollo/client', async importOriginal => ({
  ...(await importOriginal<typeof import('@apollo/client')>()),
  useApolloClient: () => client,
}));

const fire = (target: Element, type: string, clientY?: number) =>
  act(() => {
    const list = clientY === undefined ? [] : [{ clientX: 100, clientY }];
    const ev = new Event(type, { bubbles: true, cancelable: true });
    Object.defineProperty(ev, 'touches', { value: list });
    Object.defineProperty(ev, 'changedTouches', { value: list });
    target.dispatchEvent(ev);
  });

const pull = (target: Element, dy: number) => {
  fire(target, 'touchstart', 100);
  for (let y = 20; y <= dy; y += 20) fire(target, 'touchmove', 100 + y);
  fire(target, 'touchend');
};

const setStandalone = () =>
  vi
    .spyOn(window, 'matchMedia')
    .mockImplementation(query => ({ matches: query === '(display-mode: standalone)', media: query }) as MediaQueryList);

const setOnline = (value: boolean) => Object.defineProperty(navigator, 'onLine', { value, configurable: true });

const setup = () =>
  render(
    <>
      <main id="crd-main-content">
        <p>content</p>
      </main>
      <AppPullToRefresh />
    </>
  );

const content = () => document.querySelector('main p') as Element;
const indicator = () => document.querySelector('[data-slot="pull-to-refresh-indicator"]');

describe('AppPullToRefresh', () => {
  beforeEach(() => {
    client.refetchQueries.mockClear();
    setOnline(true);
    document.documentElement.style.overscrollBehaviorY = 'auto';
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    delete window.Capacitor;
    setOnline(true);
    document.documentElement.style.overscrollBehaviorY = '';
  });

  test('(a) in the app a pull refetches the active queries', () => {
    window.Capacitor = { isNativePlatform: () => true };
    setup();
    pull(content(), 200);
    expect(client.refetchQueries).toHaveBeenCalledTimes(1);
    expect(client.refetchQueries).toHaveBeenCalledWith({ include: 'active' });
  });

  test('(b) outside the app there is no gesture', () => {
    setup();
    expect(indicator()).toBeNull();
    expect(document.documentElement.style.overscrollBehaviorY).toBe('auto');
    pull(content(), 200);
    expect(client.refetchQueries).not.toHaveBeenCalled();
  });

  test('(c) offline at mount there is no gesture', () => {
    window.Capacitor = { isNativePlatform: () => true };
    setOnline(false);
    setup();
    expect(indicator()).toBeNull();
    pull(content(), 200);
    expect(client.refetchQueries).not.toHaveBeenCalled();
  });

  test('(d) going offline removes the gesture and restores overscroll', () => {
    window.Capacitor = { isNativePlatform: () => true };
    setup();
    expect(document.documentElement.style.overscrollBehaviorY).toBe('none');
    setOnline(false);
    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    expect(indicator()).toBeNull();
    expect(document.documentElement.style.overscrollBehaviorY).toBe('auto');
    pull(content(), 200);
    expect(client.refetchQueries).not.toHaveBeenCalled();
  });

  test('(e) in the installed PWA, without Capacitor, a pull refetches the active queries', () => {
    setStandalone();
    setup();
    expect(document.documentElement.style.overscrollBehaviorY).toBe('none');
    pull(content(), 200);
    expect(client.refetchQueries).toHaveBeenCalledTimes(1);
    expect(client.refetchQueries).toHaveBeenCalledWith({ include: 'active' });
  });

  test('(f) offline in the installed PWA there is no gesture', () => {
    setStandalone();
    setOnline(false);
    setup();
    expect(indicator()).toBeNull();
    expect(document.documentElement.style.overscrollBehaviorY).toBe('auto');
    pull(content(), 200);
    expect(client.refetchQueries).not.toHaveBeenCalled();
  });
});
