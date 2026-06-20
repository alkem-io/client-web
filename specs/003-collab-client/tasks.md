# Tasks: client-web unified collaboration provider (WS-D)

**Repo**: `alkem-io/client-web` · **Branch**: `feat/003-unify-collab-yjs`
**Spec**: [spec.md](./spec.md) · **Plan**: [plan.md](./plan.md)
**Maps to** epic `agents-hq/specs/003-unify-collab-yjs/tasks/client-web.md` T001–T006.
**Depends on**: WS-B binding (`@alkemio/excalidraw-yjs-binding`, **published @32 via pkg.pr.new** — see implementation note in plan.md/research.md) + WS-C ws-protocol (**frozen**).

> **Status: Phase 0/1 (memo, US2) + Phase 2 (whiteboard, US1) IMPLEMENTED** — memo
> on `479a11703`, whiteboard on `cb1e70a` (PR #9912). Phase 3 (cleanup/cutover,
> T005/T006) is still pending; several T003/T004 sub-items shipped with documented
> deviations (see `— DEFERRED:` / `— PARTIAL:` annotations). Tasks are fine-grained
> under each epic task id; `[x]` = done, `[ ]` + annotation = deferred/partial with
> the residual called out. The OPEN-1 read-only **reason** parity is still open
> server-side (client wired for it, falls back to a generic reason).

## Phase 0: Provider foundation (shared) — gated on OPEN-2

- [x] **T000.1** Decide OPEN-2 (adopt `y-websocket` + type-2/3 handlers vs. thin custom class). Verify the target `y-websocket` version exposes custom `messageHandlers`/message-type registration. Record the decision in research.md D2. → **Adopted `y-websocket@3.0.0`**; its per-instance `messageHandlers` array is overridden for bytes 2/3, with `disableBc: true` to avoid y-websocket's byte-3 queryAwareness clashing with the control channel.
- [x] **T000.2** Add deps: `y-protocols`, and `y-websocket` (if adopted). Do **not** remove `@hocuspocus/provider`/`socket.io-client` yet (cleanup is T005). → added `y-websocket@^3.0.0`, `y-protocols@^1.0.6`, `lib0@^0.2.117`; legacy deps retained.
- [x] **T000.3** Implement `UnifiedCollabProvider` (`src/core/collab/UnifiedCollabProvider.ts`): one WS to `/collab/<documentId>?type=<contentType>`; sync (0) + awareness (1) via y-websocket; type-2 (ephemeral) + type-3 (control) handlers; exposes the `CollabProviderLike` surface + `onControl`/`sendEphemeral`/`onEphemeral`/`doc`/`connect`/`destroy`. Framing `[type as VarUint][payload]`, one binary frame/message.
- [x] **T000.4** Decode type-3 `ControlMessage` (JSON, fields `kind/version/error/readOnly/users` + `reason`); ignore unknown kinds (forward-compat). → `src/core/collab/controlMessage.ts`.
- [x] **T000.5** Handshake auth: inherit the browser cookie; carry optional `guestName` per WS-C handshake shape (FR-010) as a query param (`?guestName=`). Cookie rides the same-origin WS handshake as before (no explicit bearer).
- [x] **T000.6** Unit tests (`controlMessage.test.ts`, `UnifiedCollabProvider.test.ts`): framing round-trip; control decode; ephemeral send/receive; reconnect retains the `Y.Doc` and its offline edits (FR-006); SyncStep1 on connect; `CollabProviderLike` awareness surface.

## Phase 1: [US2] Memo client (epic T001/T002) — unblocked

- [x] **T001.1** [US2] In `src/core/ui/forms/CollaborativeMarkdownInput/hooks/useCollaboration.ts`, replaced the `TiptapCollabProviderWebsocket` + `TiptapCollabProvider` construction with `UnifiedCollabProvider({ url, documentId: collaborationId, contentType: 'memo', doc: ydoc })`. The `Y.Doc`, `Collaboration.configure({ document: ydoc })`, and `CollaborationCaret.configure({ provider, user })` are **unchanged** — only the provider object changed.
- [x] **T001.2** [US2] Re-mapped the wired events: `status`→provider status; `synced`→provider `sync`/`synced`; `authenticationFailed`→`connection-close`/`connection-error` (handshake-401 path, FR-009); `stateless`→**`onControl`** (type-3 channel).
- [x] **T001.3** [US2] Provider satisfies `CollabProviderLike` (`awareness`/`status`/`on`/`off`/`destroy`) — `useCrdMemoProvider.ts`, `memoFooterMapper.ts`, `MemoCollabFooter.tsx`, and `CrdMemoDialog.tsx` consume it **unmodified** (the opaque seam held; no type change needed).
- [x] **T002.1** [US2] Mapped control kinds → memo UX: `saved`→`lastSaveTime`/saved indicator; `save-error`→"Unable to save changes" warning; `read-only-state`(+`readOnly`)→editor read-only + footer reason; `room-user-change`/`room-closed`→ignored (no memo UX impact today; forward-compat).
- [x] **T002.2** [US2] Read-only **reason** gap (OPEN-1/OPEN-4): the server `reason` (`not-authenticated`/`no-update-access`/`room-capacity-reached`/`multi-user-not-allowed`) maps 1:1 to the existing `ReadOnlyCode` via `readOnlyReasonToCode`, preserving the footer reason. When the server omits `reason` (OPEN-1 not yet landed), the code is `undefined` → footer falls back to its generic policy reason. **Flagged**: capacity/multi-user granularity is lost until the collab OPEN-1 `reason` ships.
- [~] **T002.3** [US2] Tests added: control decode + reason mapping (`controlMessage.test.ts`), provider control/ephemeral dispatch, framing, status, offline `Y.Doc` survival (`UnifiedCollabProvider.test.ts`). **Deferred to the e2e harness (T006.2 / WS-F)**: full two-client memo convergence + live footer/presence parity against a running collaboration-service.

## Phase 2: [US1] Whiteboard client (epic T003/T004) — IMPLEMENTED (`cb1e70a`), with documented deviations

- [x] **T003.0** [US1] **BLOCKER cleared**: `@alkemio/excalidraw-yjs-binding` published `@32` (pkg.pr.new, excalidraw-fork PR #31). The companion `@alkemio/excalidraw` release carrying `onExcalidrawAPI` did **not** ship a consumable artifact (see T003.1/T003.2), so the rename was decoupled.
- [ ] **T003.1** [US1] Bump `@alkemio/excalidraw` and add `@alkemio/excalidraw-yjs-binding` in `package.json` (one commit, FR-007/D5). — **PARTIAL**: binding added (`@alkemio/excalidraw-yjs-binding` via `https://pkg.pr.new/...@32`), but `@alkemio/excalidraw` **NOT bumped** — kept `0.18.0-864353b-alkemio-16`. The `@32` build is not self-contained: its published `.d.ts` references unpublished internal Excalidraw monorepo packages (`@excalidraw/element`, `@excalidraw/fractional-indexing`), satisfied via `pnpm.overrides` + a local `vendor/excalidraw-element-shim/` (`CaptureUpdateAction` shim) + tsconfig `paths`. The packaging-gap workaround is an interim measure; a self-contained-publish fix is in flight in excalidraw-fork (see plan.md implementation note + research.md D5).
- [ ] **T003.2** [US1] Rename prop `excalidrawAPI`→`onExcalidrawAPI` at `ExcalidrawWrapper.tsx:202` **and** `CollaborativeExcalidrawWrapper.tsx:289`, in the same change as T003.1; typecheck/build green (SC-005). — **DEFERRED**: not required for US1 — the binding only consumes the imperative API the existing `excalidrawAPI` callback already delivers; the render sites still pass `excalidrawAPI`. The rename is coupled to a consumable `@alkemio/excalidraw` bump (T003.1) and lands with it. (The `onExcalidrawAPI` name that appears in `CollaborativeExcalidrawWrapper.tsx` is the unified hook's own binding callback, not the Excalidraw component prop.)
- [x] **T003.3** [US1] Wire `@alkemio/excalidraw-yjs-binding` (scene id-keyed `Y.Map`) to the `UnifiedCollabProvider`'s `Y.Doc` + `Awareness`, replacing the `Collab`/`Portal` scene sync. Establish the session via `documentId = whiteboard.id`, `contentType: 'whiteboard'`. → `collab/unified/useWhiteboardCollab.ts` (one `UnifiedCollabProvider`, `type=whiteboard` + whiteboard id, driving the per-property `WhiteboardBinding`); `CollaborativeExcalidrawWrapper.tsx` swaps `useCollab` (socket.io) for the unified hook.
- [x] **T004.1** [US1] Route ephemerals (D4): cursor (`MOUSE_LOCATION`) + idle + selection → **awareness** (type 1); `EMOJI_REACTION`, `COUNTDOWN_TIMER`, `USER_VISIBLE_SCENE_BOUNDS`, `USER_FOLLOW` → **ephemeral** (type 2) via `sendEphemeral`/`onEphemeral`. Bridge Excalidraw's `onPointerUpdate`/`onRequestBroadcastEmojiReaction`/`onRequestBroadcastCountdownTimer` (`CollaborativeExcalidrawWrapper.tsx`) to these. → cursors/selection/idle via the binding's `AwarenessRouter`; emoji/countdown/bounds via the `EphemeralChannel` adapter (`collab/unified/ephemeralChannel.ts`) bridged to the provider's type-2 wire.
- [x] **T004.2** [US1] Map control → whiteboard UX: `saved`/`save-error`→`onRemoteSave`; `read-only-state`→read/write mode (mode→bool today; reason via OPEN-1); `room-user-change`→presence count; `room-closed`→teardown. → mapped in `useWhiteboardCollab.ts`. **Note (OPEN-1 still open)**: the client reads `msg.reason` (`readOnlyReasonToCode`) and is wired for the proposed additive server `reason`; when the server omits it, the read-only code is `undefined` → generic read-only treatment (capacity/multi-user granularity lost). OPEN-1 server-side `reason` not yet landed.
- [x] **T004.3** [US1] Preserve custom features (emoji, countdown, element lock) — lock is persisted scene state (binding), the rest ephemeral. Tests: two-client per-property merge; ephemerals; custom features; reconnect (US1/US5). → 27 unit tests (`useWhiteboardCollab.test.ts` 19 + `ephemeralChannel.test.ts` 8) against a mocked WS provider. **PARTIAL**: live two-client convergence is the e2e harness scope — see T006.2.

## Phase 3: Cleanup & cutover (epic T005/T006)

- [ ] **T005.1** Remove the memo Hocuspocus client: `@hocuspocus/provider` dep, `TiptapCollabProviderWebsocket`/`TiptapCollabProvider` usage, `stateless-messaging/` (after T002 is proven).
- [ ] **T005.2** Remove the whiteboard socket.io client: `socket.io-client` dep, `collab/Collab.ts`, `collab/Portal.ts`, the socket constants/types in `excalidrawAppConstants.ts`/`collab/data/index.ts` (after T003/T004 are proven). — **DEFERRED** (follow-up): `Collab.ts`/`Portal.ts`/`useCollab.ts` are now **dead code** — `CollaborativeExcalidrawWrapper.tsx` no longer wires them and there is no live caller. Full removal (files + `socket.io-client` dep + socket constants/env) is the big-bang-cutover cleanup, batched with T005.1 to keep the swap reviewable in isolation.
- [ ] **T005.3** Consolidate env (D6): `VITE_APP_COLLAB_DOC_*` + `VITE_APP_COLLAB_*` → one unified collab base URL/path; update `.env.example` + docs.
- [ ] **T006.1** Finalize error handling on the unified control messages (FR-009): `save-error`, `read-only-state`, `room-closed`, handshake-401 — remove the old `authenticationFailed`/`connect_error`/`room-not-saved` paths.
- [ ] **T006.2** Contribute the client e2e scenarios to the epic harness (WS-F / SC-009): two-client memo + whiteboard convergence, presence, reconnect — headless, CI-gating. — **DEFERRED** (follow-up): memo + whiteboard unit suites use a **mocked WS provider** (T002.3, T004.3); the live two-client convergence/presence/reconnect e2e against a running `collaboration-service` in test-suites is a separate, explicitly-tracked follow-up (not done here). SC-006 stays open until it lands.
- [ ] **T006.3** Feature-flag/branch-gate both halves off until the epic big-bang cutover (WS-E); verify a revert restores the legacy providers (legacy warm window).

## Dependency / ordering

```
OPEN-1/2 answered ─► Phase 0 (T000.*) ─► Phase 1 memo (T001/T002) ──┐
                                                                     ├─► Phase 3 cleanup (T005/T006)
binding published (OPEN-3) ─► Phase 2 whiteboard (T003/T004) ───────┘
                                                  (whiteboard blocked until publish)
```

- Memo shipped first (`479a11703`); whiteboard followed (`cb1e70a`) once the binding landed (`@32`). Both cross-reference `workspace#003-unify-collab-yjs` on PR #9912, both gated off until cutover. Remaining: Phase 3 cleanup/cutover (T005/T006) + the OPEN-1 server `reason` + the live e2e (T006.2).

## Self-analyze (consistency pass)

- **Coverage**: every epic task T001–T006 maps to ≥1 task here (T001→T001.*, T002→T002.*, T003→T003.*, T004→T004.*, T005→T005.*, T006→T006.*), plus shared Phase 0 (the provider the epic tasks assume but don't enumerate).
- **FR↔task**: FR-001/002/006/012→T000.*; FR-002/004(memo)→T001/T002; FR-003/005→T003/T004; FR-004(control)→T002.1/T004.2; FR-007→T003.1/T003.2; FR-008→T005.*; FR-009→T006.1; FR-010→T000.5; FR-011→T006.2.
- **Story↔task**: US2→Phase 1; US1→Phase 2; US5→T000.6 + T002.3 + T004.3 (reconnect proven per content).
- **OPEN↔task gating**: OPEN-1→T002.2/T004.2; OPEN-2→T000.1; OPEN-3→T003.0; OPEN-4→T002.2.
- **No orphan tasks**: T000.* is justified — the epic's T001 ("via the raw-WS + y-protocols client") presumes a provider; we make it an explicit shared foundation. No conflicting requirements found across spec/plan/tasks.
- **Honest gaps (as built)**: the read-only **reason** parity (OPEN-1) is the one place the unified contract is *narrower* than today — the client is wired for the additive server `reason` but it is not shipped server-side, so the live behaviour is the generic-reason fallback; flagged in spec edge-cases, data-model mapping, and T002.2/T004.2. The OPEN-3 binding-publish blocker is **cleared** (`@32`), but consumed via an interim packaging workaround (pnpm overrides + vendor shim + tsconfig paths) pending a self-contained excalidraw-fork publish; the `@alkemio/excalidraw` bump + prop rename (T003.1/T003.2) are deferred with it. Phase 3 cleanup/cutover (T005/T006) and the live e2e (T006.2) are open follow-ups.
