import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AwarenessRouter, type PointerPayload } from './awarenessRouter';

const viewportUtils = {
  getVisibleSceneBounds: (appState: { scrollX: number; scrollY: number }) =>
    [appState.scrollX, appState.scrollY, appState.scrollX + 100, appState.scrollY + 100] as const,
  zoomToFitBounds: ({ bounds, appState }: { bounds: readonly number[]; appState: Record<string, unknown> }) => ({
    appState: { ...appState, scrollX: bounds[0], scrollY: bounds[1], zoom: { value: 1 } },
  }),
};

// The native-Yjs cutover dropped the legacy cursor throttle, so onPointerUpdate streamed
// two awareness frames per raw pointer event, unbounded. This restores legacy parity and
// bounds presence traffic: a 33ms leading+trailing throttle that coalesces pointer+button
// into ONE frame per window, preserves the latest pointer at the trailing edge, and cancels
// cleanly on destroy. (The unbounded stream also exposed a since-corrected server-side
// all-frame disconnect; these tests pin the client contract, not that cap.)
const THROTTLE_MS = 33;
const VIEWPORT_THROTTLE_MS = 100;

function makeAwareness(clientID = 1) {
  let local: Record<string, unknown> | null = {};
  let states = new Map<number, Record<string, unknown>>();
  let changeHandler:
    | ((changes: { added: number[]; updated: number[]; removed: number[] }, origin: unknown) => void)
    | undefined;
  const setLocalState = vi.fn((s: Record<string, unknown> | null) => {
    local = s;
  });
  const setLocalStateField = vi.fn((k: string, v: unknown) => {
    local = { ...(local ?? {}), [k]: v };
  });
  return {
    clientID,
    getLocalState: vi.fn(() => local),
    setLocalState,
    setLocalStateField,
    getStates: vi.fn(() => states),
    on: vi.fn((event: string, handler: typeof changeHandler) => {
      if (event === 'change') changeHandler = handler;
    }),
    off: vi.fn(),
    destroy: vi.fn(),
    localState: () => local,
    setStates: (next: Map<number, Record<string, unknown>>) => {
      states = next;
    },
    emitRemoteChange: (changes: { added?: number[]; updated?: number[]; removed?: number[] } = {}) =>
      changeHandler?.(
        { added: changes.added ?? [], updated: changes.updated ?? [], removed: changes.removed ?? [] },
        'remote'
      ),
  };
}

function makeApi() {
  let followHandler:
    | ((payload: { userToFollow: { socketId: string; username: string }; action: string }) => void)
    | undefined;
  let scrollHandler: (() => void) | undefined;
  let appState = {
    scrollX: 0,
    scrollY: 0,
    zoom: { value: 1 },
    width: 100,
    height: 100,
    offsetLeft: 0,
    offsetTop: 0,
    userToFollow: null as { socketId: string; username: string } | null,
    followedBy: new Set<string>(),
  };
  const updateScene = vi.fn((scene: { appState?: Partial<typeof appState> }) => {
    const viewportChanged =
      scene.appState && ('scrollX' in scene.appState || 'scrollY' in scene.appState || 'zoom' in scene.appState);
    appState = { ...appState, ...scene.appState };
    if (viewportChanged) scrollHandler?.();
  });
  return {
    updateScene,
    getAppState: vi.fn(() => appState),
    onUserFollow: vi.fn((handler: typeof followHandler) => {
      followHandler = handler;
      return vi.fn();
    }),
    onScrollChange: vi.fn((handler: typeof scrollHandler) => {
      scrollHandler = handler;
      return vi.fn();
    }),
    dispatchIncomingEmojiReaction: vi.fn(),
    dispatchIncomingCountdownTimer: vi.fn(),
    follow: (socketId: string, action: 'FOLLOW' | 'UNFOLLOW' = 'FOLLOW') => {
      appState = {
        ...appState,
        userToFollow: action === 'FOLLOW' ? { socketId, username: `user-${socketId}` } : null,
      };
      followHandler?.({ userToFollow: { socketId, username: `user-${socketId}` }, action });
    },
    scrollTo: (scrollX: number, scrollY: number) => {
      appState = { ...appState, scrollX, scrollY };
      scrollHandler?.();
    },
  };
}

const makeRouter = (awareness: ReturnType<typeof makeAwareness>, api: ReturnType<typeof makeApi>) =>
  new AwarenessRouter({
    awareness: awareness as never,
    api: api as never,
    loadViewportUtils: async () => viewportUtils as never,
  });

// A "presence frame" is any awareness write that carries the pointer: exactly one
// setLocalState (whole-state, coalesced) per window in the fixed design, and — to
// sabotage-prove — ZERO per-field pointer/button writes.
function pointerFrames(aw: ReturnType<typeof makeAwareness>) {
  return aw.setLocalState.mock.calls
    .map(c => c[0])
    .filter((s): s is Record<string, unknown> => !!s && typeof s === 'object' && 'pointer' in s);
}
function perFieldPointerWrites(aw: ReturnType<typeof makeAwareness>) {
  return aw.setLocalStateField.mock.calls.filter(([k]) => k === 'pointer' || k === 'button').length;
}

const move = (x: number, button: 'up' | 'down' = 'up'): PointerPayload => ({
  pointer: { x, y: x },
  button,
});

describe('AwarenessRouter follow mode', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('fits the camera to the followed peer viewport and keeps follow state in awareness only', async () => {
    const aw = makeAwareness();
    const api = makeApi();
    aw.setStates(
      new Map([
        [1, {}],
        [2, { user: { username: 'Peer' }, viewportBounds: [25, 40, 125, 140] }],
      ])
    );
    const router = makeRouter(aw, api);
    await vi.runAllTimersAsync();

    api.follow('2');
    await vi.runAllTimersAsync();

    expect(aw.setLocalStateField).toHaveBeenCalledWith('following', '2');
    expect(api.getAppState()).toMatchObject({ scrollX: 25, scrollY: 40, zoom: { value: 1 } });
    expect(api.updateScene.mock.calls.every(([scene]) => !('elements' in scene))).toBe(true);
    router.destroy();
  });

  it('clears userToFollow and the awareness target when the followed peer departs', async () => {
    const aw = makeAwareness();
    const api = makeApi();
    aw.setStates(
      new Map([
        [1, {}],
        [2, { viewportBounds: [0, 0, 100, 100] }],
      ])
    );
    const router = makeRouter(aw, api);
    await vi.runAllTimersAsync();
    api.follow('2');
    await vi.runAllTimersAsync();

    aw.setStates(new Map([[1, {}]]));
    aw.emitRemoteChange({ removed: [2] });
    await vi.runAllTimersAsync();

    expect(api.getAppState().userToFollow).toBeNull();
    expect(aw.setLocalStateField).toHaveBeenLastCalledWith('following', null);
    router.destroy();
  });

  it('derives followedBy from remote continuous awareness state', async () => {
    const aw = makeAwareness();
    const api = makeApi();
    aw.setStates(
      new Map([
        [1, {}],
        [2, { following: '1' }],
        [3, { following: '9' }],
      ])
    );
    const router = makeRouter(aw, api);

    aw.emitRemoteChange({ updated: [2, 3] });
    await vi.runAllTimersAsync();

    expect(api.getAppState().followedBy).toEqual(new Set(['2']));
    router.destroy();
  });

  it('coalesces viewport presence to one update per 100ms window', async () => {
    const aw = makeAwareness();
    const api = makeApi();
    const router = makeRouter(aw, api);
    const viewportWrites = () => aw.setLocalStateField.mock.calls.filter(([key]) => key === 'viewportBounds');
    await vi.runAllTimersAsync();
    expect(viewportWrites()).toHaveLength(1);

    api.scrollTo(10, 10);
    api.scrollTo(20, 20);
    api.scrollTo(30, 30);
    await vi.advanceTimersByTimeAsync(VIEWPORT_THROTTLE_MS);

    expect(viewportWrites()).toHaveLength(2);
    expect(viewportWrites().at(-1)?.[1]).toEqual([30, 30, 130, 130]);
    router.destroy();
  });

  it('reaches a fixed point when two peers follow each other without republishing programmatic scrolls', async () => {
    const awA = makeAwareness(1);
    const awB = makeAwareness(2);
    const apiA = makeApi();
    const apiB = makeApi();
    const routerA = makeRouter(awA, apiA);
    const routerB = makeRouter(awB, apiB);
    await vi.runAllTimersAsync();

    const linkStates = () => {
      awA.setStates(
        new Map([
          [1, awA.localState() ?? {}],
          [2, awB.localState() ?? {}],
        ])
      );
      awB.setStates(
        new Map([
          [1, awA.localState() ?? {}],
          [2, awB.localState() ?? {}],
        ])
      );
    };
    linkStates();
    apiA.follow('2');
    apiB.follow('1');
    linkStates();
    const aViewportWrites = () => awA.setLocalStateField.mock.calls.filter(([key]) => key === 'viewportBounds').length;
    const bViewportWrites = () => awB.setLocalStateField.mock.calls.filter(([key]) => key === 'viewportBounds').length;
    const before = [aViewportWrites(), bViewportWrites()];

    awA.emitRemoteChange({ updated: [2] });
    awB.emitRemoteChange({ updated: [1] });
    await vi.advanceTimersByTimeAsync(VIEWPORT_THROTTLE_MS * 5);

    expect([aViewportWrites(), bViewportWrites()]).toEqual(before);
    routerA.destroy();
    routerB.destroy();
  });
});

describe('AwarenessRouter pointer throttle', () => {
  let aw: ReturnType<typeof makeAwareness>;
  let router: AwarenessRouter;

  beforeEach(() => {
    vi.useFakeTimers();
    aw = makeAwareness();
    router = makeRouter(aw, makeApi());
  });
  afterEach(() => {
    router.destroy();
    vi.useRealTimers();
  });

  it('coalesces pointer+button into ONE awareness frame (no per-field writes)', () => {
    router.onPointerUpdate(move(5, 'down'));
    const frames = pointerFrames(aw);
    expect(frames).toHaveLength(1);
    expect(frames[0]).toMatchObject({ pointer: { x: 5, y: 5 }, button: 'down' });
    expect(perFieldPointerWrites(aw)).toBe(0);
  });

  it('throttles a rapid burst to a single immediate (leading) frame', () => {
    for (let i = 1; i <= 12; i++) router.onPointerUpdate(move(i));
    // Before any timer fires: at most one immediate frame for the whole window.
    expect(pointerFrames(aw)).toHaveLength(1);
    expect(perFieldPointerWrites(aw)).toBe(0);
  });

  it('flushes the LATEST payload at the trailing edge', () => {
    for (let i = 1; i <= 12; i++) router.onPointerUpdate(move(i, i % 2 ? 'up' : 'down'));
    vi.advanceTimersByTime(THROTTLE_MS);
    const frames = pointerFrames(aw);
    expect(frames).toHaveLength(2); // leading + trailing
    expect(frames[1]).toMatchObject({ pointer: { x: 12, y: 12 }, button: 'down' }); // the last payload
  });

  it('bounds a continuous stream to ~one frame per throttle window', () => {
    // 3 windows of dense movement; expect ~1 frame per window, not per call.
    let x = 0;
    for (let w = 0; w < 3; w++) {
      for (let i = 0; i < 20; i++) router.onPointerUpdate(move(++x));
      vi.advanceTimersByTime(THROTTLE_MS);
    }
    const frames = pointerFrames(aw).length;
    expect(frames).toBeGreaterThanOrEqual(3);
    expect(frames).toBeLessThanOrEqual(4); // leading + one trailing per window, far below the 60 calls
    expect(perFieldPointerWrites(aw)).toBe(0);
  });

  it('cancels the pending trailing frame on destroy (no late frame)', () => {
    router.onPointerUpdate(move(1));
    router.onPointerUpdate(move(2)); // queues a trailing flush
    const before = pointerFrames(aw).length;
    router.destroy();
    vi.advanceTimersByTime(THROTTLE_MS * 4);
    // destroy() clears presence via setLocalState(null); it must NOT emit another pointer frame.
    expect(pointerFrames(aw).length).toBe(before);
    expect(aw.setLocalState).toHaveBeenLastCalledWith(null);
  });
});
