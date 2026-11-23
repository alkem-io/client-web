import { act, renderHook } from '@testing-library/react';
import { UserEvent } from 'matrix-js-sdk';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const harness = vi.hoisted(() => ({ client: null as unknown }));

vi.mock('@/core/matrix/activeClient', () => ({ useMatrixClient: () => harness.client }));

import { useMatrixPresence, useOwnStatusMessage } from './useMatrixPresence';

type FakeUser = { presence: string; events: { presence?: { getContent: () => { status_msg?: string } } } };

const makeClient = (users: Record<string, FakeUser>) => {
  const handlers = new Map<string, () => void>();
  return {
    users,
    getUserId: () => '@me:hs',
    getUser: (userId: string) => users[userId] ?? null,
    setPresence: vi.fn(() => Promise.resolve()),
    on: vi.fn((name: string, handler: () => void) => handlers.set(name, handler)),
    removeListener: vi.fn((name: string) => handlers.delete(name)),
    emit: (name: string) => handlers.get(name)?.(),
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
      client.emit(UserEvent.LastPresenceTs);
    });
    expect(result.current.get('a')).toEqual({ presence: 'online' });

    act(() => {
      client.users['@a:hs'] = reported('online', 'Lunch');
      client.emit(UserEvent.LastPresenceTs);
    });
    expect(result.current.get('a')).toEqual({ presence: 'online', statusMessage: 'Lunch' });
  });

  it('removes its presence listener on unmount', () => {
    const client = makeClient({});
    harness.client = client;
    const { unmount } = renderHook(() => useMatrixPresence(['a']));
    expect(client.listening(UserEvent.LastPresenceTs)).toBe(true);

    unmount();

    expect(client.removeListener).toHaveBeenCalledWith(UserEvent.LastPresenceTs, expect.any(Function));
    expect(client.listening(UserEvent.LastPresenceTs)).toBe(false);
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
      client.emit(UserEvent.LastPresenceTs);
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
