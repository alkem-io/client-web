import * as decoding from 'lib0/decoding';
import * as encoding from 'lib0/encoding';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { writeSyncStep2 } from 'y-protocols/sync';
import * as Y from 'yjs';
import {
  type CollaborationState,
  type ControlMessage,
  classifyConnectionEnd,
  DURABILITY_REQUEST_TIMEOUT_MS,
  HEARTBEAT_INTERVAL_MS,
  type SceneSyncPort,
  UnifiedCollabProvider,
  WIRE,
} from './unifiedCollabProvider';

class MockWebSocket {
  static OPEN = 1;
  static instances: MockWebSocket[] = [];

  readonly url: string;
  binaryType = 'blob';
  readyState = 0;
  sent: Uint8Array[] = [];
  closeCalls = 0;
  private listeners: Record<string, ((event: unknown) => void)[]> = {};

  constructor(url: string) {
    this.url = url;
    MockWebSocket.instances.push(this);
  }

  addEventListener(type: string, listener: (event: unknown) => void): void {
    const listeners = this.listeners[type] ?? [];
    listeners.push(listener);
    this.listeners[type] = listeners;
  }

  removeEventListener(type: string, listener: (event: unknown) => void): void {
    this.listeners[type] = (this.listeners[type] ?? []).filter(current => current !== listener);
  }

  send(data: Uint8Array): void {
    this.sent.push(data);
  }

  close(): void {
    this.closeCalls += 1;
    this.readyState = 3;
    this.emit('close', { code: 1000, reason: '' });
  }

  open(): void {
    this.readyState = MockWebSocket.OPEN;
    this.emit('open', {});
  }

  receive(bytes: Uint8Array): void {
    this.emit('message', { data: bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) });
  }

  serverClose(code: number, reason = ''): void {
    this.readyState = 3;
    this.emit('close', { code, reason });
  }

  listenerCount(type: string): number {
    return this.listeners[type]?.length ?? 0;
  }

  private emit(type: string, event: unknown): void {
    for (const listener of [...(this.listeners[type] ?? [])]) listener(event);
  }
}

const BASE_OPTIONS = {
  documentId: 'doc-1',
  type: 'memo' as const,
  baseUrl: 'https://collab.test',
  path: '/collab',
};

function frameType(frame: Uint8Array): number {
  return decoding.readVarUint(decoding.createDecoder(frame));
}

function readyFrame(doc = new Y.Doc()): Uint8Array {
  const encoder = encoding.createEncoder();
  encoding.writeVarUint(encoder, WIRE.SYNC);
  writeSyncStep2(encoder, doc);
  return encoding.toUint8Array(encoder);
}

function controlFrame(message: ControlMessage): Uint8Array {
  const encoder = encoding.createEncoder();
  encoding.writeVarUint(encoder, WIRE.CONTROL);
  encoding.writeUint8Array(encoder, new TextEncoder().encode(JSON.stringify(message)));
  return encoding.toUint8Array(encoder);
}

function jsonBody(frame: Uint8Array): Record<string, unknown> {
  const decoder = decoding.createDecoder(frame);
  decoding.readVarUint(decoder);
  return JSON.parse(new TextDecoder().decode(decoding.readTailAsUint8Array(decoder)));
}

beforeEach(() => {
  MockWebSocket.instances = [];
  vi.stubGlobal('WebSocket', MockWebSocket);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('UnifiedCollabProvider lifecycle', () => {
  it('owns at most one active socket for one document and becomes ready after SyncStep2', () => {
    const states: CollaborationState[] = [];
    const provider = new UnifiedCollabProvider(BASE_OPTIONS);
    provider.on('state', state => states.push(state));
    provider.connect();

    expect(MockWebSocket.instances).toHaveLength(1);
    const socket = MockWebSocket.instances[0];
    socket.open();
    expect(frameType(socket.sent[0])).toBe(WIRE.SYNC);
    socket.receive(readyFrame());

    expect(provider.state).toEqual({ status: 'ready' });
    expect(states).toContainEqual({ status: 'ready' });
    provider.destroy();
  });

  it('disconnect detaches listeners before close and never reconnects', () => {
    vi.useFakeTimers();
    const states: CollaborationState[] = [];
    const provider = new UnifiedCollabProvider(BASE_OPTIONS);
    provider.on('state', state => states.push(state));
    const socket = MockWebSocket.instances[0];
    socket.open();
    socket.receive(readyFrame());

    provider.disconnect();

    expect(socket.listenerCount('close')).toBe(0);
    expect(socket.closeCalls).toBe(1);
    expect(provider.state).toEqual({ status: 'closed' });
    vi.advanceTimersByTime(120_000);
    expect(MockWebSocket.instances).toHaveLength(1);
    expect(states.at(-1)).toEqual({ status: 'closed' });
    provider.destroy();
  });

  it('unexpected closes, including remotely observed 1000, reconnect with the same Y.Doc', () => {
    vi.useFakeTimers();
    const doc = new Y.Doc();
    const provider = new UnifiedCollabProvider({ ...BASE_OPTIONS, doc });
    const first = MockWebSocket.instances[0];
    first.open();
    first.receive(readyFrame());

    first.serverClose(1000);
    expect(provider.state).toEqual({ status: 'reconnecting' });
    vi.advanceTimersByTime(1_000);

    expect(MockWebSocket.instances).toHaveLength(2);
    expect(provider.doc).toBe(doc);
    provider.destroy();
  });

  it('keeps pre-first-sync retries in connecting instead of exposing a false recovered editor', () => {
    vi.useFakeTimers();
    const provider = new UnifiedCollabProvider(BASE_OPTIONS);
    MockWebSocket.instances[0].open();

    MockWebSocket.instances[0].serverClose(1006);
    expect(provider.state).toEqual({ status: 'connecting' });
    vi.advanceTimersByTime(1_000);
    expect(MockWebSocket.instances).toHaveLength(2);
    provider.destroy();
  });

  it('terminal policy closes never retry and unknown 1008 reasons fail closed', () => {
    vi.useFakeTimers();
    const provider = new UnifiedCollabProvider(BASE_OPTIONS);
    MockWebSocket.instances[0].serverClose(1008, 'new-policy-reason');

    expect(provider.state).toEqual({ status: 'closed', reason: 'new-policy-reason' });
    vi.advanceTimersByTime(120_000);
    expect(MockWebSocket.instances).toHaveLength(1);
    expect(classifyConnectionEnd({ code: 1008, reason: '', wasClean: false } as CloseEvent)).toEqual({
      retry: false,
      reason: 'policy-violation',
    });
    provider.destroy();
  });

  it('room capacity is the retryable 1008 policy close', () => {
    vi.useFakeTimers();
    const provider = new UnifiedCollabProvider(BASE_OPTIONS);
    MockWebSocket.instances[0].serverClose(1008, 'room-capacity-reached');
    vi.advanceTimersByTime(1_000);
    expect(MockWebSocket.instances).toHaveLength(2);
    provider.destroy();
  });

  it('does not close a slow first SyncStep2 before any complete inbound frame arrives', () => {
    vi.useFakeTimers();
    const provider = new UnifiedCollabProvider(BASE_OPTIONS);
    const socket = MockWebSocket.instances[0];
    socket.open();

    vi.advanceTimersByTime(10 * 60_000);

    expect(MockWebSocket.instances).toHaveLength(1);
    expect(socket.closeCalls).toBe(0);
    expect(provider.state).toEqual({ status: 'connecting' });
    socket.receive(readyFrame());
    expect(provider.state).toEqual({ status: 'ready' });
    provider.destroy();
  });

  it('uses type-5 heartbeat as its sole liveness probe', () => {
    vi.useFakeTimers();
    const provider = new UnifiedCollabProvider(BASE_OPTIONS);
    const socket = MockWebSocket.instances[0];
    socket.open();
    socket.receive(readyFrame());
    socket.sent.length = 0;

    vi.advanceTimersByTime(HEARTBEAT_INTERVAL_MS);
    expect(socket.sent.map(frameType)).toEqual([WIRE.HEARTBEAT]);

    socket.receive(Uint8Array.of(WIRE.HEARTBEAT));
    vi.advanceTimersByTime(HEARTBEAT_INTERVAL_MS);
    expect(provider.state).toEqual({ status: 'ready' });
    provider.destroy();
  });

  it('reconnects when the heartbeat receives no inbound frame', () => {
    vi.useFakeTimers();
    const provider = new UnifiedCollabProvider(BASE_OPTIONS);
    const socket = MockWebSocket.instances[0];
    socket.open();
    socket.receive(readyFrame());

    vi.advanceTimersByTime(2 * HEARTBEAT_INTERVAL_MS);
    expect(provider.state).toEqual({ status: 'reconnecting' });
    vi.advanceTimersByTime(1_000);
    expect(MockWebSocket.instances).toHaveLength(2);
    provider.destroy();
  });
});

describe('UnifiedCollabProvider durability and protocol', () => {
  it('shares one in-flight durability request between concurrent callers', async () => {
    const provider = new UnifiedCollabProvider(BASE_OPTIONS);
    const socket = MockWebSocket.instances[0];
    socket.open();
    socket.receive(readyFrame());
    socket.sent.length = 0;

    const first = provider.requestDurability();
    const second = provider.requestDurability();
    expect(second).toBe(first);
    expect(socket.sent.map(frameType)).toEqual([WIRE.DURABILITY_REQUEST]);

    const requestId = jsonBody(socket.sent[0]).requestId as string;
    socket.receive(controlFrame({ kind: 'persisted', requestId }));
    await expect(first).resolves.toBeUndefined();
    provider.destroy();
  });

  it('rejects a durability request on disconnect and after its one timeout', async () => {
    vi.useFakeTimers();
    const provider = new UnifiedCollabProvider(BASE_OPTIONS);
    const socket = MockWebSocket.instances[0];
    socket.open();
    socket.receive(readyFrame());

    const timeoutRequest = provider.requestDurability();
    const timeoutAssertion = expect(timeoutRequest).rejects.toThrow('timed out');
    for (let elapsed = 0; elapsed < DURABILITY_REQUEST_TIMEOUT_MS; elapsed += HEARTBEAT_INTERVAL_MS) {
      await vi.advanceTimersByTimeAsync(HEARTBEAT_INTERVAL_MS);
      socket.receive(Uint8Array.of(WIRE.HEARTBEAT));
    }
    await timeoutAssertion;

    const disconnectRequest = provider.requestDurability();
    provider.disconnect();
    await expect(disconnectRequest).rejects.toThrow('closed before the document was persisted');
    provider.destroy();
  });

  it('decodes service control as raw JSON, not a VarString', () => {
    const messages: ControlMessage[] = [];
    const provider = new UnifiedCollabProvider(BASE_OPTIONS);
    provider.on('control', message => messages.push(message));
    const socket = MockWebSocket.instances[0];
    socket.open();

    const message: ControlMessage = { kind: 'read-only-state', readOnly: true, reason: 'no-update-access' };
    const valid = controlFrame(message);
    expect(valid[0]).toBe(WIRE.CONTROL);
    expect(valid[1]).toBe(0x7b);
    socket.receive(valid);

    const invalid = encoding.createEncoder();
    encoding.writeVarUint(invalid, WIRE.CONTROL);
    encoding.writeVarString(invalid, JSON.stringify({ kind: 'saved', version: 1 }));
    socket.receive(encoding.toUint8Array(invalid));

    expect(messages).toEqual([message]);
    provider.destroy();
  });

  it('maps session-end through the same terminal/retry classifier', () => {
    expect(classifyConnectionEnd({ kind: 'session-end', code: 'server-shutdown', disposition: 'transient' })).toEqual({
      retry: true,
      reason: 'server-shutdown',
    });
    expect(classifyConnectionEnd({ kind: 'session-end', code: 'document-deleted', disposition: 'terminal' })).toEqual({
      retry: false,
      reason: 'document-deleted',
    });
  });
});

describe('UnifiedCollabProvider per-document scene port', () => {
  it('keeps a whiteboard scene port independent from another document provider', () => {
    const sceneDoc = new Y.Doc();
    const remoteOrigin = Symbol('remote');
    const port: SceneSyncPort = {
      encodeSceneStateVector: () => Y.encodeStateVector(sceneDoc),
      encodeSceneAsUpdate: (_format, target) => Y.encodeStateAsUpdate(sceneDoc, target),
      applyRemoteSceneUpdate: update => Y.applyUpdate(sceneDoc, update, remoteOrigin),
      onLocalSceneUpdate: listener => {
        const handler = (update: Uint8Array, origin: unknown) => {
          if (origin !== remoteOrigin) listener(update);
        };
        sceneDoc.on('update', handler);
        return () => sceneDoc.off('update', handler);
      },
    };

    const target = new UnifiedCollabProvider({
      ...BASE_OPTIONS,
      documentId: 'target',
      type: 'whiteboard',
      scenePort: port,
    });
    const source = new UnifiedCollabProvider({
      ...BASE_OPTIONS,
      documentId: 'template',
      type: 'whiteboard',
      scenePort: port,
    });

    expect(MockWebSocket.instances).toHaveLength(2);
    expect(MockWebSocket.instances[0].url).toContain('/target?');
    expect(MockWebSocket.instances[1].url).toContain('/template?');
    target.destroy();
    source.destroy();
  });
});
