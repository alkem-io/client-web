import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { anonymousContext, foundationTestData } from '@/core/foundation/foundationTestData';
import { getNavigationHistory } from '@/core/routing/NavigationHistory';

vi.mock('@/core/i18n/config', () => ({ supportedLngs: ['en', 'nl'] }));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'en', changeLanguage: vi.fn() } }),
  Trans: ({ i18nKey }: { i18nKey: string }) => i18nKey,
}));

import Root from './root';

beforeEach(() => {
  vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
  window.history.replaceState({}, '', '/spaces?view=all#cards');
  vi.stubGlobal(
    'fetch',
    vi.fn(async (_url: RequestInfo | URL, options?: RequestInit) => {
      const body = JSON.parse(String(options?.body));
      const data =
        body.operationName === 'NativeConfiguration'
          ? { config: foundationTestData().config }
          : body.operationName === 'V2Foundation'
            ? foundationTestData()
            : {
                spaces: {
                  __typename: 'SpaceConnection',
                  edges: [],
                  pageInfo: { __typename: 'PageInfo', hasNextPage: false, endCursor: null },
                },
              };
      return new Response(JSON.stringify({ data, extensions: { requestContext: anonymousContext } }), {
        headers: { 'Content-Type': 'application/json' },
      });
    })
  );
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('browser lifecycle mounted by the application root', () => {
  it('records the complete URL and restores scroll on ordinary navigation', async () => {
    render(<Root />);
    await screen.findByRole('banner');
    expect(getNavigationHistory().slice(-1)).toEqual(['/spaces?view=all#cards']);
    expect(window.scrollTo).toHaveBeenLastCalledWith(0, 0);
    window.history.pushState({}, '', '/spaces?view=updated#latest');
    fireEvent.popState(window);
    expect(getNavigationHistory().slice(-1)).toEqual(['/spaces?view=updated#latest']);
    const scrollCalls = vi.mocked(window.scrollTo).mock.calls.length;
    window.history.pushState({ usr: { keepScroll: true } }, '', '/spaces?view=updated#kept');
    fireEvent.popState(window);
    expect(window.scrollTo).toHaveBeenCalledTimes(scrollCalls);
    expect(getNavigationHistory().slice(-1)).toEqual(['/spaces?view=updated#kept']);
  });

  it('shows the retained offline and restored notices without starting another API operation', async () => {
    render(<Root />);
    await screen.findByRole('banner');
    vi.useFakeTimers();
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
    fireEvent.offline(window);
    await act(() => vi.advanceTimersByTimeAsync(3000));
    expect(screen.getByText('onlineStatus.offline')).toBeVisible();
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
    fireEvent.online(window);
    expect(screen.getByText('onlineStatus.restored')).toBeVisible();
    await act(() => vi.advanceTimersByTimeAsync(6000));
    expect(screen.queryByText('onlineStatus.restored')).not.toBeInTheDocument();
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it('reloads the complete current URL after a version message and removes its listener on unmount', async () => {
    const worker = new EventTarget();
    const remove = vi.spyOn(worker, 'removeEventListener');
    const original = Object.getOwnPropertyDescriptor(navigator, 'serviceWorker');
    Object.defineProperty(navigator, 'serviceWorker', { configurable: true, value: worker });
    const view = render(<Root />);
    try {
      await screen.findByRole('banner');
      act(() =>
        worker.dispatchEvent(
          new MessageEvent('message', {
            data: { type: 'NEW_VERSION_AVAILABLE', version: 'newer-deployed-build' },
          })
        )
      );
      expect(screen.getByText('appVersion.message')).toBeVisible();
      const replace = vi.fn();
      vi.stubGlobal('location', { ...window.location, replace });
      fireEvent.click(screen.getByRole('button', { name: 'appVersion.reload' }));
      expect(replace).toHaveBeenCalledExactlyOnceWith('/spaces?view=all#cards');
    } finally {
      view.unmount();
      if (original) Object.defineProperty(navigator, 'serviceWorker', original);
      else Reflect.deleteProperty(navigator, 'serviceWorker');
    }
    expect(remove).toHaveBeenCalledWith('message', expect.any(Function));
    expect(fetch).toHaveBeenCalledTimes(3);
  });
});
