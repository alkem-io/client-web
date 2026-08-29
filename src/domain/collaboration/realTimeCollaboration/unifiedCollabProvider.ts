import * as decoding from 'lib0/decoding';
import * as encoding from 'lib0/encoding';
import * as lib0String from 'lib0/string';
import { Awareness, applyAwarenessUpdate, encodeAwarenessUpdate, removeAwarenessStates } from 'y-protocols/awareness';
import { messageYjsSyncStep1, messageYjsSyncStep2, messageYjsUpdate, writeUpdate } from 'y-protocols/sync';
import * as Y from 'yjs';
import { warn as logWarn, TagCategoryValues } from '@/core/logging/sentry/log';
import { ReadOnlyCode } from '@/core/ui/forms/CollaborativeMarkdownInput/stateless-messaging/read.only.code';
import type { EphemeralChannel, EphemeralEvent } from '@/domain/common/whiteboard/excalidraw/collab/awarenessRouter';

export const WIRE = { SYNC: 0, AWARENESS: 1, EPHEMERAL: 2, CONTROL: 3, DURABILITY_REQUEST: 4, HEARTBEAT: 5 } as const;

export type CollaborationAccess = 'read' | 'write';
export type CollaborationSave = 'saved' | 'saving' | 'offline';
export type CollaborationState =
  | { kind: 'loading' }
  | { kind: 'active'; access: CollaborationAccess; save: CollaborationSave }
  | { kind: 'ended'; reason: string; recovery: 'none' | 'reload' };

type SessionEndDisposition = 'transient' | 'manual' | 'terminal';
export type ControlMessage = {
  kind: string;
  requestId?: string;
  version?: number;
  error?: string;
  readOnly?: boolean;
  reason?: string;
  mode?: CollaborationAccess | 'viewer' | 'collaborator';
  users?: number;
  code?: string;
  scope?: 'member' | 'document';
  disposition?: SessionEndDisposition;
};

export type SceneSyncPort = {
  encodeSceneStateVector: () => Uint8Array;
  encodeSceneAsUpdate: (format: 'v1', targetStateVector?: Uint8Array) => Uint8Array;
  applyRemoteSceneUpdate: (update: Uint8Array, format: 'v1') => void;
  onLocalSceneUpdate: (cb: (update: Uint8Array) => void, format: 'v1') => () => void;
};

type CommonOptions = {
  documentId: string;
  type: 'memo' | 'whiteboard';
  awareness?: Awareness;
  baseUrl?: string;
  path?: string;
  guestName?: string;
  connect?: boolean;
  beforeSave?: () => Promise<void>;
};
export type UnifiedCollabProviderOptions = CommonOptions &
  ({ doc?: Y.Doc; scenePort?: never } | { doc?: never; scenePort: SceneSyncPort });

type StateListener = (state: CollaborationState) => void;
type SaveResultListener = (error?: string) => void;

const SAVE_DEBOUNCE_MS = 2_000;
const DURABILITY_TIMEOUT_MS = 60_000;
const HEARTBEAT_IDLE_MS = 15_000;
const HEARTBEAT_REPLY_MS = 10_000;
const BACKOFF_MAX_MS = 30_000;
const POLICY_VIOLATION = 1008;
const emptyDoc = new Y.Doc();
const EMPTY_UPDATE = Y.encodeStateAsUpdate(emptyDoc);
emptyDoc.destroy();

/**
 * One local-first document over a disposable transport. Initial connect and every
 * later attempt use one path: dial → admission → sync → pump → close → classify → backoff.
 */
export class UnifiedCollabProvider {
  readonly doc: Y.Doc;
  readonly awareness: Awareness;

  private readonly documentId: string;
  private readonly type: 'memo' | 'whiteboard';
  private readonly url: string | null;
  private readonly beforeSave?: () => Promise<void>;
  private readonly ownsDoc: boolean;
  private readonly ownsAwareness: boolean;
  private readonly sync: SceneSyncPort;
  private readonly unsubscribeSync: () => void;
  private ws: WebSocket | null = null;
  private running = false;
  private destroyed = false;
  private attemptReady = false;
  private access: CollaborationAccess | null = null;
  private accessReason: string | undefined;
  private reconnectAttempt = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private heartbeatTimer: ReturnType<typeof setTimeout> | null = null;
  private heartbeatFrame: Uint8Array | null = null;
  private heartbeatSequence = 0;
  private localRevision = 0;
  private ackedRevision = 0;
  private saveTimer: ReturnType<typeof setTimeout> | null = null;
  private barrier:
    | {
        requestId: string;
        coveredRevision: number;
        resolve: () => void;
        reject: (error: Error) => void;
        timeout: ReturnType<typeof setTimeout>;
      }
    | undefined;
  private saveInFlight: Promise<void> | null = null;
  private durabilitySequence = 0;
  private _state: CollaborationState = { kind: 'loading' };
  private readonly stateListeners = new Set<StateListener>();
  private readonly saveResultListeners = new Set<SaveResultListener>();
  private readonly ephemeralListeners = new Set<(event: EphemeralEvent) => void>();

  constructor(options: UnifiedCollabProviderOptions) {
    this.documentId = options.documentId;
    this.type = options.type;
    this.beforeSave = options.beforeSave;
    this.doc = options.scenePort ? new Y.Doc() : (options.doc ?? new Y.Doc());
    this.ownsDoc = !!options.scenePort || !options.doc;
    this.sync = options.scenePort ?? {
      encodeSceneStateVector: () => Y.encodeStateVector(this.doc),
      encodeSceneAsUpdate: (_format, target) => Y.encodeStateAsUpdate(this.doc, target),
      applyRemoteSceneUpdate: update => Y.applyUpdate(this.doc, update, this),
      onLocalSceneUpdate: listener => {
        const onUpdate = (update: Uint8Array, origin: unknown) => {
          if (origin !== this) listener(update);
        };
        this.doc.on('update', onUpdate);
        return () => this.doc.off('update', onUpdate);
      },
    };
    this.awareness = options.awareness ?? new Awareness(this.doc);
    this.ownsAwareness = !options.awareness;
    this.url = buildCollabUrl(options);
    this.unsubscribeSync = this.sync.onLocalSceneUpdate(this.handleLocalUpdate, 'v1');
    this.awareness.on('update', this.handleAwarenessUpdate);
    globalThis.window?.addEventListener('online', this.handleOnline);
    globalThis.document?.addEventListener('visibilitychange', this.handleVisibilityChange);
    if (options.connect !== false) this.connect();
  }

  get state(): CollaborationState {
    return this._state;
  }

  get readOnlyReason(): ReadOnlyCode | undefined {
    return controlReasonToReadOnlyCode(this.accessReason);
  }

  get hasUnsavedChanges(): boolean {
    return this.localRevision !== this.ackedRevision;
  }

  get ephemeralChannel(): EphemeralChannel {
    return {
      send: event => this.sendEphemeral(event),
      subscribe: listener => {
        this.ephemeralListeners.add(listener);
        return () => this.ephemeralListeners.delete(listener);
      },
    };
  }

  subscribe(listener: StateListener): () => void {
    this.stateListeners.add(listener);
    listener(this._state);
    return () => this.stateListeners.delete(listener);
  }

  onSaveResult(listener: SaveResultListener): () => void {
    this.saveResultListeners.add(listener);
    return () => this.saveResultListeners.delete(listener);
  }

  connect(): void {
    if (this.destroyed) return;
    this.running = true;
    if (this._state.kind === 'ended') this.setState({ kind: 'loading' });
    this.dial();
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    this.running = false;
    this.clearReconnect();
    this.clearHeartbeat();
    this.clearSaveTimer();
    this.rejectBarrier(new Error('The collaboration editor closed before changes were persisted'));
    removeAwarenessStates(this.awareness, [this.awareness.clientID], 'provider-destroy');
    this.stopSocket();
    this.unsubscribeSync();
    this.awareness.off('update', this.handleAwarenessUpdate);
    globalThis.window?.removeEventListener('online', this.handleOnline);
    globalThis.document?.removeEventListener('visibilitychange', this.handleVisibilityChange);
    this.stateListeners.clear();
    this.saveResultListeners.clear();
    this.ephemeralListeners.clear();
    if (this.ownsAwareness) this.awareness.destroy();
    if (this.ownsDoc) this.doc.destroy();
  }

  async requestDurability(): Promise<void> {
    while (this.ackedRevision < this.localRevision) await this.ensureSave();
  }

  private dial(): void {
    if (!this.running || this.destroyed || !this.url || this.ws) return;
    this.access = null;
    this.accessReason = undefined;
    this.attemptReady = false;
    const ws = new WebSocket(this.url);
    ws.binaryType = 'arraybuffer';
    this.ws = ws;
    ws.addEventListener('message', this.handleMessage);
    ws.addEventListener('close', this.handleClose);
    ws.addEventListener('error', this.handleError);
  }

  private handleMessage = (event: MessageEvent) => {
    if (!(event.data instanceof ArrayBuffer)) return;
    const bytes = new Uint8Array(event.data);
    try {
      const decoder = decoding.createDecoder(bytes);
      switch (decoding.readVarUint(decoder)) {
        case WIRE.SYNC:
          this.readSync(decoder);
          break;
        case WIRE.AWARENESS:
          applyAwarenessUpdate(this.awareness, decoding.readVarUint8Array(decoder), this);
          break;
        case WIRE.EPHEMERAL: {
          const event = readVarStringJson(decoder) as EphemeralEvent | undefined;
          if (event && typeof event.type === 'string') emitListeners(this.ephemeralListeners, event);
          break;
        }
        case WIRE.CONTROL:
          this.handleControl(readRawJson(decoder) as ControlMessage | undefined);
          break;
        case WIRE.HEARTBEAT:
          this.receiveHeartbeat(bytes);
          break;
        default:
          break;
      }
    } catch {
      this.ws?.close(4000, 'protocol-decode-failed');
    }
  };

  private handleControl(message: ControlMessage | undefined): void {
    if (!message || typeof message.kind !== 'string') return;
    switch (message.kind) {
      case 'admission':
        if (message.mode !== 'read' && message.mode !== 'write') {
          this.end({ reason: 'invalid-admission', recovery: 'none' });
          return;
        }
        this.access = message.mode;
        this.accessReason = message.reason;
        this.sendSyncStep1();
        break;
      case 'persisted':
        this.finishSave(message.requestId);
        break;
      case 'persist-failed':
        this.failSave(message.requestId, message.error ?? 'The document could not be persisted');
        break;
      case 'save-error':
        this.emitSaveResult(message.error ?? 'save-error');
        break;
      case 'session-end':
        this.applyTypedEnd(message);
        break;
      default:
        break;
    }
  }

  private readSync(decoder: decoding.Decoder): void {
    if (!this.access) throw new Error('sync-before-admission');
    const syncType = decoding.readVarUint(decoder);
    if (syncType === messageYjsSyncStep1) {
      const localDelta = this.sync.encodeSceneAsUpdate('v1', decoding.readVarUint8Array(decoder));
      const hasLocalDelta = !isEmptyUpdate(localDelta);
      if (hasLocalDelta && this.localRevision === this.ackedRevision) this.localRevision += 1;
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, WIRE.SYNC);
      encoding.writeVarUint(encoder, messageYjsSyncStep2);
      encoding.writeVarUint8Array(encoder, this.access === 'write' ? localDelta : EMPTY_UPDATE);
      this.sendFrame(encoding.toUint8Array(encoder));
      return;
    }
    if (syncType !== messageYjsSyncStep2 && syncType !== messageYjsUpdate) throw new Error('unknown-sync-type');
    this.sync.applyRemoteSceneUpdate(decoding.readVarUint8Array(decoder), 'v1');
    if (syncType === messageYjsSyncStep2 && !this.attemptReady) this.becomeReady();
  }

  private becomeReady(): void {
    if (!this.access) return;
    this.attemptReady = true;
    this.reconnectAttempt = 0;
    if (this.access === 'read' && this.hasUnsavedChanges) {
      this.end({ reason: 'access-changed-with-local-edits', recovery: 'reload' });
      return;
    }
    this.setActive();
    this.armHeartbeat(HEARTBEAT_IDLE_MS);
    if (this.awareness.getLocalState() !== null) this.broadcastAwareness([this.awareness.clientID]);
    if (this.localRevision > this.ackedRevision && this.access === 'write') this.scheduleSave();
  }

  private applyTypedEnd(end: Pick<ControlMessage, 'code' | 'disposition'>): void {
    if (!isDisposition(end.disposition)) {
      this.end({ reason: end.code ?? 'unknown-session-end', recovery: 'none' });
    } else if (end.disposition === 'transient') {
      this.finishAttempt();
    } else {
      this.end({ reason: end.code ?? 'session-ended', recovery: end.disposition === 'manual' ? 'reload' : 'none' });
    }
  }

  private handleClose = (event: CloseEvent) => {
    if (this.ws !== event.currentTarget) return;
    if (event.code !== POLICY_VIOLATION) this.finishAttempt();
    else this.end({ reason: event.reason || 'forbidden', recovery: 'none' });
  };

  private finishAttempt(): void {
    this.rejectBarrier(new Error('The collaboration connection closed before changes were persisted'));
    this.clearHeartbeat();
    this.stopSocket();
    if (!this.running || this.destroyed) return;
    if (this._state.kind === 'active') this.setState({ ...this._state, save: 'offline' });
    else this.setState({ kind: 'loading' });
    this.scheduleReconnect();
  }

  private end(end: { reason: string; recovery: 'none' | 'reload' }): void {
    this.running = false;
    this.clearReconnect();
    this.clearHeartbeat();
    this.rejectBarrier(new Error(`Collaboration ended: ${end.reason}`));
    this.stopSocket();
    this.setState({ kind: 'ended', ...end });
  }

  private scheduleReconnect(): void {
    if (!this.running || this.destroyed || this.reconnectTimer) return;
    const cap = Math.min(1_000 * 2 ** this.reconnectAttempt, BACKOFF_MAX_MS);
    this.reconnectAttempt += 1;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.dial();
    }, Math.random() * cap);
  }

  private handleOnline = () => {
    if (this.running && !this.ws) {
      this.clearReconnect();
      this.dial();
    }
  };

  private handleVisibilityChange = () => {
    if (globalThis.document?.visibilityState !== 'visible' || this._state.kind !== 'active') return;
    this.clearHeartbeat();
    this.sendHeartbeat();
  };

  private armHeartbeat(delay: number): void {
    if (this.heartbeatTimer) clearTimeout(this.heartbeatTimer);
    this.heartbeatTimer = setTimeout(() => {
      if (this.heartbeatFrame) this.ws?.close(4000, 'heartbeat-timeout');
      else this.sendHeartbeat();
    }, delay);
  }

  private sendHeartbeat(): void {
    if (this.heartbeatFrame || this._state.kind !== 'active' || !this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }
    this.heartbeatFrame = encodeFrame(WIRE.HEARTBEAT, encoder =>
      encoding.writeVarString(encoder, `${Date.now()}-${++this.heartbeatSequence}`)
    );
    this.sendFrame(this.heartbeatFrame);
    this.armHeartbeat(HEARTBEAT_REPLY_MS);
  }

  private receiveHeartbeat(frame: Uint8Array): void {
    if (!this.heartbeatFrame || !equalBytes(frame, this.heartbeatFrame)) return;
    this.heartbeatFrame = null;
    this.armHeartbeat(HEARTBEAT_IDLE_MS);
  }

  private handleLocalUpdate = (update: Uint8Array) => {
    this.localRevision += 1;
    if (this.access === 'write') {
      this.sendFrame(encodeFrame(WIRE.SYNC, encoder => writeUpdate(encoder, update)));
    }
    this.setActive();
    this.scheduleSave();
  };

  private scheduleSave(): void {
    if (this.saveTimer || this.saveInFlight || !this.canSave()) return;
    this.saveTimer = setTimeout(() => {
      this.saveTimer = null;
      void this.ensureSave().catch(() => undefined);
    }, SAVE_DEBOUNCE_MS);
  }

  private ensureSave(): Promise<void> {
    if (this.ackedRevision >= this.localRevision) return Promise.resolve();
    if (this.saveInFlight) return this.saveInFlight;
    if (!this.canSave()) return Promise.reject(new Error('The collaboration connection is offline'));
    const operation = this.performSave();
    this.saveInFlight = operation;
    const settled = () => {
      if (this.saveInFlight !== operation) return;
      this.saveInFlight = null;
      this.setActive();
      if (this.localRevision > this.ackedRevision) this.scheduleSave();
    };
    void operation.then(settled, settled);
    return operation;
  }

  private async performSave(): Promise<void> {
    if (this.beforeSave) {
      try {
        await this.beforeSave();
      } catch (error) {
        this.emitSaveResult(error instanceof Error ? error.message : 'Asset publication failed');
        throw error;
      }
    }
    if (!this.canSave()) throw new Error('The collaboration connection is offline');
    const requestId = `${Date.now().toString(36)}-${(++this.durabilitySequence).toString(36)}`;
    let resolve!: () => void;
    let reject!: (error: Error) => void;
    const persisted = new Promise<void>((ok, fail) => {
      resolve = ok;
      reject = fail;
    });
    const timeout = setTimeout(
      () => this.failSave(requestId, 'The collaboration service timed out'),
      DURABILITY_TIMEOUT_MS
    );
    this.barrier = { requestId, coveredRevision: this.localRevision, resolve, reject, timeout };
    this.sendFrame(
      encodeFrame(WIRE.DURABILITY_REQUEST, encoder =>
        encoding.writeUint8Array(encoder, lib0String.encodeUtf8(JSON.stringify({ requestId })))
      )
    );
    return persisted;
  }

  private finishSave(requestId: string | undefined): void {
    const pending = this.barrier;
    if (!pending || requestId !== pending.requestId) return;
    clearTimeout(pending.timeout);
    this.barrier = undefined;
    this.ackedRevision = Math.max(this.ackedRevision, pending.coveredRevision);
    pending.resolve();
    this.emitSaveResult();
  }

  private failSave(requestId: string | undefined, message: string): void {
    if (!this.barrier || requestId !== this.barrier.requestId) return;
    this.rejectBarrier(new Error(message));
    this.emitSaveResult(message);
  }

  private rejectBarrier(error: Error): void {
    const pending = this.barrier;
    if (!pending) return;
    clearTimeout(pending.timeout);
    this.barrier = undefined;
    pending.reject(error);
  }

  private emitSaveResult(error?: string): void {
    emitListeners(this.saveResultListeners, error);
  }

  private setActive(): void {
    if (!this.attemptReady || !this.access) return;
    const save: CollaborationSave =
      !this.ws || this.ws.readyState !== WebSocket.OPEN
        ? 'offline'
        : this.localRevision > this.ackedRevision
          ? 'saving'
          : 'saved';
    this.setState({ kind: 'active', access: this.access, save });
  }

  private canSave(): boolean {
    return (
      this.running &&
      !this.destroyed &&
      this.access === 'write' &&
      this._state.kind === 'active' &&
      this._state.save !== 'offline'
    );
  }

  private sendSyncStep1(): void {
    this.sendFrame(
      encodeFrame(WIRE.SYNC, encoder => {
        encoding.writeVarUint(encoder, messageYjsSyncStep1);
        encoding.writeVarUint8Array(encoder, this.sync.encodeSceneStateVector());
      })
    );
  }

  private handleAwarenessUpdate = (
    changes: { added: number[]; updated: number[]; removed: number[] },
    origin: unknown
  ) => {
    if (origin !== this) this.broadcastAwareness([...changes.added, ...changes.updated, ...changes.removed]);
  };

  private broadcastAwareness(clients: number[]): void {
    this.sendFrame(
      encodeFrame(WIRE.AWARENESS, encoder =>
        encoding.writeVarUint8Array(encoder, encodeAwarenessUpdate(this.awareness, clients))
      )
    );
  }

  private sendEphemeral(event: EphemeralEvent): void {
    this.sendFrame(encodeFrame(WIRE.EPHEMERAL, encoder => encoding.writeVarString(encoder, JSON.stringify(event))));
  }

  private sendFrame(frame: Uint8Array): void {
    if (this.ws?.readyState === WebSocket.OPEN) this.ws.send(frame as BufferSource);
  }

  private handleError = () => {
    logWarn('Unified collab WebSocket error', {
      category: this.type === 'memo' ? TagCategoryValues.MEMO : TagCategoryValues.WHITEBOARD,
      label: `doc: ${this.documentId}`,
    });
  };

  private stopSocket(): void {
    const ws = this.ws;
    if (!ws) return;
    ws.removeEventListener('message', this.handleMessage);
    ws.removeEventListener('close', this.handleClose);
    ws.removeEventListener('error', this.handleError);
    this.ws = null;
    try {
      ws.close(1000);
    } catch {
      // best-effort disposal
    }
  }

  private clearReconnect(): void {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
  }

  private clearHeartbeat(): void {
    if (this.heartbeatTimer) clearTimeout(this.heartbeatTimer);
    this.heartbeatTimer = null;
    this.heartbeatFrame = null;
  }

  private clearSaveTimer(): void {
    if (this.saveTimer) clearTimeout(this.saveTimer);
    this.saveTimer = null;
  }

  private setState(state: CollaborationState): void {
    this._state = state;
    emitListeners(this.stateListeners, state);
  }
}

function isDisposition(value: string | undefined): value is SessionEndDisposition {
  return value === 'transient' || value === 'manual' || value === 'terminal';
}
function emitListeners<T>(listeners: Set<(value: T) => void>, value: T): void {
  for (const listener of listeners) listener(value);
}
function encodeFrame(kind: number, write: (encoder: encoding.Encoder) => void): Uint8Array {
  const encoder = encoding.createEncoder();
  encoding.writeVarUint(encoder, kind);
  write(encoder);
  return encoding.toUint8Array(encoder);
}
function isEmptyUpdate(update: Uint8Array): boolean {
  const decoded = Y.decodeUpdate(update);
  return decoded.structs.length === 0 && decoded.ds.clients.size === 0;
}
function equalBytes(a: Uint8Array, b: Uint8Array): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}
function readVarStringJson(decoder: decoding.Decoder): unknown {
  try {
    return JSON.parse(decoding.readVarString(decoder));
  } catch {
    return undefined;
  }
}
function readRawJson(decoder: decoding.Decoder): unknown {
  try {
    return JSON.parse(lib0String.decodeUtf8(decoding.readTailAsUint8Array(decoder)));
  } catch {
    return undefined;
  }
}
function buildCollabUrl(options: UnifiedCollabProviderOptions): string | null {
  const base =
    options.baseUrl || globalThis.window?._env_?.VITE_APP_ALKEMIO_DOMAIN || globalThis.window?.location.origin;
  if (!base) return null;
  const path = options.path ?? globalThis.window?._env_?.VITE_APP_COLLAB_PATH ?? '/collab';
  const wsBase = base.replace(/^http/, 'ws').replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path.replace(/\/$/, '') : `/${path.replace(/\/$/, '')}`;
  const params = new URLSearchParams({ type: options.type });
  if (options.guestName) params.set('guestName', options.guestName);
  return `${wsBase}${normalizedPath}/${encodeURIComponent(options.documentId)}?${params.toString()}`;
}

export function controlReasonToReadOnlyCode(reason: string | undefined): ReadOnlyCode | undefined {
  switch (reason) {
    case 'not-authenticated':
      return ReadOnlyCode.NOT_AUTHENTICATED;
    case 'no-update-access':
      return ReadOnlyCode.NO_UPDATE_ACCESS;
    case 'room-capacity-reached':
      return ReadOnlyCode.ROOM_CAPACITY_REACHED;
    case 'multi-user-not-allowed':
      return ReadOnlyCode.MULTI_USER_NOT_ALLOWED;
    default:
      return undefined;
  }
}

export type { EphemeralChannel, EphemeralEvent } from '@/domain/common/whiteboard/excalidraw/collab/awarenessRouter';
