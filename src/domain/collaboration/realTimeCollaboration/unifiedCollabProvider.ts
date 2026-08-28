import { Awareness, removeAwarenessStates } from 'y-protocols/awareness';
import * as Y from 'yjs';
import { warn as logWarn, TagCategoryValues } from '@/core/logging/sentry/log';
import type { EphemeralChannel, EphemeralEvent } from '@/domain/common/whiteboard/excalidraw/collab/awarenessRouter';
import {
  type ControlMessage,
  createAwarenessFrame,
  createEphemeralFrame,
  createHeartbeatFrame,
  createJsonFrame,
  createSyncStep1Frame,
  createUpdateFrame,
  handleIncomingFrame,
  type SceneSyncPort,
  WIRE,
} from './unifiedCollabProtocol';

export type { EphemeralChannel, EphemeralEvent } from '@/domain/common/whiteboard/excalidraw/collab/awarenessRouter';
export { type ControlMessage, controlReasonToReadOnlyCode, type SceneSyncPort, WIRE } from './unifiedCollabProtocol';

export type CollaborationState =
  | { status: 'connecting' }
  | { status: 'ready' }
  | { status: 'reconnecting' }
  | { status: 'closed'; reason?: string };

export type EndVerdict = { retry: boolean; reason?: string };

type UnifiedCollabProviderCommonOptions = {
  documentId: string;
  type: 'memo' | 'whiteboard';
  awareness?: Awareness;
  baseUrl?: string;
  path?: string;
  guestName?: string;
  connect?: boolean;
};

export type UnifiedCollabProviderOptions = UnifiedCollabProviderCommonOptions &
  ({ doc?: Y.Doc; scenePort?: never } | { doc?: never; scenePort: SceneSyncPort });

type ProviderEvent = 'state' | 'control';
type StateListener = (state: CollaborationState) => void;
type ControlListener = (message: ControlMessage) => void;

type DurabilityRequest = {
  requestId: string;
  promise: Promise<void>;
  resolve: () => void;
  reject: (error: Error) => void;
  timeout: ReturnType<typeof setTimeout>;
};

const RECONNECT_BACKOFF_MS = [1_000, 2_000, 5_000, 10_000, 30_000];
export const DURABILITY_REQUEST_TIMEOUT_MS = 60_000;
export const HEARTBEAT_INTERVAL_MS = 15_000;
const HEARTBEAT_DEAD_MS = 25_000;
const NORMAL_CLOSURE = 1000;
const POLICY_VIOLATION = 1008;
const TRANSIENT_POLICY_REASON = 'room-capacity-reached';

/** The sole lifecycle classifier, used for both socket closes and session-end controls. */
export function classifyConnectionEnd(signal: CloseEvent | ControlMessage): EndVerdict {
  if ('kind' in signal) {
    if (signal.kind === 'update-rejected') return { retry: false, reason: 'update-rejected' };
    if (signal.kind !== 'session-end') return { retry: true };
    if (signal.disposition === 'transient') return { retry: true, reason: signal.code };
    return { retry: false, reason: signal.code ?? 'session-end' };
  }
  if (signal.code === POLICY_VIOLATION && signal.reason !== TRANSIENT_POLICY_REASON) {
    return { retry: false, reason: signal.reason || 'policy-violation' };
  }
  return { retry: true, reason: signal.reason || undefined };
}

/** One provider belongs to one document and is the sole owner of its transport lifecycle. */
export class UnifiedCollabProvider {
  readonly doc: Y.Doc;
  readonly awareness: Awareness;

  private readonly documentId: string;
  private readonly type: 'memo' | 'whiteboard';
  private readonly url: string | null;
  private readonly ownsDoc: boolean;
  private readonly ownsAwareness: boolean;
  private readonly scenePort: SceneSyncPort | null;
  private unsubscribeScene: (() => void) | null = null;

  private socket: WebSocket | null = null;
  private desired = false;
  private destroyed = false;
  private _state: CollaborationState = { status: 'connecting' };
  private hasBeenReady = false;
  private reconnectAttempt = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private lastInboundAt = 0;
  private durabilitySequence = 0;
  private durability: DurabilityRequest | null = null;

  private readonly stateListeners = new Set<StateListener>();
  private readonly controlListeners = new Set<ControlListener>();
  private readonly ephemeralListeners = new Set<(event: EphemeralEvent) => void>();

  constructor(options: UnifiedCollabProviderOptions) {
    this.documentId = options.documentId;
    this.type = options.type;
    this.scenePort = options.scenePort ?? null;
    this.doc = options.doc ?? new Y.Doc();
    this.ownsDoc = !options.doc;
    this.awareness = options.awareness ?? new Awareness(this.doc);
    this.ownsAwareness = !options.awareness;
    this.url = buildCollabUrl(options);

    this.unsubscribeScene = this.scenePort?.onLocalSceneUpdate(this.broadcastSceneUpdate, 'v1') ?? null;
    if (!this.scenePort) this.doc.on('update', this.handleDocUpdate);
    this.awareness.on('update', this.handleAwarenessUpdate);
    if (options.connect !== false) this.connect();
  }

  get state(): CollaborationState {
    return this._state;
  }

  get ephemeralChannel(): EphemeralChannel {
    return {
      send: event => this.send(createEphemeralFrame(event)),
      subscribe: listener => {
        this.ephemeralListeners.add(listener);
        return () => this.ephemeralListeners.delete(listener);
      },
    };
  }

  on(event: 'state', listener: StateListener): void;
  on(event: 'control', listener: ControlListener): void;
  on(event: ProviderEvent, listener: StateListener | ControlListener): void {
    if (event === 'state') this.stateListeners.add(listener as StateListener);
    else this.controlListeners.add(listener as ControlListener);
  }

  off(event: 'state', listener: StateListener): void;
  off(event: 'control', listener: ControlListener): void;
  off(event: ProviderEvent, listener: StateListener | ControlListener): void {
    if (event === 'state') this.stateListeners.delete(listener as StateListener);
    else this.controlListeners.delete(listener as ControlListener);
  }

  connect(): void {
    if (this.destroyed || !this.url) return;
    this.desired = true;
    if (this.socket || this.reconnectTimer) return;
    this.setState({ status: this.hasBeenReady ? 'reconnecting' : 'connecting' });
    this.openSocket();
  }

  disconnect(): void {
    this.desired = false;
    this.clearReconnect();
    this.stopHeartbeat();
    this.rejectDurability('The collaboration connection closed before the document was persisted');
    this.closeSocket();
    this.setState({ status: 'closed' });
  }

  destroy(): void {
    if (this.destroyed) return;
    this.disconnect();
    this.destroyed = true;
    removeAwarenessStates(this.awareness, [this.awareness.clientID], 'provider-destroy');
    this.unsubscribeScene?.();
    if (!this.scenePort) this.doc.off('update', this.handleDocUpdate);
    this.awareness.off('update', this.handleAwarenessUpdate);
    this.stateListeners.clear();
    this.controlListeners.clear();
    this.ephemeralListeners.clear();
    if (this.ownsAwareness) this.awareness.destroy();
    if (this.ownsDoc) this.doc.destroy();
  }

  requestDurability(): Promise<void> {
    if (this.durability) return this.durability.promise;
    if (this._state.status !== 'ready' || this.socket?.readyState !== WebSocket.OPEN) {
      return Promise.reject(new Error('The collaboration connection is not ready to persist the document'));
    }
    const requestId = `${Date.now().toString(36)}-${(++this.durabilitySequence).toString(36)}`;
    let resolve!: () => void;
    let reject!: (error: Error) => void;
    const promise = new Promise<void>((onResolve, onReject) => {
      resolve = onResolve;
      reject = onReject;
    });
    const timeout = setTimeout(
      () => this.rejectDurability('The collaboration service timed out while persisting the document'),
      DURABILITY_REQUEST_TIMEOUT_MS
    );
    this.durability = { requestId, promise, resolve, reject, timeout };
    this.send(createJsonFrame(WIRE.DURABILITY_REQUEST, { requestId }));
    return promise;
  }

  private openSocket(): void {
    if (!this.desired || this.destroyed || !this.url || this.socket) return;
    const socket = new WebSocket(this.url);
    socket.binaryType = 'arraybuffer';
    this.socket = socket;
    socket.addEventListener('open', this.handleOpen);
    socket.addEventListener('message', this.handleMessage);
    socket.addEventListener('close', this.handleClose);
    socket.addEventListener('error', this.handleError);
  }

  private handleOpen = () => {
    this.send(createSyncStep1Frame(this.doc, this.scenePort));
    if (this.awareness.getLocalState() !== null) this.broadcastAwareness([this.awareness.clientID]);
  };

  private handleMessage = (event: MessageEvent) => {
    if (!(event.data instanceof ArrayBuffer)) return;
    this.lastInboundAt = Date.now();
    handleIncomingFrame(new Uint8Array(event.data), {
      awareness: this.awareness,
      doc: this.doc,
      scenePort: this.scenePort,
      origin: this,
      send: this.send,
      onReady: this.handleReady,
      onControl: this.handleControl,
      onEphemeral: event => {
        for (const listener of this.ephemeralListeners) listener(event);
      },
      onHeartbeat: () => undefined,
    });
  };

  private handleReady = () => {
    this.hasBeenReady = true;
    this.reconnectAttempt = 0;
    this.setState({ status: 'ready' });
    this.startHeartbeat();
  };

  private handleControl = (message: ControlMessage) => {
    this.settleDurability(message);
    for (const listener of this.controlListeners) listener(message);
    if (message.kind === 'update-rejected' || message.kind === 'session-end') {
      this.endConnection(classifyConnectionEnd(message));
    }
  };

  private handleClose = (event: CloseEvent) => {
    this.detachSocket();
    this.socket = null;
    if (this.desired && !this.destroyed) this.endConnection(classifyConnectionEnd(event));
  };

  private endConnection(verdict: EndVerdict): void {
    this.stopHeartbeat();
    this.rejectDurability('The collaboration connection closed before the document was persisted');
    this.closeSocket();
    if (!this.desired || this.destroyed) return;
    if (!verdict.retry) {
      this.desired = false;
      this.setState({ status: 'closed', reason: verdict.reason });
      return;
    }
    this.setState({ status: this.hasBeenReady ? 'reconnecting' : 'connecting' });
    this.scheduleReconnect();
  }

  private scheduleReconnect(): void {
    if (!this.desired || this.destroyed || this.reconnectTimer) return;
    const delay = RECONNECT_BACKOFF_MS[Math.min(this.reconnectAttempt, RECONNECT_BACKOFF_MS.length - 1)];
    this.reconnectAttempt += 1;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.openSocket();
    }, delay);
  }

  private startHeartbeat(): void {
    if (this.heartbeatTimer) return;
    this.lastInboundAt = Date.now();
    this.heartbeatTimer = setInterval(() => {
      if (Date.now() - this.lastInboundAt > HEARTBEAT_DEAD_MS) {
        this.endConnection({ retry: true, reason: 'heartbeat-timeout' });
        return;
      }
      this.send(createHeartbeatFrame());
    }, HEARTBEAT_INTERVAL_MS);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    this.heartbeatTimer = null;
  }

  private clearReconnect(): void {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
    this.reconnectAttempt = 0;
  }

  private settleDurability(message: ControlMessage): void {
    const pending = this.durability;
    if (!pending || message.requestId !== pending.requestId) return;
    if (message.kind !== 'persisted' && message.kind !== 'persist-failed') return;
    clearTimeout(pending.timeout);
    this.durability = null;
    if (message.kind === 'persisted') pending.resolve();
    else pending.reject(new Error(message.error ?? 'The document could not be persisted'));
  }

  private rejectDurability(message: string): void {
    if (!this.durability) return;
    clearTimeout(this.durability.timeout);
    const { reject } = this.durability;
    this.durability = null;
    reject(new Error(message));
  }

  private handleDocUpdate = (update: Uint8Array, origin: unknown) => {
    if (origin !== this) this.send(createUpdateFrame(update));
  };

  private broadcastSceneUpdate = (update: Uint8Array) => this.send(createUpdateFrame(update));

  private handleAwarenessUpdate = (
    changes: { added: number[]; updated: number[]; removed: number[] },
    origin: unknown
  ) => {
    if (origin === this) return;
    this.broadcastAwareness([...changes.added, ...changes.updated, ...changes.removed]);
  };

  private broadcastAwareness(clients: number[]): void {
    this.send(createAwarenessFrame(this.awareness, clients));
  }

  private send = (bytes: Uint8Array): void => {
    if (this.socket?.readyState === WebSocket.OPEN) this.socket.send(bytes as BufferSource);
  };

  private closeSocket(): void {
    const socket = this.socket;
    if (!socket) return;
    this.detachSocket();
    this.socket = null;
    try {
      socket.close(NORMAL_CLOSURE);
    } catch {
      // Already closed.
    }
  }

  private detachSocket(): void {
    const socket = this.socket;
    if (!socket) return;
    socket.removeEventListener('open', this.handleOpen);
    socket.removeEventListener('message', this.handleMessage);
    socket.removeEventListener('close', this.handleClose);
    socket.removeEventListener('error', this.handleError);
  }

  private handleError = () => {
    logWarn('Unified collab WebSocket error', {
      category: this.type === 'memo' ? TagCategoryValues.MEMO : TagCategoryValues.WHITEBOARD,
      label: `doc: ${this.documentId}`,
    });
  };

  private setState(state: CollaborationState): void {
    if (this._state.status === state.status && this._state.status !== 'closed') return;
    if (this._state.status === 'closed' && state.status === 'closed' && this._state.reason === state.reason) return;
    this._state = state;
    for (const listener of this.stateListeners) listener(state);
  }
}

function buildCollabUrl(
  options: Pick<UnifiedCollabProviderOptions, 'documentId' | 'type' | 'baseUrl' | 'path' | 'guestName'>
): string | null {
  const baseUrl =
    options.baseUrl || globalThis.window?._env_?.VITE_APP_ALKEMIO_DOMAIN || globalThis.window?.location.origin;
  if (!baseUrl) return null;
  const path = options.path ?? globalThis.window?._env_?.VITE_APP_COLLAB_PATH ?? '/collab';
  const wsBase = baseUrl.replace(/^http/, 'ws').replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path.replace(/\/$/, '') : `/${path.replace(/\/$/, '')}`;
  const params = new URLSearchParams({ type: options.type });
  if (options.guestName) params.set('guestName', options.guestName);
  return `${wsBase}${normalizedPath}/${encodeURIComponent(options.documentId)}?${params.toString()}`;
}
