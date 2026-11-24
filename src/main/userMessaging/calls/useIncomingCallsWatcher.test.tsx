import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { LiveCall } from './useActiveCallRooms';

const harness = vi.hoisted(() => ({
  conversations: [] as unknown[],
  active: new Map<string, LiveCall>() as ReadonlyMap<string, LiveCall>,
  platformRoles: ['FEATURE_BETA_TESTER'] as string[],
  guidanceVcId: null as string | null,
  querySkip: undefined as boolean | undefined,
  selectedRoomId: null as string | null,
  setRingRooms: vi.fn(),
  summaries: new Map<string, { ringing?: { eventId: string; media: 'voice' | 'video' }; ringAt?: number }>(),
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
vi.mock('../UserMessagingContext', () => ({
  useUserMessagingContext: () => ({ isEnabled: true, selectedRoomId: harness.selectedRoomId }),
}));
vi.mock('./callConfig', () => ({ isCallsConfigured: () => true }));
vi.mock('@/core/matrix/activeClient', () => ({ useMatrixClient: () => ({}) }));
vi.mock('../matrix/conversationSummaryStore', () => ({
  storeFor: () => ({ setRingRooms: harness.setRingRooms }),
  useConversationSummaries: () => harness.summaries,
}));
vi.mock('./useActiveCallRooms', () => ({
  useLiveCalls: (conversations: unknown[]) => {
    harness.conversations = conversations;
    return harness.active;
  },
}));

const othersCall: LiveCall = {
  matrixRoomId: '!r:hs',
  startedTs: 1,
  latestTs: 1,
  withMe: false,
  withMyDevice: false,
  participants: ['ann'],
};
const running = (...roomIds: string[]) => new Map(roomIds.map(roomId => [roomId, othersCall]));

import { getIncomingCallRooms } from './incomingCallStore';
import { useIncomingCallsWatcher } from './useIncomingCallsWatcher';

describe('useIncomingCallsWatcher', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    harness.platformRoles = ['FEATURE_BETA_TESTER'];
    harness.guidanceVcId = 'vc';
    harness.active = new Map();
    harness.selectedRoomId = null;
    harness.summaries = new Map();
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
    expect(harness.setRingRooms).toHaveBeenLastCalledWith(new Set());
  });

  it('makes a ring an entry in the 1:1 conversations with another person only, never in a group', () => {
    renderHook(() => useIncomingCallsWatcher());
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(harness.setRingRooms).toHaveBeenLastCalledWith(new Set(['direct']));
  });

  // From here on: a call dealt with stays dealt with for the rest of the file.
  it('leaves out a call the user is in on any device', () => {
    harness.active = new Map([
      [
        'direct',
        {
          matrixRoomId: '!direct:hs',
          startedTs: 1,
          latestTs: 2,
          withMe: true,
          withMyDevice: false,
          participants: ['ann', 'me'],
        },
      ],
      ['group', othersCall],
    ]);
    renderHook(() => useIncomingCallsWatcher());
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect([...getIncomingCallRooms()]).toEqual([['group', { name: 'Team', isGroup: true }]]);
  });

  it('keeps a 1:1 call while its conversation is open and its ring rings, but counts an open group call as seen', () => {
    // Later than the direct call dealt with above, so a new call.
    harness.active = new Map([
      [
        'direct',
        {
          matrixRoomId: '!direct:hs',
          startedTs: 10,
          latestTs: 10,
          withMe: false,
          withMyDevice: false,
          participants: ['ann'],
        },
      ],
      ['group', othersCall],
    ]);
    harness.selectedRoomId = 'direct';
    harness.summaries = new Map([['direct', { ringing: { eventId: '$ring', media: 'video' as const } }]]);
    const { rerender } = renderHook(() => useIncomingCallsWatcher());
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect([...getIncomingCallRooms()]).toEqual([
      ['direct', { name: 'Ana', isGroup: false }],
      ['group', { name: 'Team', isGroup: true }],
    ]);

    harness.selectedRoomId = 'group';
    rerender();
    expect([...getIncomingCallRooms()]).toEqual([['direct', { name: 'Ana', isGroup: false }]]);
  });

  it('counts an open 1:1 call as seen once its ring has stopped, and not before that ring is known', () => {
    // Later than the calls dealt with above, so a new call.
    const newCall = { ...othersCall, startedTs: 1_000_000, latestTs: 1_000_000 };
    harness.active = new Map([['direct', newCall]]);
    harness.selectedRoomId = 'direct';
    const { rerender } = renderHook(() => useIncomingCallsWatcher());
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect([...getIncomingCallRooms()]).toEqual([['direct', { name: 'Ana', isGroup: false }]]);

    // The summary is known but holds no ring yet, or only an earlier call's: this call's ring has not arrived.
    harness.summaries = new Map([['direct', {}]]);
    rerender();
    expect([...getIncomingCallRooms()]).toEqual([['direct', { name: 'Ana', isGroup: false }]]);
    harness.summaries = new Map([['direct', { ringAt: 999_999 }]]);
    rerender();
    expect([...getIncomingCallRooms()]).toEqual([['direct', { name: 'Ana', isGroup: false }]]);

    // Its ring is ringing.
    harness.summaries = new Map([
      ['direct', { ringing: { eventId: '$ring', media: 'video' as const }, ringAt: 1_000_050 }],
    ]);
    rerender();
    expect([...getIncomingCallRooms()]).toEqual([['direct', { name: 'Ana', isGroup: false }]]);

    // Its ring has stopped.
    harness.summaries = new Map([['direct', { ringAt: 1_000_050 }]]);
    rerender();
    expect([...getIncomingCallRooms()]).toEqual([]);
  });
});
