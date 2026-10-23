import { EventEmitter } from 'node:events';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const harness = vi.hoisted(() => ({ client: null as unknown }));
vi.mock('@/core/matrix/activeClient', () => ({ useMatrixClient: () => harness.client }));

import { useRoomCallSession } from './useRoomCallSession';

const ROOM = '!call:hs';
const ME = '@me:hs';
const MY_DEVICE = 'MYDEVICE';

type FakeMembership = {
  sender: string;
  deviceId: string;
  expiresAt: number;
  isExpired(): boolean;
  getMsUntilExpiry(): number;
};

const membership = (sender: string, deviceId: string, ttlMs: number): FakeMembership => {
  const expiresAt = Date.now() + ttlMs;
  return {
    sender,
    deviceId,
    expiresAt,
    isExpired: () => Date.now() >= expiresAt,
    getMsUntilExpiry: () => expiresAt - Date.now(),
  };
};

class FakeSession extends EventEmitter {
  memberships: FakeMembership[] = [];
  setMemberships(next: FakeMembership[]) {
    this.memberships = next;
    this.emit('memberships_changed');
  }
}

const makeClient = (session: FakeSession) => {
  const rtc = new EventEmitter();
  const client = Object.assign(new EventEmitter(), {
    matrixRTC: Object.assign(rtc, { getRoomSession: vi.fn(() => session) }),
    getRoom: vi.fn((roomId: string) => (roomId === ROOM ? { roomId } : null)),
    getUserId: () => ME,
    getDeviceId: () => MY_DEVICE,
  });
  return client;
};

describe('useRoomCallSession', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    harness.client = null;
  });

  it('counts users, not devices: two devices of one user are one participant', () => {
    const session = new FakeSession();
    session.memberships = [membership('@ann:hs', 'A1', 60_000), membership('@ann:hs', 'A2', 60_000)];
    harness.client = makeClient(session);

    const { result } = renderHook(() => useRoomCallSession(ROOM));
    expect(result.current).toEqual({ participants: ['@ann:hs'], participantCount: 1, isJoinedHere: false });
  });

  it('never counts an expired membership', () => {
    const session = new FakeSession();
    session.memberships = [membership('@crashed:hs', 'C1', -1)];
    harness.client = makeClient(session);

    const { result } = renderHook(() => useRoomCallSession(ROOM));
    expect(result.current.participantCount).toBe(0);
  });

  it('follows membership changes', () => {
    const session = new FakeSession();
    harness.client = makeClient(session);
    const { result } = renderHook(() => useRoomCallSession(ROOM));
    expect(result.current.participantCount).toBe(0);

    act(() => session.setMemberships([membership('@ann:hs', 'A1', 60_000), membership('@bob:hs', 'B1', 60_000)]));
    expect(result.current.participantCount).toBe(2);

    act(() => session.setMemberships([]));
    expect(result.current.participantCount).toBe(0);
  });

  it('drops a membership when it expires, without any event', () => {
    const session = new FakeSession();
    session.memberships = [membership('@ann:hs', 'A1', 5_000), membership('@bob:hs', 'B1', 60_000)];
    harness.client = makeClient(session);

    const { result } = renderHook(() => useRoomCallSession(ROOM));
    expect(result.current.participantCount).toBe(2);

    act(() => vi.advanceTimersByTime(5_000));
    expect(result.current.participants).toEqual(['@bob:hs']);

    act(() => vi.advanceTimersByTime(55_000));
    expect(result.current.participantCount).toBe(0);
  });

  it('knows when this tab’s own device is in the call', () => {
    const session = new FakeSession();
    session.memberships = [membership(ME, 'OTHERTAB', 60_000)];
    harness.client = makeClient(session);
    const { result } = renderHook(() => useRoomCallSession(ROOM));
    expect(result.current.isJoinedHere).toBe(false);

    act(() => session.setMemberships([membership(ME, MY_DEVICE, 60_000)]));
    expect(result.current.isJoinedHere).toBe(true);
  });

  it('shows no call without a room or a client', () => {
    harness.client = makeClient(new FakeSession());
    const { result } = renderHook(() => useRoomCallSession(null));
    expect(result.current).toEqual({ participants: [], participantCount: 0, isJoinedHere: false });

    harness.client = null;
    const { result: noClient } = renderHook(() => useRoomCallSession(ROOM));
    expect(noClient.current.participantCount).toBe(0);
  });

  it('picks up a session that starts after mounting', () => {
    const session = new FakeSession();
    const client = makeClient(session);
    client.getRoom.mockReturnValueOnce(null);
    harness.client = client;
    const { result } = renderHook(() => useRoomCallSession(ROOM));
    expect(result.current.participantCount).toBe(0);

    session.memberships = [membership('@ann:hs', 'A1', 60_000)];
    act(() => {
      client.matrixRTC.emit('session_started');
    });
    expect(result.current.participantCount).toBe(1);
  });

  it('unsubscribes everything on unmount', () => {
    const session = new FakeSession();
    session.memberships = [membership('@ann:hs', 'A1', 60_000)];
    const client = makeClient(session);
    harness.client = client;
    const { unmount } = renderHook(() => useRoomCallSession(ROOM));
    unmount();
    expect(session.listenerCount('memberships_changed')).toBe(0);
    expect(client.matrixRTC.listenerCount('session_started')).toBe(0);
    expect(client.matrixRTC.listenerCount('session_ended')).toBe(0);
    expect(client.listenerCount('Room')).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
  });
});
