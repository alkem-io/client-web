import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { LiveCall } from './useActiveCallRooms';

const harness = vi.hoisted(() => ({
  conversations: [] as unknown[],
  active: new Map<string, LiveCall>() as ReadonlyMap<string, LiveCall>,
  platformRoles: ['FEATURE_BETA_TESTER'] as string[],
  guidanceVcId: null as string | null,
  querySkip: undefined as boolean | undefined,
}));

const vc = { id: 'vc', type: 'VIRTUAL_CONTRIBUTOR' };
const me = { id: 'me', type: 'USER', profile: { displayName: 'Me' } };
const ana = { id: 'ana', type: 'USER', profile: { displayName: 'Ana' } };
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useUserConversationsQuery: ({ skip }: { skip: boolean }) => {
    harness.querySkip = skip;
    return {
      data: skip
        ? undefined
        : {
            me: {
              conversations: {
                conversations: [
                  { id: 'c1', room: { id: 'direct', type: 'CONVERSATION_DIRECT' }, members: [me, ana] },
                  { id: 'c2', room: { id: 'group', type: 'CONVERSATION_GROUP', displayName: 'Team' }, members: [] },
                  { id: 'c3', room: { id: 'guidance', type: 'CONVERSATION_GROUP' }, members: [vc] },
                ],
              },
            },
          },
    };
  },
}));
vi.mock('@/domain/community/userCurrent/useCurrentUserContext', () => ({
  useCurrentUserContext: () => ({ platformRoles: harness.platformRoles, userModel: { id: 'me' } }),
}));
vi.mock('@/main/guidance/chatWidget/useGuidanceVcId', () => ({
  useGuidanceVcId: ({ skip }: { skip: boolean }) => ({ guidanceVcId: skip ? null : harness.guidanceVcId }),
}));
vi.mock('../UserMessagingContext', () => ({ useUserMessagingContext: () => ({ isEnabled: true }) }));
vi.mock('./callConfig', () => ({ isCallsConfigured: () => true }));
vi.mock('./useActiveCallRooms', () => ({
  useLiveCalls: (conversations: unknown[]) => {
    harness.conversations = conversations;
    return harness.active;
  },
}));

const othersCall: LiveCall = { startedTs: 1, latestTs: 1, withMe: false };
const running = (...roomIds: string[]) => new Map(roomIds.map(roomId => [roomId, othersCall]));

import { getIncomingCallRooms } from './incomingCallStore';
import { useIncomingCallsWatcher } from './useIncomingCallsWatcher';

describe('useIncomingCallsWatcher', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    harness.platformRoles = ['FEATURE_BETA_TESTER'];
    harness.guidanceVcId = 'vc';
    harness.active = new Map();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('loads the conversations after the startup delay, then watches them for calls the user is not in and publishes those', () => {
    harness.active = running('group');
    renderHook(() => useIncomingCallsWatcher());
    expect(harness.querySkip).toBe(true);

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(harness.querySkip).toBe(false);
    expect(harness.conversations).toEqual([
      { roomId: 'direct', isGroup: false, isGuidance: false, members: [me, ana] },
      { roomId: 'group', isGroup: true, isGuidance: false, members: [] },
      { roomId: 'guidance', isGroup: true, isGuidance: true, members: [vc] },
    ]);
    expect([...getIncomingCallRooms()]).toEqual([['group', { name: 'Team', isGroup: true }]]);
  });

  it('names a direct call after the other person', () => {
    harness.active = running('direct', 'group');
    renderHook(() => useIncomingCallsWatcher());
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect([...getIncomingCallRooms()]).toEqual([
      ['direct', { name: 'Ana', isGroup: false }],
      ['group', { name: 'Team', isGroup: true }],
    ]);
  });

  it('loads and watches nothing for someone who is not a beta tester', () => {
    harness.platformRoles = [];
    renderHook(() => useIncomingCallsWatcher());
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(harness.querySkip).toBe(true);
    expect(harness.conversations).toEqual([]);
  });

  // Last: the call joined here stays dealt with for the rest of the file.
  it('leaves out a call the user is in on any device', () => {
    harness.active = new Map([
      ['direct', { startedTs: 1, latestTs: 2, withMe: true }],
      ['group', othersCall],
    ]);
    renderHook(() => useIncomingCallsWatcher());
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect([...getIncomingCallRooms()]).toEqual([['group', { name: 'Team', isGroup: true }]]);
  });
});
