import * as decoding from 'lib0/decoding';
import * as encoding from 'lib0/encoding';
import * as lib0String from 'lib0/string';
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
  /** Server→client JSON control (saved / save-error / read-only-state / collaborator-mode / room-user-change / update-rejected / session-end). */
  CONTROL: 3,
  /** Client→server request to persist every preceding update on this connection. */
  DURABILITY_REQUEST: 4,
  /** Client liveness probe echoed by the service; never persisted or broadcast. */
  HEARTBEAT: 5,
} as const;

/**
 * A server-authoritative session-end cause. The `disposition` (carried on the control)
 * decides the client outcome; `code` names the cause and always equals the subsequent
 * close reason. No Error/Reason string-branching — route on the code + disposition.
 */
export type SessionEndCode =
  | 'update-rate-exceeded' // member  · transient · close 1013
  | 'update-not-accepted' // member  · transient · an inbound update could not be admitted to the room command queue (not applied/saved) — reconnect/backoff
  | 'document-size-limit-exceeded' // member  · manual    · close 1008
  | 'document-deleted' // document · terminal  · close 1008
  | 'edits-not-saved' // document · terminal  · close 1008
  | 'server-shutdown'; // document · transient · close 1001

export type SessionEndDisposition = 'transient' | 'terminal' | 'manual';

export type SessionEndScope = 'member' | 'document';

export type SessionEndInfo = { code: SessionEndCode; scope: SessionEndScope; disposition: SessionEndDisposition };

/**
 * The KNOWN session-end tuples. The `code` is the key; scope + disposition are derived from
 * THIS table (the authority), never trusted from the wire — a control whose wire scope or
 * disposition disagrees with the table, or whose code is unknown, is rejected (fail closed).
 */
export const SESSION_END_TABLE: Record<SessionEndCode, { scope: SessionEndScope; disposition: SessionEndDisposition }> =
  {
    'update-rate-exceeded': { scope: 'member', disposition: 'transient' },
    'update-not-accepted': { scope: 'member', disposition: 'transient' },
    'document-size-limit-exceeded': { scope: 'member', disposition: 'manual' },
    'document-deleted': { scope: 'document', disposition: 'terminal' },
    'edits-not-saved': { scope: 'document', disposition: 'terminal' },
    'server-shutdown': { scope: 'document', disposition: 'transient' },
  };

/**
 * Classify a `session-end` control against {@link SESSION_END_TABLE}. Returns the
 * authoritative tuple (from the table), or `null` when the code is unknown OR the wire
 * scope/disposition is inconsistent with the table — the caller must then fail CLOSED
 * (terminal, no reconnect) rather than trust an arbitrary wire string.
 */
export function classifySessionEnd(
  message: Pick<ControlMessage, 'code' | 'scope' | 'disposition'>
): SessionEndInfo | null {
  const code = message.code;
  const known = code ? SESSION_END_TABLE[code] : undefined;
  if (!code || !known) {
    return null;
  }
  if (message.scope !== known.scope || message.disposition !== known.disposition) {
    return null;
  }
  return { code, scope: known.scope, disposition: known.disposition };
}

/** A `WireControl` payload — server→client JSON (collaboration-service `ControlMessage`). */
export type ControlMessage = {
  kind:
    | 'saved'
    | 'save-error'
    | 'read-only-state'
    | 'collaborator-mode'
    | 'room-user-change'
    // The server's ingress validator rejected a local update (e.g. a bad assets-root
    // struct). The local scene is poisoned: the client must discard this generation
    // and resync a fresh scene from the server rather than resend the rejected state.
    | 'update-rejected'
    // The server is ending this session. `disposition` is AUTHORITATIVE — the socket close
    // that follows must not override or duplicate it. `code` names the cause, `scope` its
    // extent (a member limit vs a whole-document condition).
    | 'session-end'
    // Durability-barrier replies: each answers ONE `persist-request` by its `requestId`.
    // `persisted` = the requested state reached the configured stores; `persist-failed` =
    // it could not (with `error`). `requestDurability` below consumes them over the
    // same raw-JSON control channel.
    | 'persisted'
    | 'persist-failed';
  version?: number;
  /** Correlates `persisted` / `persist-failed` with the durability request that asked. */
  requestId?: string;
  /** Human-readable failure reason on `save-error` and `persist-failed` (never secrets). */
  error?: string;
  readOnly?: boolean;
  reason?: string;
  mode?: 'read' | 'write';
  users?: number;
  code?: SessionEndCode;
  scope?: 'member' | 'document';
  disposition?: SessionEndDisposition;
};

export type { EphemeralChannel, EphemeralEvent } from '@/domain/common/whiteboard/excalidraw/collab/awarenessRouter';

/**
 * How an unavailable or ended connection attempt should be handled:
 * - `transient`: a drop to reconnect from with backoff (and the reconnect notice):
 *   `room-capacity-reached` (1008), 1011 (authz-backend outage), a transport error
 *   (1006), etc.
 * - `terminal`: a policy close this attempt must NEVER retry — `forbidden` /
 *   `document deleted` / any unrecognised 1008 (fail closed). The provider's timer
 *   stays off.
 * `reason` is carried through so a consumer can tell the terminal reasons apart.
 */
export type CloseDisposition = 'transient' | 'terminal';

export type CloseVerdict = {
  code: number;
  reason: string;
  disposition: CloseDisposition;
};

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

type ProviderEvent = 'status' | 'synced' | 'control' | 'close' | 'unconfirmed';

type StatusListener = (status: ConnectionStatus) => void;
type SyncedListener = (synced: boolean) => void;
type ControlListener = (message: ControlMessage) => void;
type CloseListener = (verdict: CloseVerdict) => void;
type UnconfirmedListener = (unconfirmed: boolean) => void;

type DurabilityWaiter = {
  resolve: () => void;
  reject: (error: Error) => void;
  timeout: ReturnType<typeof setTimeout>;
};

type UnifiedCollabProviderCommonOptions = {
  /** The collaborative document id (the room) — `/collab/<documentId>`. */
  documentId: string;
  /** Document content type, selecting the room's seed convention server-side. */
  type: 'memo' | 'whiteboard';
  /** Reuse an existing awareness (e.g. the whiteboard binding's). A fresh one is created when omitted. */
  awareness?: Awareness;
  /** Override the service base URL (defaults to the platform or browser origin). */
  baseUrl?: string;
  /** Override the service path prefix (defaults to `/collab`). */
  path?: string;
  /** Anonymous display name for a guest connection (`?guestName=`). The BFF session cookie is reused otherwise. */
  guestName?: string;
  /** Connect on construction. Defaults to true. */
  connect?: boolean;
  /**
   * Carry an unconfirmed edit across a deliberate provider/admission replacement
   * that keeps the same Y.Doc/scene (the inactivity Resume path). Transport
   * reconnects keep their provider and do not need this hand-off.
   */
  initialUnconfirmedLocalChanges?: boolean;
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
export const DURABILITY_REQUEST_TIMEOUT_MS = 60_000;
export const INBOUND_IDLE_PROBE_MS = 15_000;
export const INBOUND_IDLE_GRACE_MS = 10_000;
const NORMAL_CLOSURE = 1000;
/**
 * WebSocket policy-violation close code (RFC 6455 §7.4.1). The unified collaboration
 * service uses it for every room-policy close, discriminated by the close `reason`
 * (collaboration-service `internal/transport/ws`): `room-capacity-reached` is
 * transient (a later retry may find room); `forbidden` and `document deleted` are
 * terminal, and any UNRECOGNISED 1008 reason is treated as terminal (fail closed)
 * so a policy the client does not understand is never blindly retried forever.
 */
const POLICY_VIOLATION = 1008;
/** The only 1008 reason that is transient — every other 1008 reason is terminal. */
const TRANSIENT_POLICY_REASON = 'room-capacity-reached';

/**
 * `UnifiedCollabProvider` connects a `Y.Doc` (memo or whiteboard) to the unified
 * collaboration service over a single WebSocket at
 * `wss://<host>/collab/<documentId>?type=memo|whiteboard`, reusing the OIDC/BFF
 * session (the session cookie rides the same-site handshake; a guest passes
 * `?guestName=`). It speaks the collaboration wire protocol directly — sync(0) +
 * awareness(1) via y-protocols, plus the service's custom ephemeral(2) and
 * control(3) JSON channels, durability requests(4), and heartbeats(5) — so it
 * replaces both legacy transports with one transport.
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
  private _status: ConnectionStatus = 'disconnected';
  private _synced = false;
  private destroyed = false;
  private reconnectAttempt = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private inboundIdleTimer: ReturnType<typeof setTimeout> | null = null;
  private heartbeatProbeSent = false;
  private online = globalThis.navigator?.onLine !== false;
  /**
   * The caller's durable connection intent. Transient transport failures and
   * browser-offline periods preserve it; clean/terminal closes, disconnect(),
   * and destroy() clear it. Sockets and retry timers are consequences of this
   * intent, never a source from which it is reconstructed.
   */
  private connectionRequested = false;

  private readonly statusListeners = new Set<StatusListener>();
  private readonly syncedListeners = new Set<SyncedListener>();
  private readonly controlListeners = new Set<ControlListener>();
  private readonly closeListeners = new Set<CloseListener>();
  private readonly unconfirmedListeners = new Set<UnconfirmedListener>();
  private readonly ephemeralListeners = new Set<(event: EphemeralEvent) => void>();
  private durabilitySequence = 0;
  private localUpdateSeq = 0;
  private confirmedUpdateSeq = 0;
  private hasCompletedSync = false;
  private queuedDurabilityWaiters: DurabilityWaiter[] = [];
  private pendingDurability:
    | {
        requestId: string;
        snapshotSeq: number;
        waiters: DurabilityWaiter[];
      }
    | undefined;

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
    if (options.initialUnconfirmedLocalChanges) this.localUpdateSeq = 1;

    if (this.scenePort) {
      // Outbound: local scene edits are framed as sync Updates. The port never
      // delivers remote-applied updates here (its one-origin policy), so unlike
      // the raw-doc path this needs no origin/echo guard.
      this.unsubscribeScene = this.scenePort.onLocalSceneUpdate(update => this.broadcastSceneUpdate(update), 'v1');
    } else {
      this.doc.on('update', this.handleDocUpdate);
    }
    this.awareness.on('update', this.handleAwarenessUpdate);
    globalThis.window?.addEventListener?.('offline', this.handleOffline);
    globalThis.window?.addEventListener?.('online', this.handleOnline);

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

  get hasEverSynced(): boolean {
    return this.hasCompletedSync;
  }

  get hasUnconfirmedLocalChanges(): boolean {
    return this.localUpdateSeq > this.confirmedUpdateSeq;
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
  on(event: 'close', listener: CloseListener): void;
  on(event: 'unconfirmed', listener: UnconfirmedListener): void;
  on(
    event: ProviderEvent,
    listener: StatusListener | SyncedListener | ControlListener | CloseListener | UnconfirmedListener
  ): void {
    if (event === 'status') this.statusListeners.add(listener as StatusListener);
    else if (event === 'synced') this.syncedListeners.add(listener as SyncedListener);
    else if (event === 'control') this.controlListeners.add(listener as ControlListener);
    else if (event === 'close') this.closeListeners.add(listener as CloseListener);
    else this.unconfirmedListeners.add(listener as UnconfirmedListener);
  }

  off(event: 'status', listener: StatusListener): void;
  off(event: 'synced', listener: SyncedListener): void;
  off(event: 'control', listener: ControlListener): void;
  off(event: 'close', listener: CloseListener): void;
  off(event: 'unconfirmed', listener: UnconfirmedListener): void;
  off(
    event: ProviderEvent,
    listener: StatusListener | SyncedListener | ControlListener | CloseListener | UnconfirmedListener
  ): void {
    if (event === 'status') this.statusListeners.delete(listener as StatusListener);
    else if (event === 'synced') this.syncedListeners.delete(listener as SyncedListener);
    else if (event === 'control') this.controlListeners.delete(listener as ControlListener);
    else if (event === 'close') this.closeListeners.delete(listener as CloseListener);
    else this.unconfirmedListeners.delete(listener as UnconfirmedListener);
  }

  connect(): void {
    if (this.destroyed || !this.url) return;

    const isNewRequest = !this.connectionRequested;
    this.connectionRequested = true;

    // A live/connecting socket or a scheduled retry already owns the next
    // attempt. Repeated connect() calls must never create a second owner.
    if (this.ws || this.reconnectTimer) return;

    if (!this.online) {
      if (isNewRequest) {
        this.reportTransientDisconnect('offline');
      }
      return;
    }

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
    this.connectionRequested = false;
    this.rejectAllDurability('The collaboration connection closed before the draft was persisted');
    this.clearReconnect();
    this.clearConnectionHealthTimers();
    this.teardownSocket(NORMAL_CLOSURE);
    this.setSynced(false);
    this.setStatus('disconnected');
  }

  /** Permanently dispose: stop reconnecting, close the socket, free any doc/awareness this provider created. */
  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    this.connectionRequested = false;
    this.rejectAllDurability('The collaboration editor closed before the draft was persisted');
    this.clearReconnect();
    this.clearConnectionHealthTimers();
    // Publish the local leave while the socket and awareness listener are still
    // active. The service also cleans up on disconnect; this makes normal client
    // disposal immediate without depending on that fallback.
    removeAwarenessStates(this.awareness, [this.awareness.clientID], 'provider-destroy');
    this.teardownSocket(NORMAL_CLOSURE);

    if (this.scenePort) {
      // Whiteboard: stop listening for local scene edits.
      this.unsubscribeScene?.();
      this.unsubscribeScene = null;
    } else {
      this.doc.off('update', this.handleDocUpdate);
    }
    this.awareness.off('update', this.handleAwarenessUpdate);
    globalThis.window?.removeEventListener?.('offline', this.handleOffline);
    globalThis.window?.removeEventListener?.('online', this.handleOnline);

    this.statusListeners.clear();
    this.syncedListeners.clear();
    this.controlListeners.clear();
    this.closeListeners.clear();
    this.unconfirmedListeners.clear();
    this.ephemeralListeners.clear();

    if (this.ownsAwareness) this.awareness.destroy();
    if (this.ownsDoc) this.doc.destroy();
  }

  /**
   * Ask the collaboration service to persist every update sent before this frame.
   * Logical callers survive transient reconnects. At most one wire request is in
   * flight; callers that were waiting when a connection resyncs share the next
   * barrier, while callers arriving after that frame wait for the following one.
   */
  requestDurability(): Promise<void> {
    if (this.destroyed) {
      return Promise.reject(new Error('The collaboration editor closed before the draft was persisted'));
    }
    if (!this.connectionRequested) {
      return Promise.reject(new Error('The collaboration connection is not available for persistence'));
    }
    const promise = new Promise<void>((resolve, reject) => {
      const waiter: DurabilityWaiter = {
        resolve,
        reject,
        timeout: setTimeout(() => {
          this.expireDurabilityWaiter(waiter);
          reject(new Error('The collaboration service timed out while persisting the draft'));
        }, DURABILITY_REQUEST_TIMEOUT_MS),
      };
      this.queuedDurabilityWaiters.push(waiter);
    });
    this.ensureDurabilityRequest();
    return promise;
  }

  /**
   * Persist the provider's pending local state, not merely one point-in-time
   * barrier. A newer edit that lands while an acknowledgement is in flight
   * remains dirty and therefore requires the next barrier before this resolves.
   */
  async persistPendingChanges(options: { force?: boolean } = {}): Promise<void> {
    if (!options.force && !this.hasUnconfirmedLocalChanges) return;
    do {
      await this.requestDurability();
    } while (this.hasUnconfirmedLocalChanges);
  }

  private ensureDurabilityRequest(): void {
    if (this.destroyed || this.pendingDurability || this.queuedDurabilityWaiters.length === 0) return;
    if (
      !this.online ||
      this._status !== 'connected' ||
      !this._synced ||
      !this.ws ||
      this.ws.readyState !== WebSocket.OPEN
    ) {
      this.dialNowIfRequested();
      return;
    }

    const requestId = `${Date.now().toString(36)}-${(++this.durabilitySequence).toString(36)}`;
    const waiters = this.queuedDurabilityWaiters;
    this.queuedDurabilityWaiters = [];
    this.pendingDurability = { requestId, snapshotSeq: this.localUpdateSeq, waiters };

    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, WIRE.DURABILITY_REQUEST);
    encoding.writeUint8Array(encoder, lib0String.encodeUtf8(JSON.stringify({ requestId })));
    this.sendFrame(encoding.toUint8Array(encoder));
  }

  private requeuePendingDurability(): void {
    if (!this.pendingDurability) return;
    this.queuedDurabilityWaiters = [...this.pendingDurability.waiters, ...this.queuedDurabilityWaiters];
    this.pendingDurability = undefined;
  }

  private expireDurabilityWaiter(waiter: DurabilityWaiter): void {
    this.queuedDurabilityWaiters = this.queuedDurabilityWaiters.filter(candidate => candidate !== waiter);
    let abandonedWireRequest = false;
    if (this.pendingDurability) {
      this.pendingDurability.waiters = this.pendingDurability.waiters.filter(candidate => candidate !== waiter);
      abandonedWireRequest = this.pendingDurability.waiters.length === 0;
    }

    if (abandonedWireRequest) {
      // The wire request may still be running even though its last logical caller
      // timed out. Retire that connection before another barrier is sent: requestId
      // correlation prevents a wrong acknowledgement, but it would not preserve the
      // stronger one-wire-at-a-time contract. The normal transient funnel clears the
      // old request and keeps any later logical callers queued for the resync.
      this.failTransientConnection('durability-timeout');
      return;
    }
    this.ensureDurabilityRequest();
  }

  private resolveDurabilityWaiters(waiters: DurabilityWaiter[]): void {
    for (const waiter of waiters) {
      clearTimeout(waiter.timeout);
      waiter.resolve();
    }
  }

  private rejectDurabilityWaiters(waiters: DurabilityWaiter[], message: string): void {
    for (const waiter of waiters) {
      clearTimeout(waiter.timeout);
      waiter.reject(new Error(message));
    }
  }

  private rejectAllDurability(message: string): void {
    const waiters = [...(this.pendingDurability?.waiters ?? []), ...this.queuedDurabilityWaiters];
    this.pendingDurability = undefined;
    this.queuedDurabilityWaiters = [];
    this.rejectDurabilityWaiters(waiters, message);
  }

  private handleOpen = () => {
    this.setStatus('connected');
    this.markInboundActivity();
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
      this.broadcastAwareness([this.awareness.clientID]);
    }
  };

  private handleMessage = (event: MessageEvent) => {
    if (!(event.data instanceof ArrayBuffer)) return;
    const decoder = decoding.createDecoder(new Uint8Array(event.data));
    const messageType = decoding.readVarUint(decoder);
    let validInboundFrame = false;

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
        validInboundFrame = true;
        break;
      }
      case WIRE.AWARENESS: {
        const update = decoding.readVarUint8Array(decoder);
        applyAwarenessUpdate(this.awareness, update, this);
        validInboundFrame = true;
        break;
      }
      case WIRE.EPHEMERAL: {
        const parsed = readJsonPayload(decoder) as EphemeralEvent | undefined;
        if (parsed && typeof parsed.type === 'string') {
          this.ephemeralListeners.forEach(listener => listener(parsed));
          validInboundFrame = true;
        }
        break;
      }
      case WIRE.CONTROL: {
        const parsed = readRawJsonPayload(decoder) as ControlMessage | undefined;
        if (parsed && typeof parsed.kind === 'string') {
          this.settleDurability(parsed);
          this.controlListeners.forEach(listener => listener(parsed));
          validInboundFrame = true;
        }
        break;
      }
      case WIRE.HEARTBEAT:
        validInboundFrame = true;
        break;
      default:
        // y-protocols leniency: ignore unknown types.
        break;
    }
    if (validInboundFrame) this.markInboundActivity();
  };

  private handleClose = (event: CloseEvent) => {
    this.requeuePendingDurability();
    this.setSynced(false);
    this.clearConnectionHealthTimers();
    this.detachSocketListeners();
    this.ws = null;
    if (this.destroyed) return;
    this.setStatus('disconnected');

    // Classify the close from BOTH the code and the reason, then hand the verdict
    // to consumers so a terminal policy close stops their retry loops too — not
    // just this provider's timer.
    const verdict = classifyClose(event.code, event.reason);
    if (verdict.disposition !== 'transient') {
      // Clear the ended intent before notifying consumers. A close listener may
      // deliberately start a fresh manual attempt; clearing after notification
      // would silently cancel that new request.
      this.connectionRequested = false;
      this.clearReconnect();
      this.rejectAllDurability('The collaboration connection closed before the draft was persisted');
    }
    this.closeListeners.forEach(listener => listener(verdict));

    // Every observed non-terminal remote close reconnects with backoff. Intentional
    // local closes detached this listener before sending 1000.
    if (verdict.disposition === 'transient') {
      this.scheduleReconnect();
    }
  };

  private settleDurability(message: ControlMessage): void {
    const pending = this.pendingDurability;
    if (
      !pending ||
      message.requestId !== pending.requestId ||
      (message.kind !== 'persisted' && message.kind !== 'persist-failed')
    ) {
      return;
    }
    if (message.kind === 'persisted') {
      this.pendingDurability = undefined;
      const wasUnconfirmed = this.hasUnconfirmedLocalChanges;
      this.confirmedUpdateSeq = Math.max(this.confirmedUpdateSeq, pending.snapshotSeq);
      this.resolveDurabilityWaiters(pending.waiters);
      this.emitUnconfirmedIfChanged(wasUnconfirmed);
      this.ensureDurabilityRequest();
    } else if (message.kind === 'persist-failed') {
      this.pendingDurability = undefined;
      this.rejectDurabilityWaiters(pending.waiters, message.error ?? 'The draft could not be persisted');
      this.ensureDurabilityRequest();
    }
  }

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
    const wasUnconfirmed = this.recordLocalUpdate();
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, WIRE.SYNC);
    writeUpdate(encoder, update);
    this.sendFrame(encoding.toUint8Array(encoder));
    this.emitUnconfirmedIfChanged(wasUnconfirmed);
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
        // Do NOT swallow a decode/apply failure — let it escape and fail loud. There
        // is no decode-failure resync handler and none is needed: post-cutover the
        // coordinated ingress validation (candidate-apply + no mixed fleet) means
        // malformed bytes have no route to a client, so a catch here would only hide
        // a real bug.
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
    const wasUnconfirmed = this.recordLocalUpdate();
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, WIRE.SYNC);
    writeUpdate(encoder, update);
    this.sendFrame(encoding.toUint8Array(encoder));
    this.emitUnconfirmedIfChanged(wasUnconfirmed);
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
      // `bytes` is ArrayBuffer-backed (lib0 `toUint8Array`); the cast bridges TS 5.7+'s
      // generic typed-array lib (`Uint8Array<ArrayBufferLike>` no longer implicitly a `BufferSource`).
      this.ws.send(bytes as BufferSource);
    }
  }

  private recordLocalUpdate(): boolean {
    const wasUnconfirmed = this.hasUnconfirmedLocalChanges;
    this.localUpdateSeq += 1;
    return wasUnconfirmed;
  }

  private emitUnconfirmedIfChanged(previous: boolean): void {
    const current = this.hasUnconfirmedLocalChanges;
    if (current !== previous) this.unconfirmedListeners.forEach(listener => listener(current));
  }

  private markInboundActivity(): void {
    if (this.destroyed || !this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    if (this.inboundIdleTimer) clearTimeout(this.inboundIdleTimer);
    this.heartbeatProbeSent = false;
    this.inboundIdleTimer = setTimeout(() => {
      this.inboundIdleTimer = null;
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
      if (!this.heartbeatProbeSent) {
        this.heartbeatProbeSent = true;
        const encoder = encoding.createEncoder();
        encoding.writeVarUint(encoder, WIRE.HEARTBEAT);
        this.sendFrame(encoding.toUint8Array(encoder));
        this.inboundIdleTimer = setTimeout(() => {
          this.inboundIdleTimer = null;
          this.failTransientConnection('inbound-idle-timeout');
        }, INBOUND_IDLE_GRACE_MS);
      }
    }, INBOUND_IDLE_PROBE_MS);
  }

  private scheduleReconnect(): void {
    if (this.destroyed || !this.connectionRequested || this.ws || this.reconnectTimer || !this.online) return;
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

  /** Retry immediately through the provider's one reconnect owner. */
  reconnectNow(): void {
    if (this.destroyed || !this.online || this.ws) return;
    this.connectionRequested = true;
    this.clearReconnect();
    this.connect();
  }

  /**
   * Expedite an already-requested connection for a pending durability waiter.
   * Unlike explicit Retry, this can never revive a terminal or intentionally
   * disconnected provider and it preserves the accumulated backoff attempt.
   */
  private dialNowIfRequested(): void {
    if (this.destroyed || !this.connectionRequested || !this.online || this.ws) return;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.connect();
  }

  /** Pause retries and preserve an active connection intent until the browser returns online. */
  private handleOffline = () => {
    if (this.destroyed) return;
    this.online = false;
    if (this.ws) {
      this.failTransientConnection('offline');
    } else {
      this.clearReconnect();
      this.setSynced(false);
      this.setStatus('disconnected');
    }
  };

  /** Fulfil a deferred connection intent without reviving an intentional close. */
  private handleOnline = () => {
    this.online = true;
    if (!this.connectionRequested) return;
    this.reconnectNow();
  };

  private failTransientConnection(reason: string): void {
    if (this.destroyed || !this.ws) return;
    // Once the browser has started closing a socket, its queued `close` event is
    // authoritative: it may carry a remote 1000 or terminal policy verdict. Detaching
    // that listener here would replace the real outcome with a synthetic transient
    // one and could reconnect a session that must stay closed.
    if (this.ws.readyState !== WebSocket.CONNECTING && this.ws.readyState !== WebSocket.OPEN) return;
    this.requeuePendingDurability();
    this.clearConnectionHealthTimers();
    this.teardownSocket(4000);
    this.reportTransientDisconnect(reason);
    this.scheduleReconnect();
  }

  /** Publish the shared retryable-disconnect outcome, whether or not a socket was created. */
  private reportTransientDisconnect(reason: string): void {
    this.setSynced(false);
    this.setStatus('disconnected');
    const verdict: CloseVerdict = { code: 4000, reason, disposition: 'transient' };
    this.closeListeners.forEach(listener => listener(verdict));
  }

  private clearConnectionHealthTimers(): void {
    if (this.inboundIdleTimer) clearTimeout(this.inboundIdleTimer);
    this.inboundIdleTimer = null;
    this.heartbeatProbeSent = false;
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
    if (synced) {
      // Reset backoff only after a usable Yjs session, not merely TCP OPEN.
      // Repeated open-without-sync failures must continue backing off.
      this.reconnectAttempt = 0;
      this.hasCompletedSync = true;
      this.ensureDurabilityRequest();
    }
    this.syncedListeners.forEach(listener => listener(synced));
  }
}

/**
 * Classify a WebSocket close into one of three dispositions from its `(code, reason)`:
 * `terminal` (never retry) or `transient` (retry). A remote 1000 is transient:
 * proxies and service drains can normalize an unexpected close to 1000. Intentional
 * local closes are excluded structurally because their listener is detached first.
 *
 * Only a `1008` policy close is reason-sensitive: `room-capacity-reached` is the
 * single transient reason (retrying may later find room); `forbidden` and
 * `document deleted` are terminal, and any OTHER/unknown 1008 reason is treated as
 * terminal too — FAIL CLOSED, so a policy the client does not recognise is never
 * retried blindly. Every other code is transient (including 1000, a `1011`
 * authz-backend outage, and a `1006` transport drop).
 */
export function classifyClose(code: number, reason: string): CloseVerdict {
  if (code === POLICY_VIOLATION && reason !== TRANSIENT_POLICY_REASON) {
    return { code, reason, disposition: 'terminal' };
  }
  return { code, reason, disposition: 'transient' };
}

/**
 * Read a `[VarString]` JSON payload (a `writeVarString` length prefix + UTF-8
 * bytes), returning `undefined` on malformed input. Used for EPHEMERAL (type 2):
 * those frames are CLIENT-originated (`sendEphemeral` frames them with
 * `writeVarString`) and the service relays them to peers verbatim, so a received
 * ephemeral frame still carries the client's VarString length prefix.
 */
function readJsonPayload(decoder: decoding.Decoder): unknown {
  try {
    return JSON.parse(decoding.readVarString(decoder));
  } catch {
    return undefined;
  }
}

/**
 * Read a raw-JSON control payload, returning `undefined` on malformed input.
 * CONTROL (type 3) is SERVER-originated: the service frames it via go-yjs
 * `protocol.WriteMessage(buf, WireControl, json.Marshal(msg))`, which writes
 * `[type VarUint][raw JSON bytes]` — the marshalled JSON is copied verbatim
 * (`buf.Write(payload)`), with NO VarString length prefix. So after the type
 * varuint is consumed the JSON is the entire remainder of the frame: decode the
 * tail bytes as UTF-8 and parse. (Reading a VarString here would misread the
 * leading `{` byte, 0x7B = 123, as a 123-byte length and drop every control.)
 */
function readRawJsonPayload(decoder: decoding.Decoder): unknown {
  try {
    return JSON.parse(lib0String.decodeUtf8(decoding.readTailAsUint8Array(decoder)));
  } catch {
    return undefined;
  }
}

/**
 * Build `wss://<host><path>/<documentId>?type=<type>[&guestName=...]` from the
 * platform origin. `http(s)` is upgraded to `ws(s)`. An explicit `baseUrl`
 * remains available for tests and non-platform embedding.
 */
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
    case 'inactivity':
      return ReadOnlyCode.INACTIVITY;
    default:
      return undefined;
  }
}
