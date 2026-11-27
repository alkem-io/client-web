import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanupVersionUpdateListeners, onVersionUpdate } from './serviceWorker';

/**
 * Page side of the planned-maintenance reload (workspace#126, US5). The worker cannot know a tab's
 * current address after client-side navigation, so the page reloads itself when the worker asks.
 */
const listenForWorkerMessages = () => {
  let handler: (event: MessageEvent) => void = () => {};
  const reload = vi.fn();
  vi.stubGlobal('navigator', {
    serviceWorker: {
      addEventListener: (_type: string, listener: (event: MessageEvent) => void) => {
        handler = listener;
      },
      removeEventListener: vi.fn(),
    },
  });
  vi.stubGlobal('location', { ...window.location, reload });
  const onNewVersion = vi.fn();
  onVersionUpdate(onNewVersion);
  return { send: (data: unknown) => handler({ data } as MessageEvent), reload, onNewVersion };
};

afterEach(() => {
  cleanupVersionUpdateListeners();
  vi.unstubAllGlobals();
});

describe('planned-maintenance message from the service worker', () => {
  it('reloads the tab in place', () => {
    const { send, reload, onNewVersion } = listenForWorkerMessages();

    send({ type: 'MAINTENANCE' });

    expect(reload).toHaveBeenCalledTimes(1);
    expect(onNewVersion).not.toHaveBeenCalled();
  });

  it('does not reload on a new-version message', () => {
    const { send, reload, onNewVersion } = listenForWorkerMessages();

    send({ type: 'NEW_VERSION_AVAILABLE', version: '1.2.0' });

    expect(reload).not.toHaveBeenCalled();
    expect(onNewVersion).toHaveBeenCalledWith('1.2.0');
  });
});
