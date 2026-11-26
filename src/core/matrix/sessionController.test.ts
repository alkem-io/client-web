import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getActiveClient, isSessionEstablishing } from './activeClient';
import { stopActiveSession } from './activeSession';
import { establishSession } from './sessionController';

const { createClient, quietSdkLogging } = vi.hoisted(() => ({
  createClient: vi.fn(),
  quietSdkLogging: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('matrix-js-sdk', () => ({
  ClientEvent: { Sync: 'sync' },
  HttpApiEvent: { SessionLoggedOut: 'logout' },
  SyncState: { Prepared: 'PREPARED' },
  createClient,
}));
vi.mock('./sdkLogging', () => ({ quietSdkLogging }));

const base = '/api/matrix';
const access = {
  userId: '@actor:platform.example.test',
  sessionBaseUrl: base,
  expiresAt: '2099-01-01T00:00:00Z',
};

describe('the Matrix platform session', () => {
  beforeEach(() => {
    createClient.mockReset();
    vi.stubGlobal('navigator', {
      locks: {
        request: async (_key: string, _options: object, callback: (lock: object) => Promise<unknown>) =>
          callback({ name: 'tab' }),
      },
    });
  });
  afterEach(() => {
    stopActiveSession();
    vi.unstubAllGlobals();
    sessionStorage.clear();
  });

  it('publishes the one SDK client on PREPARED and stops it through the existing logout hook', async () => {
    const lifetime = new AbortController();
    const callbacks = new Map<string, (state?: string) => void>();
    const discoverRtcTransports = vi.fn();
    const discoverHomeserver = vi.fn();
    const sync = {
      cachedRtcTransports: { start: discoverRtcTransports },
      cachedWellKnown: { start: discoverHomeserver },
      on: vi.fn((event: string, callback: (state?: string) => void) => callbacks.set(event, callback)),
      startClient: vi.fn(async () => {
        sync.cachedRtcTransports.start();
        sync.cachedWellKnown.start();
      }),
      stopClient: vi.fn(),
    };
    createClient
      .mockReturnValueOnce({ whoami: vi.fn().mockResolvedValue({ user_id: access.userId, device_id: 'TAB' }) })
      .mockReturnValueOnce(sync);

    const running = establishSession(base, access, lifetime.signal);
    await vi.waitFor(() => expect(sync.startClient).toHaveBeenCalledOnce());
    expect(discoverRtcTransports).not.toHaveBeenCalled();
    expect(discoverHomeserver).not.toHaveBeenCalled();
    expect(isSessionEstablishing()).toBe(true);
    expect(getActiveClient()).toBe(null);
    callbacks.get('sync')?.('PREPARED');
    expect(getActiveClient()).toBe(sync);
    expect(isSessionEstablishing()).toBe(false);
    expect(createClient.mock.calls[1][0]).toMatchObject({ userId: access.userId, deviceId: 'TAB' });
    expect(createClient.mock.calls[1][0]).not.toHaveProperty('accessToken');

    expect(stopActiveSession()).toBe(true);
    await running;
    expect(getActiveClient()).toBe(null);
    expect(sync.stopClient).toHaveBeenCalledOnce();
  });

  it('rejects an unexpected whoami result before starting sync', async () => {
    createClient.mockReturnValue({
      whoami: vi.fn().mockResolvedValue({ user_id: '@other:platform.example.test', device_id: 'TAB' }),
    });
    await expect(establishSession(base, access, new AbortController().signal)).rejects.toThrow('identity mismatch');
    expect(createClient).toHaveBeenCalledTimes(1);
    expect(getActiveClient()).toBe(null);
    expect(isSessionEstablishing()).toBe(false);
  });
});
