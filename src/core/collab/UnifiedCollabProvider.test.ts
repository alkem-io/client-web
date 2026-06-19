import * as decoding from 'lib0/decoding';
import * as encoding from 'lib0/encoding';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as Y from 'yjs';
import { UnifiedCollabProvider, WireType } from './UnifiedCollabProvider';

/**
 * Minimal WebSocket stand-in that y-websocket can drive. It records outbound frames
 * and lets the test deliver inbound frames + lifecycle events deterministically.
 */
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

  // --- test drivers ---
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

const jsonPayload = (value: unknown): Uint8Array => new TextEncoder().encode(JSON.stringify(value));

const makeProvider = (overrides: Partial<{ guestName: string; contentType: 'memo' | 'whiteboard' }> = {}) => {
  const doc = new Y.Doc();
  const provider = new UnifiedCollabProvider({
    url: 'wss://example.test/collab',
    documentId: 'doc-123',
    contentType: overrides.contentType ?? 'memo',
    doc,
    guestName: overrides.guestName,
    WebSocketPolyfill: MockWebSocket as unknown as typeof WebSocket,
  });
  return { doc, provider };
};

beforeEach(() => {
  MockWebSocket.instances = [];
  vi.stubGlobal('WebSocket', MockWebSocket);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('UnifiedCollabProvider — connection + handshake', () => {
  it('connects to <url>/<documentId> with the content type on the handshake query', () => {
    const { provider } = makeProvider();
    provider.connect();
    const ws = MockWebSocket.instances[0];
    expect(ws.url).toContain('wss://example.test/collab/doc-123');
    expect(ws.url).toContain('type=memo');
    provider.destroy();
  });

  it('carries an optional guestName on the handshake (public whiteboard, FR-010)', () => {
    const { provider } = makeProvider({ contentType: 'whiteboard', guestName: 'Guest42' });
    provider.connect();
    expect(MockWebSocket.instances[0].url).toContain('guestName=Guest42');
    provider.destroy();
  });

  it('reports status transitions connecting → connected', () => {
    const { provider } = makeProvider();
    provider.connect();
    expect(provider.status).toBe('connecting');
    MockWebSocket.instances[0].open();
    expect(provider.status).toBe('connected');
    provider.destroy();
  });

  it('sends a SyncStep1 (type 0) frame on connect to drive the y-protocols handshake', () => {
    const { provider } = makeProvider();
    provider.connect();
    MockWebSocket.instances[0].open();
    const firstFrame = MockWebSocket.instances[0].sent[0];
    expect(firstFrame).toBeDefined();
    expect(decoding.readVarUint(decoding.createDecoder(firstFrame))).toBe(WireType.SYNC);
    provider.destroy();
  });
});

describe('UnifiedCollabProvider — control channel (type 3)', () => {
  it('decodes inbound control frames and fans them out to onControl listeners', () => {
    const { provider } = makeProvider();
    const received: unknown[] = [];
    provider.onControl(msg => received.push(msg));
    provider.connect();
    const ws = MockWebSocket.instances[0];
    ws.open();

    ws.deliver(frame(WireType.CONTROL, jsonPayload({ kind: 'saved', version: 12 })));
    ws.deliver(
      frame(WireType.CONTROL, jsonPayload({ kind: 'read-only-state', readOnly: true, reason: 'no-update-access' }))
    );

    expect(received).toEqual([
      { kind: 'saved', version: 12 },
      { kind: 'read-only-state', readOnly: true, reason: 'no-update-access' },
    ]);
    provider.destroy();
  });

  it('ignores a malformed control frame without throwing', () => {
    const { provider } = makeProvider();
    const received: unknown[] = [];
    provider.onControl(msg => received.push(msg));
    provider.connect();
    const ws = MockWebSocket.instances[0];
    ws.open();

    expect(() => ws.deliver(frame(WireType.CONTROL, new TextEncoder().encode('{bad')))).not.toThrow();
    expect(received).toHaveLength(0);
    provider.destroy();
  });

  it('stops delivering control messages after the listener unsubscribes', () => {
    const { provider } = makeProvider();
    const received: unknown[] = [];
    const unsubscribe = provider.onControl(msg => received.push(msg));
    provider.connect();
    const ws = MockWebSocket.instances[0];
    ws.open();

    unsubscribe();
    ws.deliver(frame(WireType.CONTROL, jsonPayload({ kind: 'saved', version: 1 })));
    expect(received).toHaveLength(0);
    provider.destroy();
  });
});

describe('UnifiedCollabProvider — ephemeral channel (type 2)', () => {
  it('fans inbound ephemeral payloads out to onEphemeral listeners', () => {
    const { provider } = makeProvider({ contentType: 'whiteboard' });
    const received: Uint8Array[] = [];
    provider.onEphemeral(payload => received.push(payload));
    provider.connect();
    const ws = MockWebSocket.instances[0];
    ws.open();

    const payload = new Uint8Array([1, 2, 3, 4]);
    ws.deliver(frame(WireType.EPHEMERAL, payload));

    expect(received).toHaveLength(1);
    expect(Array.from(received[0])).toEqual([1, 2, 3, 4]);
    provider.destroy();
  });

  it('encodes sendEphemeral as a [type 2][payload] frame on the wire', () => {
    const { provider } = makeProvider({ contentType: 'whiteboard' });
    provider.connect();
    const ws = MockWebSocket.instances[0];
    ws.open();
    ws.sent.length = 0; // drop the handshake frame

    provider.sendEphemeral(new Uint8Array([9, 8, 7]));

    expect(ws.sent).toHaveLength(1);
    const decoder = decoding.createDecoder(ws.sent[0]);
    expect(decoding.readVarUint(decoder)).toBe(WireType.EPHEMERAL);
    expect(Array.from(decoding.readVarUint8Array(decoder))).toEqual([9, 8, 7]);
    provider.destroy();
  });

  it('does not send ephemerals while disconnected', () => {
    const { provider } = makeProvider({ contentType: 'whiteboard' });
    provider.connect();
    const ws = MockWebSocket.instances[0];
    // not opened → readyState CONNECTING
    ws.sent.length = 0;
    provider.sendEphemeral(new Uint8Array([1]));
    expect(ws.sent).toHaveLength(0);
    provider.destroy();
  });
});

describe('UnifiedCollabProvider — offline survival (FR-006 / US5)', () => {
  it('retains the live Y.Doc and its content across a transient disconnect', () => {
    const { doc, provider } = makeProvider();
    provider.connect();
    const ws = MockWebSocket.instances[0];
    ws.open();

    doc.getText('t').insert(0, 'offline edit');
    // Simulate a transient drop.
    ws.close();
    expect(provider.status).toBe('disconnected');

    // The doc must survive so the edit can sync on reconnect.
    expect(doc.getText('t').toString()).toBe('offline edit');
    expect(provider.doc).toBe(doc);
    provider.destroy();
  });
});

describe('UnifiedCollabProvider — CollabProviderLike surface', () => {
  it('exposes a real y-protocols awareness with getStates / setLocalStateField', () => {
    const { provider } = makeProvider();
    provider.awareness.setLocalStateField('user', { id: 'u1', name: 'Ada', color: '#fff' });
    const states = provider.awareness.getStates();
    expect(states.size).toBeGreaterThanOrEqual(1);
    const local = states.get(provider.doc.clientID) as { user?: { name?: string } } | undefined;
    expect(local?.user?.name).toBe('Ada');
    provider.destroy();
  });
});
