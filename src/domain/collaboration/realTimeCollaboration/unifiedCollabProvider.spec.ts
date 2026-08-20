import * as decoding from 'lib0/decoding';
import * as encoding from 'lib0/encoding';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Awareness, encodeAwarenessUpdate } from 'y-protocols/awareness';
import { messageYjsSyncStep2, readSyncMessage, writeSyncStep1, writeSyncStep2, writeUpdate } from 'y-protocols/sync';
import * as Y from 'yjs';
import {
  type CloseVerdict,
  type ControlMessage,
  classifyClose,
  type SceneSyncPort,
  UnifiedCollabProvider,
  WIRE,
} from './unifiedCollabProvider';

/**
 * A controllable WebSocket stand-in. `globalThis.WebSocket` is replaced with this
 * so the provider's frames can be captured and server-shaped frames injected,
 * without a live server. Each instance records the URL it was opened with.
 */
class MockWebSocket {
  static OPEN = 1;
  static instances: MockWebSocket[] = [];

  url: string;
  binaryType = 'blob';
  readyState = 0;
  sent: Uint8Array[] = [];
  private listeners: Record<string, ((event: unknown) => void)[]> = {};

  constructor(url: string) {
    this.url = url;
    MockWebSocket.instances.push(this);
  }

  addEventListener(type: string, listener: (event: unknown) => void): void {
    (this.listeners[type] ??= []).push(listener);
  }
  removeEventListener(type: string, listener: (event: unknown) => void): void {
    this.listeners[type] = (this.listeners[type] ?? []).filter(l => l !== listener);
  }

  send(data: Uint8Array): void {
    this.sent.push(data);
  }
  close(): void {
    this.readyState = 3;
  }

  /** Simulate the socket opening (server accepted the handshake). */
  open(): void {
    this.readyState = MockWebSocket.OPEN;
    this.emit('open', {});
  }
  /** Inject a server→client binary frame. */
  receive(bytes: Uint8Array): void {
    this.emit('message', { data: bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) });
  }
  /** Simulate a close with a code and optional reason (the 1008 policy discriminator). */
  serverClose(code: number, reason = ''): void {
    this.readyState = 3;
    this.emit('close', { code, reason });
  }

  private emit(type: string, event: unknown): void {
    (this.listeners[type] ?? []).forEach(l => l(event));
  }
}

function readFrameType(bytes: Uint8Array): number {
  return decoding.readVarUint(decoding.createDecoder(bytes));
}

beforeEach(() => {
  MockWebSocket.instances = [];
  vi.stubGlobal('WebSocket', MockWebSocket);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('UnifiedCollabProvider', () => {
  const baseOptions = {
    documentId: 'doc-1',
    type: 'whiteboard' as const,
    baseUrl: 'https://collab.test',
    path: '/collab',
  };

  it('builds the y-websocket URL with the content type and upgrades the scheme', () => {
    const provider = new UnifiedCollabProvider(baseOptions);
    expect(MockWebSocket.instances).toHaveLength(1);
    expect(MockWebSocket.instances[0].url).toBe('wss://collab.test/collab/doc-1?type=whiteboard');
    provider.destroy();
  });

  it('passes a guest name through the query string', () => {
    const provider = new UnifiedCollabProvider({ ...baseOptions, type: 'memo', guestName: 'Alice S.' });
    expect(MockWebSocket.instances[0].url).toBe('wss://collab.test/collab/doc-1?type=memo&guestName=Alice+S.');
    provider.destroy();
  });

  it('sends SyncStep1 (type 0) on open and reports connected', () => {
    const statuses: string[] = [];
    const provider = new UnifiedCollabProvider(baseOptions);
    provider.on('status', s => statuses.push(s));

    MockWebSocket.instances[0].open();

    expect(statuses).toContain('connected');
    const firstFrame = MockWebSocket.instances[0].sent[0];
    expect(readFrameType(firstFrame)).toBe(WIRE.SYNC);
    provider.destroy();
  });

  it('applies a server document update into the local doc (sync convergence)', () => {
    const provider = new UnifiedCollabProvider(baseOptions);
    const socket = MockWebSocket.instances[0];
    socket.open();

    // The "server" doc makes an edit; frame it as a sync Update (type 0).
    const serverDoc = new Y.Doc();
    serverDoc.getMap('scene').set('hello', 'world');
    const update = Y.encodeStateAsUpdate(serverDoc);
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, WIRE.SYNC);
    writeUpdate(encoder, update);
    socket.receive(encoding.toUint8Array(encoder));

    expect(provider.doc.getMap('scene').get('hello')).toBe('world');
    provider.destroy();
  });

  it('replies to a server SyncStep1 with a SyncStep2 frame', () => {
    const provider = new UnifiedCollabProvider(baseOptions);
    const socket = MockWebSocket.instances[0];
    socket.open();
    socket.sent.length = 0; // ignore the client's own SyncStep1

    // Server sends SyncStep1 → client must reply SyncStep2 (it answers the read request).
    const serverDoc = new Y.Doc();
    const step1 = encoding.createEncoder();
    encoding.writeVarUint(step1, WIRE.SYNC);
    writeSyncStep1(step1, serverDoc);
    socket.receive(encoding.toUint8Array(step1));

    expect(socket.sent.length).toBeGreaterThan(0);
    const reply = socket.sent[0];
    expect(readFrameType(reply)).toBe(WIRE.SYNC);
    // Decode the reply against the server doc — it is a SyncStep2.
    const dec = decoding.createDecoder(reply);
    decoding.readVarUint(dec); // strip the WIRE.SYNC byte
    const replyType = readSyncMessage(dec, encoding.createEncoder(), serverDoc, null);
    expect(replyType).toBe(messageYjsSyncStep2);
    provider.destroy();
  });

  it('marks synced when the server replies with a SyncStep2', () => {
    const synced: boolean[] = [];
    const provider = new UnifiedCollabProvider(baseOptions);
    provider.on('synced', s => synced.push(s));
    const socket = MockWebSocket.instances[0];
    socket.open();

    // The server answers the client's SyncStep1 with a SyncStep2 (real handshake).
    const serverDoc = new Y.Doc();
    serverDoc.getMap('scene').set('seed', true);
    const step2 = encoding.createEncoder();
    encoding.writeVarUint(step2, WIRE.SYNC);
    writeSyncStep2(step2, serverDoc);
    socket.receive(encoding.toUint8Array(step2));

    expect(synced).toContain(true);
    expect(provider.synced).toBe(true);
    expect(provider.doc.getMap('scene').get('seed')).toBe(true);
    provider.destroy();
  });

  it('forwards local doc edits to the server as sync Update frames', () => {
    const provider = new UnifiedCollabProvider(baseOptions);
    const socket = MockWebSocket.instances[0];
    socket.open();
    socket.sent.length = 0;

    provider.doc.getMap('scene').set('a', 1);

    expect(socket.sent.length).toBeGreaterThan(0);
    expect(readFrameType(socket.sent[0])).toBe(WIRE.SYNC);
    provider.destroy();
  });

  it('does not echo a server-applied update back to the server', () => {
    const provider = new UnifiedCollabProvider(baseOptions);
    const socket = MockWebSocket.instances[0];
    socket.open();
    socket.sent.length = 0;

    const serverDoc = new Y.Doc();
    serverDoc.getMap('scene').set('x', 1);
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, WIRE.SYNC);
    writeUpdate(encoder, Y.encodeStateAsUpdate(serverDoc));
    socket.receive(encoding.toUint8Array(encoder));

    // The applied update must not be re-broadcast (origin === provider).
    expect(socket.sent.length).toBe(0);
    provider.destroy();
  });

  it('decodes a control frame (type 3) and emits it to control listeners', () => {
    const received: ControlMessage[] = [];
    const provider = new UnifiedCollabProvider(baseOptions);
    provider.on('control', m => received.push(m));
    const socket = MockWebSocket.instances[0];
    socket.open();

    const control: ControlMessage = { kind: 'read-only-state', readOnly: true, reason: 'no-update-access' };
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, WIRE.CONTROL);
    encoding.writeVarString(encoder, JSON.stringify(control));
    socket.receive(encoding.toUint8Array(encoder));

    expect(received).toEqual([control]);
    provider.destroy();
  });

  it('routes ephemeral frames (type 2) through the ephemeral channel both ways', () => {
    const provider = new UnifiedCollabProvider(baseOptions);
    const socket = MockWebSocket.instances[0];
    socket.open();
    socket.sent.length = 0;

    // Inbound: a type-2 frame surfaces on the channel subscription.
    const inbound: unknown[] = [];
    provider.ephemeralChannel.subscribe(e => inbound.push(e));
    const event = { type: 'EMOJI_REACTION', payload: { id: 'a', emoji: '🎉', x: 1, y: 2 } } as const;
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, WIRE.EPHEMERAL);
    encoding.writeVarString(encoder, JSON.stringify(event));
    socket.receive(encoding.toUint8Array(encoder));
    expect(inbound).toEqual([event]);

    // Outbound: channel.send frames a type-2 message.
    provider.ephemeralChannel.send(event);
    expect(readFrameType(socket.sent.at(-1) as Uint8Array)).toBe(WIRE.EPHEMERAL);
    provider.destroy();
  });

  it('applies a server awareness frame (type 1) into the shared awareness', () => {
    const sharedAwareness = new Awareness(new Y.Doc());
    const provider = new UnifiedCollabProvider({
      ...baseOptions,
      awareness: sharedAwareness,
      doc: sharedAwareness.doc,
    });
    const socket = MockWebSocket.instances[0];
    socket.open();

    // A "peer" awareness state arrives.
    const peerDoc = new Y.Doc();
    const peerAwareness = new Awareness(peerDoc);
    peerAwareness.setLocalState({ user: { name: 'Bob' } });
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, WIRE.AWARENESS);
    encoding.writeVarUint8Array(encoder, encodeAwarenessUpdate(peerAwareness, [peerDoc.clientID]));
    socket.receive(encoding.toUint8Array(encoder));

    const states = [...sharedAwareness.getStates().values()];
    expect(states.some(s => (s as { user?: { name?: string } }).user?.name === 'Bob')).toBe(true);
    provider.destroy();
  });

  it('reconnects after an unexpected close but not after a normal closure', () => {
    vi.useFakeTimers();
    const provider = new UnifiedCollabProvider(baseOptions);
    MockWebSocket.instances[0].open();

    // Unexpected close (code !== 1000) → a new socket is created after backoff.
    MockWebSocket.instances[0].serverClose(1006);
    vi.advanceTimersByTime(1_000);
    expect(MockWebSocket.instances.length).toBe(2);

    // Normal closure → no further reconnect.
    MockWebSocket.instances[1].open();
    MockWebSocket.instances[1].serverClose(1000);
    vi.advanceTimersByTime(60_000);
    expect(MockWebSocket.instances.length).toBe(2);

    provider.destroy();
    vi.useRealTimers();
  });

  it('stays inert when no collab base URL is configured', () => {
    const provider = new UnifiedCollabProvider({ documentId: 'd', type: 'memo' });
    expect(MockWebSocket.instances).toHaveLength(0);
    expect(provider.status).toBe('connecting');
    provider.destroy();
  });
});

/**
 * Reason-aware 1008 close handling. On a WebSocket policy close (1008) the retry
 * decision depends on the close REASON: `room-capacity-reached` is transient (retry);
 * `forbidden`, `document deleted`, and any unrecognised reason (fail closed) are
 * terminal (never retried). Other codes stay transient — 1011 (authz-backend outage)
 * must remain retryable — while 1000 is a clean closure that is never retried.
 */
describe('UnifiedCollabProvider — reason-aware close classification', () => {
  const baseOptions = {
    documentId: 'doc-1',
    type: 'whiteboard' as const,
    baseUrl: 'https://collab.test',
    path: '/collab',
  };

  it('classifyClose: 1000 normal, 1008 splits terminal/transient by reason, other codes transient', () => {
    // A clean 1000 close is its OWN disposition — never retried, never a reconnect
    // notice (NOT overloaded onto terminal=false, which would read as "retry").
    expect(classifyClose(1000, '').disposition).toBe('normal');
    // The single transient 1008 reason.
    expect(classifyClose(1008, 'room-capacity-reached')).toEqual({
      code: 1008,
      reason: 'room-capacity-reached',
      disposition: 'transient',
    });
    // Terminal 1008 reasons + fail-closed unknown.
    expect(classifyClose(1008, 'forbidden').disposition).toBe('terminal');
    expect(classifyClose(1008, 'document deleted').disposition).toBe('terminal');
    expect(classifyClose(1008, 'some-new-policy').disposition).toBe('terminal');
    expect(classifyClose(1008, '').disposition).toBe('terminal');
    // Other codes reconnect (1011 authz outage stays retryable; 1006 transport drop).
    expect(classifyClose(1011, '').disposition).toBe('transient');
    expect(classifyClose(1006, '').disposition).toBe('transient');
  });

  /** Drive a close with `(code, reason)` and report whether a NEW socket was created. */
  function reconnectsAfterClose(code: number, reason: string): { reconnected: boolean; verdicts: CloseVerdict[] } {
    vi.useFakeTimers();
    const provider = new UnifiedCollabProvider(baseOptions);
    const verdicts: CloseVerdict[] = [];
    provider.on('close', v => verdicts.push(v));
    MockWebSocket.instances[0].open();

    MockWebSocket.instances[0].serverClose(code, reason);
    // Advance well past the longest backoff step — a scheduled reconnect would have
    // opened a second socket by now.
    vi.advanceTimersByTime(60_000);
    const reconnected = MockWebSocket.instances.length > 1;

    provider.destroy();
    vi.useRealTimers();
    return { reconnected, verdicts };
  }

  it('1008 "forbidden" is TERMINAL: no reconnect scheduled and a terminal verdict is emitted', () => {
    const { reconnected, verdicts } = reconnectsAfterClose(1008, 'forbidden');
    expect(reconnected).toBe(false);
    expect(verdicts).toEqual([{ code: 1008, reason: 'forbidden', disposition: 'terminal' }]);
  });

  it('1008 "document deleted" is TERMINAL: no reconnect scheduled', () => {
    const { reconnected, verdicts } = reconnectsAfterClose(1008, 'document deleted');
    expect(reconnected).toBe(false);
    expect(verdicts[0]).toEqual({ code: 1008, reason: 'document deleted', disposition: 'terminal' });
  });

  it('1008 unknown reason is TERMINAL (fail closed): no reconnect scheduled', () => {
    const { reconnected, verdicts } = reconnectsAfterClose(1008, 'mystery-reason');
    expect(reconnected).toBe(false);
    expect(verdicts[0].disposition).toBe('terminal');
    expect(verdicts[0].reason).toBe('mystery-reason');
  });

  it('1008 "room-capacity-reached" is TRANSIENT: a reconnect IS scheduled', () => {
    const { reconnected, verdicts } = reconnectsAfterClose(1008, 'room-capacity-reached');
    expect(reconnected).toBe(true);
    expect(verdicts[0].disposition).toBe('transient');
  });

  it('1011 (authz-backend outage) is TRANSIENT: a reconnect IS scheduled', () => {
    const { reconnected, verdicts } = reconnectsAfterClose(1011, '');
    expect(reconnected).toBe(true);
    expect(verdicts[0].disposition).toBe('transient');
  });

  it('1000 (clean closure) is NORMAL: not retried, not terminal', () => {
    const { reconnected, verdicts } = reconnectsAfterClose(1000, '');
    expect(reconnected).toBe(false);
    expect(verdicts[0].disposition).toBe('normal');
  });
});

/**
 * Whiteboard path: sync flows through the excalidraw editor's scene-sync port
 * instead of a raw `Y.Doc`. These tests pin BYTE-FRAME EQUIVALENCE against the
 * memo raw-doc path — the scene-port provider must put the exact same bytes on
 * the wire that a raw-doc provider driven over the same `Y.Doc` would.
 */
describe('UnifiedCollabProvider — whiteboard scene-sync port', () => {
  const baseOptions = {
    documentId: 'wb-1',
    type: 'whiteboard' as const,
    baseUrl: 'https://collab.test',
    path: '/collab',
  };

  /** The newest MockWebSocket a just-constructed provider opened. */
  function lastSocket(): MockWebSocket {
    return MockWebSocket.instances[MockWebSocket.instances.length - 1];
  }

  /**
   * A fake `SceneSyncPort` backed by a real `Y.Doc` (`sceneDoc`). It models the
   * fork's one-origin policy precisely: remote applies carry `REMOTE_ORIGIN`, and
   * `onLocalSceneUpdate` ignores those, so a remote apply is never echoed. Because
   * it sources/sinks via `Y.encodeStateVector` / `Y.encodeStateAsUpdate` /
   * `Y.applyUpdate` — exactly what the raw-doc path uses — identical doc state
   * yields byte-identical frames.
   */
  function makeFakePort(sceneDoc: Y.Doc) {
    const REMOTE_ORIGIN = Symbol('remote-scene-apply');
    const activeCallbacks = new Set<(update: Uint8Array) => void>();
    const port: SceneSyncPort = {
      encodeSceneStateVector: () => Y.encodeStateVector(sceneDoc),
      encodeSceneAsUpdate: (_format, targetStateVector) => Y.encodeStateAsUpdate(sceneDoc, targetStateVector),
      applyRemoteSceneUpdate: update => Y.applyUpdate(sceneDoc, update, REMOTE_ORIGIN),
      onLocalSceneUpdate: cb => {
        const handler = (update: Uint8Array, origin: unknown) => {
          // Remote applies (REMOTE_ORIGIN) are never delivered here — no echo.
          if (origin !== REMOTE_ORIGIN) cb(update);
        };
        sceneDoc.on('update', handler);
        activeCallbacks.add(cb);
        return () => {
          sceneDoc.off('update', handler);
          activeCallbacks.delete(cb);
        };
      },
    };
    return { port, REMOTE_ORIGIN, activeCallbacks };
  }

  it('sends a SyncStep1 open frame BYTE-IDENTICAL to the raw-doc path', () => {
    const sceneDoc = new Y.Doc();
    sceneDoc.getMap('scene').set('el-1', { x: 10 });

    // Raw-doc provider over the SAME doc → the reference frame.
    const rawProvider = new UnifiedCollabProvider({ ...baseOptions, doc: sceneDoc });
    const rawSocket = lastSocket();
    rawSocket.open();
    const rawFrame = rawSocket.sent[0];

    // Scene-port provider over a fake port wrapping the SAME doc.
    const { port } = makeFakePort(sceneDoc);
    const sceneProvider = new UnifiedCollabProvider({ ...baseOptions, scenePort: port });
    const sceneSocket = lastSocket();
    sceneSocket.open();
    const sceneFrame = sceneSocket.sent[0];

    expect(readFrameType(sceneFrame)).toBe(WIRE.SYNC);
    expect(sceneFrame).toEqual(rawFrame);

    rawProvider.destroy();
    sceneProvider.destroy();
  });

  it('replies to a server SyncStep1 with a SyncStep2 frame BYTE-IDENTICAL to the raw-doc path', () => {
    const sceneDoc = new Y.Doc();
    sceneDoc.getMap('scene').set('el-1', { x: 10 });
    sceneDoc.getMap('scene').set('el-2', { x: 20 });

    // A fresh peer (empty state vector) → the reply delta is the full scene state.
    const peerDoc = new Y.Doc();
    const serverStep1 = encoding.createEncoder();
    encoding.writeVarUint(serverStep1, WIRE.SYNC);
    writeSyncStep1(serverStep1, peerDoc);
    const step1Frame = encoding.toUint8Array(serverStep1);

    const rawProvider = new UnifiedCollabProvider({ ...baseOptions, doc: sceneDoc });
    const rawSocket = lastSocket();
    rawSocket.open();
    rawSocket.sent.length = 0;
    rawSocket.receive(step1Frame);
    const rawReply = rawSocket.sent[0];

    const { port } = makeFakePort(sceneDoc);
    const sceneProvider = new UnifiedCollabProvider({ ...baseOptions, scenePort: port });
    const sceneSocket = lastSocket();
    sceneSocket.open();
    sceneSocket.sent.length = 0;
    sceneSocket.receive(step1Frame);
    const sceneReply = sceneSocket.sent[0];

    // Both replies decode as a SyncStep2 against the peer doc, and are byte-equal.
    const dec = decoding.createDecoder(sceneReply);
    decoding.readVarUint(dec); // strip WIRE.SYNC
    expect(readSyncMessage(dec, encoding.createEncoder(), peerDoc, null)).toBe(messageYjsSyncStep2);
    expect(sceneReply).toEqual(rawReply);

    rawProvider.destroy();
    sceneProvider.destroy();
  });

  it('frames a local scene edit as an Update BYTE-IDENTICAL to the raw-doc path', () => {
    const sceneDoc = new Y.Doc();

    const rawProvider = new UnifiedCollabProvider({ ...baseOptions, doc: sceneDoc });
    const rawSocket = lastSocket();
    rawSocket.open();

    const { port } = makeFakePort(sceneDoc);
    const sceneProvider = new UnifiedCollabProvider({ ...baseOptions, scenePort: port });
    const sceneSocket = lastSocket();
    sceneSocket.open();

    rawSocket.sent.length = 0;
    sceneSocket.sent.length = 0;

    // One local edit fires BOTH observers with the same update bytes.
    sceneDoc.getMap('scene').set('a', 1);

    expect(readFrameType(sceneSocket.sent[0])).toBe(WIRE.SYNC);
    expect(sceneSocket.sent[0]).toEqual(rawSocket.sent[0]);
    // Exactly one frame each — no duplicate / echo.
    expect(sceneSocket.sent.length).toBe(1);

    rawProvider.destroy();
    sceneProvider.destroy();
  });

  it('throws on an unknown sync sub-type — frame-for-frame parity with y-protocols', () => {
    const sceneDoc = new Y.Doc();
    const { port } = makeFakePort(sceneDoc);
    const provider = new UnifiedCollabProvider({ ...baseOptions, scenePort: port });
    const socket = lastSocket();
    socket.open();
    socket.sent.length = 0;

    // WIRE.SYNC + an unknown sync sub-type (99). y-protocols `readSyncMessage` throws
    // 'Unknown message type'; the hand-rolled scene-port path must match — fail loud
    // rather than silently diverging. (No resync handler catches this; none is needed —
    // post-cutover ingress validation means malformed bytes can't reach a client.)
    const enc = encoding.createEncoder();
    encoding.writeVarUint(enc, WIRE.SYNC);
    encoding.writeVarUint(enc, 99);
    expect(() => socket.receive(encoding.toUint8Array(enc))).toThrow('Unknown message type');

    provider.destroy();
  });

  it('applies a server document Update through the port (sync convergence)', () => {
    const sceneDoc = new Y.Doc();
    const { port } = makeFakePort(sceneDoc);
    const provider = new UnifiedCollabProvider({ ...baseOptions, scenePort: port });
    const socket = lastSocket();
    socket.open();

    const serverDoc = new Y.Doc();
    serverDoc.getMap('scene').set('hello', 'world');
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, WIRE.SYNC);
    writeUpdate(encoder, Y.encodeStateAsUpdate(serverDoc));
    socket.receive(encoding.toUint8Array(encoder));

    expect(sceneDoc.getMap('scene').get('hello')).toBe('world');
    provider.destroy();
  });

  it('marks synced when the server replies with a SyncStep2 (first time only)', () => {
    const synced: boolean[] = [];
    const sceneDoc = new Y.Doc();
    const { port } = makeFakePort(sceneDoc);
    const provider = new UnifiedCollabProvider({ ...baseOptions, scenePort: port });
    provider.on('synced', s => synced.push(s));
    const socket = lastSocket();
    socket.open();

    const serverDoc = new Y.Doc();
    serverDoc.getMap('scene').set('seed', true);
    const step2 = encoding.createEncoder();
    encoding.writeVarUint(step2, WIRE.SYNC);
    writeSyncStep2(step2, serverDoc);
    socket.receive(encoding.toUint8Array(step2));

    expect(provider.synced).toBe(true);
    expect(synced).toEqual([true]);
    expect(sceneDoc.getMap('scene').get('seed')).toBe(true);

    // A second SyncStep2 must NOT re-fire the synced listener.
    const serverDoc2 = new Y.Doc();
    serverDoc2.getMap('scene').set('more', 1);
    const step2b = encoding.createEncoder();
    encoding.writeVarUint(step2b, WIRE.SYNC);
    writeSyncStep2(step2b, serverDoc2);
    socket.receive(encoding.toUint8Array(step2b));

    expect(synced).toEqual([true]);
    provider.destroy();
  });

  it('does NOT echo a server-applied update back to the server', () => {
    const sceneDoc = new Y.Doc();
    const { port } = makeFakePort(sceneDoc);
    const provider = new UnifiedCollabProvider({ ...baseOptions, scenePort: port });
    const socket = lastSocket();
    socket.open();
    socket.sent.length = 0;

    const serverDoc = new Y.Doc();
    serverDoc.getMap('scene').set('x', 1);
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, WIRE.SYNC);
    writeUpdate(encoder, Y.encodeStateAsUpdate(serverDoc));
    socket.receive(encoding.toUint8Array(encoder));

    // Applied into the scene doc, but the remote-origin apply is never echoed.
    expect(sceneDoc.getMap('scene').get('x')).toBe(1);
    expect(socket.sent.length).toBe(0);
    provider.destroy();
  });

  it('destroy() unsubscribes onLocalSceneUpdate and destroys the owned awareness doc', () => {
    const sceneDoc = new Y.Doc();
    const { port, activeCallbacks } = makeFakePort(sceneDoc);
    const provider = new UnifiedCollabProvider({ ...baseOptions, scenePort: port });
    const socket = lastSocket();
    socket.open();

    // The provider owns a SEPARATE awareness-only doc — never the scene doc.
    const awarenessDoc = provider.doc;
    expect(awarenessDoc).not.toBe(sceneDoc);
    expect(activeCallbacks.size).toBe(1);

    provider.destroy();

    // The local-scene subscription is gone …
    expect(activeCallbacks.size).toBe(0);
    // … so a later local edit produces no outbound frame.
    socket.sent.length = 0;
    sceneDoc.getMap('scene').set('after', 1);
    expect(socket.sent.length).toBe(0);
    // … and the provider-owned awareness doc is destroyed.
    expect(awarenessDoc.isDestroyed).toBe(true);
    // The scene doc (owned by the editor) is left intact.
    expect(sceneDoc.isDestroyed).toBe(false);
  });

  it('carries local awareness on a provider-owned awareness doc distinct from the scene', () => {
    const sceneDoc = new Y.Doc();
    const { port } = makeFakePort(sceneDoc);
    const provider = new UnifiedCollabProvider({ ...baseOptions, scenePort: port });
    const socket = lastSocket();
    socket.open();
    socket.sent.length = 0;

    // A local awareness change broadcasts a type-1 frame and never touches the scene.
    provider.awareness.setLocalState({ user: { name: 'Carol' } });
    expect(socket.sent.length).toBeGreaterThan(0);
    expect(readFrameType(socket.sent[socket.sent.length - 1])).toBe(WIRE.AWARENESS);
    expect(sceneDoc.getMap('scene').size).toBe(0);

    provider.destroy();
  });
});
