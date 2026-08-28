import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type {
  CollaborationState,
  ControlMessage,
} from '@/domain/collaboration/realTimeCollaboration/unifiedCollabProvider';
import { CollaboratorModeReasons } from './excalidrawAppConstants';

let stateHandler: ((state: CollaborationState) => void) | undefined;
let controlHandler: ((message: ControlMessage) => void) | undefined;
const connect = vi.fn();
const disconnect = vi.fn();
const destroy = vi.fn();

vi.mock('./awarenessRouter', () => ({
  AwarenessRouter: class {
    onPointerUpdate = vi.fn();
    broadcastEmojiReaction = vi.fn();
    broadcastCountdownTimer = vi.fn();
    destroy = vi.fn();
  },
}));

vi.mock('@/domain/collaboration/realTimeCollaboration/unifiedCollabProvider', async importOriginal => {
  const actual =
    await importOriginal<typeof import('@/domain/collaboration/realTimeCollaboration/unifiedCollabProvider')>();
  return {
    ...actual,
    UnifiedCollabProvider: class {
      state: CollaborationState = { status: 'connecting' };
      awareness = { setLocalStateField: vi.fn() };
      ephemeralChannel = { send: vi.fn(), subscribe: vi.fn(() => () => {}) };
      on(event: string, handler: never) {
        if (event === 'state') stateHandler = handler;
        if (event === 'control') controlHandler = handler;
      }
      off() {}
      connect = connect;
      disconnect = disconnect;
      destroy = destroy;
      requestDurability = vi.fn(() => Promise.resolve());
    },
  };
});

import useCollab from './useCollab';

const baseApi = {
  encodeSceneStateVector: vi.fn(),
  encodeSceneAsUpdate: vi.fn(),
  applyRemoteSceneUpdate: vi.fn(),
  onLocalSceneUpdate: vi.fn(),
  getSceneElements: vi.fn(() => []),
  scrollToContent: vi.fn(),
};
const api = baseApi as never;

describe('useCollab', () => {
  beforeEach(() => {
    stateHandler = undefined;
    controlHandler = undefined;
    vi.clearAllMocks();
  });

  it('passes the provider state directly to whiteboard consumers', () => {
    const { result } = renderHook(() => useCollab({ username: 'Tester' }));
    let cleanup!: () => void;
    act(() => {
      cleanup = result.current[1]({ excalidrawApi: api, roomId: 'whiteboard-1' });
    });

    act(() => stateHandler?.({ status: 'ready' }));
    expect(result.current[2].state).toEqual({ status: 'ready' });
    expect(result.current[2].collaborating).toBe(true);

    act(() => stateHandler?.({ status: 'reconnecting' }));
    expect(result.current[2].state).toEqual({ status: 'reconnecting' });
    expect(result.current[2].collaborating).toBe(true);
    act(cleanup);
  });

  it('establishes write mode on first ready and honors a read-only downgrade', () => {
    const { result } = renderHook(() => useCollab({ username: 'Tester' }));
    let cleanup!: () => void;
    act(() => {
      cleanup = result.current[1]({ excalidrawApi: api, roomId: 'whiteboard-1' });
    });

    act(() => stateHandler?.({ status: 'ready' }));
    expect(result.current[2].mode).toBe('write');
    expect(result.current[2].isReadOnly).toBe(false);

    act(() => controlHandler?.({ kind: 'read-only-state', readOnly: true, reason: 'inactivity' }));
    expect(result.current[2].mode).toBe('read');
    expect(result.current[2].modeReason).toBe(CollaboratorModeReasons.INACTIVITY);
    expect(result.current[2].isReadOnly).toBe(true);
    act(cleanup);
  });

  it('resumes inactivity through the same disconnect/connect path', () => {
    const { result } = renderHook(() => useCollab({ username: 'Tester' }));
    let cleanup!: () => void;
    act(() => {
      cleanup = result.current[1]({ excalidrawApi: api, roomId: 'whiteboard-1' });
    });

    act(() => controlHandler?.({ kind: 'read-only-state', readOnly: true, reason: 'inactivity' }));
    expect(result.current[2].mode).toBe('read');

    act(() => result.current[0]?.resume());
    expect(disconnect).toHaveBeenCalledTimes(1);
    expect(connect).toHaveBeenCalledTimes(2);
    expect(result.current[2].mode).toBeNull();

    act(() => stateHandler?.({ status: 'ready' }));
    expect(result.current[2].mode).toBe('write');
    act(cleanup);
  });

  it('fits non-empty content once, not again after reconnect', () => {
    const elements = [{ id: 'one' }];
    const fitApi = { ...baseApi, getSceneElements: () => elements, scrollToContent: vi.fn() } as never;
    const { result } = renderHook(() => useCollab({ username: 'Tester' }));
    let cleanup!: () => void;
    act(() => {
      cleanup = result.current[1]({ excalidrawApi: fitApi, roomId: 'whiteboard-1' });
    });

    act(() => stateHandler?.({ status: 'ready' }));
    act(() => stateHandler?.({ status: 'reconnecting' }));
    act(() => stateHandler?.({ status: 'ready' }));

    expect((fitApi as { scrollToContent: ReturnType<typeof vi.fn> }).scrollToContent).toHaveBeenCalledTimes(1);
    act(cleanup);
  });

  it('does not carry a ready state from one whiteboard into the next', () => {
    const { result } = renderHook(() => useCollab({ username: 'Tester' }));
    let cleanupFirst!: () => void;
    act(() => {
      cleanupFirst = result.current[1]({ excalidrawApi: api, roomId: 'whiteboard-1' });
    });
    act(() => stateHandler?.({ status: 'ready' }));
    expect(result.current[2].state.status).toBe('ready');

    act(cleanupFirst);
    let cleanupSecond!: () => void;
    act(() => {
      cleanupSecond = result.current[1]({ excalidrawApi: api, roomId: 'whiteboard-2' });
    });

    expect(result.current[2].state.status).toBe('connecting');
    act(cleanupSecond);
  });
});
