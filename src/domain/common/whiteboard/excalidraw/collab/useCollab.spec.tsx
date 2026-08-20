import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { CloseVerdict, ControlMessage } from '@/domain/collaboration/realTimeCollaboration/unifiedCollabProvider';
import useCollab from './useCollab';

// AwarenessRouter subscribes to editor pointer/selection APIs we don't fake here.
vi.mock('./awarenessRouter', () => ({
  AwarenessRouter: class {
    destroy() {}
  },
}));

// Capture the provider's registered control + close handlers so the test can drive
// control messages and socket-close verdicts directly, without a live WebSocket.
let controlHandler: ((message: ControlMessage) => void) | undefined;
let closeHandler: ((verdict: CloseVerdict) => void) | undefined;
let syncedHandler: ((synced: boolean) => void) | undefined;
vi.mock('@/domain/collaboration/realTimeCollaboration/unifiedCollabProvider', async importOriginal => {
  const actual =
    await importOriginal<typeof import('@/domain/collaboration/realTimeCollaboration/unifiedCollabProvider')>();
  class MockProvider {
    awareness = { setLocalStateField: vi.fn(), on: vi.fn(), off: vi.fn(), destroy: vi.fn() };
    ephemeralChannel = { send: vi.fn(), subscribe: vi.fn(() => () => {}) };
    on(event: string, handler: (arg: never) => void) {
      if (event === 'control') controlHandler = handler as (m: ControlMessage) => void;
      else if (event === 'close') closeHandler = handler as (v: CloseVerdict) => void;
      else if (event === 'synced') syncedHandler = handler as (s: boolean) => void;
    }
    off() {}
    connect() {}
    destroy() {}
  }
  return { ...actual, UnifiedCollabProvider: MockProvider };
});

const fakeApi = {} as never;

describe('useCollab — update-rejected recovery routing', () => {
  afterEach(() => {
    controlHandler = undefined;
    closeHandler = undefined;
    vi.clearAllMocks();
  });

  it('calls onUpdateRejected when the server sends an update-rejected control', () => {
    const onUpdateRejected = vi.fn();
    const onRemoteSave = vi.fn();
    const { result } = renderHook(() =>
      useCollab({ username: 'Tester', onCloseConnection: () => {}, onRemoteSave, onUpdateRejected })
    );
    const cleanup = result.current[1]({ excalidrawApi: fakeApi, roomId: 'room-1' });

    controlHandler?.({ kind: 'update-rejected' });

    expect(onUpdateRejected).toHaveBeenCalledTimes(1);
    // a non-rejection control must NOT trigger recovery
    expect(onRemoteSave).not.toHaveBeenCalled();
    cleanup();
  });

  it('does NOT trigger recovery on a normal control (saved)', () => {
    const onUpdateRejected = vi.fn();
    const onRemoteSave = vi.fn();
    const { result } = renderHook(() =>
      useCollab({ username: 'Tester', onCloseConnection: () => {}, onRemoteSave, onUpdateRejected })
    );
    const cleanup = result.current[1]({ excalidrawApi: fakeApi, roomId: 'room-1' });

    controlHandler?.({ kind: 'saved' });

    expect(onRemoteSave).toHaveBeenCalledTimes(1);
    expect(onUpdateRejected).not.toHaveBeenCalled();
    cleanup();
  });
});

describe('useCollab — reason-aware close routing', () => {
  afterEach(() => {
    controlHandler = undefined;
    closeHandler = undefined;
    vi.clearAllMocks();
  });

  it('routes a TERMINAL close to onTerminalClose (with reason), NOT onCloseConnection', () => {
    const onCloseConnection = vi.fn();
    const onTerminalClose = vi.fn();
    const { result } = renderHook(() => useCollab({ username: 'Tester', onCloseConnection, onTerminalClose }));
    const cleanup = result.current[1]({ excalidrawApi: fakeApi, roomId: 'room-1' });

    closeHandler?.({ code: 1008, reason: 'forbidden', disposition: 'terminal' });

    expect(onTerminalClose).toHaveBeenCalledTimes(1);
    expect(onTerminalClose).toHaveBeenCalledWith('forbidden');
    // A terminal close must NOT open the retrying reconnect notice.
    expect(onCloseConnection).not.toHaveBeenCalled();
    cleanup();
  });

  it('routes a TRANSIENT close to onCloseConnection, NOT onTerminalClose', () => {
    const onCloseConnection = vi.fn();
    const onTerminalClose = vi.fn();
    const { result } = renderHook(() => useCollab({ username: 'Tester', onCloseConnection, onTerminalClose }));
    const cleanup = result.current[1]({ excalidrawApi: fakeApi, roomId: 'room-1' });

    closeHandler?.({ code: 1011, reason: '', disposition: 'transient' });

    expect(onCloseConnection).toHaveBeenCalledTimes(1);
    expect(onTerminalClose).not.toHaveBeenCalled();
    cleanup();
  });

  it('a NORMAL (clean 1000) close calls NEITHER callback — no reconnect notice, no terminal state', () => {
    const onCloseConnection = vi.fn();
    const onTerminalClose = vi.fn();
    const { result } = renderHook(() => useCollab({ username: 'Tester', onCloseConnection, onTerminalClose }));
    const cleanup = result.current[1]({ excalidrawApi: fakeApi, roomId: 'room-1' });

    closeHandler?.({ code: 1000, reason: '', disposition: 'normal' });

    // A clean close must not open the retrying notice (which would activate the
    // wrapper's independent useAutoReconnect) NOR surface a terminal state.
    expect(onCloseConnection).not.toHaveBeenCalled();
    expect(onTerminalClose).not.toHaveBeenCalled();
    cleanup();
  });
});

describe('useCollab — fit-to-content on initial scene sync', () => {
  afterEach(() => {
    syncedHandler = undefined;
    vi.clearAllMocks();
  });

  const fitApi = (elementCount: number) => {
    const scrollToContent = vi.fn();
    const elements = Array.from({ length: elementCount }, (_, i) => ({ id: `e${i}` }));
    return { api: { getSceneElements: () => elements, scrollToContent } as never, scrollToContent };
  };

  it('fits to content ONCE on the first completed sync (when the scene has elements)', () => {
    const { api, scrollToContent } = fitApi(2);
    const { result } = renderHook(() => useCollab({ username: 'Tester', onCloseConnection: () => {} }));
    const cleanup = result.current[1]({ excalidrawApi: api, roomId: 'room-1' });

    syncedHandler?.(true);

    expect(scrollToContent).toHaveBeenCalledTimes(1);
    expect(scrollToContent).toHaveBeenCalledWith(expect.any(Array), {
      animate: false,
      fitToViewport: true,
      viewportZoomFactor: 0.75,
      maxZoom: 1,
    });
    cleanup();
  });

  it('does NOT re-fit on a later sync (reconnect/resync) — exactly once per editor', () => {
    const { api, scrollToContent } = fitApi(3);
    const { result } = renderHook(() => useCollab({ username: 'Tester', onCloseConnection: () => {} }));
    const cleanup = result.current[1]({ excalidrawApi: api, roomId: 'room-1' });

    syncedHandler?.(true); // initial
    syncedHandler?.(false); // drop
    syncedHandler?.(true); // reconnect resync

    expect(scrollToContent).toHaveBeenCalledTimes(1);
    cleanup();
  });

  it('does NOT fit an empty scene (no elements to frame)', () => {
    const { api, scrollToContent } = fitApi(0);
    const { result } = renderHook(() => useCollab({ username: 'Tester', onCloseConnection: () => {} }));
    const cleanup = result.current[1]({ excalidrawApi: api, roomId: 'room-1' });

    syncedHandler?.(true);

    expect(scrollToContent).not.toHaveBeenCalled();
    cleanup();
  });
});
