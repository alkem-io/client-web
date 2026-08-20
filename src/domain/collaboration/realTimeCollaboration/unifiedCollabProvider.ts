import * as decoding from 'lib0/decoding';
import * as encoding from 'lib0/encoding';
import { Awareness, applyAwarenessUpdate, encodeAwarenessUpdate, removeAwarenessStates } from 'y-protocols/awareness';
import {
  messageYjsSyncStep1,
  messageYjsSyncStep2,
  messageYjsUpdate,
  readSyncMessage,
  writeSyncStep1,
  writeUpdate,
} from 'y-protocols/sync';
import * as Y from 'yjs';
import { warn as logWarn, TagCategoryValues } from '@/core/logging/sentry/log';
import { ReadOnlyCode } from '@/core/ui/forms/CollaborativeMarkdownInput/stateless-messaging/read.only.code';
import type { EphemeralChannel, EphemeralEvent } from '@/domain/common/whiteboard/excalidraw/collab/awarenessRouter';

/**
 * Wire message types of the unified collaboration service
 * (collaboration-service `internal/domain/model/control.go`). Types 0/1 are
 * owned by y-protocols (sync/awareness); 2/3 are this service's custom channels,
 * framed with the same `[type as VarUint][payload]` envelope, one message per
 * binary WebSocket frame (the y-websocket model — one document per connection).
 */
export const WIRE = {
  /** y-protocols sync (SyncStep1 / SyncStep2 / Update). Persisted via the debounced snapshot. */
  SYNC: 0,
  /** y-protocols awareness (cursors / online / idle / mode). Never persisted. */
  AWARENESS: 1,
  /** Custom whiteboard ephemeral events (cursor/emoji/countdown/bounds). Volatile, lossy, never persisted. */
  EPHEMERAL: 2,
  /** Server→client JSON control (saved / save-error / read-only-state / collaborator-mode / room-user-change / room-closed). */
  CONTROL: 3,
} as const;

/** A `WireControl` payload — server→client JSON (collaboration-service `ControlMessage`). */
export type ControlMessage = {
  kind:
    | 'saved'
    | 'save-error'
    | 'read-only-state'
    | 'collaborator-mode'
    | 'room-user-change'
    | 'room-closed'
    // The server's ingress validator rejected a local update (e.g. a bad assets-root
    // struct). The local scene is poisoned: the client must discard this generation
    // and resync a fresh scene from the server rather than resend the rejected state.
    | 'update-rejected';
  version?: number;
  error?: string;
  readOnly?: boolean;
  reason?: string;
  mode?: 'read' | 'write';
  users?: number;
};

export type { EphemeralChannel, EphemeralEvent } from '@/domain/common/whiteboard/excalidraw/collab/awarenessRouter';

/**
 * The excalidraw editor's scene-sync port: the four y-protocol operations a
 * collaboration transport needs, sourced from / sinked into the editor's scene
 * `Y.Doc` without ever touching the raw doc. It carries the editor's one-origin
 * policy — `onLocalSceneUpdate` fires only for LOCAL edits, never for updates
 * applied via `applyRemoteSceneUpdate` — so the transport needs no echo guard.
 * Fixed to the `'v1'` wire format (the y-protocols update encoding on the socket).
 */
export type SceneSyncPort = {
  /** This replica's state vector — what it already has (`Y.encodeStateVector`). */
  encodeSceneStateVector: () => Uint8Array;
  /** Encode the scene as an update; pass a peer's state vector for just the delta. */
  encodeSceneAsUpdate: (format: 'v1', targetStateVector?: Uint8Array) => Uint8Array;
  /** Integrate a peer's update: never re-broadcast, never captured into local undo. */
  applyRemoteSceneUpdate: (update: Uint8Array, format: 'v1') => void;
  /** Subscribe to LOCAL scene edits (unsub returned); remote applies never fire this. */
  onLocalSceneUpdate: (cb: (update: Uint8Array) => void, format: 'v1') => () => void;
};

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';

type ProviderEvent = 'status' | 'synced' | 'control';

type StatusListener = (status: ConnectionStatus) => void;
type SyncedListener = (synced: boolean) => void;
type ControlListener = (message: ControlMessage) => void;

type UnifiedCollabProviderCommonOptions = {
  /** The collaborative document id (the room) — `/collab/<documentId>`. */
  documentId: string;
  /** Document content type, selecting the room's seed convention server-side. */
  type: 'memo' | 'whiteboard';
  /** Reuse an existing awareness (e.g. the whiteboard binding's). A fresh one is created when omitted. */
  awareness?: Awareness;
  /** Override the service base URL (defaults to the configured collab URL). */
  baseUrl?: string;
  /** Override the service path prefix (defaults to `/collab`). */
  path?: string;
  /** Anonymous display name for a guest connection (`?guestName=`). The BFF session cookie is reused otherwise. */
  guestName?: string;
  /** Connect on construction. Defaults to true. */
  connect?: boolean;
};

/**
 * `doc` (memo — Tiptap's editor doc) and `scenePort` (whiteboard — the excalidraw
 * editor's scene-sync port) are MUTUALLY EXCLUSIVE. Memo drives sync over the raw
 * `Y.Doc`; whiteboard drives it through the port and never passes a `doc` (the
 * editor owns the scene doc). Omitting both is the memo path with a fresh doc.
 */
export type UnifiedCollabProviderOptions = UnifiedCollabProviderCommonOptions &
  (
    | {
        /** Reuse an existing `Y.Doc` (the editor's). A fresh one is created when omitted. */
        doc?: Y.Doc;
        scenePort?: never;
      }
    | {
        doc?: never;
        /** Drive whiteboard sync through the excalidraw editor's scene-sync port. */
        scenePort: SceneSyncPort;
      }
  );

const RECONNECT_BACKOFF_MS = [1_000, 2_000, 5_000, 10_000, 30_000];
const NORMAL_CLOSURE = 1000;

/**
 * `UnifiedCollabProvider` connects a `Y.Doc` (memo or whiteboard) to the unified
 * collaboration service over a single WebSocket at
 * `wss://<host>/collab/<documentId>?type=memo|whiteboard`, reusing the OIDC/BFF
 * session (the session cookie rides the same-site handshake; a guest passes
 * `?guestName=`). It speaks the four-channel protocol directly — sync(0) +
 * awareness(1) via y-protocols, plus the service's custom ephemeral(2) and
 * control(3) JSON channels — so it replaces both the legacy memo Hocuspocus
 * provider and the legacy whiteboard Socket.IO portal with one transport.
 *
 * It is transport-only: it owns no editor state. The whiteboard binding consumes
 * its `awareness` + `ephemeralChannel`; Tiptap binds its `doc`.
 */
export class UnifiedCollabProvider {
  readonly doc: Y.Doc;
  readonly awareness: Awareness;

  private readonly documentId: string;
  private readonly type: 'memo' | 'whiteboard';
  private readonly url: string | null;
  private readonly ownsDoc: boolean;
  private readonly ownsAwareness: boolean;
  /** Whiteboard mode: the editor's scene-sync port. `null` in the memo raw-doc path. */
  private readonly scenePort: SceneSyncPort | null;
  /** Unsubscribe handle for `scenePort.onLocalSceneUpdate` (whiteboard outbound). */
  private unsubscribeScene: (() => void) | null = null;

  private ws: WebSocket | null = null;
  private _status: ConnectionStatus = 'connecting';
  private _synced = false;
  private destroyed = false;
  private reconnectAttempt = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  private readonly statusListeners = new Set<StatusListener>();
  private readonly syncedListeners = new Set<SyncedListener>();
  private readonly controlListeners = new Set<ControlListener>();
  private readonly ephemeralListeners = new Set<(event: EphemeralEvent) => void>();

  constructor(options: UnifiedCollabProviderOptions) {
    this.documentId = options.documentId;
    this.type = options.type;
    this.scenePort = options.scenePort ?? null;

    if (this.scenePort) {
      // Whiteboard: the editor owns the scene doc behind the port. This provider
      // owns an awareness-only `Y.Doc` purely to host Awareness — a separate
      // channel whose clientID need not match the scene doc's. No external
      // consumer reads `provider.doc` for whiteboard content (the editor does),
      // so an awareness-only doc here is fine.
      this.doc = new Y.Doc();
      this.ownsDoc = true;
    } else {
      this.doc = options.doc ?? new Y.Doc();
      this.ownsDoc = !options.doc;
    }
    this.awareness = options.awareness ?? new Awareness(this.doc);
    this.ownsAwareness = !options.awareness;
    this.url = buildCollabUrl(options);

    if (this.scenePort) {
      // Outbound: local scene edits are framed as sync Updates. The port never
      // delivers remote-applied updates here (its one-origin policy), so unlike
      // the raw-doc path this needs no origin/echo guard.
      this.unsubscribeScene = this.scenePort.onLocalSceneUpdate(update => this.broadcastSceneUpdate(update), 'v1');
    } else {
      this.doc.on('update', this.handleDocUpdate);
    }
    this.awareness.on('update', this.handleAwarenessUpdate);

    if (options.connect !== false) {
      this.connect();
    }
  }

  get status(): ConnectionStatus {
    return this._status;
  }

  get synced(): boolean {
    return this._synced;
  }

  /**
   * The whiteboard binding's ephemeral transport: outbound events are JSON-framed
   * as `WireEphemeral` (type 2); inbound type-2 frames are decoded back to events.
   * The doc is never touched (presence stays out of the persisted snapshot).
   */
  get ephemeralChannel(): EphemeralChannel {
    return {
      send: (event: EphemeralEvent) => this.sendEphemeral(event),
      subscribe: (handler: (event: EphemeralEvent) => void) => {
        this.ephemeralListeners.add(handler);
        return () => this.ephemeralListeners.delete(handler);
      },
    };
  }

  on(event: 'status', listener: StatusListener): void;
  on(event: 'synced', listener: SyncedListener): void;
  on(event: 'control', listener: ControlListener): void;
  on(event: ProviderEvent, listener: StatusListener | SyncedListener | ControlListener): void {
    if (event === 'status') this.statusListeners.add(listener as StatusListener);
    else if (event === 'synced') this.syncedListeners.add(listener as SyncedListener);
    else this.controlListeners.add(listener as ControlListener);
  }

  off(event: 'status', listener: StatusListener): void;
  off(event: 'synced', listener: SyncedListener): void;
  off(event: 'control', listener: ControlListener): void;
  off(event: ProviderEvent, listener: StatusListener | SyncedListener | ControlListener): void {
    if (event === 'status') this.statusListeners.delete(listener as StatusListener);
    else if (event === 'synced') this.syncedListeners.delete(listener as SyncedListener);
    else this.controlListeners.delete(listener as ControlListener);
  }

  connect(): void {
    if (this.destroyed || !this.url || this.ws) return;

    this.setStatus('connecting');

    const ws = new WebSocket(this.url);
    ws.binaryType = 'arraybuffer';
    this.ws = ws;

    ws.addEventListener('open', this.handleOpen);
    ws.addEventListener('message', this.handleMessage);
    ws.addEventListener('close', this.handleClose);
    ws.addEventListener('error', this.handleError);
  }

  /** Tear down the socket without reconnecting and without destroying the doc. */
  disconnect(): void {
    this.clearReconnect();
    this.teardownSocket(NORMAL_CLOSURE);
    this.setSynced(false);
    this.setStatus('disconnected');
  }

  /** Permanently dispose: stop reconnecting, close the socket, free any doc/awareness this provider created. */
  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    this.clearReconnect();
    this.teardownSocket(NORMAL_CLOSURE);

    if (this.scenePort) {
      // Whiteboard: stop listening for local scene edits.
      this.unsubscribeScene?.();
      this.unsubscribeScene = null;
    } else {
      this.doc.off('update', this.handleDocUpdate);
    }
    this.awareness.off('update', this.handleAwarenessUpdate);
    // Drop this client's awareness state so peers see the leave immediately.
    removeAwarenessStates(this.awareness, [this.doc.clientID], 'provider-destroy');

    this.statusListeners.clear();
    this.syncedListeners.clear();
    this.controlListeners.clear();
    this.ephemeralListeners.clear();

    if (this.ownsAwareness) this.awareness.destroy();
    if (this.ownsDoc) this.doc.destroy();
  }

  private handleOpen = () => {
    this.reconnectAttempt = 0;
    this.setStatus('connected');
    // Initiate the handshake: send SyncStep1 so the server replies SyncStep2
    // (+ its own SyncStep1 and an awareness snapshot). Mirrors the y-websocket client.
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, WIRE.SYNC);
    if (this.scenePort) {
      // Byte-identical to `writeSyncStep1(encoder, doc)` for a doc whose state
      // vector equals `encodeSceneStateVector()`: both emit
      // `messageYjsSyncStep1` + a var-uint8-array of the state vector.
      encoding.writeVarUint(encoder, messageYjsSyncStep1);
      encoding.writeVarUint8Array(encoder, this.scenePort.encodeSceneStateVector());
    } else {
      writeSyncStep1(encoder, this.doc);
    }
    this.sendFrame(encoding.toUint8Array(encoder));

    // Announce our current local awareness state to the room.
    if (this.awareness.getLocalState() !== null) {
      this.broadcastAwareness([this.doc.clientID]);
    }
  };

  private handleMessage = (event: MessageEvent) => {
    if (!(event.data instanceof ArrayBuffer)) return;
    const decoder = decoding.createDecoder(new Uint8Array(event.data));
    const messageType = decoding.readVarUint(decoder);

    switch (messageType) {
      case WIRE.SYNC: {
        const encoder = encoding.createEncoder();
        encoding.writeVarUint(encoder, WIRE.SYNC);
        // Drives the canonical sync state machine. A server SyncStep1 yields a
        // SyncStep2 reply; SyncStep2 / Update are applied. In the raw-doc (memo)
        // path `this` is the origin so our doc 'update' observer does not echo
        // them back; in the scene-port (whiteboard) path the port's
        // `applyRemoteSceneUpdate` is itself non-echoing.
        const replyType = this.scenePort
          ? this.readSceneSyncMessage(decoder, encoder, this.scenePort)
          : readSyncMessage(decoder, encoder, this.doc, this);
        if (encoding.length(encoder) > 1) {
          this.sendFrame(encoding.toUint8Array(encoder));
        }
        // The first SyncStep2 means our initial state has been received: synced.
        if (replyType === messageYjsSyncStep2 && !this._synced) {
          this.setSynced(true);
        }
        break;
      }
      case WIRE.AWARENESS: {
        const update = decoding.readVarUint8Array(decoder);
        applyAwarenessUpdate(this.awareness, update, this);
        break;
      }
      case WIRE.EPHEMERAL: {
        const parsed = readJsonPayload(decoder) as EphemeralEvent | undefined;
        if (parsed && typeof parsed.type === 'string') {
          this.ephemeralListeners.forEach(listener => listener(parsed));
        }
        break;
      }
      case WIRE.CONTROL: {
        const parsed = readJsonPayload(decoder) as ControlMessage | undefined;
        if (parsed && typeof parsed.kind === 'string') {
          this.controlListeners.forEach(listener => listener(parsed));
        }
        break;
      }
      default:
        // y-protocols leniency: ignore unknown types.
        break;
    }
  };

  private handleClose = (event: CloseEvent) => {
    this.setSynced(false);
    this.detachSocketListeners();
    this.ws = null;
    if (this.destroyed) return;
    this.setStatus('disconnected');
    // Reconnect with backoff unless the server signalled a clean policy close
    // (e.g. room-closed / capacity) — those should not be retried blindly.
    if (event.code === NORMAL_CLOSURE) return;
    this.scheduleReconnect();
  };

  private handleError = () => {
    // 'close' fires after 'error'; the reconnect is scheduled there.
    logWarn('Unified collab WebSocket error', {
      category: this.type === 'memo' ? TagCategoryValues.MEMO : TagCategoryValues.WHITEBOARD,
      label: `doc: ${this.documentId}`,
    });
  };

  private handleDocUpdate = (update: Uint8Array, origin: unknown) => {
    // Skip updates we applied FROM the server (origin === this).
    if (origin === this) return;
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, WIRE.SYNC);
    writeUpdate(encoder, update);
    this.sendFrame(encoding.toUint8Array(encoder));
  };

  /**
   * Hand-rolled y-protocols sync dispatch for the scene-port (whiteboard) path,
   * mirroring `readSyncMessage` but sourcing/sinking via the editor's port instead
   * of a raw `Y.Doc`. Frame-for-frame identical to the raw-doc path: a SyncStep1
   * yields a SyncStep2 (delta) reply; SyncStep2 / Update are applied. Returns the
   * sub-type read, so the caller's `synced` and reply-suppression logic is shared.
   */
  private readSceneSyncMessage(decoder: decoding.Decoder, encoder: encoding.Encoder, port: SceneSyncPort): number {
    const messageType = decoding.readVarUint(decoder);
    switch (messageType) {
      case messageYjsSyncStep1: {
        const stateVector = decoding.readVarUint8Array(decoder);
        encoding.writeVarUint(encoder, messageYjsSyncStep2);
        encoding.writeVarUint8Array(encoder, port.encodeSceneAsUpdate('v1', stateVector));
        break;
      }
      case messageYjsSyncStep2:
      case messageYjsUpdate: {
        const update = decoding.readVarUint8Array(decoder);
        // Let a decode/apply failure ESCAPE — the provider's message handler owns
        // decode-failure recovery (resync) and needs the throw to trigger it. Do not
        // swallow it here.
        port.applyRemoteSceneUpdate(update, 'v1');
        break;
      }
      default:
        // Frame-for-frame parity with y-protocols `readSyncMessage`: an unknown sync
        // sub-type is a protocol violation and throws rather than silently diverging.
        throw new Error('Unknown message type');
    }
    return messageType;
  }

  /**
   * Outbound framing for a local scene edit — identical to `handleDocUpdate`'s:
   * `writeUpdate` frames `messageYjsUpdate` + payload under the WIRE.SYNC prefix.
   */
  private broadcastSceneUpdate(update: Uint8Array): void {
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, WIRE.SYNC);
    writeUpdate(encoder, update);
    this.sendFrame(encoding.toUint8Array(encoder));
  }

  private handleAwarenessUpdate = (
    changes: { added: number[]; updated: number[]; removed: number[] },
    origin: unknown
  ) => {
    // Skip awareness we applied FROM the server (origin === this).
    if (origin === this) return;
    const changedClients = [...changes.added, ...changes.updated, ...changes.removed];
    this.broadcastAwareness(changedClients);
  };

  private broadcastAwareness(clients: number[]): void {
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, WIRE.AWARENESS);
    encoding.writeVarUint8Array(encoder, encodeAwarenessUpdate(this.awareness, clients));
    this.sendFrame(encoding.toUint8Array(encoder));
  }

  private sendEphemeral(event: EphemeralEvent): void {
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, WIRE.EPHEMERAL);
    encoding.writeVarString(encoder, JSON.stringify(event));
    this.sendFrame(encoding.toUint8Array(encoder));
  }

  private sendFrame(bytes: Uint8Array): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(bytes);
    }
  }

  private scheduleReconnect(): void {
    if (this.destroyed || this.reconnectTimer) return;
    const delay = RECONNECT_BACKOFF_MS[Math.min(this.reconnectAttempt, RECONNECT_BACKOFF_MS.length - 1)];
    this.reconnectAttempt += 1;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }

  private clearReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.reconnectAttempt = 0;
  }

  private teardownSocket(code: number): void {
    if (!this.ws) return;
    this.detachSocketListeners();
    try {
      this.ws.close(code);
    } catch {
      // already closing/closed
    }
    this.ws = null;
  }

  private detachSocketListeners(): void {
    if (!this.ws) return;
    this.ws.removeEventListener('open', this.handleOpen);
    this.ws.removeEventListener('message', this.handleMessage);
    this.ws.removeEventListener('close', this.handleClose);
    this.ws.removeEventListener('error', this.handleError);
  }

  private setStatus(status: ConnectionStatus): void {
    if (this._status === status) return;
    this._status = status;
    this.statusListeners.forEach(listener => listener(status));
  }

  private setSynced(synced: boolean): void {
    if (this._synced === synced) return;
    this._synced = synced;
    this.syncedListeners.forEach(listener => listener(synced));
  }
}

/** Read a `[length-prefixed JSON string]` payload, returning `undefined` on malformed input. */
function readJsonPayload(decoder: decoding.Decoder): unknown {
  try {
    return JSON.parse(decoding.readVarString(decoder));
  } catch {
    return undefined;
  }
}

/**
 * Build `wss://<host><path>/<documentId>?type=<type>[&guestName=...]` from the
 * configured collab base URL. `http(s)` is upgraded to `ws(s)`. Returns null when
 * the base URL is not configured (the provider then stays inert).
 */
function buildCollabUrl(
  options: Pick<UnifiedCollabProviderOptions, 'documentId' | 'type' | 'baseUrl' | 'path' | 'guestName'>
): string | null {
  const baseUrl = options.baseUrl ?? globalThis.window?._env_?.VITE_APP_COLLAB_URL;
  if (!baseUrl) return null;

  const path = options.path ?? globalThis.window?._env_?.VITE_APP_COLLAB_PATH ?? '/collab';
  const wsBase = baseUrl.replace(/^http/, 'ws').replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path.replace(/\/$/, '') : `/${path.replace(/\/$/, '')}`;

  const params = new URLSearchParams({ type: options.type });
  if (options.guestName) params.set('guestName', options.guestName);

  return `${wsBase}${normalizedPath}/${encodeURIComponent(options.documentId)}?${params.toString()}`;
}

/**
 * Map a control message's granular `reason` (the server's `ReadOnlyReason`) to the
 * client's `ReadOnlyCode` so the memo footer keeps its read-only UX granularity.
 * The vocabularies are 1:1 by design (collaboration-service `control.go`).
 */
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
