import { act, renderHook } from '@testing-library/react';
import { UserEvent } from 'matrix-js-sdk';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const harness = vi.hoisted(() => ({ client: null as unknown }));

vi.mock('@/core/matrix/activeClient', () => ({ useMatrixClient: () => harness.client }));

import { useMatrixPresence } from './useMatrixPresence';

type FakeUser = { presence: string; events: { presence?: object } };

const makeClient = (users: Record<string, FakeUser>) => {
  const handlers = new Map<string, () => void>();
  return {
    users,
    getUserId: () => '@me:hs',
    getUser: (userId: string) => users[userId] ?? null,
    on: vi.fn((name: string, handler: () => void) => handlers.set(name, handler)),
    removeListener: vi.fn((name: string) => handlers.delete(name)),
    emit: (name: string) => handlers.get(name)?.(),
    listening: (name: string) => handlers.has(name),
  };
};

// A presence the homeserver sent; the SDK's own default 'offline' carries no event.
const reported = (presence: string): FakeUser => ({ presence, events: { presence: {} } });

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
      ['a', 'online'],
      ['b', 'away'],
      ['c', 'offline'],
      ['d', 'unknown'],
      ['unseen', 'unknown'],
    ]);
  });

  it('reports unknown for everyone without a Matrix client', () => {
    const { result } = renderHook(() => useMatrixPresence(['a']));
    expect(result.current.get('a')).toBe('unknown');
  });

  it('re-renders when a presence event arrives', () => {
    const client = makeClient({ '@a:hs': reported('offline') });
    harness.client = client;
    const { result } = renderHook(() => useMatrixPresence(['a']));
    expect(result.current.get('a')).toBe('offline');

    act(() => {
      client.users['@a:hs'] = reported('online');
      client.emit(UserEvent.Presence);
    });

    expect(result.current.get('a')).toBe('online');
  });

  it('removes its presence listener on unmount', () => {
    const client = makeClient({});
    harness.client = client;
    const { unmount } = renderHook(() => useMatrixPresence(['a']));
    expect(client.listening(UserEvent.Presence)).toBe(true);

    unmount();

    expect(client.removeListener).toHaveBeenCalledWith(UserEvent.Presence, expect.any(Function));
    expect(client.listening(UserEvent.Presence)).toBe(false);
  });
});
