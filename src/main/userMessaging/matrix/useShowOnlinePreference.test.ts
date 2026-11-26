import { act, renderHook } from '@testing-library/react';
import { ClientEvent } from 'matrix-js-sdk';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readStoredShowOnline } from '@/core/matrix/showOnlineStorage';

const harness = vi.hoisted(() => ({ client: null as unknown }));

vi.mock('@/core/matrix/activeClient', () => ({ useMatrixClient: () => harness.client }));

import { useShowOnlinePreference } from './useShowOnlinePreference';

const EVENT_TYPE = 'io.alkemio.chat.presence';

type FakeEvent = { getType: () => string; getContent: () => Record<string, unknown> };
const accountDataEvent = (type: string, content: Record<string, unknown>): FakeEvent => ({
  getType: () => type,
  getContent: () => content,
});

const makeClient = (accountData: Record<string, Record<string, unknown>> = {}) => {
  const handlers = new Map<string, (event: FakeEvent) => void>();
  return {
    accountData,
    getSafeUserId: () => '@me:hs',
    getAccountData: (type: string) => (type in accountData ? accountDataEvent(type, accountData[type]) : undefined),
    // As the SDK does: resolves once sync has echoed the change back as an account data event.
    setAccountData: vi.fn(async (type: string, content: Record<string, unknown>) => {
      accountData[type] = content;
      handlers.get(ClientEvent.AccountData)?.(accountDataEvent(type, content));
      return {};
    }),
    setSyncPresence: vi.fn(async () => {}),
    setPresence: vi.fn(() => Promise.resolve()),
    on: vi.fn((name: string, handler: (event: FakeEvent) => void) => handlers.set(name, handler)),
    removeListener: vi.fn((name: string) => handlers.delete(name)),
    emit: (name: string, event: FakeEvent) => handlers.get(name)?.(event),
    listening: (name: string) => handlers.has(name),
  };
};

describe('useShowOnlinePreference', () => {
  beforeEach(() => {
    harness.client = null;
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('applies account data that arrived before it mounted, and leaves the sync alone while there is none', () => {
    const off = makeClient({ [EVENT_TYPE]: { show_online: false } });
    harness.client = off;
    renderHook(() => useShowOnlinePreference());
    expect(off.setSyncPresence).toHaveBeenCalledWith('offline');
    expect(readStoredShowOnline('@me:hs')).toBe(false);

    const none = makeClient();
    harness.client = none;
    renderHook(() => useShowOnlinePreference());
    expect(none.setSyncPresence).not.toHaveBeenCalled();
    expect(readStoredShowOnline('@me:hs')).toBe(false);
  });

  it('is on while the account data is absent or says nothing, and off when it says so', () => {
    harness.client = makeClient();
    expect(renderHook(() => useShowOnlinePreference()).result.current.showOnline).toBe(true);

    harness.client = makeClient({ [EVENT_TYPE]: {} });
    expect(renderHook(() => useShowOnlinePreference()).result.current.showOnline).toBe(true);

    harness.client = makeClient({ [EVENT_TYPE]: { show_online: false } });
    expect(renderHook(() => useShowOnlinePreference()).result.current.showOnline).toBe(false);
  });

  it('is on without a Matrix client', () => {
    expect(renderHook(() => useShowOnlinePreference()).result.current.showOnline).toBe(true);
  });

  it('follows a change made on another device into the sync loop and the stored copy, without sending presence', () => {
    const client = makeClient();
    harness.client = client;
    const { result } = renderHook(() => useShowOnlinePreference());

    act(() => {
      client.accountData[EVENT_TYPE] = { show_online: false };
      client.emit(ClientEvent.AccountData, accountDataEvent(EVENT_TYPE, { show_online: false }));
    });
    expect(result.current.showOnline).toBe(false);
    expect(client.setSyncPresence).toHaveBeenLastCalledWith('offline');
    expect(readStoredShowOnline('@me:hs')).toBe(false);

    act(() => {
      client.accountData[EVENT_TYPE] = { show_online: true };
      client.emit(ClientEvent.AccountData, accountDataEvent(EVENT_TYPE, { show_online: true }));
    });
    expect(result.current.showOnline).toBe(true);
    expect(client.setSyncPresence).toHaveBeenLastCalledWith('online');
    expect(readStoredShowOnline('@me:hs')).toBe(true);

    expect(client.setPresence).not.toHaveBeenCalled();
  });

  it('ignores other account data', () => {
    const client = makeClient();
    harness.client = client;
    renderHook(() => useShowOnlinePreference());

    act(() => {
      client.emit(ClientEvent.AccountData, accountDataEvent('m.direct', {}));
    });

    expect(client.setSyncPresence).not.toHaveBeenCalled();
  });

  it('switching off saves it, syncs offline, and then clears presence and status message once', async () => {
    const client = makeClient();
    harness.client = client;
    const { result } = renderHook(() => useShowOnlinePreference());

    await act(() => result.current.setShowOnline(false));

    expect(client.setAccountData).toHaveBeenCalledWith(EVENT_TYPE, { show_online: false });
    expect(client.setSyncPresence).toHaveBeenCalledWith('offline');
    expect(client.setPresence).toHaveBeenCalledExactlyOnceWith({ presence: 'offline', status_msg: '' });
    expect(client.setSyncPresence.mock.invocationCallOrder[0]).toBeLessThan(
      client.setPresence.mock.invocationCallOrder[0]
    );
    expect(readStoredShowOnline('@me:hs')).toBe(false);
    expect(result.current.showOnline).toBe(false);
  });

  it('switching off waits as a rate-limiting homeserver asks and retries once', async () => {
    const client = makeClient();
    client.setPresence.mockRejectedValueOnce({ errcode: 'M_LIMIT_EXCEEDED', data: { retry_after_ms: 20 } });
    harness.client = client;
    const { result } = renderHook(() => useShowOnlinePreference());

    await act(() => result.current.setShowOnline(false));

    expect(client.setPresence).toHaveBeenCalledTimes(2);
    expect(client.setPresence).toHaveBeenLastCalledWith({ presence: 'offline', status_msg: '' });
  });

  it('does not retry the offline presence once the setting is back on', async () => {
    const client = makeClient();
    client.setPresence.mockRejectedValueOnce({ errcode: 'M_LIMIT_EXCEEDED', data: { retry_after_ms: 30 } });
    harness.client = client;
    const { result } = renderHook(() => useShowOnlinePreference());

    let switchingOff: Promise<void> = Promise.resolve();
    act(() => {
      switchingOff = result.current.setShowOnline(false);
    });
    await act(() => result.current.setShowOnline(true));
    await act(() => switchingOff);

    expect(client.setPresence).toHaveBeenCalledOnce();
    expect(client.setSyncPresence).toHaveBeenLastCalledWith('online');
  });

  it('switching on saves it and syncs online, without sending presence', async () => {
    const client = makeClient({ [EVENT_TYPE]: { show_online: false } });
    harness.client = client;
    const { result } = renderHook(() => useShowOnlinePreference());

    await act(() => result.current.setShowOnline(true));

    expect(client.setAccountData).toHaveBeenCalledWith(EVENT_TYPE, { show_online: true });
    expect(client.setSyncPresence).toHaveBeenLastCalledWith('online');
    expect(client.setPresence).not.toHaveBeenCalled();
    expect(readStoredShowOnline('@me:hs')).toBe(true);
  });

  it('rejects without changing anything when the homeserver refuses, and without a client', async () => {
    const client = makeClient();
    client.setAccountData.mockRejectedValueOnce(new Error('M_FORBIDDEN'));
    harness.client = client;
    const { result, rerender } = renderHook(() => useShowOnlinePreference());

    await expect(result.current.setShowOnline(false)).rejects.toThrow('M_FORBIDDEN');
    expect(client.setSyncPresence).not.toHaveBeenCalled();
    expect(client.setPresence).not.toHaveBeenCalled();
    expect(readStoredShowOnline('@me:hs')).toBe(true);

    harness.client = null;
    rerender();
    await expect(result.current.setShowOnline(false)).rejects.toThrow();
  });

  it('removes its account data listener on unmount', () => {
    const client = makeClient();
    harness.client = client;
    const { unmount } = renderHook(() => useShowOnlinePreference());
    expect(client.listening(ClientEvent.AccountData)).toBe(true);

    unmount();

    expect(client.listening(ClientEvent.AccountData)).toBe(false);
  });
});
