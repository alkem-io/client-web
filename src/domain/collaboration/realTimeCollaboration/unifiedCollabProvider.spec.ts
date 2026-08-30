import * as decoding from 'lib0/decoding';
import * as encoding from 'lib0/encoding';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  messageYjsSyncStep1,
  messageYjsSyncStep2,
  messageYjsUpdate,
  writeSyncStep1,
  writeSyncStep2,
} from 'y-protocols/sync';
import * as Y from 'yjs';
import { type CollaborationState, UnifiedCollabProvider, WIRE } from './unifiedCollabProvider';

class MockWebSocket {
  static OPEN = 1;
  static instances: MockWebSocket[] = [];
  readonly url: string;
  binaryType = 'blob';
  readyState = 0;
  sent: Uint8Array[] = [];
  closes: Array<{ code: number; reason: string }> = [];
  private listeners = new Map<string, Set<(event: never) => void>>();

  constructor(url: string) {
    this.url = url;
    MockWebSocket.instances.push(this);
  }
  addEventListener(type: string, listener: (event: never) => void) {
    const set = this.listeners.get(type) ?? new Set();
    set.add(listener);
    this.listeners.set(type, set);
  }
  removeEventListener(type: string, listener: (event: never) => void) {
    this.listeners.get(type)?.delete(listener);
  }
  send(frame: Uint8Array) {
    this.sent.push(frame);
  }
  close(code = 1000, reason = '') {
    this.closes.push({ code, reason });
    this.serverClose(code, reason);
  }
  open() {
    this.readyState = MockWebSocket.OPEN;
  }
  receive(frame: Uint8Array) {
    const data = frame.buffer.slice(frame.byteOffset, frame.byteOffset + frame.byteLength);
    this.emit('message', { data });
  }
  serverClose(code: number, reason = '') {
    this.readyState = 3;
    this.emit('close', { currentTarget: this, code, reason });
  }
  private emit(type: string, event: unknown) {
    for (const listener of this.listeners.get(type) ?? []) listener(event as never);
  }
}

const options = {
  documentId: 'doc-1',
  type: 'memo' as const,
  baseUrl: 'https://collab.test',
  path: '/collab',
};
const socket = () => MockWebSocket.instances[MockWebSocket.instances.length - 1] as MockWebSocket;
const frameType = (frame: Uint8Array) => decoding.readVarUint(decoding.createDecoder(frame));
const heartbeatFixtureHex = '050731353030302d31'; // type 5 + VarString('15000-1')
const toHex = (frame: Uint8Array) => Array.from(frame, byte => byte.toString(16).padStart(2, '0')).join('');
const control = (body: object) => {
  const encoder = encoding.createEncoder();
  encoding.writeVarUint(encoder, WIRE.CONTROL);
  encoding.writeUint8Array(encoder, new TextEncoder().encode(JSON.stringify(body)));
  return encoding.toUint8Array(encoder);
};
const syncStep1 = (doc = new Y.Doc()) => {
  const encoder = encoding.createEncoder();
  encoding.writeVarUint(encoder, WIRE.SYNC);
  writeSyncStep1(encoder, doc);
  return encoding.toUint8Array(encoder);
};
const syncStep2 = (doc = new Y.Doc()) => {
  const encoder = encoding.createEncoder();
  encoding.writeVarUint(encoder, WIRE.SYNC);
  writeSyncStep2(encoder, doc);
  return encoding.toUint8Array(encoder);
};
const admitAndSync = (provider: UnifiedCollabProvider, mode: 'read' | 'write' = 'write') => {
  const ws = socket();
  ws.open();
  ws.receive(control({ kind: 'admission', mode }));
  ws.receive(syncStep2());
  expect(provider.state.kind).toBe('active');
  return ws;
};

beforeEach(() => {
  MockWebSocket.instances = [];
  vi.stubGlobal('WebSocket', MockWebSocket);
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('UnifiedCollabProvider — one per-document loop', () => {
  it('builds the document URL and carries the validated guest identity', () => {
    const provider = new UnifiedCollabProvider({ ...options, guestName: 'Guest A' });
    expect(socket().url).toBe('wss://collab.test/collab/doc-1?type=memo&guestName=Guest+A');
    provider.destroy();
  });

  it('waits for admission, then sends SyncStep1 as the first client frame', () => {
    const provider = new UnifiedCollabProvider(options);
    socket().open();
    expect(socket().sent).toEqual([]);
    socket().receive(control({ kind: 'admission', mode: 'write' }));
    expect(frameType(socket().sent[0])).toBe(WIRE.SYNC);
    const decoder = decoding.createDecoder(socket().sent[0]);
    decoding.readVarUint(decoder);
    expect(decoding.readVarUint(decoder)).toBe(messageYjsSyncStep1);
    provider.destroy();
  });

  it('keeps local edits in the document until a write admission permits transmission', () => {
    const provider = new UnifiedCollabProvider(options);
    socket().open();
    provider.doc.getText('content').insert(0, 'local');
    expect(socket().sent).toEqual([]);
    expect(provider.hasChangesAtRisk).toBe(true);

    socket().receive(control({ kind: 'admission', mode: 'write' }));
    socket().receive(syncStep1());
    const sent = socket().sent;
    const reply = sent[sent.length - 1] as Uint8Array;
    const decoder = decoding.createDecoder(reply);
    decoding.readVarUint(decoder);
    expect(decoding.readVarUint(decoder)).toBe(messageYjsSyncStep2);
    expect(Y.decodeUpdate(decoding.readVarUint8Array(decoder)).structs).not.toHaveLength(0);
    expect(provider.hasChangesAtRisk).toBe(false);
    provider.destroy();
  });

  it('delivers an admitted write update while the server handshake reply is still pending', () => {
    const provider = new UnifiedCollabProvider(options);
    socket().open();
    socket().receive(control({ kind: 'admission', mode: 'write' }));
    const sentBeforeEdit = socket().sent.length;

    provider.doc.getText('content').insert(0, 'during-handshake');

    expect(socket().sent).toHaveLength(sentBeforeEdit + 1);
    const decoder = decoding.createDecoder(socket().sent[sentBeforeEdit] as Uint8Array);
    expect(decoding.readVarUint(decoder)).toBe(WIRE.SYNC);
    expect(decoding.readVarUint(decoder)).toBe(messageYjsUpdate);
    expect(provider.hasChangesAtRisk).toBe(false);
    provider.destroy();
  });

  it('projects Saved as soon as a local delta is delivered without waiting for persistence', () => {
    const provider = new UnifiedCollabProvider(options);
    admitAndSync(provider);
    const states: CollaborationState[] = [];
    provider.subscribe(state => states.push(state));

    provider.doc.getText('content').insert(0, 'delivered');

    expect(states.slice(-2)).toEqual([
      { kind: 'active', access: 'write', save: 'saving' },
      { kind: 'active', access: 'write', save: 'saved' },
    ]);
    expect(provider.hasUnsavedChanges).toBe(true);
    expect(provider.hasChangesAtRisk).toBe(false);
    provider.destroy();
  });

  it('applies the server snapshot and becomes writable only after SyncStep2', () => {
    const provider = new UnifiedCollabProvider(options);
    const states: CollaborationState[] = [];
    provider.subscribe(state => states.push(state));
    const server = new Y.Doc();
    server.getText('content').insert(0, 'hello');
    socket().open();
    socket().receive(control({ kind: 'admission', mode: 'write' }));
    socket().receive(syncStep2(server));
    expect(provider.doc.getText('content').toString()).toBe('hello');
    expect(states[states.length - 1]).toEqual({ kind: 'active', access: 'write', save: 'saved' });
    provider.destroy();
  });

  it('never sends local state into a read admission and ends only when a local delta exists', () => {
    const local = new Y.Doc();
    local.getText('content').insert(0, 'private edit');
    const provider = new UnifiedCollabProvider({ ...options, doc: local });
    socket().open();
    socket().receive(control({ kind: 'admission', mode: 'read', reason: 'no-update-access' }));
    socket().receive(syncStep1());
    const sent = socket().sent;
    const reply = sent[sent.length - 1] as Uint8Array;
    const decoder = decoding.createDecoder(reply);
    decoding.readVarUint(decoder);
    expect(decoding.readVarUint(decoder)).toBe(messageYjsSyncStep2);
    expect(Y.decodeUpdate(decoding.readVarUint8Array(decoder)).structs).toHaveLength(0);
    socket().receive(syncStep2());
    expect(provider.state).toEqual({
      kind: 'ended',
      reason: 'access-changed-with-local-edits',
      recovery: 'reload',
    });
    expect(provider.hasChangesAtRisk).toBe(true);
    provider.destroy();
  });

  it('keeps a clean read admission active and exposes its stable permission reason', () => {
    const provider = new UnifiedCollabProvider(options);
    socket().open();
    socket().receive(control({ kind: 'admission', mode: 'read', reason: 'not-authenticated' }));
    socket().receive(syncStep2());
    expect(provider.state).toEqual({ kind: 'active', access: 'read', save: 'saved' });
    expect(provider.readOnlyReason).toBe('notAuthenticated');
    provider.destroy();
  });

  it('treats every untyped remote close except 1008 as transient and redials the same doc', async () => {
    vi.useFakeTimers();
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const provider = new UnifiedCollabProvider(options);
    const doc = provider.doc;
    admitAndSync(provider);
    socket().serverClose(1000);
    expect(provider.state).toEqual({ kind: 'active', access: 'write', save: 'offline' });
    await vi.advanceTimersByTimeAsync(0);
    expect(MockWebSocket.instances).toHaveLength(2);
    expect(provider.doc).toBe(doc);
    provider.destroy();
  });

  it('keeps the patient backoff loop running when the browser reports offline', async () => {
    vi.useFakeTimers();
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    vi.stubGlobal('navigator', { onLine: false });
    const provider = new UnifiedCollabProvider(options);
    expect(MockWebSocket.instances).toHaveLength(1);
    admitAndSync(provider);
    socket().serverClose(1006);
    await vi.advanceTimersByTimeAsync(499);
    expect(MockWebSocket.instances).toHaveLength(1);
    await vi.advanceTimersByTimeAsync(1);
    expect(MockWebSocket.instances).toHaveLength(2);
    provider.destroy();
  });

  it('re-emits the offline projection when a local edit makes the document dirty', () => {
    const provider = new UnifiedCollabProvider(options);
    admitAndSync(provider);
    socket().serverClose(1006);
    const states: CollaborationState[] = [];
    provider.subscribe(state => states.push(state));
    provider.doc.getText('content').insert(0, 'offline edit');
    expect(states[states.length - 1]).toEqual({ kind: 'active', access: 'write', save: 'offline' });
    expect(provider.hasUnsavedChanges).toBe(true);
    expect(provider.hasChangesAtRisk).toBe(true);
    provider.destroy();
  });

  it('re-proves delivery from the server state vector after reconnect', async () => {
    vi.useFakeTimers();
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const provider = new UnifiedCollabProvider(options);
    admitAndSync(provider);
    provider.doc.getText('content').insert(0, 'delivered');
    expect(provider.hasChangesAtRisk).toBe(false);
    const server = new Y.Doc();
    Y.applyUpdate(server, Y.encodeStateAsUpdate(provider.doc));

    socket().serverClose(1006);
    expect(provider.hasChangesAtRisk).toBe(true);
    await vi.advanceTimersByTimeAsync(0);
    const reconnect = socket();
    reconnect.open();
    reconnect.receive(control({ kind: 'admission', mode: 'write' }));
    reconnect.receive(syncStep1(server));
    reconnect.receive(syncStep2(server));

    expect(provider.state).toEqual({ kind: 'active', access: 'write', save: 'saved' });
    expect(provider.hasUnsavedChanges).toBe(true);
    expect(provider.hasChangesAtRisk).toBe(false);
    provider.destroy();
    server.destroy();
  });

  it('fails closed on untyped 1008 and never schedules another dial', async () => {
    vi.useFakeTimers();
    const provider = new UnifiedCollabProvider(options);
    admitAndSync(provider);
    socket().serverClose(1008, 'forbidden');
    expect(provider.state).toEqual({ kind: 'ended', reason: 'forbidden', recovery: 'none' });
    expect(MockWebSocket.instances).toHaveLength(1);
    provider.destroy();
  });

  it('keeps a terminal end final when the retained local document changes', () => {
    const provider = new UnifiedCollabProvider(options);
    admitAndSync(provider);
    socket().serverClose(1008, 'forbidden');

    provider.doc.getText('content').insert(0, 'local edit after refusal');

    expect(provider.state).toEqual({ kind: 'ended', reason: 'forbidden', recovery: 'none' });
    provider.destroy();
  });

  it('lets the typed disposition override the following socket status', async () => {
    vi.useFakeTimers();
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const provider = new UnifiedCollabProvider(options);
    admitAndSync(provider);
    socket().receive(
      control({ kind: 'session-end', code: 'server-shutdown', scope: 'document', disposition: 'transient' })
    );
    await vi.advanceTimersByTimeAsync(0);
    expect(MockWebSocket.instances).toHaveLength(2);
    provider.destroy();
  });

  it('intentional destroy detaches close handling before close(1000)', async () => {
    vi.useFakeTimers();
    const provider = new UnifiedCollabProvider(options);
    const states: CollaborationState[] = [];
    provider.subscribe(state => states.push(state));
    admitAndSync(provider);
    const before = states.length;
    provider.destroy();
    await vi.advanceTimersByTimeAsync(0);
    expect(socket().closes).toContainEqual({ code: 1000, reason: '' });
    expect(MockWebSocket.instances).toHaveLength(1);
    expect(states).toHaveLength(before);
  });

  it('probes at the fixed interval, accepts only the exact echo, and retries after timeout', async () => {
    vi.useFakeTimers();
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const provider = new UnifiedCollabProvider(options);
    const ws = admitAndSync(provider);
    await vi.advanceTimersByTimeAsync(15_000);
    const probe = ws.sent.find(frame => frameType(frame) === WIRE.HEARTBEAT) as Uint8Array;
    expect(probe).toBeDefined();
    ws.receive(control({ kind: 'collaborator-count', users: 2 }));
    await vi.advanceTimersByTimeAsync(10_000);
    await vi.advanceTimersByTimeAsync(1);
    expect(ws.closes).toContainEqual({ code: 4000, reason: 'heartbeat-timeout' });
    expect(MockWebSocket.instances.length).toBeGreaterThan(1);
    provider.destroy();
  });

  it('an exact heartbeat echo starts the next verified-round-trip interval', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    const provider = new UnifiedCollabProvider(options);
    const ws = admitAndSync(provider);
    await vi.advanceTimersByTimeAsync(15_000);
    const probe = ws.sent[ws.sent.length - 1] as Uint8Array;
    expect(toHex(probe)).toBe(heartbeatFixtureHex);
    ws.receive(probe);
    await vi.advanceTimersByTimeAsync(9_999);
    expect(ws.closes).toEqual([]);
    provider.destroy();
  });

  it('starts a fresh heartbeat round trip after the page becomes visible', () => {
    vi.useFakeTimers();
    const listeners = new Map<string, EventListener>();
    vi.stubGlobal('document', {
      visibilityState: 'hidden',
      addEventListener: (type: string, listener: EventListener) => listeners.set(type, listener),
      removeEventListener: (type: string) => listeners.delete(type),
    });
    const provider = new UnifiedCollabProvider(options);
    const ws = admitAndSync(provider);
    Object.assign(document, { visibilityState: 'visible' });
    listeners.get('visibilitychange')?.(new Event('visibilitychange'));
    expect(ws.sent.filter(frame => frameType(frame) === WIRE.HEARTBEAT)).toHaveLength(1);
    provider.destroy();
  });

  it('publishes pending assets before the one durability barrier', async () => {
    let release!: () => void;
    const beforeSave = vi.fn(() => new Promise<void>(resolve => (release = resolve)));
    const provider = new UnifiedCollabProvider({ ...options, beforeSave });
    const ws = admitAndSync(provider);
    provider.doc.getText('content').insert(0, 'with image');
    const saved = provider.requestDurability();
    expect(beforeSave).toHaveBeenCalledOnce();
    expect(ws.sent.filter(frame => frameType(frame) === WIRE.DURABILITY_REQUEST)).toEqual([]);

    release();
    await vi.waitFor(() =>
      expect(ws.sent.filter(frame => frameType(frame) === WIRE.DURABILITY_REQUEST)).toHaveLength(1)
    );
    const request = ws.sent.find(frame => frameType(frame) === WIRE.DURABILITY_REQUEST) as Uint8Array;
    const requestId = (JSON.parse(new TextDecoder().decode(request.slice(1))) as { requestId: string }).requestId;
    ws.receive(control({ kind: 'persisted', requestId }));
    await expect(saved).resolves.toBeUndefined();
    provider.destroy();
  });

  it('does not create a barrier on a dead socket when asset publication finishes after disconnect', async () => {
    let release!: () => void;
    const provider = new UnifiedCollabProvider({
      ...options,
      beforeSave: () => new Promise<void>(resolve => (release = resolve)),
    });
    const ws = admitAndSync(provider);
    provider.doc.getText('content').insert(0, 'with image');
    const saved = provider.requestDurability();
    ws.serverClose(1006);
    release();
    await expect(saved).rejects.toThrow('offline');
    expect(ws.sent.filter(frame => frameType(frame) === WIRE.DURABILITY_REQUEST)).toEqual([]);
    provider.destroy();
  });

  it('does not create a barrier when asset publication finishes after destroy', async () => {
    let release!: () => void;
    const provider = new UnifiedCollabProvider({
      ...options,
      beforeSave: () => new Promise<void>(resolve => (release = resolve)),
    });
    const ws = admitAndSync(provider);
    provider.doc.getText('content').insert(0, 'with image');
    const saved = provider.requestDurability();
    provider.destroy();
    release();
    await expect(saved).rejects.toThrow('offline');
    expect(ws.sent.filter(frame => frameType(frame) === WIRE.DURABILITY_REQUEST)).toEqual([]);
  });

  it('coalesces durability callers and does not let a stale ack mark a later edit saved', async () => {
    const provider = new UnifiedCollabProvider(options);
    const ws = admitAndSync(provider);
    provider.doc.getText('content').insert(0, 'a');
    const first = provider.requestDurability();
    const second = provider.requestDurability();
    const requests = () => ws.sent.filter(frame => frameType(frame) === WIRE.DURABILITY_REQUEST);
    expect(requests()).toHaveLength(1);
    provider.doc.getText('content').insert(1, 'b');
    const requestId = (JSON.parse(new TextDecoder().decode(requests()[0].slice(1))) as { requestId: string }).requestId;
    ws.receive(control({ kind: 'persisted', requestId }));
    await vi.waitFor(() => expect(requests()).toHaveLength(2));
    expect(provider.state).toEqual({ kind: 'active', access: 'write', save: 'saved' });
    expect(provider.hasUnsavedChanges).toBe(true);
    const nextId = (JSON.parse(new TextDecoder().decode(requests()[1].slice(1))) as { requestId: string }).requestId;
    ws.receive(control({ kind: 'persisted', requestId: nextId }));
    await expect(Promise.all([first, second])).resolves.toEqual([undefined, undefined]);
    expect(provider.state).toEqual({ kind: 'active', access: 'write', save: 'saved' });
    provider.destroy();
  });

  it('keeps delivered changes at risk after a durability failure until persistence succeeds', async () => {
    const provider = new UnifiedCollabProvider(options);
    const ws = admitAndSync(provider);
    provider.doc.getText('content').insert(0, 'delivered');
    expect(provider.hasChangesAtRisk).toBe(false);

    const failed = provider.requestDurability();
    const request = ws.sent.find(frame => frameType(frame) === WIRE.DURABILITY_REQUEST) as Uint8Array;
    const failedId = (JSON.parse(new TextDecoder().decode(request.slice(1))) as { requestId: string }).requestId;
    ws.receive(control({ kind: 'persist-failed', requestId: failedId, error: 'storage unavailable' }));
    await expect(failed).rejects.toThrow('storage unavailable');
    expect(provider.state).toEqual({ kind: 'active', access: 'write', save: 'saved' });
    expect(provider.hasChangesAtRisk).toBe(true);

    const retried = provider.requestDurability();
    const requests = ws.sent.filter(frame => frameType(frame) === WIRE.DURABILITY_REQUEST);
    const retriedId = (JSON.parse(new TextDecoder().decode(requests[1].slice(1))) as { requestId: string }).requestId;
    ws.receive(control({ kind: 'persisted', requestId: retriedId }));
    await expect(retried).resolves.toBeUndefined();
    expect(provider.hasChangesAtRisk).toBe(false);
    provider.destroy();
  });

  it('treats an uncorrelated room save error as durability risk without changing transport state', async () => {
    const provider = new UnifiedCollabProvider(options);
    const ws = admitAndSync(provider);
    provider.doc.getText('content').insert(0, 'delivered');

    ws.receive(control({ kind: 'save-error', error: 'checkpoint failed' }));

    expect(provider.state).toEqual({ kind: 'active', access: 'write', save: 'saved' });
    expect(provider.hasChangesAtRisk).toBe(true);

    const saved = provider.requestDurability();
    const request = ws.sent.find(frame => frameType(frame) === WIRE.DURABILITY_REQUEST) as Uint8Array;
    const requestId = (JSON.parse(new TextDecoder().decode(request.slice(1))) as { requestId: string }).requestId;
    ws.receive(control({ kind: 'persisted', requestId }));
    await expect(saved).resolves.toBeUndefined();
    expect(provider.hasChangesAtRisk).toBe(false);
    provider.destroy();
  });
});
