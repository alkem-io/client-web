# Tasks: client-web unified collaboration provider (WS-D)

**Repo**: `alkem-io/client-web` · **Branch**: `feat/003-unify-collab-yjs`
**Spec**: [spec.md](./spec.md) · **Plan**: [plan.md](./plan.md)
**Maps to** epic `agents-hq/specs/003-unify-collab-yjs/tasks/client-web.md` T001–T006.
**Depends on**: WS-B binding (`@alkemio/excalidraw-yjs-binding`, **unpublished — BLOCKING**) + WS-C ws-protocol (**frozen**).

> **Status: SPEC/DESIGN only.** No task below is implemented. Phase 2 (whiteboard)
> is **blocked** on the binding publish; Phase 0/1 (memo) is unblocked once OPEN-1/2
> are answered. Tasks are fine-grained under each epic task id.

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

## Phase 2: [US1] Whiteboard client (epic T003/T004) — BLOCKED on binding publish (OPEN-3)

- [ ] **T003.0** [US1] **BLOCKER**: wait for `@alkemio/excalidraw-yjs-binding` publish + the `@alkemio/excalidraw` release carrying `onExcalidrawAPI` (excalidraw-fork PR #31, OPEN-3).
- [ ] **T003.1** [US1] Bump `@alkemio/excalidraw` and add `@alkemio/excalidraw-yjs-binding` in `package.json` (one commit, FR-007/D5).
- [ ] **T003.2** [US1] Rename prop `excalidrawAPI`→`onExcalidrawAPI` at `ExcalidrawWrapper.tsx:202` **and** `CollaborativeExcalidrawWrapper.tsx:289`, in the same change as T003.1; typecheck/build green (SC-005).
- [ ] **T003.3** [US1] Wire `@alkemio/excalidraw-yjs-binding` (scene id-keyed `Y.Map`) to the `UnifiedCollabProvider`'s `Y.Doc` + `Awareness`, replacing the `Collab`/`Portal` scene sync. Establish the session via `documentId = whiteboard.id`, `contentType: 'whiteboard'`.
- [ ] **T004.1** [US1] Route ephemerals (D4): cursor (`MOUSE_LOCATION`) + idle + selection → **awareness** (type 1); `EMOJI_REACTION`, `COUNTDOWN_TIMER`, `USER_VISIBLE_SCENE_BOUNDS`, `USER_FOLLOW` → **ephemeral** (type 2) via `sendEphemeral`/`onEphemeral`. Bridge Excalidraw's `onPointerUpdate`/`onRequestBroadcastEmojiReaction`/`onRequestBroadcastCountdownTimer` (`CollaborativeExcalidrawWrapper.tsx`) to these.
- [ ] **T004.2** [US1] Map control → whiteboard UX: `saved`/`save-error`→`onRemoteSave`; `read-only-state`→read/write mode (mode→bool today; reason via OPEN-1); `room-user-change`→presence count; `room-closed`→teardown.
- [ ] **T004.3** [US1] Preserve custom features (emoji, countdown, element lock) — lock is persisted scene state (binding), the rest ephemeral. Tests: two-client per-property merge; ephemerals; custom features; reconnect (US1/US5).

## Phase 3: Cleanup & cutover (epic T005/T006)

- [ ] **T005.1** Remove the memo Hocuspocus client: `@hocuspocus/provider` dep, `TiptapCollabProviderWebsocket`/`TiptapCollabProvider` usage, `stateless-messaging/` (after T002 is proven).
- [ ] **T005.2** Remove the whiteboard socket.io client: `socket.io-client` dep, `collab/Collab.ts`, `collab/Portal.ts`, the socket constants/types in `excalidrawAppConstants.ts`/`collab/data/index.ts` (after T003/T004 are proven).
- [ ] **T005.3** Consolidate env (D6): `VITE_APP_COLLAB_DOC_*` + `VITE_APP_COLLAB_*` → one unified collab base URL/path; update `.env.example` + docs.
- [ ] **T006.1** Finalize error handling on the unified control messages (FR-009): `save-error`, `read-only-state`, `room-closed`, handshake-401 — remove the old `authenticationFailed`/`connect_error`/`room-not-saved` paths.
- [ ] **T006.2** Contribute the client e2e scenarios to the epic harness (WS-F / SC-009): two-client memo + whiteboard convergence, presence, reconnect — headless, CI-gating.
- [ ] **T006.3** Feature-flag/branch-gate both halves off until the epic big-bang cutover (WS-E); verify a revert restores the legacy providers (legacy warm window).

## Dependency / ordering

```
OPEN-1/2 answered ─► Phase 0 (T000.*) ─► Phase 1 memo (T001/T002) ──┐
                                                                     ├─► Phase 3 cleanup (T005/T006)
binding published (OPEN-3) ─► Phase 2 whiteboard (T003/T004) ───────┘
                                                  (whiteboard blocked until publish)
```

- Memo ships as its own PR first (unblocked). Whiteboard is a second PR after the binding lands. Both cross-reference `workspace#003-unify-collab-yjs`, both gated off until cutover.

## Self-analyze (consistency pass)

- **Coverage**: every epic task T001–T006 maps to ≥1 task here (T001→T001.*, T002→T002.*, T003→T003.*, T004→T004.*, T005→T005.*, T006→T006.*), plus shared Phase 0 (the provider the epic tasks assume but don't enumerate).
- **FR↔task**: FR-001/002/006/012→T000.*; FR-002/004(memo)→T001/T002; FR-003/005→T003/T004; FR-004(control)→T002.1/T004.2; FR-007→T003.1/T003.2; FR-008→T005.*; FR-009→T006.1; FR-010→T000.5; FR-011→T006.2.
- **Story↔task**: US2→Phase 1; US1→Phase 2; US5→T000.6 + T002.3 + T004.3 (reconnect proven per content).
- **OPEN↔task gating**: OPEN-1→T002.2/T004.2; OPEN-2→T000.1; OPEN-3→T003.0; OPEN-4→T002.2.
- **No orphan tasks**: T000.* is justified — the epic's T001 ("via the raw-WS + y-protocols client") presumes a provider; we make it an explicit shared foundation. No conflicting requirements found across spec/plan/tasks.
- **Honest gaps**: the read-only **reason** parity (OPEN-1) is the one place the unified contract is *narrower* than today; flagged in spec edge-cases, data-model mapping, and T002.2/T004.2. The binding-publish blocker (OPEN-3) gates all of Phase 2.
