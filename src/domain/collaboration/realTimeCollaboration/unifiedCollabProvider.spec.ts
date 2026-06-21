import * as decoding from 'lib0/decoding';
import * as encoding from 'lib0/encoding';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Awareness, encodeAwarenessUpdate } from 'y-protocols/awareness';
import { messageYjsSyncStep2, readSyncMessage, writeSyncStep1, writeSyncStep2, writeUpdate } from 'y-protocols/sync';
import * as Y from 'yjs';
import { type ControlMessage, UnifiedCollabProvider, WIRE } from './unifiedCollabProvider';

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
  /** Simulate a close with a code. */
  serverClose(code: number): void {
    this.readyState = 3;
    this.emit('close', { code });
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
