import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ActiveCallRoomsOptions } from './useActiveCallRooms';

const harness = vi.hoisted(() => ({
  options: undefined as ActiveCallRoomsOptions | undefined,
  conversations: [] as unknown[],
  active: new Set<string>() as ReadonlySet<string>,
  selectedRoomId: undefined as string | undefined,
  chatMessage: true,
  platformRoles: ['FEATURE_BETA_TESTER'] as string[],
  playSound: vi.fn(),
  querySkip: undefined as boolean | undefined,
}));

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useUserConversationsUnreadCountQuery: ({ skip }: { skip: boolean }) => {
    harness.querySkip = skip;
    return {
      data: {
        me: {
          conversations: {
            conversations: [
              { id: 'c1', room: { id: 'direct', type: 'CONVERSATION_DIRECT' }, members: [] },
              { id: 'c2', room: { id: 'group', type: 'CONVERSATION_GROUP' }, members: [] },
            ],
          },
        },
      },
    };
  },
}));
vi.mock('@/core/sound/soundPlayer', () => ({ playSound: harness.playSound }));
vi.mock('@/domain/community/userCurrent/useCurrentUserContext', () => ({
  useCurrentUserContext: () => ({
    platformRoles: harness.platformRoles,
    userModel: { settings: { notification: { sound: { chatMessage: harness.chatMessage } } } },
  }),
}));
vi.mock('../UserMessagingContext', () => ({
  useUserMessagingContext: () => ({ isEnabled: true, selectedRoomId: harness.selectedRoomId }),
}));
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
    harness.selectedRoomId = undefined;
    harness.chatMessage = true;
    harness.platformRoles = ['FEATURE_BETA_TESTER'];
    harness.active = new Set();
    harness.playSound.mockClear();
    vi.spyOn(document, 'hasFocus').mockReturnValue(true);
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('watches the 1:1 and group conversations for calls the user is not in, and publishes them', () => {
    harness.active = new Set(['group']);
    renderHook(() => useIncomingCallsWatcher());
    expect(harness.options?.withoutMe).toBe(true);
    expect(harness.conversations).toEqual([
      { roomId: 'direct', isGroup: false, isGuidance: false, members: [] },
      { roomId: 'group', isGroup: true, isGuidance: false, members: [] },
    ]);
    expect([...getIncomingCallRooms()]).toEqual(['group']);
  });

  it('plays the chat sound when a call starts', () => {
    renderHook(() => useIncomingCallsWatcher());
    harness.options?.onStarted?.(['direct']);
    expect(harness.playSound).toHaveBeenCalledWith('chat');
  });

  it('stays silent for the conversation being viewed in a focused tab, or with chat sounds off', () => {
    harness.selectedRoomId = 'direct';
    const { rerender } = renderHook(() => useIncomingCallsWatcher());
    harness.options?.onStarted?.(['direct']);
    expect(harness.playSound).not.toHaveBeenCalled();

    harness.selectedRoomId = undefined;
    harness.chatMessage = false;
    rerender();
    harness.options?.onStarted?.(['direct']);
    expect(harness.playSound).not.toHaveBeenCalled();
  });

  it('watches nothing for someone who is not a beta tester', () => {
    harness.platformRoles = [];
    renderHook(() => useIncomingCallsWatcher());
    expect(harness.querySkip).toBe(true);
    expect(harness.conversations).toEqual([]);
  });
});
