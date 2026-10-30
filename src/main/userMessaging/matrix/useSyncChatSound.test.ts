import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const harness = vi.hoisted(() => ({
  client: null as unknown,
  playSound: vi.fn(),
  selectedRoomId: null as string | null,
  platformRoles: [] as string[],
  callsConfigured: true,
  alkemioRoomIdFor: vi.fn((matrixRoomId: string) => (matrixRoomId === '!conv' ? 'alk-conv' : undefined)),
}));

vi.mock('@/core/matrix/activeClient', () => ({ useMatrixClient: () => harness.client }));
vi.mock('@/core/sound/soundPlayer', () => ({ playSound: harness.playSound }));
vi.mock('@/domain/community/userCurrent/useCurrentUserContext', () => ({
  useCurrentUserContext: () => ({ userModel: { id: 'me' }, platformRoles: harness.platformRoles }),
}));
vi.mock('../calls/callConfig', () => ({ isCallsConfigured: () => harness.callsConfigured }));
vi.mock('../UserMessagingContext', () => ({
  useUserMessagingContext: () => ({ selectedRoomId: harness.selectedRoomId }),
}));
vi.mock('./conversationSummaryStore', () => ({
  storeFor: () => ({ alkemioRoomIdFor: harness.alkemioRoomIdFor }),
}));

import { useSyncChatSound } from './useSyncChatSound';

const makeClient = (initialSyncComplete: boolean) => {
  const handlers = new Map<string, (...args: unknown[]) => void>();
  return {
    getUserId: () => '@me:hs',
    isInitialSyncComplete: () => initialSyncComplete,
    on: (name: string, handler: (...args: unknown[]) => void) => handlers.set(name, handler),
    removeListener: vi.fn(),
    emit: (name: string, ...args: unknown[]) => handlers.get(name)?.(...args),
  };
};

const message = (sender = '@other:hs') => ({ getType: () => 'm.room.message', getSender: () => sender });
const live = { liveEvent: true };

describe('useSyncChatSound', () => {
  beforeEach(() => {
    harness.playSound.mockClear();
    harness.selectedRoomId = null;
    harness.platformRoles = [];
    harness.callsConfigured = true;
    vi.spyOn(document, 'hasFocus').mockReturnValue(true);
  });

  it('plays for a new message from someone else in one of the user’s conversations', () => {
    const client = makeClient(true);
    harness.client = client;
    renderHook(() => useSyncChatSound());

    client.emit('Room.timeline', message(), { roomId: '!conv' }, false, false, live);

    expect(harness.playSound).toHaveBeenCalledWith('chat');
  });

  it('stays silent for own messages, the conversation being viewed, and rooms that are not conversations', () => {
    const client = makeClient(true);
    harness.client = client;
    harness.selectedRoomId = 'alk-conv';
    renderHook(() => useSyncChatSound());

    client.emit('Room.timeline', message('@me:hs'), { roomId: '!other' }, false, false, live);
    client.emit('Room.timeline', message(), { roomId: '!conv' }, false, false, live);
    client.emit('Room.timeline', message(), { roomId: '!unlisted' }, false, false, live);

    expect(harness.playSound).not.toHaveBeenCalled();
  });

  it('never sounds for the initial sync backlog or back-paginated history', () => {
    const client = makeClient(false);
    harness.client = client;
    renderHook(() => useSyncChatSound());

    client.emit('Room.timeline', message(), { roomId: '!conv' }, false, false, live);
    expect(harness.playSound).not.toHaveBeenCalled();

    client.emit('sync', 'PREPARED');
    client.emit('Room.timeline', message(), { roomId: '!conv' }, true, false, live);
    client.emit('Room.timeline', message(), { roomId: '!conv' }, false, false, { liveEvent: false });
    expect(harness.playSound).not.toHaveBeenCalled();

    client.emit('Room.timeline', message(), { roomId: '!conv' }, false, false, live);
    expect(harness.playSound).toHaveBeenCalledOnce();
  });

  it('plays when someone else starts a call, 1:1 or group, for a beta tester where calls are configured', () => {
    const client = makeClient(true);
    harness.client = client;
    harness.platformRoles = ['FEATURE_BETA_TESTER'];
    renderHook(() => useSyncChatSound());
    const callStarted = (sender = '@other:hs') => ({
      getType: () => 'org.matrix.msc4075.rtc.notification',
      getSender: () => sender,
    });

    client.emit('Room.timeline', callStarted('@me:hs'), { roomId: '!conv' }, false, false, live);
    expect(harness.playSound).not.toHaveBeenCalled();

    client.emit('Room.timeline', callStarted(), { roomId: '!conv' }, false, false, live);
    expect(harness.playSound).toHaveBeenCalledWith('chat');
  });

  it('stays silent for a call starting for anyone the call controls are hidden from', () => {
    const client = makeClient(true);
    harness.client = client;
    const { rerender } = renderHook(() => useSyncChatSound());
    const callStarted = { getType: () => 'org.matrix.msc4075.rtc.notification', getSender: () => '@other:hs' };

    client.emit('Room.timeline', callStarted, { roomId: '!conv' }, false, false, live);
    harness.platformRoles = ['FEATURE_BETA_TESTER'];
    harness.callsConfigured = false;
    rerender();
    client.emit('Room.timeline', callStarted, { roomId: '!conv' }, false, false, live);

    expect(harness.playSound).not.toHaveBeenCalled();
  });
});
