import { EventEmitter } from 'node:events';
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const harness = vi.hoisted(() => ({
  client: null as unknown,
  platformRoles: ['FEATURE_BETA_TESTER'] as string[] | undefined,
  configured: true,
  resolve: vi.fn(async (_client: unknown, alkemioRoomId: string): Promise<string | null> => `!m-${alkemioRoomId}:hs`),
}));

vi.mock('@/core/matrix/activeClient', () => ({ useMatrixClient: () => harness.client }));
vi.mock('@/domain/community/userCurrent/useCurrentUserContext', () => ({
  useCurrentUserContext: () => ({ platformRoles: harness.platformRoles }),
}));
vi.mock('./callConfig', () => ({ isCallsConfigured: () => harness.configured }));
vi.mock('@/main/userMessaging/matrix/matrixRooms', () => ({
  CLIENT_SYNC: 'sync',
  resolveMatrixRoomId: harness.resolve,
}));

import { useCallEligibility } from './useCallEligibility';

const group = { roomId: 'alk-group', isGroup: true, isGuidance: false };

const makeClient = (syncState: string | null = 'SYNCING') => {
  const client = Object.assign(new EventEmitter(), {
    state: syncState,
    getSyncState() {
      return this.state;
    },
  });
  return client;
};

describe('useCallEligibility', () => {
  beforeEach(() => {
    harness.client = makeClient();
    harness.platformRoles = ['FEATURE_BETA_TESTER'];
    harness.configured = true;
    harness.resolve.mockClear();
  });
  afterEach(() => {
    harness.client = null;
  });

  it('is eligible for a beta tester in a synced group conversation, with the resolved Matrix room', async () => {
    const { result } = renderHook(() => useCallEligibility(group));
    await waitFor(() => expect(result.current).toEqual({ eligible: true, matrixRoomId: '!m-alk-group:hs' }));
  });

  it.each([
    ['the user is not a beta tester', () => (harness.platformRoles = ['PLATFORM_SUPPORT'])],
    ['the user has no platform roles loaded', () => (harness.platformRoles = undefined)],
    ['the environment has no call-token service', () => (harness.configured = false)],
    ['there is no chat session', () => (harness.client = null)],
    ['the chat session has not synced yet', () => (harness.client = makeClient('PREPARING' as string))],
    ['the conversation room alias does not resolve', () => harness.resolve.mockResolvedValueOnce(null)],
  ])('is not eligible when %s', async (_label, arrange) => {
    arrange();
    const { result } = renderHook(() => useCallEligibility(group));
    await act(async () => {});
    expect(result.current).toEqual({ eligible: false, matrixRoomId: null });
  });

  it.each([
    ['a 1:1 conversation', { roomId: 'alk-direct', isGroup: false, isGuidance: false }],
    ['the guidance thread', { roomId: 'alk-guidance', isGroup: true, isGuidance: true }],
    ['no conversation', null],
  ])('is not eligible for %s and never resolves its room', async (_label, conversation) => {
    const { result } = renderHook(() => useCallEligibility(conversation));
    await act(async () => {});
    expect(result.current.eligible).toBe(false);
    expect(harness.resolve).not.toHaveBeenCalled();
  });

  it('becomes eligible once the chat session syncs', async () => {
    const client = makeClient(null);
    harness.client = client;
    const { result } = renderHook(() => useCallEligibility(group));
    await act(async () => {});
    expect(result.current.eligible).toBe(false);

    act(() => {
      client.state = 'PREPARED';
      client.emit('sync', 'PREPARED');
    });
    expect(result.current).toEqual({ eligible: true, matrixRoomId: '!m-alk-group:hs' });
  });

  it('does not reuse a room resolved for another conversation', async () => {
    let resolveSecond: (value: string | null) => void = () => {};
    const { result, rerender } = renderHook(({ conversation }) => useCallEligibility(conversation), {
      initialProps: { conversation: group },
    });
    await waitFor(() => expect(result.current.eligible).toBe(true));

    harness.resolve.mockReturnValueOnce(new Promise(resolve => (resolveSecond = resolve)));
    rerender({ conversation: { roomId: 'alk-other', isGroup: true, isGuidance: false } });
    expect(result.current).toEqual({ eligible: false, matrixRoomId: null });

    await act(async () => resolveSecond('!other:hs'));
    expect(result.current).toEqual({ eligible: true, matrixRoomId: '!other:hs' });
  });
});
