# Data Model — client-web collaboration provider (WS-D, Phase 1)

The client owns no persisted schema — `collaboration-service` is authoritative
(epic `data-model.md`). This file records the **client-side shapes**: the in-`Y.Doc`
conventions the client binds to, the wire-message shapes the provider
encodes/decodes, and the provider's TypeScript surface. The CRDT document
conventions are owned by the epic + the `y-crdt` core; the client consumes them.

## CRDT document conventions (consumed, not owned)

### Memo (rich text) — unchanged
- Root `Y.XmlFragment` named **`default`** ↔ TipTap via `y-prosemirror`. Character-level, intention-preserving merge (native Yjs). No client schema change vs today (epic `data-model.md`; server `convention.go` `applyConvention` → `GetXmlFragment("default")`).

### Whiteboard (Excalidraw scene) — new binding, consumed
- Root `Y.Map` **`elements`**: key = element id → per-element `Y.Map` (geometry/style props per key ⇒ per-property merge; `index` fractional ordering; `isDeleted`/tombstone, `version`, `versionNonce` for Excalidraw interop).
- Root `Y.Map` **`files`**: fileId → descriptor (url/dataURL/mimeType).
- Root `Y.Map` **`appState`**: shared view-state subset.
- Mapping owned by `@alkemio/excalidraw-yjs-binding` (WS-B); the client wires the binding to the provider's `Y.Doc`. Server roots: `convention.go` → `GetMap("elements"|"files"|"appState")`.
- **Ephemeral (NOT in the doc)**: cursor, selection, idle, emoji reaction, countdown, scene-bounds — via awareness (type 1) + ephemeral (type 2).

## Wire messages (the provider's encode/decode contract — frozen)

Framing: `[type as VarUint][payload]`, **one WebSocket binary frame per message**,
no length prefix (`y-crdt/protocol/protocol.go` `WriteMessage`/`ReadMessage`).
Byte-compatible with `y-protocols`/`y-websocket` JS clients.

| type | name | dir | client handling |
|---|---|---|---|
| `0` | **Sync** (SyncStep1/SyncStep2/Update, y-protocols v1) | both | y-protocols sync state machine: send SyncStep1 on (re)connect; reply SyncStep2 to server's SyncStep1; apply Update deltas to `Y.Doc`. Owned by `y-websocket` if adopted (OPEN-2). |
| `1` | **Awareness** (y-protocols awareness) | both | cursors/presence/mode. Owned by the provider's `Awareness`; `CollaborationCaret` (memo) + the binding (whiteboard) write local state; footer reads `getStates()`. |
| `2` | **Ephemeral** (custom) | both | whiteboard volatile events; `sendEphemeral(payload)` / `onEphemeral(cb)`. Never applied to `Y.Doc`. |
| `3` | **Control** (custom, JSON) | S→C | decode JSON `ControlMessage` → per-content UX callbacks. |

### Type-3 ControlMessage (server→client, JSON) — mirrors `control.go`

```ts
type ControlKind =
  | 'saved'            // version: number
  | 'save-error'       // error: string
  | 'read-only-state'  // readOnly: boolean   (NO reason today — OPEN-1)
  | 'room-user-change' // users: number
  | 'room-closed';     // (no fields)

interface ControlMessage {
  kind: ControlKind;
  version?: number;  // saved
  error?: string;    // save-error
  readOnly?: boolean;// read-only-state
  users?: number;    // room-user-change
  // reason?: string; // PROPOSED (OPEN-1) — for read-only/collaborator-mode parity
}
```

JSON field names exactly match the Go `json:"…"` tags: `kind`, `version`,
`error`, `readOnly`, `users`.

### Type-2 ephemeral payloads (whiteboard) — re-expressed from today's socket types

The volatile events `Portal` broadcasts today (`collab/data/index.ts` socket
types) move onto type-2 frames. Payload encoding is the client/binding's choice
(the server fans them opaquely — `room.go WireEphemeral`: broadcast, never parsed),
but should preserve today's fields:

| event | today's payload (F-W4) | unified routing |
|---|---|---|
| cursor (`MOUSE_LOCATION`) | `{ pointer, button, username, selectedElementIds }` | **awareness (type 1)** — presence, not type 2 (D4) |
| `IDLE_STATUS` | user idle/active | awareness (type 1) |
| `EMOJI_REACTION` | `{ emoji, x, y, id }` | ephemeral (type 2) |
| `COUNTDOWN_TIMER` | `{ remainingSeconds, active, startedBy }` | ephemeral (type 2) |
| `USER_VISIBLE_SCENE_BOUNDS`/`SCENE_BOUNDS` | `{ socketId, sceneBounds }` | ephemeral (type 2) |
| `USER_FOLLOW` | `{ socketId, userToFollow, action }` | ephemeral (type 2) or awareness — confirm w/ binding |

## Provider TypeScript surface (new)

```ts
// Satisfies the existing CollabProviderLike (collabProviderTypes.ts) for memo,
// plus the whiteboard-facing API. One instance per open document.
interface UnifiedCollabProvider {
  // --- CollabProviderLike (memo footer / useCrdMemoProvider consume this) ---
  readonly awareness: Awareness;                 // y-protocols Awareness
  readonly status: 'connecting' | 'connected' | 'disconnected';
  on(event: string, cb: (...a: unknown[]) => void): void;
  off(event: string, cb: (...a: unknown[]) => void): void;
  destroy(): void;

  // --- shared ---
  readonly doc: Y.Doc;                           // bound by y-prosemirror or the excalidraw binding
  connect(): void;
  onControl(cb: (msg: ControlMessage) => void): void; // type-3 → UX

  // --- whiteboard ---
  sendEphemeral(payload: Uint8Array): void;      // type-2 out
  onEphemeral(cb: (payload: Uint8Array) => void): void; // type-2 in
}

interface UnifiedCollabProviderOptions {
  url: string;            // unified collab base (consolidated env, D6)
  documentId: string;     // memo UUID or whiteboard id → /collab/<documentId>
  contentType: 'memo' | 'whiteboard'; // → ?type= (seeds a fresh doc; persisted type wins server-side)
  doc: Y.Doc;
  guestName?: string;     // public whiteboard handshake (FR-010)
}
```

## State / mode mapping (client UX ← unified control)

| client UX (today) | source today | source unified | gap |
|---|---|---|---|
| memo saved indicator / `lastSaveTime` | stateless `saved` | control `saved` (+`version`) | none |
| memo "Unable to save" warning | stateless `save-error` | control `save-error` (+`error`) | none |
| memo read-only + footer reason | stateless `read-only-state` + `readOnlyCode` | control `read-only-state` (+`readOnly`) | **reason missing (OPEN-1)** |
| memo connection status | provider `status` | provider `status` | none |
| memo connected users / `memberCount` | `awareness.getStates()` | `awareness.getStates()` (+`room-user-change.users` cross-check) | none |
| whiteboard `onRemoteSave` | socket `room-saved`/`room-not-saved` | control `saved`/`save-error` | none |
| whiteboard read/write mode | socket `collaborator-mode` `{mode,reason}` | control `read-only-state` (+`readOnly`) | **mode→bool, reason missing (OPEN-1)** |
| whiteboard presence count | socket `room-user-change` | control `room-user-change` (+`users`) / awareness | none |
| whiteboard inactivity downgrade | socket `collaborator-mode` `reason: inactivity` | server-side sweep; **control payload TBC** | **OPEN-1** |
| room teardown | (none today) | control `room-closed` | new — client must handle |

## Validation / rules (client)

- The provider MUST NOT discard the live `Y.Doc` on transient disconnect (FR-006 / US5 offline-edit survival).
- The provider MUST treat type-2 ephemeral and type-1 awareness as non-persisted; only type-0 sync mutates the document.
- Unknown control `kind`s MUST be ignored (forward-compat — the kind set is extensible).
- `guestName` MUST be validated as today (`validateGuestName`) before being put on the handshake.
