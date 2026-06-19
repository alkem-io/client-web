# Feature Specification: Wire client-web editors to the unified collaboration-service (WS-D)

**Feature Branch**: `feat/003-unify-collab-yjs`
**Created**: 2026-06-19
**Status**: Draft (SPEC/DESIGN only — implementation blocked on Clarifications + the binding package)
**Repo**: `alkem-io/client-web` · **Integration branch**: `develop`
**Workspace epic**: [`agents-hq/specs/003-unify-collab-yjs/`](../../../agents-hq/specs/003-unify-collab-yjs/spec.md) · Backlog story [alkem-io/alkemio#1909](https://github.com/alkem-io/alkemio/issues/1909)
**Slice ID**: `workspace#003-unify-collab-yjs` → WS-D (client integration), epic `tasks/client-web.md` T001–T006

> **Sub-spec of an epic.** This is the **client-web slice** of the cross-repo
> initiative that merges `collaborative-document-service` (memos) and
> `whiteboard-collaboration-service` (whiteboards) into one Go
> **`collaboration-service`** over **one CRDT protocol (Yjs/y-protocols)**. The
> epic owns the *why*, the cross-repo architecture, and the frozen contracts
> (`contracts/ws-protocol.md`, `data-model.md`). This sub-spec owns **only the
> client-web changes**: replacing the two existing collab clients (the
> Hocuspocus `TiptapCollabProvider` for memos and the socket.io `Collab`/`Portal`
> stack for whiteboards) with **one unified WS client provider** that speaks the
> canonical y-protocols wire (sync + awareness + the service's ephemeral/control
> channels). It does **not** re-specify the server (WS-C), the CRDT core (WS-A),
> or the Excalidraw binding internals (WS-B); it consumes them.

## Clarifications

### Session 2026-06-19 (resolved — inherited from the epic)

- Q: What client transport replaces the two current ones? → A: **One raw-WebSocket + y-protocols client provider** for both content types, connecting `wss://<host>/collab/<documentId>` (one document per connection, y-websocket model). It carries y-protocols **sync** (type 0) + **awareness** (type 1) plus the service's **ephemeral** (type 2) and **control** (type 3) channels, all framed `[type as VarUint][payload]`, one binary frame per message (epic `contracts/ws-protocol.md`; Wave-1 `protocol.go`).
- Q: Does the memo editor stack change? → A: **No.** The TipTap editor, the `@tiptap/extension-collaboration` + `@tiptap/extension-collaboration-caret` extensions, the `y-prosemirror` binding, and the `Y.XmlFragment` named `default` all stay. Only the *provider* underneath (the thing that owns the WS, sync, and awareness) is swapped.
- Q: Does the whiteboard scene model change at the client? → A: **Yes.** The scene moves from socket.io whole-scene broadcast (LWW by `version`/`versionNonce`) to the **per-property id-keyed `Y.Map` binding** from `@alkemio/excalidraw-yjs-binding` (WS-B / excalidraw-fork PR #31). The client consumes that package; it does not implement the binding.
- Q: Auth on the client side? → A: **Unchanged in spirit** — AuthN is the Alkemio cookie/token at the WS handshake (Oathkeeper/Kratos), inherited from the browser; the client passes no explicit bearer for memo today and an optional `guestName` for public whiteboards. AuthZ (viewer vs collaborator) is delivered to the client as a **control message** (`read-only-state`), not negotiated client-side.

### Session 2026-06-19 — OPEN (blocking implementation)

> See `## Clarifications → OPEN` at the end of this spec for the four questions
> that must be answered before T001–T006 are implemented. They concern control/
> ephemeral message **parity** with today's UX, the **provider build-vs-fork**
> decision, the **binding-package publish sequencing**, and the **memo UX signal
> re-mapping**. Each is grounded in real client-web code below.

## Current State *(what exists today — file-anchored)*

**Memo (Hocuspocus / `TiptapCollabProvider`)**
- Provider built in `src/core/ui/forms/CollaborativeMarkdownInput/hooks/useCollaboration.ts` (~L66–83) from `@hocuspocus/provider` (`^2.15.3`): `new TiptapCollabProviderWebsocket({ baseUrl: MEMO_SERVICE_URL, connect: false })` → `new TiptapCollabProvider({ websocketProvider, name: collaborationId, document: ydoc })`. `collaborationId` = the memo UUID; URL from `VITE_APP_COLLAB_DOC_URL` + `VITE_APP_COLLAB_DOC_PATH`.
- Events wired (~L85–136): `status`, `synced`, `authenticationFailed`, `stateless`. Lifecycle: `provider.connect()` after listeners; `provider.destroy()` on unmount.
- Control plane = Hocuspocus **stateless** messages (JSON string via `onStatelessParameters.payload`), decoded in `stateless-messaging/util.ts`. Message shapes (`stateless-messaging/`): `saved`, `save-error` (+`error`), `read-only-state` (+`readOnly: boolean`, +`readOnlyCode?: ReadOnlyCode`). `ReadOnlyCode` ∈ `notAuthenticated | noUpdateAccess | roomCapacityReached | multiUserNotAllowed`.
- Editor binding: `Collaboration.configure({ document: ydoc })` + `CollaborationCaret.configure({ provider, user })` (~L146–162). `y-prosemirror` (`^1.3.6`) binds `Y.XmlFragment("default")` internally.
- Presence/footer: `useCrdMemoProvider.ts` reads `provider.awareness?.getStates()` + `awareness.on('change', …)`; `src/crd/components/memo/MemoCollabFooter.tsx` renders connection status, connected-user avatars, member count, and a read-only reason. Provider contract abstracted as `CollabProviderLike` in `src/crd/forms/markdown/collabProviderTypes.ts` (`awareness`, `status`, `on/off`, `destroy`).

**Whiteboard (socket.io / `Collab` + `Portal`)**
- `src/domain/common/whiteboard/excalidraw/collab/Collab.ts` (orchestrator) + `Portal.ts` (socket.io transport, `socket.io-client` `^4.8.1`). Connects via `getCollabServer()` (`collab/data/index.ts`) → `{ url: VITE_APP_COLLAB_URL, path: VITE_APP_COLLAB_PATH, polling: true }`; `roomId` = whiteboard id; `auth: { guestName? }`; `reconnection: false`.
- Scene sync: `Portal.broadcastScene(SCENE_UPDATE, …)` (changed-element diff, throttled 10 ms, full resync 10 s). Ephemerals on `WS_EVENTS.SERVER_VOLATILE`: `MOUSE_LOCATION`, `IDLE_STATUS`, `EMOJI_REACTION`, `COUNTDOWN_TIMER`, `USER_FOLLOW`, `SCENE_BOUNDS` (`excalidrawAppConstants.ts` `WS_SCENE_EVENT_TYPES`).
- Incoming socket events: `init-room`/`join-room`, `scene-init`, `client-broadcast`, `room-saved`/`room-not-saved` → `onRemoteSave`, `collaborator-mode` (`{ mode: 'read'|'write', reason }`) → `onCollaboratorModeChange`, `room-user-change`, `idle-state`.
- Excalidraw render: `src/domain/common/whiteboard/excalidraw/ExcalidrawWrapper.tsx:202` and `CollaborativeExcalidrawWrapper.tsx:289` pass the **`excalidrawAPI={handleInitializeApi}`** prop (the rename target → `onExcalidrawAPI`, gated on the `@alkemio/excalidraw` version bump). Component is `@alkemio/excalidraw` `0.18.0-864353b-alkemio-16`.
- Lifecycle hook: `collab/useCollab.ts` (`CollabAPI`, `CollabState`, render-prop wiring in `CollaborativeExcalidrawWrapper.tsx`).

**Dependencies today** (`package.json`): `@hocuspocus/provider ^2.15.3`, `@tiptap/extension-collaboration 3.11.0`, `@tiptap/extension-collaboration-caret 3.11.0`, `y-prosemirror ^1.3.6`, `yjs ^13.6.27`, `@alkemio/excalidraw 0.18.0-864353b-alkemio-16`, `socket.io-client ^4.8.1`. **Absent** (must be added): `y-protocols`, `y-websocket`(if chosen), `@alkemio/excalidraw-yjs-binding`.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Whiteboard edits no longer clobber each other, at the client (Priority: P1)

A collaborator's whiteboard edits to one property of an element survive a
concurrent edit to another property of the same element, end to end through the
client. The client consumes the per-property `@alkemio/excalidraw-yjs-binding`
(scene = id-keyed `Y.Map`) over the unified WS provider, so what the user sees on
their canvas converges to the same per-property-merged state every peer sees —
replacing the socket.io whole-scene LWW path that silently dropped one edit.

**Why this priority**: This is the headline correctness win of the epic, and the
client is the surface where the user perceives it. The binding does the merge;
the client must connect it correctly and render the converged scene.

**Independent Test**: Open the same board in two browser sessions; A drags a shape
while B recolors it (briefly partition one); on reconnect both clients render the
shape with A's position and B's color, identical on both canvases.

**Acceptance Scenarios**:
1. **Given** two client sessions on one board and the same element, **When** A changes position and B changes color concurrently, **Then** both canvases render A's position *and* B's color.
2. **Given** two sessions concurrently set the *same* property, **When** they converge, **Then** both canvases show one deterministic value with no flicker/divergence and no console error.
3. **Given** the Excalidraw custom features (emoji reaction, countdown timer, element lock), **When** used during a collaborative session, **Then** they behave as today (ephemeral broadcasts ride awareness/ephemeral; lock is persisted scene state).

---

### User Story 2 — Memo collaboration keeps its current quality (no regression) (Priority: P1)

People co-editing a memo over the unified provider get exactly the editing,
formatting, undo/redo, presence, and save/read-only feedback they have today.
The TipTap + `y-prosemirror` + `Y.XmlFragment("default")` stack is unchanged; only
the provider beneath it is swapped. The footer (connection status, connected
users, member count, read-only reason) and the saved/saving indicators behave
identically.

**Why this priority**: Memos already work well; this is the "do no harm"
guarantee. A subtle regression in the footer, the read-only reason, or the save
indicator would be a visible quality drop with no offsetting feature.

**Independent Test**: Run the existing memo collaboration scenarios (concurrent
typing, formatting, undo/redo, presence avatars, save indicator, read-only when
not a collaborator) against a `collaboration-service` instance and confirm parity
with the current Hocuspocus path.

**Acceptance Scenarios**:
1. **Given** two clients typing in the same paragraph, **Then** both insertions are preserved in stable, intention-preserving order on both.
2. **Given** an existing memo, **When** opened via the unified provider, **Then** its full content + formatting load intact and the footer shows the right connected users + member count.
3. **Given** a viewer (no update-content grant), **When** they open the memo, **Then** the editor is read-only and the footer shows the correct read-only reason, matching today's behaviour for the equivalent cause.
4. **Given** a debounced server snapshot completes, **Then** the saved indicator updates; **Given** a persist failure, **Then** the "Unable to save changes" warning surfaces — same as today.

---

### User Story 5 — Edits made offline merge cleanly on reconnect, at the client (Priority: P3)

A user who briefly loses connectivity keeps editing a memo or a whiteboard; when
the unified provider reconnects, the y-protocols sync handshake (SyncStep1 →
SyncStep2 state-vector diff) merges their offline edits with the server's instead
of losing or overwriting them. The client must drive (and survive) reconnect: it
re-issues SyncStep1 on reconnect and the provider re-binds awareness.

**Why this priority**: A real resilience improvement that falls out of the CRDT
choice, but secondary to the two P1 correctness/no-regression stories. The client
must not block it (e.g. a provider that tears down its Y.Doc on disconnect would
lose offline edits).

**Independent Test**: Partition a client mid-edit (memo and whiteboard), make
edits on both sides, restore connectivity; confirm both sides' edits appear,
converged, on every session, with no full-page reload required.

**Acceptance Scenarios**:
1. **Given** a client edits while disconnected, **When** the provider reconnects, **Then** its edits and the concurrent server-side edits both appear, converged identically across sessions.
2. **Given** a reconnect, **Then** the awareness/presence state re-establishes (the footer's connected-users list repopulates) without a stale ghost cursor lingering past the awareness TTL.

### Edge Cases

- **Control-message parity gaps** (see OPEN-1): the unified `read-only-state` control carries only `readOnly: boolean` today — **no `readOnlyCode`** and **no `reason`** — whereas the memo footer renders a read-only *reason* and the whiteboard renders a `collaborator-mode` *reason* (capacity/multi-user/inactivity). The client must degrade gracefully (generic reason) or the contract must be extended — this is the central open question.
- **Inactivity downgrade**: today the whiteboard downgrades an idle collaborator to viewer with `reason: inactivity`; the unified service performs the downgrade server-side (Wave-3 sweep) but the **control payload for the downgrade event** must be confirmed (OPEN-1).
- **Room closed / disconnect**: the unified service emits `room-closed` (idle release or owner delete); the client must handle it (stop sending, optionally reconnect) — today neither client has an exact equivalent (whiteboard has `reconnection: false`).
- **Mixed-version clients during cutover**: an old (socket.io / Hocuspocus) client and a new (unified) client must not share a live document — this is enforced by the **big-bang cutover** (epic WS-E), not by the client; the client only ships behind the cutover flip.
- **Guest / public whiteboard**: the optional `guestName` auth path (`Portal.ts`) must be re-expressed in the unified provider's handshake (query param or header) — confirm with WS-C's handshake auth (OPEN-1/handshake).
- **Binding package absent**: `@alkemio/excalidraw-yjs-binding` is **not yet published** (excalidraw-fork PR #31). The whiteboard half (US1, T003/T004) is **blocked** until it ships — see the blocking dependency note.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: client-web MUST provide **one unified WS client provider** that connects `wss://<host>/collab/<documentId>` (one document per connection) and speaks the canonical y-protocols wire — sync (type 0) + awareness (type 1) + the service's ephemeral (type 2) and control (type 3) channels — framed `[type as VarUint][payload]`, one binary frame per message, byte-compatible with the Wave-1 server (`contracts/ws-protocol.md`, `protocol.go`).
- **FR-002**: The unified provider MUST replace the memo Hocuspocus client (`TiptapCollabProvider`) while preserving the memo editor stack unchanged — TipTap, `@tiptap/extension-collaboration`, `@tiptap/extension-collaboration-caret`, `y-prosemirror`, and the `Y.XmlFragment` named `default`. The provider MUST satisfy the existing `CollabProviderLike` contract (`awareness` with `getStates()`/`setLocalStateField`/`on('change')`, `status`, `on/off`, `destroy`) so `useCrdMemoProvider.ts` and `MemoCollabFooter.tsx` work unmodified or near-unmodified.
- **FR-003**: The unified provider MUST replace the whiteboard socket.io client (`Collab`/`Portal`) and connect the **per-property `@alkemio/excalidraw-yjs-binding`** (scene = id-keyed `Y.Map`, fractional `index` ordering) to the same provider transport. The client consumes the binding; it MUST NOT re-implement element merge.
- **FR-004**: The provider MUST map the unified service's **control channel** (type 3, JSON `ControlMessage`: `saved`+`version`, `save-error`+`error`, `read-only-state`+`readOnly`, `room-user-change`+`users`, `room-closed`) onto the existing memo UX (saved indicator, "Unable to save changes" warning, read-only state + reason in `MemoCollabFooter`) and whiteboard UX (`onRemoteSave`, read/write mode, presence count) — preserving today's user-visible behaviour to the extent the contract allows (gaps tracked in OPEN-1).
- **FR-005**: The provider MUST route whiteboard **ephemeral** events (cursor/`MOUSE_LOCATION`, `IDLE_STATUS`, `EMOJI_REACTION`, `COUNTDOWN_TIMER`, `USER_VISIBLE_SCENE_BOUNDS`/`SCENE_BOUNDS`) through the unified **awareness + ephemeral** channels (types 1/2) rather than socket.io volatile broadcasts, preserving the Excalidraw custom features (FR-008 epic).
- **FR-006**: The provider MUST support **offline edit → reconnect** convergence for both content types: it re-issues the sync handshake on reconnect (SyncStep1 → SyncStep2 state-vector diff), retains the live `Y.Doc` across a disconnect (does not discard offline edits), and re-establishes awareness/presence on reconnect (US5).
- **FR-007**: The Excalidraw render-prop site MUST migrate the prop **`excalidrawAPI` → `onExcalidrawAPI`** (one primary site at `ExcalidrawWrapper.tsx:202`, mirrored at `CollaborativeExcalidrawWrapper.tsx:289`), **sequenced with the `@alkemio/excalidraw` version bump** that introduces the renamed prop — the bump and the rename land together so the build is never red.
- **FR-008**: At cutover, the two legacy collab clients MUST be removed: the Hocuspocus memo client (`@hocuspocus/provider`, `TiptapCollabProvider*`, `stateless-messaging/`) and the socket.io whiteboard client (`Collab.ts`, `Portal.ts`, `socket.io-client`, `WS_EVENTS`/`WS_SCENE_EVENT_TYPES` socket plumbing), along with their dead env/config (`VITE_APP_COLLAB_DOC_*` vs `VITE_APP_COLLAB_*` consolidation). (epic FR-012)
- **FR-009**: Error/connection handling MUST move to the unified control messages: `save-error` → warning, `read-only-state` → editor lock + footer reason, `room-closed` → stop-sending/reconnect, handshake 401 → authentication-failed UX (replacing `authenticationFailed`/`connect_error`).
- **FR-010**: The provider MUST authenticate at the WS handshake using the Alkemio cookie/token inherited from the browser, and carry the optional public-whiteboard **`guestName`** through the handshake (query param or header per WS-C) — preserving guest access (`GUEST_SHARE_PATH`).
- **FR-011**: All new provider/integration code MUST carry tests at the repo's standard bar; the client MUST contribute its scenarios to the epic's shared e2e/integration harness (two-client convergence for memo + whiteboard, presence, reconnect) (epic SC-009).
- **FR-012**: The provider SHOULD be **content-type-agnostic at the transport layer** (memo and whiteboard share one provider class/transport); content-specific wiring (the y-prosemirror binding vs the excalidraw-yjs binding, the per-content control-message mapping) layers on top.

### Key Entities *(client-side)*

- **UnifiedCollabProvider**: the new client class/hook owning one WebSocket to `/collab/<documentId>`, the y-protocols sync state machine, the awareness instance, and the inbound dispatch by type byte (0/1/2/3). Exposes a `CollabProviderLike`-compatible surface (so memo UX is untouched) plus a whiteboard-facing API (scene binding hookup, ephemeral send/receive). One instance per open document.
- **Memo binding (unchanged)**: `Y.Doc` → `Y.XmlFragment("default")` ↔ TipTap via `y-prosemirror`; presence via `CollaborationCaret` writing the awareness `user` field.
- **Whiteboard binding (new, consumed)**: `@alkemio/excalidraw-yjs-binding` mapping the id-keyed scene `Y.Map` ↔ Excalidraw elements, wired to the provider's `Y.Doc` + awareness.
- **Control message**: the type-3 JSON `ControlMessage` (`kind`, `version?`, `error?`, `readOnly?`, `users?`) the provider decodes and routes to per-content UX.
- **Ephemeral event**: the type-2 frame carrying volatile whiteboard events (cursor/emoji/countdown/bounds), fanned out, never persisted.

## Success Criteria *(mandatory)*

- **SC-001**: 0% of concurrent different-property whiteboard edits are lost as rendered on the client, across a two-session test (today: a measurable share clobbered).
- **SC-002**: After edits stop, both client sessions render identical document state within ~1 s for memo and whiteboard (visual convergence), 0 divergent canvases.
- **SC-003**: The existing memo collaboration acceptance scenarios pass unchanged against the unified provider — **no regression** (footer, presence, save indicator, read-only).
- **SC-004**: After cutover, `@hocuspocus/provider` and `socket.io-client` are **removed** from `package.json` (no remaining import); one provider serves both content types.
- **SC-005**: The Excalidraw prop rename (`excalidrawAPI`→`onExcalidrawAPI`) lands with the `@alkemio/excalidraw` bump with **0** broken render sites and a green typecheck/build.
- **SC-006**: The client contributes two-client convergence (memo + whiteboard), presence, and reconnect scenarios to the epic e2e harness, all green and reproducible (epic SC-009).
- **SC-007**: A viewer (no update-content grant) sees a read-only editor and a correct footer reason for memo, and read-only mode for whiteboard, driven by the `read-only-state` control — parity with today's read-only causes (subject to OPEN-1 contract).

## Scope

**In scope**: the unified WS client provider; rewiring the memo provider (T001/T002); rewiring the whiteboard to the binding + provider (T003/T004); the `excalidrawAPI`→`onExcalidrawAPI` rename sequenced with the bump; ephemeral-through-awareness wiring; legacy-client removal + error-handling cutover (T005/T006); the client's e2e scenarios.

**Out of scope**: the server (`collaboration-service`, WS-C); the CRDT core + v2 codec + fuzz (`y-crdt`, WS-A); the Excalidraw binding *internals* and upstream merge (`excalidraw-fork`, WS-B — consumed, not built here); the one-time content migration + big-bang cutover orchestration (WS-E, server/infra); the e2e *harness* itself (WS-F — the client contributes scenarios to it); changing the TipTap/Excalidraw editor feature sets beyond the collaboration binding; cross-session version history (epic FR-025 forward-compat only).

## Assumptions & Dependencies

- **Frozen contracts consumed**: epic `contracts/ws-protocol.md` (the wire) and `data-model.md` (memo `Y.XmlFragment`, whiteboard id-keyed `Y.Map`); the Wave-1 server impl (`collaboration-service/internal/adapter/inbound/ws/` + `domain/service/{sync,room}.go`) as the canonical behaviour the provider must interoperate with.
- **Blocking dependency (hard)**: `@alkemio/excalidraw-yjs-binding` must be **published as a package** (from excalidraw-fork PR #31) before the whiteboard half (T003/T004, US1) can be implemented. The memo half (T001/T002, US2) is **not** blocked on it.
- **Sequencing dependency**: the `excalidrawAPI`→`onExcalidrawAPI` rename (T003) is coupled to the `@alkemio/excalidraw` version bump that introduces the renamed prop; they land in one change.
- **Rollout dependency**: the client ships behind the epic's **big-bang cutover** (WS-E) — the unified provider goes live when the server cuts over, with the legacy services kept warm for the rollback window. No mixed old/new client on one live document.
- **Provider library decision (OPEN-2)**: write a thin custom provider class vs. adopt/fork `y-websocket` — recommendation below, pending confirmation.

## Clarifications → OPEN

These four must be answered before T001–T006 are implemented. Each is grounded in
real client-web code + the Wave-1 server, with a recommendation.

- **OPEN-1 — Control/ephemeral message parity.** The unified service's type-3
  `ControlMessage` (`collaboration-service/internal/domain/model/control.go`) is
  `{ kind, version?, error?, readOnly?, users? }` with kinds `saved`,
  `save-error`, `read-only-state`, `room-user-change`, `room-closed`. Today's
  clients expect **richer** signals: the memo `read-only-state` carries a
  `readOnlyCode` (`notAuthenticated | noUpdateAccess | roomCapacityReached |
  multiUserNotAllowed`) the footer renders as a reason; the whiteboard uses a
  separate **`collaborator-mode`** event `{ mode: 'read'|'write', reason:
  roomCapacityReached | multiUserNotAllowed | inactivity }`. The unified contract
  has **no `readOnlyCode`, no `reason`, no `collaborator-mode` kind, and no
  inactivity-downgrade control payload**. **Question**: does the client degrade to
  a generic read-only reason (and lose the capacity/inactivity distinction), or
  does WS-C extend the `ControlMessage` (add `reason`/`code`, add a
  `collaborator-mode` kind, emit a control on inactivity downgrade)?
  **Recommendation**: extend the server `ControlMessage` with an optional
  `reason` string and emit `read-only-state` on the inactivity downgrade — it is a
  small, additive, JSON-extensible change (the kind set is "extensible without a
  new wire type" by design) that preserves today's UX. Confirm with the WS-C owner;
  if declined, the client maps all read-only causes to one generic reason and
  drops the capacity/inactivity distinction (a minor UX regression to flag).

- **OPEN-2 — Provider: thin custom class vs. fork `y-websocket`.** The canonical
  raw-WS y-protocols provider is `y-websocket` (`WebsocketProvider`), which already
  implements the exact framing (`[type][payload]`), the SyncStep1→2 handshake,
  awareness sync, reconnect/backoff, and an `awareness` instance with
  `getStates()`/`on('change')` — i.e. it natively satisfies the memo
  `CollabProviderLike` surface and FR-006 reconnect. It does **not** know the
  service's custom **type-2 ephemeral** and **type-3 control** channels.
  **Question**: thin custom class, or adopt `y-websocket` + a small extension for
  types 2/3? **Recommendation**: **adopt `y-websocket` and register the two custom
  message handlers** (it exposes `messageHandlers` keyed by type byte for exactly
  this) rather than re-implement the sync/awareness/reconnect state machine — less
  code, canonical interop, fewer framing bugs. Wrap it in a thin
  `UnifiedCollabProvider` that adds: the control-message decode → UX mapping, the
  ephemeral send/receive for whiteboard, and the `guestName` handshake param. Only
  if `y-websocket`'s extension points prove too rigid for types 2/3 do we fall back
  to a custom class (still reusing `y-protocols` + `lib0` encoding so the wire stays
  byte-exact). Verify the current `y-websocket` version's `messageHandlers` API
  before committing.

- **OPEN-3 — Binding-package publish + version-bump sequencing.** The whiteboard
  half depends on **two** unreleased artifacts: `@alkemio/excalidraw-yjs-binding`
  (new package, excalidraw-fork PR #31) and the `@alkemio/excalidraw` **version
  bump** that renames `excalidrawAPI`→`onExcalidrawAPI`. **Question**: what is the
  publish/version order, and is the rename in the *same* `@alkemio/excalidraw`
  release as the binding, or separate? **Recommendation**: order is (1) publish
  `@alkemio/excalidraw-yjs-binding` + the `@alkemio/excalidraw` release carrying
  the `onExcalidrawAPI` prop; (2) bump both in client-web `package.json` in one
  commit; (3) implement T003 (binding + rename) atomically against them. Until (1)
  ships, T003/T004 are **blocked**; T001/T002 (memo) proceed independently. Confirm
  the exact published version strings and whether the prop rename ships in the same
  `@alkemio/excalidraw` tag as the binding peer-dep.

- **OPEN-4 — Memo UX signals to re-map carefully.** The memo footer
  (`MemoCollabFooter.tsx`) renders: connection status (`connecting`/`connected`/
  `disconnected`), connected-user avatars + `memberCount`, and a debounced (500 ms)
  read-only reason (`connecting | notSynced | unauthenticated |
  contentUpdatePolicy | contentUpdatePolicyNoOwner | noMembership`); plus a
  saved/`lastSaveTime` indicator. The saved indicator is driven by the `saved`
  stateless message; member count + avatars by `awareness.getStates()`; read-only
  reason by the `read-only-state` `readOnlyCode`. **Question**: which of these map
  cleanly to the unified channels and which need bridging? **Findings**: `saved`/
  `save-error` map 1:1 to the `saved`/`save-error` control kinds (version carried);
  presence avatars + `memberCount` map cleanly to `awareness.getStates()` (the
  provider exposes the same awareness API), with `room-user-change.users` as a
  cross-check; connection status maps to the provider's WS status. The **only**
  bridging risk is the read-only **reason** (OPEN-1) — the `readOnlyCode`→footer-
  reason mapping has no source field in the unified `read-only-state`. **Action**:
  resolve via OPEN-1; if the server cannot supply a reason, default the footer to
  the generic `contentUpdatePolicy` reason and flag the lost granularity.

## Self-Analysis

A consistency pass across this sub-spec's artifacts is recorded in
`checklists/requirements.md` and summarized at the end of `tasks.md`.
