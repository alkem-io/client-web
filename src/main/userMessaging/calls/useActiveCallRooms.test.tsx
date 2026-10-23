import { EventEmitter } from 'node:events';
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const harness = vi.hoisted(() => ({
  client: null as unknown,
  platformRoles: ['FEATURE_BETA_TESTER'] as string[],
  configured: true,
}));

vi.mock('@/core/matrix/activeClient', () => ({ useMatrixClient: () => harness.client }));
vi.mock('@/domain/community/userCurrent/useCurrentUserContext', () => ({
  useCurrentUserContext: () => ({ platformRoles: harness.platformRoles }),
}));
vi.mock('./callConfig', () => ({ isCallsConfigured: () => harness.configured }));
vi.mock('@/main/userMessaging/matrix/matrixRooms', () => ({
  CLIENT_ROOM: 'Room',
  CLIENT_SYNC: 'sync',
  resolveMatrixRoomId: async (_client: unknown, alkemioRoomId: string) => `!${alkemioRoomId}:hs`,
}));

import { useActiveCallRooms } from './useActiveCallRooms';

const membership = (sender: string, ttlMs: number) => {
  const expiresAt = Date.now() + ttlMs;
  return {
    sender,
    deviceId: 'D',
    isExpired: () => Date.now() >= expiresAt,
    getMsUntilExpiry: () => expiresAt - Date.now(),
  };
};

class FakeSession extends EventEmitter {
  constructor(public memberships: ReturnType<typeof membership>[] = []) {
    super();
  }
}

const makeClient = (sessions: Record<string, FakeSession>) =>
  Object.assign(new EventEmitter(), {
    matrixRTC: Object.assign(new EventEmitter(), {
      getRoomSession: (room: { roomId: string }) => sessions[room.roomId] ?? new FakeSession(),
    }),
    getRoom: (roomId: string) => ({ roomId }),
  });

const conversations = [
  { roomId: 'g1', isGroup: true, isGuidance: false },
  { roomId: 'g2', isGroup: true, isGuidance: false },
  { roomId: 'direct', isGroup: false, isGuidance: false },
];

describe('useActiveCallRooms', () => {
  beforeEach(() => {
    harness.platformRoles = ['FEATURE_BETA_TESTER'];
    harness.configured = true;
  });
  afterEach(() => {
    harness.client = null;
  });

  it('flags the group conversation with a running call', async () => {
    harness.client = makeClient({ '!g1:hs': new FakeSession([membership('@ann:hs', 60_000)]) });
    const { result } = renderHook(() => useActiveCallRooms(conversations));
    await waitFor(() => expect([...result.current]).toEqual(['g1']));
  });

  it('ignores rooms whose only membership has expired', async () => {
    harness.client = makeClient({ '!g1:hs': new FakeSession([membership('@crashed:hs', -1)]) });
    const { result } = renderHook(() => useActiveCallRooms(conversations));
    await act(async () => {});
    expect(result.current.size).toBe(0);
  });

  it('follows a call starting and ending', async () => {
    const session = new FakeSession();
    const client = makeClient({ '!g2:hs': session });
    harness.client = client;
    const { result } = renderHook(() => useActiveCallRooms(conversations));
    await act(async () => {});
    expect(result.current.size).toBe(0);

    act(() => {
      session.memberships = [membership('@ann:hs', 60_000)];
      client.matrixRTC.emit('session_started');
    });
    expect([...result.current]).toEqual(['g2']);

    act(() => {
      session.memberships = [];
      session.emit('memberships_changed');
    });
    expect(result.current.size).toBe(0);
  });

  it('flags nothing for someone who is not a beta tester, or where calls are off', async () => {
    harness.client = makeClient({ '!g1:hs': new FakeSession([membership('@ann:hs', 60_000)]) });
    harness.platformRoles = [];
    const { result } = renderHook(() => useActiveCallRooms(conversations));
    await act(async () => {});
    expect(result.current.size).toBe(0);

    harness.platformRoles = ['FEATURE_BETA_TESTER'];
    harness.configured = false;
    const { result: unconfigured } = renderHook(() => useActiveCallRooms(conversations));
    await act(async () => {});
    expect(unconfigured.current.size).toBe(0);
  });
});
