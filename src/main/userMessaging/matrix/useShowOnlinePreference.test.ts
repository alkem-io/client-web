import { act, renderHook, waitFor } from '@testing-library/react';
import { ClientEvent, SyncState } from 'matrix-js-sdk';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const harness = vi.hoisted(() => ({ client: null as unknown }));

vi.mock('@/core/matrix/activeClient', () => ({ useMatrixClient: () => harness.client }));

import { useShowOnlinePreference } from './useShowOnlinePreference';

const EVENT_TYPE = 'io.alkemio.chat.presence';

type FakeEvent = { getType: () => string; getContent: () => Record<string, unknown> };
const accountDataEvent = (type: string, content: Record<string, unknown>): FakeEvent => ({
  getType: () => type,
  getContent: () => content,
});

const makeClient = (accountData: Record<string, Record<string, unknown>> = {}, firstSyncDone = true) => {
  // biome-ignore lint/suspicious/noExplicitAny: handlers take an account data event or a sync state
  const handlers = new Map<string, (payload: any) => void>();
  const events = new WeakMap<Record<string, unknown>, FakeEvent>();
  return {
    accountData,
    isInitialSyncComplete: () => firstSyncDone,
    // As the SDK's store does: one event per update, replaced by the next.
    getAccountData: (type: string) => {
      const content = accountData[type];
      if (!content) {
        return undefined;
      }
      if (!events.has(content)) {
        events.set(content, accountDataEvent(type, content));
      }
      return events.get(content);
    },
    // As the SDK does: resolves once sync has echoed the change back as an account data event.
    setAccountData: vi.fn(async (type: string, content: Record<string, unknown>) => {
      accountData[type] = content;
      handlers.get(ClientEvent.AccountData)?.(accountDataEvent(type, content));
      return {};
    }),
    setSyncPresence: vi.fn(async () => {}),
    setPresence: vi.fn(() => Promise.resolve()),
    // biome-ignore lint/suspicious/noExplicitAny: as above
    on: vi.fn((name: string, handler: (payload: any) => void) => handlers.set(name, handler)),
    removeListener: vi.fn((name: string) => handlers.delete(name)),
    emit: (name: string, payload: FakeEvent | SyncState) => handlers.get(name)?.(payload),
    listening: (name: string) => handlers.has(name),
  };
};

describe('useShowOnlinePreference', () => {
  beforeEach(() => {
    harness.client = null;
  });

  it('applies the setting at mount when the first sync is already done, absent meaning on', () => {
    const off = makeClient({ [EVENT_TYPE]: { show_online: false } });
    harness.client = off;
    renderHook(() => useShowOnlinePreference());
    expect(off.setSyncPresence).toHaveBeenCalledExactlyOnceWith('offline');

    const none = makeClient();
    harness.client = none;
    renderHook(() => useShowOnlinePreference());
    expect(none.setSyncPresence).toHaveBeenCalledExactlyOnceWith('online');
  });

  it('leaves the offline start alone until the first sync is done, then goes online when nothing is stored', () => {
    const client = makeClient({}, false);
    harness.client = client;
    renderHook(() => useShowOnlinePreference());
    expect(client.setSyncPresence).not.toHaveBeenCalled();

    act(() => client.emit(ClientEvent.Sync, SyncState.Prepared));

    expect(client.setSyncPresence).toHaveBeenCalledExactlyOnceWith('online');
  });

  it('stays offline after the first sync when the setting arrived as off', () => {
    const client = makeClient({}, false);
    harness.client = client;
    const { result } = renderHook(() => useShowOnlinePreference());

    act(() => {
      client.accountData[EVENT_TYPE] = { show_online: false };
      client.emit(ClientEvent.AccountData, accountDataEvent(EVENT_TYPE, { show_online: false }));
      client.emit(ClientEvent.Sync, SyncState.Prepared);
    });

    expect(result.current.showOnline).toBe(false);
    expect(client.setSyncPresence).not.toHaveBeenCalledWith('online');
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

  it('follows a change made on another device into the sync loop, without sending presence', () => {
    const client = makeClient();
    harness.client = client;
    const { result } = renderHook(() => useShowOnlinePreference());

    act(() => {
      client.accountData[EVENT_TYPE] = { show_online: false };
      client.emit(ClientEvent.AccountData, accountDataEvent(EVENT_TYPE, { show_online: false }));
    });
    expect(result.current.showOnline).toBe(false);
    expect(client.setSyncPresence).toHaveBeenLastCalledWith('offline');

    act(() => {
      client.accountData[EVENT_TYPE] = { show_online: true };
      client.emit(ClientEvent.AccountData, accountDataEvent(EVENT_TYPE, { show_online: true }));
    });
    expect(result.current.showOnline).toBe(true);
    expect(client.setSyncPresence).toHaveBeenLastCalledWith('online');

    expect(client.setPresence).not.toHaveBeenCalled();
  });

  it('ignores other account data', () => {
    const client = makeClient();
    harness.client = client;
    renderHook(() => useShowOnlinePreference());
    client.setSyncPresence.mockClear();

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
    let refuse: (error: unknown) => void = () => {};
    client.setPresence.mockImplementationOnce(
      () =>
        new Promise<void>((_, reject) => {
          refuse = reject;
        })
    );
    harness.client = client;
    const { result } = renderHook(() => useShowOnlinePreference());

    let switchingOff: Promise<void> = Promise.resolve();
    act(() => {
      switchingOff = result.current.setShowOnline(false);
    });
    await waitFor(() => expect(client.setPresence).toHaveBeenCalledOnce());
    refuse({ errcode: 'M_LIMIT_EXCEEDED', data: { retry_after_ms: 30 } });
    // Lets the refusal start the wait, so only the check after the wait can stop the retry.
    await new Promise(resolve => setTimeout(resolve, 0));
    await act(() => result.current.setShowOnline(true));
    await act(() => switchingOff);

    expect(client.setPresence).toHaveBeenCalledOnce();
    expect(client.setSyncPresence).toHaveBeenLastCalledWith('online');
  });

  it('switching off puts the setting back on when the presence clear fails', async () => {
    const client = makeClient();
    client.setPresence.mockRejectedValueOnce(new Error('network down'));
    harness.client = client;
    const { result } = renderHook(() => useShowOnlinePreference());

    await act(() => expect(result.current.setShowOnline(false)).rejects.toThrow('network down'));

    expect(client.setAccountData).toHaveBeenLastCalledWith(EVENT_TYPE, { show_online: true });
    expect(result.current.showOnline).toBe(true);
    expect(client.setSyncPresence).toHaveBeenLastCalledWith('online');
  });

  it('a failed presence clear from an earlier switch-off does not undo a later one', async () => {
    const client = makeClient();
    let fail: (error: Error) => void = () => {};
    client.setPresence.mockImplementationOnce(
      () =>
        new Promise<void>((_, reject) => {
          fail = reject;
        })
    );
    harness.client = client;
    const { result } = renderHook(() => useShowOnlinePreference());

    let first: Promise<void> = Promise.resolve();
    act(() => {
      first = result.current.setShowOnline(false);
    });
    await waitFor(() => expect(client.setPresence).toHaveBeenCalledOnce());
    await act(() => result.current.setShowOnline(true));
    await act(() => result.current.setShowOnline(false));
    fail(new Error('network down'));
    await act(() => expect(first).rejects.toThrow('network down'));

    expect(client.setAccountData).toHaveBeenLastCalledWith(EVENT_TYPE, { show_online: false });
    expect(result.current.showOnline).toBe(false);
  });

  it('a failed presence clear does not undo a switch-off made on another device meanwhile', async () => {
    const client = makeClient();
    let fail: (error: Error) => void = () => {};
    client.setPresence.mockImplementationOnce(
      () =>
        new Promise<void>((_, reject) => {
          fail = reject;
        })
    );
    harness.client = client;
    const { result } = renderHook(() => useShowOnlinePreference());

    let switchingOff: Promise<void> = Promise.resolve();
    act(() => {
      switchingOff = result.current.setShowOnline(false);
    });
    await waitFor(() => expect(client.setPresence).toHaveBeenCalledOnce());
    act(() => {
      for (const show_online of [true, false]) {
        client.accountData[EVENT_TYPE] = { show_online };
        client.emit(ClientEvent.AccountData, accountDataEvent(EVENT_TYPE, { show_online }));
      }
    });
    fail(new Error('network down'));
    await act(() => expect(switchingOff).rejects.toThrow('network down'));

    expect(client.setAccountData).toHaveBeenCalledOnce();
    expect(result.current.showOnline).toBe(false);
  });

  it('sends no presence clear when the setting is already back on by the time the save returns', async () => {
    const client = makeClient();
    // Another device switched it on again before this device's save came back.
    client.setAccountData.mockImplementationOnce(async (type: string) => {
      client.accountData[type] = { show_online: true };
      return {};
    });
    harness.client = client;
    const { result } = renderHook(() => useShowOnlinePreference());

    await act(() => result.current.setShowOnline(false));

    expect(client.setPresence).not.toHaveBeenCalled();
  });

  it('switching on saves it and syncs online, without sending presence', async () => {
    const client = makeClient({ [EVENT_TYPE]: { show_online: false } });
    harness.client = client;
    const { result } = renderHook(() => useShowOnlinePreference());

    await act(() => result.current.setShowOnline(true));

    expect(client.setAccountData).toHaveBeenCalledWith(EVENT_TYPE, { show_online: true });
    expect(client.setSyncPresence).toHaveBeenLastCalledWith('online');
    expect(client.setPresence).not.toHaveBeenCalled();
  });

  it('rejects without changing anything when the homeserver refuses, and without a client', async () => {
    const client = makeClient();
    client.setAccountData.mockRejectedValueOnce(new Error('M_FORBIDDEN'));
    harness.client = client;
    const { result, rerender } = renderHook(() => useShowOnlinePreference());

    await expect(result.current.setShowOnline(false)).rejects.toThrow('M_FORBIDDEN');
    expect(client.setSyncPresence).not.toHaveBeenCalledWith('offline');
    expect(client.setPresence).not.toHaveBeenCalled();

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
