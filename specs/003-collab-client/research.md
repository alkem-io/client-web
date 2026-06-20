# Research — client-web collaboration provider (WS-D, Phase 0)

Current-state findings (file-anchored) for the two collab clients being replaced,
plus the design decisions for the unified provider. Format: **Decision ·
Rationale · Alternatives** for decisions; **Finding** for current-state anchors.
The workspace `research.md` (`agents-hq/specs/003-unify-collab-yjs/research.md`)
is the source of truth for cross-repo decisions; this records the *client*
realization and client-only choices.

## Current state — Memo (Hocuspocus)

- **F-M1 — Provider construction.** `src/core/ui/forms/CollaborativeMarkdownInput/hooks/useCollaboration.ts` (~L66–83): `new TiptapCollabProviderWebsocket({ baseUrl: MEMO_SERVICE_URL, connect: false })` → `new TiptapCollabProvider({ websocketProvider, name: collaborationId, document: ydoc })`. `collaborationId` = memo UUID. URL from `VITE_APP_COLLAB_DOC_URL` + `VITE_APP_COLLAB_DOC_PATH`. `@hocuspocus/provider ^2.15.3`.
- **F-M2 — Events.** `status`, `synced`, `authenticationFailed`, `stateless` (~L85–136). Lifecycle: `provider.connect()` after listeners attach; `provider.destroy()` on unmount. `Y.Doc` created once (`new Y.Doc()`).
- **F-M3 — Control plane = Hocuspocus stateless.** JSON-string payloads via `onStatelessParameters.payload`, decoded in `stateless-messaging/util.ts`. Kinds: `saved`; `save-error` (+`error`) → "Unable to save changes" warning; `read-only-state` (+`readOnly: boolean`, +`readOnlyCode?`). `ReadOnlyCode` = `notAuthenticated | noUpdateAccess | roomCapacityReached | multiUserNotAllowed`.
- **F-M4 — Editor binding (unchanged target).** `Collaboration.configure({ document: ydoc })` + `CollaborationCaret.configure({ provider, user: { id, name, color } })` (~L146–162). `y-prosemirror ^1.3.6` binds `Y.XmlFragment("default")` internally — **no explicit fragment reference in client code**.
- **F-M5 — Presence/footer.** `useCrdMemoProvider.ts` reads `provider.awareness?.getStates()` + `awareness.on('change', …)`. `src/crd/components/memo/MemoCollabFooter.tsx`: connection status, connected-user avatars (max 5 + overflow), `memberCount`, debounced (500 ms) read-only reason (`connecting | notSynced | unauthenticated | contentUpdatePolicy | contentUpdatePolicyNoOwner | noMembership`), `lastSaveTime` indicator.
- **F-M6 — Provider contract.** `src/crd/forms/markdown/collabProviderTypes.ts`: `CollabProviderLike = { awareness, status, on, off, destroy }`; `CollabAwarenessLike = { setLocalStateField, getStates }`; `CollabStatus = 'connecting'|'connected'|'disconnected'`. The CRD layer isolates Yjs/Hocuspocus behind this branded surface — **the key seam: any provider satisfying it drops in**.
- **F-M7 — Auth.** No explicit bearer in provider construction; the WS inherits the browser cookie. `authenticationFailed` handles 401.

## Current state — Whiteboard (socket.io)

- **F-W1 — Transport.** `src/domain/common/whiteboard/excalidraw/collab/Portal.ts` uses `socket.io-client ^4.8.1`: `socketIOClient(url, { transports, path, retries: 0, reconnection: false, auth: { guestName? } })`. `roomId` = whiteboard id. Server resolved via `collab/data/index.ts` `getCollabServer()` → `{ url: VITE_APP_COLLAB_URL, path: VITE_APP_COLLAB_PATH, polling: true }`.
- **F-W2 — Orchestrator.** `collab/Collab.ts` + lifecycle hook `collab/useCollab.ts` (`CollabAPI`, `CollabState`, render-prop in `CollaborativeExcalidrawWrapper.tsx`). `CollabAPI` = `{ onPointerUpdate, syncScene, isCollaborating, broadcastEmojiReaction, broadcastCountdownTimer }`.
- **F-W3 — Scene sync.** `Portal.broadcastScene(SCENE_UPDATE, …)` — changed-element diff, throttled `SCENE_SYNC_TIMEOUT=10ms`, full resync `SYNC_FULL_SCENE_INTERVAL_MS=10s`. JSON → `TextEncoder().encode(...).buffer`, `socket.emit(event, roomId, buffer)`.
- **F-W4 — Ephemerals** (`excalidrawAppConstants.ts` `WS_SCENE_EVENT_TYPES`, on `WS_EVENTS.SERVER_VOLATILE`/`IDLE_STATE`): `MOUSE_LOCATION` (cursor, throttle 100 ms), `IDLE_STATUS`, `EMOJI_REACTION` (`{emoji,x,y,id}`, volatile), `COUNTDOWN_TIMER` (`{remainingSeconds,active,startedBy}`, volatile), `USER_FOLLOW`, `SCENE_BOUNDS` (viewport, throttle 100 ms).
- **F-W5 — Incoming socket events.** `init-room`/`join-room`, `scene-init`, `client-broadcast` (other clients' SCENE_UPDATE/MOUSE_LOCATION/EMOJI/COUNTDOWN/FOLLOW/BOUNDS), `room-saved`/`room-not-saved` → `onRemoteSave(error?)`, `collaborator-mode` `{ mode: 'read'|'write', reason }` → `onCollaboratorModeChange`, `room-user-change` (presence), `idle-state`.
- **F-W6 — Mode types.** `excalidrawAppConstants.ts`: `CollaboratorMode = 'read'|'write'`; `CollaboratorModeReasons = roomCapacityReached | multiUserNotAllowed | inactivity`; `CollaboratorModeEvent = { mode, reason }`.
- **F-W7 — Excalidraw render + prop.** `ExcalidrawWrapper.tsx:202` and `CollaborativeExcalidrawWrapper.tsx:289` render `<Excalidraw excalidrawAPI={handleInitializeApi} … />` (current prop is **`excalidrawAPI`**, a callback). The collaborative wrapper also passes `onPointerUpdate`, `onRequestBroadcastEmojiReaction`, `onRequestBroadcastCountdownTimer`. `@alkemio/excalidraw 0.18.0-864353b-alkemio-16`.

## Current dependencies (`package.json`)

| Package | Version | Fate |
|---|---|---|
| `@hocuspocus/provider` | `^2.15.3` | **remove** at cutover (T005) |
| `socket.io-client` | `^4.8.1` | **remove** at cutover (T005) |
| `@tiptap/extension-collaboration` | `3.11.0` | keep (unchanged) |
| `@tiptap/extension-collaboration-caret` | `3.11.0` | keep (unchanged) |
| `y-prosemirror` | `^1.3.6` | keep (unchanged) |
| `yjs` | `^13.6.27` | keep |
| `@alkemio/excalidraw` | `0.18.0-864353b-alkemio-16` | **NOT bumped** — `@32` un-consumable; rename deferred (D5 as-built) |
| `y-protocols` | `^1.0.6` (**added**) | keep |
| `y-websocket` | `^3.0.0` (**added**, OPEN-2 → adopt) | keep |
| `@alkemio/excalidraw-yjs-binding` | `pkg.pr.new @32` (**added**) | keep; interim overrides/shim until self-contained publish (D5 as-built) |

## Decisions

### D1 — One provider, content-agnostic transport + content-specific bindings
- **Decision**: a single `UnifiedCollabProvider` owns the WS, sync, awareness, and the type-2/3 channels; the y-prosemirror binding (memo) and `@alkemio/excalidraw-yjs-binding` (whiteboard) layer on its `Y.Doc`/`Awareness`. The memo path exposes the existing `CollabProviderLike` surface.
- **Rationale**: matches the epic's "one protocol for both content types"; the `CollabProviderLike` seam (F-M6) already isolates the provider, so a drop-in is low-risk for memo; whiteboard gains per-property merge via the consumed binding.
- **Alternatives**: two providers sharing a base class — rejected (re-introduces the "two ways to do everything" the epic removes).

### D2 — Adopt `y-websocket`, register handlers for types 2/3 (recommended, OPEN-2)
- **Decision (recommended, pending OPEN-2)**: use `y-websocket`'s `WebsocketProvider` for the sync/awareness/reconnect state machine and its `messageHandlers` (keyed by type byte) to add types 2 (ephemeral) and 3 (control); wrap in `UnifiedCollabProvider`.
- **Rationale**: `y-websocket` is the canonical raw-WS y-protocols provider — it already implements `[type][payload]` framing, SyncStep1→2, awareness, reconnect/backoff, and an `awareness` instance with `getStates()`/`on('change')` (so it natively satisfies `CollabProviderLike` and FR-006). Re-implementing that is bug-prone (framing/echo/backoff edge cases). The server's wire (`protocol.go` D1: no length prefix, one frame per message) is exactly y-websocket-compatible.
- **Alternatives**: thin custom class over `y-protocols`+`lib0` — kept as the fallback if y-websocket's extension points cannot host types 2/3 cleanly; fork y-websocket — heavier, avoid unless necessary.
- **Verify**: confirm the chosen `y-websocket` version exposes `messageHandlers`/custom-message registration before committing.

### D3 — Control channel maps to existing UX; parity gap is real (OPEN-1)
- **Finding**: the unified type-3 `ControlMessage` (`control.go`) is `{ kind, version?, error?, readOnly?, users? }`, kinds `saved | save-error | read-only-state | room-user-change | room-closed`. `saved`/`save-error`/`room-user-change` map 1:1 to today's memo `saved`/`save-error` and the whiteboard presence count. The **gap**: no `readOnlyCode`/`reason` (memo footer reason, F-M3/F-M5) and no `collaborator-mode`+`reason` (whiteboard, F-W5/F-W6) and no inactivity-downgrade control.
- **Decision (recommended)**: extend the server `ControlMessage` with an optional `reason` and emit `read-only-state` on inactivity downgrade — additive, JSON-extensible by design. Else: client maps all read-only causes to a generic reason (minor UX regression, flagged).

### D4 — Ephemerals ride awareness (type 1) + ephemeral (type 2), not socket volatile
- **Decision**: cursor/selection → awareness (type 1, the y-protocols presence channel `CollaborationCaret`/binding already use); emoji/countdown/scene-bounds → the custom ephemeral channel (type 2, `sendEphemeral`/`onEphemeral`). Replaces `Portal`'s `SERVER_VOLATILE` broadcasts (F-W4).
- **Rationale**: matches the server's type-1/2 split (`room.go handleMessage`: awareness fanned + applied to room awareness; ephemeral fanned, never persisted). Cursor through awareness gives free TTL/eviction (the server force-evicts a departed client's awareness, `forcedAwarenessRemoval`) — fixes ghost cursors without client bookkeeping.
- **Alternatives**: all ephemerals on type 2 — rejected (cursor belongs in awareness so presence + late-joiner snapshot work uniformly with memo).

### D5 — Prop rename sequenced with the `@alkemio/excalidraw` bump (FR-007, OPEN-3)
- **Decision**: `excalidrawAPI`→`onExcalidrawAPI` (F-W7) lands in the same change as the `@alkemio/excalidraw` version bump that introduces the renamed prop; both whiteboard render sites updated together.
- **Rationale**: the prop name is owned by the published component; renaming before the bump (or bumping before the rename) is a red build.
- **Alternatives**: a compat shim accepting both props — rejected (no-legacy; we control the bump timing).
- **As built (`cb1e70a`) — packaging gap + deferred rename.** The binding shipped via **pkg.pr.new `@32`** (not a registry release) and is **not self-contained**: its published `.d.ts` references unpublished internal Excalidraw monorepo packages (`@excalidraw/element`, `@excalidraw/fractional-indexing`). To consume it today the build pins `pnpm.overrides` (`@excalidraw/element@0.18.0` → local `vendor/excalidraw-element-shim/` with a minimal `CaptureUpdateAction` shim; `@excalidraw/fractional-indexing@3.3.0` → `npm:fractional-indexing@3.2.0`) + `tsconfig.json` `paths` for the binding's internal type imports. The companion `@alkemio/excalidraw` `@32` build is equally un-consumable, so **`@alkemio/excalidraw` was NOT bumped** (kept `0.18.0-864353b-alkemio-16`) and the **`excalidrawAPI`→`onExcalidrawAPI` rename was deferred** — the binding only needs the imperative API the existing `excalidrawAPI` callback already delivers, so US1 does not require the rename. The overrides/shim/paths are an **interim** workaround removed once a self-contained excalidraw-fork publish lands (a fix is in flight); the atomic bump+rename (D5) applies then. Tracked: tasks T003.1 (PARTIAL) / T003.2 (DEFERRED), plan.md Implementation note + R4'.

### D6 — Config consolidation
- **Decision**: collapse `VITE_APP_COLLAB_DOC_URL`/`_PATH` (memo) and `VITE_APP_COLLAB_URL`/`_PATH` (whiteboard) into one unified collab base URL/path at cutover (T006), both pointing at `collaboration-service`.
- **Rationale**: one backend ⇒ one config; removes the two-services drift.

## Open items (full text in spec.md `Clarifications → OPEN`)

- **OPEN-1** control/ephemeral message parity (read-only reason, collaborator-mode, inactivity) — recommend additive server `reason`. **STILL OPEN** server-side: the client decodes `msg.reason` (`readOnlyReasonToCode`) and falls back to a generic reason while the server omits it (capacity/multi-user/inactivity granularity lost).
- **OPEN-2** thin custom provider vs. fork/adopt `y-websocket` — recommend **adopt** + register type-2/3 handlers. **RESOLVED**: adopted `y-websocket@3.0.0` (D2 / T000.1).
- **OPEN-3** binding publish + version-bump sequencing — recommend publish binding + `@alkemio/excalidraw` (with `onExcalidrawAPI`) → bump both → implement T003 atomically. **PARTIALLY RESOLVED**: binding published `@32` and consumed; `@alkemio/excalidraw` bump + prop rename **deferred** (the `@32` build is un-consumable, and US1 does not need the rename) — see D5 as-built.
- **OPEN-4** memo UX signals to re-map — only the read-only **reason** needs bridging (folds into OPEN-1); the rest map cleanly. **As built**: the rest mapped cleanly; the reason bridge is wired but still depends on OPEN-1 server-side.
