import * as decoding from 'lib0/decoding';
import * as encoding from 'lib0/encoding';
import type { Awareness } from 'y-protocols/awareness';
import { WebsocketProvider } from 'y-websocket';
import type * as Y from 'yjs';
import { type ControlMessage, decodeControlMessage } from './controlMessage';

/**
 * Wire message types — the canonical y-protocols envelope `[type as VarUint][payload]`,
 * one binary frame per message, byte-compatible with the unified collaboration-service
 * (`protocol.go` / epic `contracts/ws-protocol.md`).
 *
 *   0 sync       — y-protocols sync (SyncStep1/2/Update). Owned by y-websocket.
 *   1 awareness  — y-protocols awareness (presence/cursors). Owned by y-websocket.
 *   2 ephemeral  — custom: whiteboard volatile events (emoji/countdown/bounds). Never persisted.
 *   3 control    — custom: server→client JSON ControlMessage (saved/save-error/read-only/...).
 *
 * NOTE on the y-websocket type-byte overlap: y-websocket@3 reuses byte 2 for `auth`
 * and byte 3 for `queryAwareness`, but only ever *sends* those over its cross-tab
 * BroadcastChannel — never over the WebSocket. We disable BroadcastChannel
 * (`disableBc: true`, the unified service is the single source of truth) and override
 * the inbound handlers for bytes 2 and 3, so the wire stays byte-exact with the server.
 */
export const WireType = {
  SYNC: 0,
  AWARENESS: 1,
  EPHEMERAL: 2,
  CONTROL: 3,
} as const;

export type CollabConnectionStatus = 'connecting' | 'connected' | 'disconnected';

export type UnifiedCollabProviderOptions = {
  /** Unified collab base URL, e.g. `wss://host/collab` (consolidated env). */
  url: string;
  /** Memo UUID or whiteboard id → connects to `<url>/<documentId>`. */
  documentId: string;
  /** Seeds a fresh server-side document; the persisted type wins server-side. */
  contentType: 'memo' | 'whiteboard';
  /** The shared Y.Doc bound by y-prosemirror (memo) or the excalidraw binding (whiteboard). */
  doc: Y.Doc;
  /** Optional public-whiteboard guest display name, carried on the handshake (FR-010). */
  guestName?: string;
  /** Start the WS immediately (default false; the consumer calls `connect()` after wiring listeners). */
  connect?: boolean;
  /** Optional WebSocket implementation override (tests inject a mock; defaults to the global). */
  WebSocketPolyfill?: typeof WebSocket;
};

type ControlListener = (msg: ControlMessage) => void;
type EphemeralListener = (payload: Uint8Array) => void;

/**
 * One WebSocket to the unified collaboration-service for a single document.
 *
 * Wraps y-websocket's `WebsocketProvider` for the sync (0) + awareness (1) state
 * machine, reconnect/backoff, and the live `Awareness` instance, and layers the
 * service's custom ephemeral (2) and control (3) channels on top by overriding the
 * provider's inbound `messageHandlers` for those bytes.
 *
 * Exposes the existing `CollabProviderLike` surface (`awareness` / `status` /
 * `on` / `off` / `destroy`) so the memo footer + `useCrdMemoProvider` consume it
 * unchanged, plus `onControl` / `sendEphemeral` / `onEphemeral` / `doc` / `connect`
 * for the control + whiteboard-ephemeral wiring.
 */
export class UnifiedCollabProvider {
  readonly doc: Y.Doc;
  private readonly wsProvider: WebsocketProvider;
  private readonly controlListeners = new Set<ControlListener>();
  private readonly ephemeralListeners = new Set<EphemeralListener>();
  private destroyed = false;

  constructor(options: UnifiedCollabProviderOptions) {
    this.doc = options.doc;

    // y-websocket appends `/<roomname>` to the server URL and the params as a query
    // string → `<url>/<documentId>?type=<contentType>[&guestName=...]`. The Alkemio
    // cookie/token rides the handshake automatically (same-origin WS), as it did for
    // the Hocuspocus provider — no explicit bearer.
    const params: Record<string, string> = { type: options.contentType };
    if (options.guestName) {
      params.guestName = options.guestName;
    }

    this.wsProvider = new WebsocketProvider(options.url, options.documentId, options.doc, {
      connect: options.connect ?? false,
      params,
      ...(options.WebSocketPolyfill ? { WebSocketPolyfill: options.WebSocketPolyfill } : {}),
      // The unified service is authoritative; cross-tab BroadcastChannel would also
      // emit y-websocket's byte-3 queryAwareness, which collides with our control
      // channel. Disable it so the wire stays byte-exact and single-sourced.
      disableBc: true,
    });

    // Override the inbound handlers for the service's custom channels. y-websocket
    // dispatches by `provider.messageHandlers[type]` (a per-instance array), so this
    // replaces its byte-2 (auth) and byte-3 (queryAwareness) defaults with the
    // unified ephemeral/control decode. Sync (0) + awareness (1) keep y-websocket's.
    this.wsProvider.messageHandlers[WireType.EPHEMERAL] = (_encoder, decoder) => {
      if (this.ephemeralListeners.size === 0) {
        return;
      }
      const payload = decoding.readVarUint8Array(decoder);
      for (const listener of this.ephemeralListeners) {
        listener(payload);
      }
    };

    this.wsProvider.messageHandlers[WireType.CONTROL] = (_encoder, decoder) => {
      const payload = decoding.readVarUint8Array(decoder);
      const msg = decodeControlMessage(payload);
      if (!msg) {
        return;
      }
      for (const listener of this.controlListeners) {
        listener(msg);
      }
    };
  }

  // --- CollabProviderLike (memo footer / useCrdMemoProvider consume this) ---

  get awareness(): Awareness {
    return this.wsProvider.awareness;
  }

  get status(): CollabConnectionStatus {
    if (this.wsProvider.wsconnected) {
      return 'connected';
    }
    if (this.wsProvider.wsconnecting) {
      return 'connecting';
    }
    return 'disconnected';
  }

  // Typed overloads for the y-websocket events memo wiring listens to, plus the
  // opaque `(...args: unknown[]) => void` signature that satisfies CollabProviderLike.
  on(event: 'status', cb: (event: { status: CollabConnectionStatus }) => void): void;
  on(event: 'synced' | 'sync', cb: (state: boolean) => void): void;
  on(event: 'connection-close', cb: (event: CloseEvent | null) => void): void;
  on(event: 'connection-error', cb: (event: Event) => void): void;
  on(event: string, cb: (...args: unknown[]) => void): void;
  on(event: string, cb: (...args: never[]) => void): void {
    // `synced` is the y-websocket alias for `sync`; map it so memo callers that
    // listened to the Hocuspocus `synced` event keep working unchanged.
    this.wsProvider.on(event as 'sync', cb as never);
  }

  off(event: string, cb: (...args: never[]) => void): void {
    this.wsProvider.off(event as 'sync', cb as never);
  }

  // --- shared ---

  connect(): void {
    this.wsProvider.connect();
  }

  /** Subscribe to decoded type-3 control messages. Returns an unsubscribe fn. */
  onControl(cb: ControlListener): () => void {
    this.controlListeners.add(cb);
    return () => this.controlListeners.delete(cb);
  }

  // --- whiteboard ephemeral (type 2) ---

  /** Subscribe to inbound type-2 ephemeral payloads. Returns an unsubscribe fn. */
  onEphemeral(cb: EphemeralListener): () => void {
    this.ephemeralListeners.add(cb);
    return () => this.ephemeralListeners.delete(cb);
  }

  /** Send a type-2 ephemeral payload (whiteboard volatile event). No-op while disconnected. */
  sendEphemeral(payload: Uint8Array): void {
    const ws = this.wsProvider.ws;
    if (this.destroyed || !ws || ws.readyState !== WebSocket.OPEN) {
      return;
    }
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, WireType.EPHEMERAL);
    encoding.writeVarUint8Array(encoder, payload);
    ws.send(encoding.toUint8Array(encoder));
  }

  destroy(): void {
    this.destroyed = true;
    this.controlListeners.clear();
    this.ephemeralListeners.clear();
    this.wsProvider.destroy();
  }
}
