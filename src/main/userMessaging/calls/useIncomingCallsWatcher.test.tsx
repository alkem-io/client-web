import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ActiveCallRoomsOptions } from './useActiveCallRooms';

const harness = vi.hoisted(() => ({
  options: undefined as ActiveCallRoomsOptions | undefined,
  conversations: [] as unknown[],
  active: new Set<string>() as ReadonlySet<string>,
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
                  { id: 'c2', room: { id: 'group', type: 'CONVERSATION_GROUP' }, members: [] },
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
  useActiveCallRooms: (conversations: unknown[], options: ActiveCallRoomsOptions) => {
    harness.conversations = conversations;
    harness.options = options;
    return harness.active;
  },
}));

import { getIncomingCallRooms } from './incomingCallStore';
import { useIncomingCallsWatcher } from './useIncomingCallsWatcher';

describe('useIncomingCallsWatcher', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    harness.platformRoles = ['FEATURE_BETA_TESTER'];
    harness.guidanceVcId = 'vc';
    harness.active = new Set();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('loads the conversations after the startup delay, then watches them for calls the user is not in and publishes those', () => {
    harness.active = new Set(['group']);
    renderHook(() => useIncomingCallsWatcher());
    expect(harness.querySkip).toBe(true);

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(harness.querySkip).toBe(false);
    expect(harness.options?.withoutMe).toBe(true);
    expect(harness.conversations).toEqual([
      { roomId: 'direct', isGroup: false, isGuidance: false, members: [me, ana] },
      { roomId: 'group', isGroup: true, isGuidance: false, members: [] },
      { roomId: 'guidance', isGroup: true, isGuidance: true, members: [vc] },
    ]);
    expect([...getIncomingCallRooms()]).toEqual([['group', null]]);
  });

  it('publishes the other person as the caller of a direct conversation', () => {
    harness.active = new Set(['direct', 'group']);
    renderHook(() => useIncomingCallsWatcher());
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect([...getIncomingCallRooms()]).toEqual([
      ['direct', 'Ana'],
      ['group', null],
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
});
