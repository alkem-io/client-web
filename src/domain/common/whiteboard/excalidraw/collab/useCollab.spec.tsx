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
let unconfirmedHandler: ((unconfirmed: boolean) => void) | undefined;
let providerInitialUnconfirmed: boolean[] = [];
let durabilityRequests: ReturnType<typeof vi.fn>[] = [];
let disconnects: ReturnType<typeof vi.fn>[] = [];
vi.mock('@/domain/collaboration/realTimeCollaboration/unifiedCollabProvider', async importOriginal => {
  const actual =
    await importOriginal<typeof import('@/domain/collaboration/realTimeCollaboration/unifiedCollabProvider')>();
  class MockProvider {
    awareness = { setLocalStateField: vi.fn(), on: vi.fn(), off: vi.fn(), destroy: vi.fn() };
    ephemeralChannel = { send: vi.fn(), subscribe: vi.fn(() => () => {}) };
    hasUnconfirmedLocalChanges: boolean;
    requestDurability = vi.fn(() => Promise.resolve());
    persistPendingChanges = vi.fn(() => Promise.resolve());
    disconnect = vi.fn();
    constructor(options: { initialUnconfirmedLocalChanges?: boolean }) {
      this.hasUnconfirmedLocalChanges = !!options.initialUnconfirmedLocalChanges;
      providerInitialUnconfirmed.push(this.hasUnconfirmedLocalChanges);
      durabilityRequests.push(this.requestDurability);
      disconnects.push(this.disconnect);
    }
    on(event: string, handler: (arg: never) => void) {
      if (event === 'control') controlHandler = handler as (m: ControlMessage) => void;
      else if (event === 'close') closeHandler = handler as (v: CloseVerdict) => void;
      else if (event === 'synced') syncedHandler = handler as (s: boolean) => void;
      else if (event === 'status') statusHandler = handler as (s: string) => void;
      else if (event === 'unconfirmed') unconfirmedHandler = handler as (value: boolean) => void;
    }
    off() {}
    connect() {}
    reconnectNow() {}
    destroy() {}
  }
  return { ...actual, UnifiedCollabProvider: MockProvider };
});

const fakeApi = { getSceneElements: () => [], scrollToContent: vi.fn() } as never;

describe('useCollab — update-rejected recovery routing', () => {
  afterEach(() => {
    controlHandler = undefined;
    closeHandler = undefined;
    unconfirmedHandler = undefined;
    providerInitialUnconfirmed = [];
    durabilityRequests = [];
    disconnects = [];
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
    syncedHandler = undefined;
    statusHandler = undefined;
    unconfirmedHandler = undefined;
    disconnects = [];
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
    expect(disconnects.at(-1)).toHaveBeenCalledOnce();
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

  it('keeps an established whiteboard editable while the same scene recovers', () => {
    const onCloseConnection = vi.fn();
    const { result } = renderHook(() => useCollab({ username: 'Tester', onCloseConnection }));
    const cleanup = result.current[1]({ excalidrawApi: fakeApi, roomId: 'room-1' });
    act(() => {
      statusHandler?.('connected');
      syncedHandler?.(true);
    });
    expect(result.current[2].phase).toBe('live');

    act(() => {
      syncedHandler?.(false);
      statusHandler?.('disconnected');
      closeHandler?.({ code: 1006, reason: '', disposition: 'transient' });
    });

    expect(result.current[2].phase).toBe('recovering');
    expect(result.current[2].isReadOnly).toBe(false);
    expect(onCloseConnection).toHaveBeenCalledTimes(1);
    cleanup();
  });

  it('resumes inactivity with a fresh admission over the same dirty scene and confirms it after sync', () => {
    providerInitialUnconfirmed = [];
    durabilityRequests = [];
    const { result } = renderHook(() => useCollab({ username: 'Tester', onCloseConnection: () => {} }));
    const firstCleanup = result.current[1]({ excalidrawApi: fakeApi, roomId: 'room-1' });
    act(() => {
      statusHandler?.('connected');
      syncedHandler?.(true);
      unconfirmedHandler?.(true);
    });

    act(() => firstCleanup());
    const secondCleanup = result.current[1]({ excalidrawApi: fakeApi, roomId: 'room-1' });
    expect(providerInitialUnconfirmed).toEqual([false, true]);

    act(() => {
      statusHandler?.('connected');
      syncedHandler?.(true);
    });
    expect(durabilityRequests[1]).toHaveBeenCalledOnce();
    secondCleanup();
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

  it('does not report collaboration ready until the opened socket completes Yjs sync', () => {
    const { stateOf, cleanup } = mount();
    act(() => statusHandler?.('connected'));
    expect(stateOf().collaborating).toBe(false);
    expect(stateOf().isReadOnly).toBe(true);
    expect(stateOf().mode).toBeNull();
    act(() => syncedHandler?.(true));
    expect(stateOf().collaborating).toBe(true);
    expect(stateOf().mode).toBe('write');
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
    syncedHandler = undefined;
    unconfirmedHandler = undefined;
    disconnects = [];
    vi.clearAllMocks();
  });

  const mount = () => {
    const onSessionEnd = vi.fn();
    const onTerminalClose = vi.fn();
    const onCloseConnection = vi.fn();
    const onSceneInitChange = vi.fn();
    const { result } = renderHook(() =>
      useCollab({ username: 'T', onCloseConnection, onTerminalClose, onSessionEnd, onSceneInitChange })
    );
    const cleanup = result.current[1]({ excalidrawApi: fakeApi, roomId: 'r' });
    return { result, onSessionEnd, onTerminalClose, onCloseConnection, onSceneInitChange, cleanup };
  };

  it('keeps an established scene mounted when a transient session-end starts recovery', () => {
    const { onSessionEnd, onSceneInitChange, cleanup } = mount();
    controlHandler?.({
      kind: 'session-end',
      code: 'server-shutdown',
      scope: 'document',
      disposition: 'transient',
    } as ControlMessage);

    expect(onSessionEnd).toHaveBeenCalledWith({
      code: 'server-shutdown',
      scope: 'document',
      disposition: 'transient',
    });
    expect(onSceneInitChange).not.toHaveBeenCalledWith(false);
    cleanup();
  });

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
    const { onSessionEnd, onTerminalClose, onSceneInitChange, cleanup } = mount();
    controlHandler?.({
      kind: 'session-end',
      code: 'document-deleted',
      scope: 'document',
      disposition: 'transient', // inconsistent with the table (should be terminal)
    } as ControlMessage);
    expect(onSessionEnd).not.toHaveBeenCalled();
    expect(onTerminalClose).toHaveBeenCalledWith('document-deleted');
    expect(disconnects.at(-1)).toHaveBeenCalledOnce();
    expect(onSceneInitChange).not.toHaveBeenCalledWith(false);
    cleanup();
  });

  it('seals a terminal session-end, disconnects synchronously, and ignores a later connected status', () => {
    const { result, onSceneInitChange, cleanup } = mount();
    act(() => {
      statusHandler?.('connected');
      syncedHandler?.(true);
      unconfirmedHandler?.(true);
    });

    act(() =>
      controlHandler?.({
        kind: 'session-end',
        code: 'edits-not-saved',
        scope: 'document',
        disposition: 'terminal',
      } as ControlMessage)
    );

    expect(disconnects.at(-1)).toHaveBeenCalledOnce();
    expect(onSceneInitChange).not.toHaveBeenCalledWith(false);
    expect(result.current[2].phase).toBe('terminal');
    act(() => statusHandler?.('connected'));
    expect(disconnects.at(-1)).toHaveBeenCalledOnce();
    expect(result.current[2].phase).toBe('terminal');
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
