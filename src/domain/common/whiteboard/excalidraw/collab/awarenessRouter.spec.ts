import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AwarenessRouter, type PointerPayload } from './awarenessRouter';

// The native-Yjs cutover dropped the legacy cursor throttle, so onPointerUpdate streamed
// two awareness frames per raw pointer event, unbounded. This restores legacy parity and
// bounds presence traffic: a 33ms leading+trailing throttle that coalesces pointer+button
// into ONE frame per window, preserves the latest pointer at the trailing edge, and cancels
// cleanly on destroy. (The unbounded stream also exposed a since-corrected server-side
// all-frame disconnect; these tests pin the client contract, not that cap.)
const THROTTLE_MS = 33;

function makeAwareness() {
  let local: Record<string, unknown> | null = {};
  const setLocalState = vi.fn((s: Record<string, unknown> | null) => {
    local = s;
  });
  const setLocalStateField = vi.fn((k: string, v: unknown) => {
    local = { ...(local ?? {}), [k]: v };
  });
  return {
    clientID: 1,
    getLocalState: vi.fn(() => local),
    setLocalState,
    setLocalStateField,
    getStates: vi.fn(() => new Map()),
    on: vi.fn(),
    off: vi.fn(),
    destroy: vi.fn(),
  };
}

function makeApi() {
  return {
    updateScene: vi.fn(),
    dispatchIncomingEmojiReaction: vi.fn(),
    dispatchIncomingCountdownTimer: vi.fn(),
  };
}

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

describe('AwarenessRouter pointer throttle', () => {
  let aw: ReturnType<typeof makeAwareness>;
  let router: AwarenessRouter;

  beforeEach(() => {
    vi.useFakeTimers();
    aw = makeAwareness();
    router = new AwarenessRouter({ awareness: aw as never, api: makeApi() as never });
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
