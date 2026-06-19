import type { ExcalidrawImperativeAPI } from '@alkemio/excalidraw/dist/types/excalidraw/types';
import { act, renderHook } from '@testing-library/react';
import * as decoding from 'lib0/decoding';
import * as encoding from 'lib0/encoding';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { WireType } from '@/core/collab/UnifiedCollabProvider';
import { decodeEphemeralEvent } from './ephemeralChannel';
import { getWhiteboardCollabUrl, useWhiteboardCollab } from './useWhiteboardCollab';

// `@/main/env` captures `window._env_` once at module load, so the env must be
// injected via a mutable mock rather than by setting `window._env_` per test.
const mockEnv: { VITE_APP_COLLAB_URL?: string; VITE_APP_COLLAB_PATH?: string } = {};
vi.mock('@/main/env', () => ({
  get env() {
    return mockEnv;
  },
}));

/** Records outbound frames + drives inbound frames/lifecycle (mirrors the memo provider test). */
class MockWebSocket {
  static readonly CONNECTING = 0;
  static readonly OPEN = 1;
  static readonly CLOSING = 2;
  static readonly CLOSED = 3;

  static instances: MockWebSocket[] = [];

  readonly url: string;
  binaryType = 'arraybuffer';
  readyState: number = MockWebSocket.CONNECTING;
  readonly sent: Uint8Array[] = [];

  onopen: (() => void) | null = null;
  onmessage: ((event: { data: ArrayBuffer }) => void) | null = null;
  onclose: ((event: { code?: number } | null) => void) | null = null;
  onerror: ((event: unknown) => void) | null = null;

  constructor(url: string) {
    this.url = url;
    MockWebSocket.instances.push(this);
  }

  send(data: ArrayBuffer | Uint8Array): void {
    this.sent.push(data instanceof Uint8Array ? data : new Uint8Array(data));
  }

  close(): void {
    this.readyState = MockWebSocket.CLOSED;
    this.onclose?.({ code: 1000 });
  }

  open(): void {
    this.readyState = MockWebSocket.OPEN;
    this.onopen?.();
  }

  deliver(frame: Uint8Array): void {
    const buffer = new ArrayBuffer(frame.byteLength);
    new Uint8Array(buffer).set(frame);
    this.onmessage?.({ data: buffer });
  }
}

const frame = (type: number, payload: Uint8Array): Uint8Array => {
  const encoder = encoding.createEncoder();
  encoding.writeVarUint(encoder, type);
  encoding.writeVarUint8Array(encoder, payload);
  return encoding.toUint8Array(encoder);
};

const controlFrame = (msg: unknown): Uint8Array =>
  frame(WireType.CONTROL, new TextEncoder().encode(JSON.stringify(msg)));

/** Type byte of a `[type as VarUint][payload]` frame. */
const frameType = (f: Uint8Array): number => decoding.readVarUint(decoding.createDecoder(f));

/** Read the inner `[VarUint8Array]` payload of a type-2 ephemeral frame (skip the type byte). */
const ephemeralPayload = (f: Uint8Array): Uint8Array => {
  const decoder = decoding.createDecoder(f);
  decoding.readVarUint(decoder); // discard the type byte
  return decoding.readVarUint8Array(decoder);
};

/**
 * Minimal Excalidraw imperative-API stub the binding can drive. The binding reads
 * scene state and subscribes to onChange; none of those are exercised here beyond
 * confirming the binding wires up, so the methods are inert.
 */
const makeExcalidrawApi = (): ExcalidrawImperativeAPI => {
  const onChangeCallbacks = new Set<(...a: unknown[]) => void>();
  return {
    updateScene: vi.fn(),
    getSceneElementsIncludingDeleted: vi.fn(() => []),
    getFiles: vi.fn(() => ({})),
    addFiles: vi.fn(),
    getAppState: vi.fn(() => ({}) as never),
    onChange: vi.fn((cb: (...a: unknown[]) => void) => {
      onChangeCallbacks.add(cb);
      return () => onChangeCallbacks.delete(cb);
    }),
    dispatchIncomingEmojiReaction: vi.fn(),
    dispatchIncomingCountdownTimer: vi.fn(),
  } as unknown as ExcalidrawImperativeAPI;
};

const user = { id: 'u1', username: 'Ada', color: '#abc' };
const wsPolyfill = MockWebSocket as unknown as typeof WebSocket;

beforeEach(() => {
  MockWebSocket.instances = [];
  vi.stubGlobal('WebSocket', MockWebSocket);
  mockEnv.VITE_APP_COLLAB_URL = 'ws://localhost:3000';
  mockEnv.VITE_APP_COLLAB_PATH = '/collab';
});

afterEach(() => {
  vi.unstubAllGlobals();
  mockEnv.VITE_APP_COLLAB_URL = undefined;
  mockEnv.VITE_APP_COLLAB_PATH = undefined;
});

describe('getWhiteboardCollabUrl', () => {
  it('joins the base + path with a single slash', () => {
    expect(getWhiteboardCollabUrl()).toBe('ws://localhost:3000/collab');
  });

  it('returns null when the base URL is unset', () => {
    mockEnv.VITE_APP_COLLAB_URL = undefined;
    expect(getWhiteboardCollabUrl()).toBeNull();
  });
});

describe('useWhiteboardCollab — provider handshake', () => {
  it('connects to /collab/<whiteboardId>?type=whiteboard', () => {
    const { result, unmount } = renderHook(() =>
      useWhiteboardCollab({ whiteboardId: 'wb-42', user, WebSocketPolyfill: wsPolyfill })
    );
    const [, state] = result.current;
    expect(state.status).toBe('connecting');

    const ws = MockWebSocket.instances[0];
    expect(ws.url).toContain('ws://localhost:3000/collab/wb-42');
    expect(ws.url).toContain('type=whiteboard');
    unmount();
  });

  it('carries the guestName on the handshake for a public whiteboard (FR-010)', () => {
    const { unmount } = renderHook(() =>
      useWhiteboardCollab({ whiteboardId: 'wb-42', user, guestName: 'Guest7', WebSocketPolyfill: wsPolyfill })
    );
    expect(MockWebSocket.instances[0].url).toContain('guestName=Guest7');
    unmount();
  });

  it('reports status connecting → connected on socket open', () => {
    const { result, unmount } = renderHook(() =>
      useWhiteboardCollab({ whiteboardId: 'wb-42', user, WebSocketPolyfill: wsPolyfill })
    );
    act(() => MockWebSocket.instances[0].open());
    expect(result.current[1].status).toBe('connected');
    unmount();
  });

  it('does not create a provider without a whiteboardId', () => {
    const { result, unmount } = renderHook(() => useWhiteboardCollab({ user }));
    expect(result.current[0].provider).toBeNull();
    expect(MockWebSocket.instances).toHaveLength(0);
    unmount();
  });
});

describe('useWhiteboardCollab — binding wiring', () => {
  it('creates the WhiteboardBinding against the provider doc + awareness when the API attaches', () => {
    const { result, unmount } = renderHook(() =>
      useWhiteboardCollab({ whiteboardId: 'wb-42', user, WebSocketPolyfill: wsPolyfill })
    );
    const [api] = result.current;
    expect(api.binding).toBeNull();

    act(() => api.onExcalidrawAPI(makeExcalidrawApi()));

    const [apiAfter] = result.current;
    expect(apiAfter.binding).not.toBeNull();
    // bound to the provider's shared doc
    expect(apiAfter.binding?.ydoc).toBe(apiAfter.doc);
    expect(apiAfter.binding?.ydoc).toBe(apiAfter.provider?.doc);
    // awareness router present (provider awareness wired through)
    expect(apiAfter.binding?.awarenessRouter).toBeDefined();
    unmount();
  });

  it('disposes the binding when the API detaches (onExcalidrawAPI(null))', () => {
    const { result, unmount } = renderHook(() =>
      useWhiteboardCollab({ whiteboardId: 'wb-42', user, WebSocketPolyfill: wsPolyfill })
    );
    act(() => result.current[0].onExcalidrawAPI(makeExcalidrawApi()));
    expect(result.current[0].binding).not.toBeNull();

    act(() => result.current[0].onExcalidrawAPI(null));
    expect(result.current[0].binding).toBeNull();
    unmount();
  });

  it('seeds local presence identity into awareness on bind', () => {
    const { result, unmount } = renderHook(() =>
      useWhiteboardCollab({ whiteboardId: 'wb-42', user, WebSocketPolyfill: wsPolyfill })
    );
    act(() => result.current[0].onExcalidrawAPI(makeExcalidrawApi()));

    const awareness = result.current[0].provider?.awareness;
    const local = awareness?.getStates().get(awareness.clientID) as { user?: { username?: string } } | undefined;
    expect(local?.user?.username).toBe('Ada');
    unmount();
  });
});

describe('useWhiteboardCollab — awareness/ephemeral routing (D4)', () => {
  it('routes a pointer move to awareness (presence), NOT the scene doc or the ephemeral wire', () => {
    const { result, unmount } = renderHook(() =>
      useWhiteboardCollab({ whiteboardId: 'wb-42', user, WebSocketPolyfill: wsPolyfill })
    );
    act(() => result.current[0].onExcalidrawAPI(makeExcalidrawApi()));
    const ws = MockWebSocket.instances[0];
    act(() => ws.open());
    ws.sent.length = 0;

    act(() => result.current[0].onPointerUpdate({ pointer: { x: 5, y: 6 }, button: 'up' }));

    const awareness = result.current[0].provider?.awareness;
    const local = awareness?.getStates().get(awareness.clientID) as { pointer?: { x: number } } | undefined;
    expect(local?.pointer).toEqual({ x: 5, y: 6 });
    // no type-2 ephemeral frame produced for a cursor move
    const ephemeralFrames = ws.sent.filter(f => frameType(f) === WireType.EPHEMERAL);
    expect(ephemeralFrames).toHaveLength(0);
    unmount();
  });

  it('routes an emoji reaction through the type-2 ephemeral channel', () => {
    const { result, unmount } = renderHook(() =>
      useWhiteboardCollab({ whiteboardId: 'wb-42', user, WebSocketPolyfill: wsPolyfill })
    );
    act(() => result.current[0].onExcalidrawAPI(makeExcalidrawApi()));
    const ws = MockWebSocket.instances[0];
    act(() => ws.open());
    ws.sent.length = 0;

    act(() => result.current[0].broadcastEmojiReaction('🎉', 11, 22));

    const ephemeralFrames = ws.sent.filter(f => frameType(f) === WireType.EPHEMERAL);
    expect(ephemeralFrames).toHaveLength(1);
    const event = decodeEphemeralEvent(ephemeralPayload(ephemeralFrames[0]));
    expect(event?.type).toBe('EMOJI_REACTION');
    expect(event?.payload).toMatchObject({ emoji: '🎉', x: 11, y: 22 });
    unmount();
  });

  it('routes a countdown timer through the type-2 ephemeral channel', () => {
    const { result, unmount } = renderHook(() =>
      useWhiteboardCollab({ whiteboardId: 'wb-42', user, WebSocketPolyfill: wsPolyfill })
    );
    act(() => result.current[0].onExcalidrawAPI(makeExcalidrawApi()));
    const ws = MockWebSocket.instances[0];
    act(() => ws.open());
    ws.sent.length = 0;

    act(() => result.current[0].broadcastCountdownTimer(30, 'Ada', true));

    const ephemeralFrames = ws.sent.filter(f => frameType(f) === WireType.EPHEMERAL);
    expect(ephemeralFrames).toHaveLength(1);
    const event = decodeEphemeralEvent(ephemeralPayload(ephemeralFrames[0]));
    expect(event?.type).toBe('COUNTDOWN_TIMER');
    expect(event?.payload).toMatchObject({ remainingSeconds: 30, startedBy: 'Ada', active: true });
    unmount();
  });
});

describe('useWhiteboardCollab — control-message mapping (type 3)', () => {
  const setup = () => {
    const onRemoteSave = vi.fn();
    const onCloseConnection = vi.fn();
    const hook = renderHook(() =>
      useWhiteboardCollab({
        whiteboardId: 'wb-42',
        user,
        onRemoteSave,
        onCloseConnection,
        WebSocketPolyfill: wsPolyfill,
      })
    );
    const ws = MockWebSocket.instances[0];
    act(() => ws.open());
    return { ...hook, ws, onRemoteSave, onCloseConnection };
  };

  it('maps `saved` → onRemoteSave() + lastSaveVersion', () => {
    const { result, ws, onRemoteSave, unmount } = setup();
    act(() => ws.deliver(controlFrame({ kind: 'saved', version: 7 })));
    expect(onRemoteSave).toHaveBeenCalledWith();
    expect(result.current[1].lastSaveVersion).toBe(7);
    unmount();
  });

  it('maps `save-error` → onRemoteSave(error)', () => {
    const { ws, onRemoteSave, unmount } = setup();
    act(() => ws.deliver(controlFrame({ kind: 'save-error', error: 'disk full' })));
    expect(onRemoteSave).toHaveBeenCalledWith('disk full');
    unmount();
  });

  it('maps `read-only-state` → read mode + reason code', () => {
    const { result, ws, unmount } = setup();
    act(() => ws.deliver(controlFrame({ kind: 'read-only-state', readOnly: true, reason: 'room-capacity-reached' })));
    expect(result.current[1].mode).toBe('read');
    expect(result.current[1].readOnlyCode).toBe('roomCapacityReached');

    act(() => ws.deliver(controlFrame({ kind: 'read-only-state', readOnly: false })));
    expect(result.current[1].mode).toBe('write');
    expect(result.current[1].readOnlyCode).toBeUndefined();
    unmount();
  });

  it('maps `room-user-change` → userCount', () => {
    const { result, ws, unmount } = setup();
    act(() => ws.deliver(controlFrame({ kind: 'room-user-change', users: 3 })));
    expect(result.current[1].userCount).toBe(3);
    unmount();
  });

  it('maps `room-closed` → onCloseConnection()', () => {
    const { ws, onCloseConnection, unmount } = setup();
    act(() => ws.deliver(controlFrame({ kind: 'room-closed' })));
    expect(onCloseConnection).toHaveBeenCalled();
    unmount();
  });

  it('ignores an unknown control kind (forward-compat)', () => {
    const { result, ws, unmount } = setup();
    expect(() => act(() => ws.deliver(controlFrame({ kind: 'future-kind', foo: 1 })))).not.toThrow();
    // mode unchanged from its default
    expect(result.current[1].mode).toBe('read');
    unmount();
  });
});

describe('useWhiteboardCollab — offline survival (FR-006 / US5)', () => {
  it('retains the live Y.Doc across a transient disconnect', () => {
    const { result, unmount } = renderHook(() =>
      useWhiteboardCollab({ whiteboardId: 'wb-42', user, WebSocketPolyfill: wsPolyfill })
    );
    const ws = MockWebSocket.instances[0];
    act(() => ws.open());
    const doc = result.current[0].doc;
    doc.getMap('elements').set('probe', 1);

    act(() => ws.close());
    expect(result.current[1].status).toBe('disconnected');
    expect(result.current[0].doc).toBe(doc);
    expect(doc.getMap('elements').get('probe')).toBe(1);
    unmount();
  });
});
