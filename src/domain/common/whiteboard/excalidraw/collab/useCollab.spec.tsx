import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { CloseVerdict, ControlMessage } from '@/domain/collaboration/realTimeCollaboration/unifiedCollabProvider';
import { CollaboratorModeReasons } from './excalidrawAppConstants';
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
let statusHandler: ((status: string) => void) | undefined;
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
      else if (event === 'status') statusHandler = handler as (s: string) => void;
    }
    off() {}
    connect() {}
    destroy() {}
  }
  return { ...actual, UnifiedCollabProvider: MockProvider };
});

const fakeApi = { getSceneElements: () => [], scrollToContent: vi.fn() } as never;

describe('useCollab — update-rejected recovery routing', () => {
  afterEach(() => {
    controlHandler = undefined;
    closeHandler = undefined;
    vi.clearAllMocks();
  });

  it('locks the scene before routing an update-rejected recovery', () => {
    const onUpdateRejected = vi.fn();
    const onRemoteSave = vi.fn();
    const onSceneInitChange = vi.fn();
    const { result } = renderHook(() =>
      useCollab({ username: 'Tester', onCloseConnection: () => {}, onRemoteSave, onUpdateRejected, onSceneInitChange })
    );
    const cleanup = result.current[1]({ excalidrawApi: fakeApi, roomId: 'room-1' });

    act(() => {
      statusHandler?.('connected');
      syncedHandler?.(true);
    });
    expect(result.current[2].isReadOnly).toBe(false);
    act(() => controlHandler?.({ kind: 'update-rejected' }));

    expect(onUpdateRejected).toHaveBeenCalledTimes(1);
    expect(onSceneInitChange).toHaveBeenLastCalledWith(false);
    expect(result.current[2].isReadOnly).toBe(true);
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

describe('useCollab — reconnect + collaborator-mode contract', () => {
  afterEach(() => {
    syncedHandler = undefined;
    statusHandler = undefined;
    controlHandler = undefined;
    vi.clearAllMocks();
  });

  const api = { getSceneElements: () => [], scrollToContent: vi.fn() } as never;
  const mount = () => {
    const rendered = renderHook(() => useCollab({ username: 'T', onCloseConnection: () => {} }));
    const cleanup = rendered.result.current[1]({ excalidrawApi: api, roomId: 'r' });
    const stateOf = () =>
      rendered.result.current[2] as {
        collaborating: boolean;
        mode: string | null;
        isReadOnly: boolean;
        modeReason: CollaboratorModeReasons | null;
      };
    return { stateOf, cleanup };
  };

  it('collaborating becomes true on connect — WITHOUT waiting for a collaborator-mode frame', () => {
    const { stateOf, cleanup } = mount();
    act(() => statusHandler?.('connected'));
    // A healthy socket is enough for the wrapper's auto-reconnect to stop; it must not
    // hinge on a mode frame the service never sends at join.
    expect(stateOf().collaborating).toBe(true);
    expect(stateOf().mode).toBeNull();
    cleanup();
  });

  it('establishes default write mode on the initial sync when no downgrade arrived (absence = grant)', () => {
    const { stateOf, cleanup } = mount();
    act(() => {
      statusHandler?.('connected');
      syncedHandler?.(true);
    });
    expect(stateOf().mode).toBe('write');
    expect(stateOf().isReadOnly).toBe(false);
    cleanup();
  });

  it('FIFO: a viewer read-only-state arriving BEFORE the sync wins (mode stays read)', () => {
    const { stateOf, cleanup } = mount();
    act(() => {
      statusHandler?.('connected');
      controlHandler?.({ kind: 'read-only-state', readOnly: true } as ControlMessage);
      syncedHandler?.(true);
    });
    expect(stateOf().mode).toBe('read');
    expect(stateOf().isReadOnly).toBe(true);
    cleanup();
  });

  it('a read-only downgrade arriving AFTER the sync still wins over the default write', () => {
    const { stateOf, cleanup } = mount();
    act(() => {
      statusHandler?.('connected');
      syncedHandler?.(true);
    });
    expect(stateOf().mode).toBe('write');
    act(() => controlHandler?.({ kind: 'read-only-state', readOnly: true } as ControlMessage));
    expect(stateOf().mode).toBe('read');
    cleanup();
  });

  it.each([
    ['room-capacity-reached', CollaboratorModeReasons.ROOM_CAPACITY_REACHED],
    ['multi-user-not-allowed', CollaboratorModeReasons.MULTI_USER_NOT_ALLOWED],
    ['inactivity', CollaboratorModeReasons.INACTIVITY],
    ['unknown', null],
  ])('maps collaborator-mode reason %s', (reason, expectedReason) => {
    const { stateOf, cleanup } = mount();
    act(() => controlHandler?.({ kind: 'collaborator-mode', mode: 'read', reason } as ControlMessage));
    expect(stateOf().mode).toBe('read');
    expect(stateOf().modeReason).toBe(expectedReason);
    cleanup();
  });
});

describe('useCollab — session-end control (validated tuple, idempotent close)', () => {
  afterEach(() => {
    controlHandler = undefined;
    closeHandler = undefined;
    statusHandler = undefined;
    vi.clearAllMocks();
  });

  const mount = () => {
    const onSessionEnd = vi.fn();
    const onTerminalClose = vi.fn();
    const onCloseConnection = vi.fn();
    const { result } = renderHook(() => useCollab({ username: 'T', onCloseConnection, onTerminalClose, onSessionEnd }));
    const cleanup = result.current[1]({ excalidrawApi: fakeApi, roomId: 'r' });
    return { onSessionEnd, onTerminalClose, onCloseConnection, cleanup };
  };

  it.each([
    ['update-rate-exceeded', 'member', 'transient'],
    ['update-not-accepted', 'member', 'transient'],
    ['document-size-limit-exceeded', 'member', 'manual'],
    ['document-deleted', 'document', 'terminal'],
    ['edits-not-saved', 'document', 'terminal'],
    ['server-shutdown', 'document', 'transient'],
  ])('routes %s → onSessionEnd with its validated tuple', (code, scope, disposition) => {
    const { onSessionEnd, onTerminalClose, cleanup } = mount();
    controlHandler?.({ kind: 'session-end', code, scope, disposition } as ControlMessage);
    expect(onSessionEnd).toHaveBeenCalledWith({ code, scope, disposition });
    expect(onTerminalClose).not.toHaveBeenCalled();
    cleanup();
  });

  it('fails CLOSED to onTerminalClose on an inconsistent tuple (never onSessionEnd)', () => {
    const { onSessionEnd, onTerminalClose, cleanup } = mount();
    controlHandler?.({
      kind: 'session-end',
      code: 'document-deleted',
      scope: 'document',
      disposition: 'transient', // inconsistent with the table (should be terminal)
    } as ControlMessage);
    expect(onSessionEnd).not.toHaveBeenCalled();
    expect(onTerminalClose).toHaveBeenCalledWith('document-deleted');
    cleanup();
  });

  it('the subsequent socket close is IDEMPOTENT — session-end wins, the close routes to no callback', () => {
    const { onSessionEnd, onCloseConnection, onTerminalClose, cleanup } = mount();
    controlHandler?.({
      kind: 'session-end',
      code: 'update-rate-exceeded',
      scope: 'member',
      disposition: 'transient',
    } as ControlMessage);
    expect(onSessionEnd).toHaveBeenCalledTimes(1);
    // The transient socket close (1013) follows: it must NOT re-open the reconnect notice.
    closeHandler?.({ code: 1013, reason: 'update-rate-exceeded', disposition: 'transient' });
    expect(onCloseConnection).not.toHaveBeenCalled();
    expect(onTerminalClose).not.toHaveBeenCalled();
    expect(onSessionEnd).toHaveBeenCalledTimes(1);
    cleanup();
  });

  it('a fresh connection re-arms: after reconnect a plain close routes normally again', () => {
    const { onCloseConnection, cleanup } = mount();
    controlHandler?.({
      kind: 'session-end',
      code: 'update-rate-exceeded',
      scope: 'member',
      disposition: 'transient',
    } as ControlMessage);
    statusHandler?.('connected'); // provider reconnected → the prior session-end is spent
    closeHandler?.({ code: 1011, reason: '', disposition: 'transient' });
    expect(onCloseConnection).toHaveBeenCalledTimes(1);
    cleanup();
  });

  it('a removed room-closed control is inert (residue zero — falls to the default case)', () => {
    const { onSessionEnd, onTerminalClose, onCloseConnection, cleanup } = mount();
    controlHandler?.({ kind: 'room-closed' } as unknown as ControlMessage);
    expect(onSessionEnd).not.toHaveBeenCalled();
    expect(onTerminalClose).not.toHaveBeenCalled();
    expect(onCloseConnection).not.toHaveBeenCalled();
    cleanup();
  });
});
