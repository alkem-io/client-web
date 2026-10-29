import { EventEmitter } from 'node:events';
import type { MatrixClient } from 'matrix-js-sdk';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { watchLiveMemberships } from './matrixRtc';

vi.mock('@/main/userMessaging/matrix/matrixRooms', () => ({ CLIENT_ROOM: 'Room' }));

const membership = (ttlMs: number) => {
  const expiresAt = Date.now() + ttlMs;
  return {
    sender: '@ann:hs',
    deviceId: 'D',
    isExpired: () => Date.now() >= expiresAt,
    getMsUntilExpiry: () => expiresAt - Date.now(),
  };
};

const makeClient = (memberships: ReturnType<typeof membership>[]) => {
  const session = Object.assign(new EventEmitter(), { memberships });
  return Object.assign(new EventEmitter(), {
    matrixRTC: Object.assign(new EventEmitter(), { getRoomSession: () => session }),
    getRoom: (roomId: string) => ({ roomId }),
  }) as unknown as MatrixClient;
};

describe('watchLiveMemberships', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('re-evaluates when the nearest membership expires', () => {
    const onChange = vi.fn();
    const stop = watchLiveMemberships(makeClient([membership(60_000)]), ['!g:hs'], onChange);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.lastCall?.[0].get('!g:hs')).toHaveLength(1);

    vi.advanceTimersByTime(60_000);
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange.mock.lastCall?.[0].get('!g:hs')).toHaveLength(0);
    stop();
  });

  it('does not spin on a membership whose expiry is further away than a timer can wait', () => {
    const onChange = vi.fn();
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    const stop = watchLiveMemberships(makeClient([membership(thirtyDays)]), ['!g:hs'], onChange);

    vi.advanceTimersByTime(1_000);
    expect(onChange).toHaveBeenCalledTimes(1);
    stop();
  });
});
