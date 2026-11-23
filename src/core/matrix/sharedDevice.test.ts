import { afterEach, describe, expect, it, vi } from 'vitest';
import { askOtherTabs, localpartOf, withCredentialLock } from './sharedDevice';
import type { CredentialRecord } from './storage';

describe('sharedDevice', () => {
  afterEach(() => {
    vi.useRealTimers();
    Reflect.deleteProperty(navigator, 'locks');
  });

  it('derives the same lock owner from the actor id and the Matrix user id', () => {
    expect(localpartOf('@abc-123:matrix.alkem.io')).toBe('abc-123');
    expect(localpartOf('@ABC-123:matrix.alkem.io')).toBe('abc-123');
  });

  it('runs the task directly where the browser has no Web Locks', async () => {
    await expect(withCredentialLock('abc', async () => 'ran')).resolves.toBe('ran');
  });

  it('a sign-out does not wait on a lock another tab never releases', async () => {
    vi.useFakeTimers();
    Object.defineProperty(navigator, 'locks', {
      configurable: true,
      value: {
        // Held elsewhere for good: the request is only ever settled by its abort signal.
        request: (_name: string, options: { signal: AbortSignal }) =>
          new Promise((_resolve, reject) =>
            options.signal.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')))
          ),
      },
    });

    const result = withCredentialLock('abc', async () => 'cleared', 3000);
    await vi.advanceTimersByTimeAsync(3000);

    await expect(result).resolves.toBe('cleared');
  });

  it("adopts another tab's answer only when it is a complete credential of the same user", async () => {
    // The answering tab runs its own copy of the module, as another tab would.
    vi.resetModules();
    const otherTab = await import('./sharedDevice');
    const answering: CredentialRecord = {
      userId: '@abc:hs',
      deviceId: 'D',
      accessToken: 't',
      homeserverUrl: 'https://hs',
    };
    let running = answering;
    const stop = otherTab.listenToOtherTabs('abc', {
      running: () => running,
      onDeviceChanged: () => undefined,
      onSignedOut: () => undefined,
    });
    try {
      await expect(askOtherTabs('abc', new AbortController().signal)).resolves.toEqual(answering);
      running = { ...answering, userId: '@someone-else:hs' };
      await expect(askOtherTabs('abc', new AbortController().signal)).resolves.toBeNull();
      running = { ...answering, accessToken: '' };
      await expect(askOtherTabs('abc', new AbortController().signal)).resolves.toBeNull();
    } finally {
      stop();
    }
  });
});
