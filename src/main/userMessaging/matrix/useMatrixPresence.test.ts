import { act, renderHook, waitFor } from '@testing-library/react';
import { ClientEvent } from 'matrix-js-sdk';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const harness = vi.hoisted(() => ({ client: null as unknown }));

vi.mock('@/core/matrix/activeClient', () => ({ useMatrixClient: () => harness.client }));

import { useMatrixPresence, useOwnStatusMessage } from './useMatrixPresence';

type FakeUser = { presence: string; events: { presence?: { getContent: () => { status_msg?: string } } } };

type FakeEvent = { getType: () => string };
const presenceEvent: FakeEvent = { getType: () => 'm.presence' };

const makeClient = (
  users: Record<string, FakeUser>,
  accountData: Record<string, unknown> = {},
  firstSyncDone = true
) => {
  const handlers = new Map<string, (event: FakeEvent) => void>();
  return {
    users,
    accountData,
    firstSyncDone,
    isInitialSyncComplete() {
      return this.firstSyncDone;
    },
    getUserId: () => '@me:hs',
    getAccountData: (type: string) => (type in accountData ? { getContent: () => accountData[type] } : undefined),
    getUser: (userId: string) => users[userId] ?? null,
    setPresence: vi.fn(() => Promise.resolve()),
    on: vi.fn((name: string, handler: (event: FakeEvent) => void) => handlers.set(name, handler)),
    removeListener: vi.fn((name: string) => handlers.delete(name)),
    emit: (name: string, event: FakeEvent) => handlers.get(name)?.(event),
    listening: (name: string) => handlers.has(name),
  };
};

// A presence the homeserver sent; the SDK's own default 'offline' carries no event.
const reported = (presence: string, statusMessage?: string): FakeUser => ({
  presence,
  events: { presence: { getContent: () => ({ status_msg: statusMessage }) } },
});

describe('useMatrixPresence', () => {
  beforeEach(() => {
    harness.client = null;
  });

  it('maps online, unavailable and offline, and reports unknown when no presence was received', () => {
    harness.client = makeClient({
      '@a:hs': reported('online'),
      '@b:hs': reported('unavailable'),
      '@c:hs': reported('offline'),
      '@d:hs': { presence: 'offline', events: {} },
    });
    const { result } = renderHook(() => useMatrixPresence(['a', 'b', 'c', 'd', 'unseen']));
    expect([...result.current]).toEqual([
      ['a', { presence: 'online' }],
      ['b', { presence: 'away' }],
      ['c', { presence: 'offline' }],
      ['d', { presence: 'unknown' }],
      ['unseen', { presence: 'unknown' }],
    ]);
  });

  it('reads the trimmed status message from the presence event, and none when it is blank', () => {
    harness.client = makeClient({
      '@a:hs': reported('online', '  In a workshop, back at 3  '),
      '@b:hs': reported('offline', '   '),
    });
    const { result } = renderHook(() => useMatrixPresence(['a', 'b']));
    expect(result.current.get('a')).toEqual({ presence: 'online', statusMessage: 'In a workshop, back at 3' });
    expect(result.current.get('b')).toEqual({ presence: 'offline' });
  });

  it('reports unknown for everyone without a Matrix client', () => {
    const { result } = renderHook(() => useMatrixPresence(['a']));
    expect(result.current.get('a')).toEqual({ presence: 'unknown' });
  });

  it('re-renders when a presence event arrives, including one that only changes the status message', () => {
    const client = makeClient({ '@a:hs': reported('offline') });
    harness.client = client;
    const { result } = renderHook(() => useMatrixPresence(['a']));
    expect(result.current.get('a')).toEqual({ presence: 'offline' });

    act(() => {
      client.users['@a:hs'] = reported('online');
      client.emit(ClientEvent.Event, presenceEvent);
    });
    expect(result.current.get('a')).toEqual({ presence: 'online' });

    act(() => {
      client.users['@a:hs'] = reported('online', 'Lunch');
      client.emit(ClientEvent.Event, presenceEvent);
    });
    expect(result.current.get('a')).toEqual({ presence: 'online', statusMessage: 'Lunch' });
  });

  it('shows nobody a status until the first sync has told us the setting, then shows them', () => {
    const client = makeClient({ '@a:hs': reported('online', 'Lunch') }, {}, false);
    harness.client = client;
    const { result } = renderHook(() => useMatrixPresence(['a']));
    expect(result.current.get('a')).toEqual({ presence: 'unknown' });

    // A presence event that arrives before the setting is known changes nothing.
    act(() => client.emit(ClientEvent.Event, presenceEvent));
    expect(result.current.get('a')).toEqual({ presence: 'unknown' });

    act(() => {
      client.firstSyncDone = true;
      client.emit(ClientEvent.Sync, presenceEvent);
    });
    expect(result.current.get('a')).toEqual({ presence: 'online', statusMessage: 'Lunch' });
  });

  it('keeps showing statuses through a reconnect, once the setting is known', () => {
    const client = makeClient({ '@a:hs': reported('online') });
    harness.client = client;
    const { result } = renderHook(() => useMatrixPresence(['a']));
    expect(result.current.get('a')).toEqual({ presence: 'online' });

    act(() => {
      client.firstSyncDone = false;
      client.emit(ClientEvent.Sync, presenceEvent);
    });
    expect(result.current.get('a')).toEqual({ presence: 'online' });
  });

  it('shows nobody a status while the own setting is off, and follows it live', () => {
    const client = makeClient(
      { '@a:hs': reported('online', 'Lunch') },
      { 'io.alkemio.chat.presence': { show_online: false } }
    );
    harness.client = client;
    const { result } = renderHook(() => useMatrixPresence(['a']));
    expect(result.current.get('a')).toEqual({ presence: 'unknown' });

    act(() => {
      client.accountData['io.alkemio.chat.presence'] = { show_online: true };
      client.emit(ClientEvent.AccountData, presenceEvent);
    });
    expect(result.current.get('a')).toEqual({ presence: 'online', statusMessage: 'Lunch' });

    act(() => {
      client.accountData['io.alkemio.chat.presence'] = { show_online: false };
      client.emit(ClientEvent.AccountData, presenceEvent);
    });
    expect(result.current.get('a')).toEqual({ presence: 'unknown' });
  });

  it('picks up a person the SDK meets for the first time, once they are in its store', () => {
    const client = makeClient({});
    harness.client = client;
    const { result } = renderHook(() => useMatrixPresence(['a']));
    expect(result.current.get('a')).toEqual({ presence: 'unknown' });

    act(() => {
      client.users['@a:hs'] = reported('offline');
      client.emit(ClientEvent.Event, presenceEvent);
    });
    expect(result.current.get('a')).toEqual({ presence: 'offline' });
  });

  it('ignores events that are not presence', () => {
    const client = makeClient({ '@a:hs': reported('offline') });
    harness.client = client;
    const { result } = renderHook(() => useMatrixPresence(['a']));

    act(() => {
      client.users['@a:hs'] = reported('online');
      client.emit(ClientEvent.Event, { getType: () => 'm.room.message' });
    });
    expect(result.current.get('a')).toEqual({ presence: 'offline' });
  });

  it('removes its presence listener on unmount', () => {
    const client = makeClient({});
    harness.client = client;
    const { unmount } = renderHook(() => useMatrixPresence(['a']));
    expect(client.listening(ClientEvent.Event)).toBe(true);

    unmount();

    expect(client.removeListener).toHaveBeenCalledWith(ClientEvent.Event, expect.any(Function));
    expect(client.listening(ClientEvent.Event)).toBe(false);
  });
});

describe('useOwnStatusMessage', () => {
  beforeEach(() => {
    harness.client = null;
  });

  it('reads the signed-in user status message and follows presence events', () => {
    const client = makeClient({ '@me:hs': reported('online', ' Focusing ') });
    harness.client = client;
    const { result } = renderHook(() => useOwnStatusMessage());
    expect(result.current.statusMessage).toBe('Focusing');

    act(() => {
      client.users['@me:hs'] = reported('online');
      client.emit(ClientEvent.Event, presenceEvent);
    });

    expect(result.current.statusMessage).toBe('');
  });

  it('sets the trimmed message while online, and clears it with an empty one', async () => {
    const client = makeClient({});
    harness.client = client;
    const { result } = renderHook(() => useOwnStatusMessage());

    await result.current.setStatusMessage('  In a workshop  ');
    expect(client.setPresence).toHaveBeenLastCalledWith({ presence: 'online', status_msg: 'In a workshop' });

    await result.current.setStatusMessage('');
    expect(client.setPresence).toHaveBeenLastCalledWith({ presence: 'online', status_msg: '' });
  });

  it('caps the message at 100 characters', async () => {
    const client = makeClient({});
    harness.client = client;
    const { result } = renderHook(() => useOwnStatusMessage());

    await result.current.setStatusMessage('x'.repeat(120));

    expect(client.setPresence).toHaveBeenLastCalledWith({ presence: 'online', status_msg: 'x'.repeat(100) });
  });

  it('when the homeserver rate-limits, shows the saved text, waits as told and retries once', async () => {
    const client = makeClient({ '@me:hs': reported('online', 'In a workshop') });
    client.setPresence.mockRejectedValueOnce({ errcode: 'M_LIMIT_EXCEEDED', data: { retry_after_ms: 20 } });
    harness.client = client;
    const { result } = renderHook(() => useOwnStatusMessage());

    let saving: Promise<void> = Promise.resolve();
    act(() => {
      saving = result.current.setStatusMessage('');
    });
    await waitFor(() => expect(result.current.statusMessage).toBe(''));
    await act(() => saving);

    expect(client.setPresence).toHaveBeenCalledTimes(2);
    expect(client.setPresence).toHaveBeenLastCalledWith({ presence: 'online', status_msg: '' });
  });

  it('a save overtaken while it waits on the rate limit neither sends late nor hides the newer text', async () => {
    const client = makeClient({ '@me:hs': reported('online', 'Lunch') });
    client.setPresence.mockRejectedValueOnce({ errcode: 'M_LIMIT_EXCEEDED', data: { retry_after_ms: 30 } });
    harness.client = client;
    const { result } = renderHook(() => useOwnStatusMessage());

    let first: Promise<void> = Promise.resolve();
    let second: Promise<void> = Promise.resolve();
    act(() => {
      first = result.current.setStatusMessage('Old');
    });
    act(() => {
      second = result.current.setStatusMessage('New');
    });
    await act(() => second);
    expect(result.current.statusMessage).toBe('Lunch');
    await act(() => first);

    // The rate-limited 'Old' and the accepted 'New': 'Old' is never retried.
    expect(client.setPresence).toHaveBeenCalledTimes(2);
    expect(client.setPresence).toHaveBeenLastCalledWith({ presence: 'online', status_msg: 'New' });
  });

  it('a save waiting on the rate limit is not retried once "Show when I\'m online" is switched off', async () => {
    const accountData: Record<string, unknown> = {};
    const client = makeClient({ '@me:hs': reported('online', 'Lunch') }, accountData);
    let refuse: (error: unknown) => void = () => {};
    client.setPresence.mockImplementationOnce(
      () =>
        new Promise<void>((_, reject) => {
          refuse = reject;
        })
    );
    harness.client = client;
    const { result } = renderHook(() => useOwnStatusMessage());

    let saving: Promise<void> = Promise.resolve();
    act(() => {
      saving = result.current.setStatusMessage('In a workshop');
    });
    await waitFor(() => expect(client.setPresence).toHaveBeenCalledOnce());
    refuse({ errcode: 'M_LIMIT_EXCEEDED', data: { retry_after_ms: 20 } });
    // Lets the refusal start the wait, so only the check after the wait can stop the retry.
    await new Promise(resolve => setTimeout(resolve, 0));
    accountData['io.alkemio.chat.presence'] = { show_online: false };
    await act(() => saving);

    expect(client.setPresence).toHaveBeenCalledOnce();
  });

  it('sends nothing while "Show when I\'m online" is off, since a status message would say online', async () => {
    const client = makeClient({}, { 'io.alkemio.chat.presence': { show_online: false } });
    harness.client = client;
    const { result } = renderHook(() => useOwnStatusMessage());

    await result.current.setStatusMessage('In a workshop');

    expect(client.setPresence).not.toHaveBeenCalled();
  });

  it('rejects and sends nothing before the first sync is done, while the setting is still unknown', async () => {
    const client = makeClient({}, {}, false);
    harness.client = client;
    const { result } = renderHook(() => useOwnStatusMessage());

    await expect(result.current.setStatusMessage('In a workshop')).rejects.toThrow('Chat is not connected');

    expect(client.setPresence).not.toHaveBeenCalled();
  });

  it('rejects when the homeserver refuses, and without a client', async () => {
    const client = makeClient({});
    client.setPresence.mockRejectedValueOnce(new Error('M_FORBIDDEN'));
    harness.client = client;
    const { result, rerender } = renderHook(() => useOwnStatusMessage());
    await expect(result.current.setStatusMessage('Away')).rejects.toThrow('M_FORBIDDEN');

    harness.client = null;
    rerender();
    expect(result.current.statusMessage).toBe('');
    await expect(result.current.setStatusMessage('Away')).rejects.toThrow();
  });
});
