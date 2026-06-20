# Implementation Plan: client-web unified collaboration provider (WS-D)

**Branch**: `feat/003-unify-collab-yjs` | **Date**: 2026-06-19 | **Spec**: [spec.md](./spec.md)
**Repo**: `alkem-io/client-web` (React 18 / TypeScript / Vite) · **Integration branch**: `develop`
**Workspace epic**: [`agents-hq/specs/003-unify-collab-yjs/plan.md`](../../../agents-hq/specs/003-unify-collab-yjs/plan.md)

> **Sub-spec plan.** Owns the **client-web internals**: the unified WS client
> provider design, how memo + whiteboard share it, the packaging/sequencing, and
> the rollout. The cross-repo architecture, the WS wire contract, and the rollout
> *ordering* are owned by the epic plan; this plan realizes the WS-D slice against
> the **frozen** `contracts/ws-protocol.md` and the Wave-1 server.

## Summary

Replace client-web's **two** collaboration clients — the Hocuspocus
`TiptapCollabProvider` (memo) and the socket.io `Collab`/`Portal` stack
(whiteboard) — with **one unified WS client provider** that speaks the canonical
y-protocols wire to `collaboration-service` (`wss://<host>/collab/<documentId>`,
one document per connection). The provider carries y-protocols **sync** (type 0) +
**awareness** (type 1) and the service's **ephemeral** (type 2) + **control**
(type 3) channels. The memo editor stack (TipTap + `y-prosemirror` +
`Y.XmlFragment("default")`) is unchanged beneath the new provider; the whiteboard
moves to the per-property `@alkemio/excalidraw-yjs-binding` (id-keyed `Y.Map`) wired
to the same provider. Memo (T001/T002) can proceed now; whiteboard (T003/T004) is
**blocked on the binding package publish**. Cleanup (T005/T006) removes the two
legacy clients at cutover.

## Technical Context

- **Language/stack**: TypeScript, React 18, Vite, MUI; Yjs ecosystem (`yjs ^13.6.27`, `y-prosemirror ^1.3.6`). Add `y-protocols` and (recommended) `y-websocket`; add `@alkemio/excalidraw-yjs-binding`; bump `@alkemio/excalidraw`. Remove `@hocuspocus/provider` + `socket.io-client` at cutover.
- **Editors**: TipTap (`@tiptap/extension-collaboration 3.11.0`, `@tiptap/extension-collaboration-caret 3.11.0`) for memo; `@alkemio/excalidraw 0.18.0-864353b-alkemio-16` for whiteboard.
- **Wire contract (frozen)**: `[type as VarUint][payload]`, one WS binary frame per message; type 0 sync (SyncStep1/2/Update, y-protocols v1), 1 awareness, 2 ephemeral (custom), 3 control (server→client JSON `ControlMessage`). Source of truth: `agents-hq/.../contracts/ws-protocol.md`, `y-crdt/protocol/protocol.go`, `collaboration-service/internal/domain/{service/sync.go,model/control.go}`.
- **Testing**: existing client unit/integration tests + Vitest; contributes scenarios to the epic e2e harness (WS-F).
- **Config**: consolidate `VITE_APP_COLLAB_DOC_URL`/`VITE_APP_COLLAB_DOC_PATH` (memo) and `VITE_APP_COLLAB_URL`/`VITE_APP_COLLAB_PATH` (whiteboard) → one unified collab base URL/path pointing at `collaboration-service`.

## Architecture — the unified WS client provider

### One transport, two bindings

```
                 ┌──────────────────────────────────────────────┐
                 │            UnifiedCollabProvider              │
   memo ─────────┤  one WebSocket → /collab/<documentId>         ├───────── whiteboard
 (TipTap +       │  ┌────────────────────────────────────────┐  │   (Excalidraw +
  y-prosemirror) │  │ y-protocols sync (0)  ── Y.Doc          │  │    excalidraw-yjs-
                 │  │ awareness (1)         ── Awareness      │  │    binding)
                 │  │ ephemeral (2)         ── emit/onEphemeral│ │
                 │  │ control  (3)          ── onControl → UX  │  │
                 │  └────────────────────────────────────────┘  │
                 │  CollabProviderLike surface (status/awareness/ │
                 │  on/off/destroy) ⇒ memo footer untouched      │
                 └──────────────────────────────────────────────┘
```

- **Shared core (content-agnostic)**: the WS connection, the SyncStep1→SyncStep2
  state-vector handshake (initial sync + the US5 reconnect catch-up), the
  awareness instance, reconnect/backoff, and inbound dispatch by type byte. This
  is exactly what `y-websocket`'s `WebsocketProvider` already implements — see
  OPEN-2; the recommendation is to **adopt it and register handlers for types 2/3**
  rather than re-implement the state machine.
- **Custom channels layered on top**: type-2 **ephemeral** (whiteboard
  cursor/emoji/countdown/bounds) and type-3 **control** (server→client `saved`,
  `save-error`, `read-only-state`, `room-user-change`, `room-closed`). The wrapper
  decodes control → per-content UX callbacks and exposes `sendEphemeral` /
  `onEphemeral` for the whiteboard.
- **Memo facing**: the wrapper exposes the existing `CollabProviderLike` shape
  (`collabProviderTypes.ts`) so `useCrdMemoProvider.ts` + `MemoCollabFooter.tsx`
  consume it unchanged; the provider's `awareness` is a real y-protocols
  `Awareness` (so `CollaborationCaret` and the footer's `getStates()`/`on('change')`
  work as today).
- **Whiteboard facing**: the wrapper hands its `Y.Doc` + `Awareness` to
  `@alkemio/excalidraw-yjs-binding`, and bridges Excalidraw's
  `onPointerUpdate`/`onRequestBroadcastEmojiReaction`/`onRequestBroadcastCountdownTimer`
  to `sendEphemeral`, and incoming ephemerals back to the collaborator/emoji/
  countdown handlers (replacing `Portal`'s socket broadcasts).

### How memo + whiteboard share it

| Concern | Memo | Whiteboard | Shared in provider? |
|---|---|---|---|
| WS connection + handshake | ✓ | ✓ | **Yes** (one class) |
| `Y.Doc` sync (type 0) | XmlFragment | id-keyed Y.Map | Yes (content-agnostic) |
| Awareness (type 1) | caret user | cursor + selection | Yes |
| Ephemeral (type 2) | — (unused) | emoji/countdown/bounds | Yes (whiteboard-only consumers) |
| Control (type 3) | saved / read-only | room-saved / mode | Yes (mapped per content) |
| Binding | `y-prosemirror` (unchanged) | `@alkemio/excalidraw-yjs-binding` (new) | No (content-specific) |
| UX surface | `MemoCollabFooter` | Excalidraw collab UI | No (content-specific) |

### Packaging / sequencing (the critical path)

1. **Memo (T001/T002)** — unblocked. Add `y-protocols` (+ `y-websocket` if OPEN-2 confirms); build `UnifiedCollabProvider`; swap it into `useCollaboration.ts`; map control → footer/save UX. Keep `@hocuspocus/provider` installed until cleanup so the swap is reviewable in isolation.
2. **Binding publish (external)** — **DONE**: `@alkemio/excalidraw-yjs-binding` shipped from excalidraw-fork (PR #31/#32) via **pkg.pr.new `@32`** (OPEN-3). The artifact is not self-contained and the companion `@alkemio/excalidraw` build is un-consumable — so the `onExcalidrawAPI` bump+rename did **not** land with it (deferred; see Implementation note below + R4').
3. **Whiteboard (T003/T004)** — bump `@alkemio/excalidraw` + add `@alkemio/excalidraw-yjs-binding`; rename `excalidrawAPI`→`onExcalidrawAPI` at `ExcalidrawWrapper.tsx:202` (+ `CollaborativeExcalidrawWrapper.tsx:289`) **in the same change as the bump**; wire the binding + ephemerals to the unified provider.
4. **Cleanup (T005/T006)** — remove `@hocuspocus/provider`, `socket.io-client`, `Collab.ts`, `Portal.ts`, `stateless-messaging/`, dead socket constants/env; finalize error handling on the unified control messages.

> **Implementation note (as built, `cb1e70a`).** Step 3 shipped with two
> deviations from the plan above, both documented and bounded:
> 1. **Packaging-gap workaround.** `@alkemio/excalidraw-yjs-binding` was consumed
>    from **pkg.pr.new `@32`**, not a registry release, and that artifact is **not
>    self-contained**: its published `.d.ts` references unpublished internal
>    Excalidraw monorepo packages (`@excalidraw/element`,
>    `@excalidraw/fractional-indexing`). To make it consumable today, the build
>    pins `pnpm.overrides` (`@excalidraw/element@0.18.0` → a local
>    `vendor/excalidraw-element-shim/` carrying a minimal `CaptureUpdateAction`
>    shim; `@excalidraw/fractional-indexing@3.3.0` → `npm:fractional-indexing@3.2.0`)
>    plus `tsconfig.json` `paths` mapping the binding's internal type imports. This
>    is an **interim** measure; a self-contained-publish fix is in flight in
>    excalidraw-fork, after which the overrides/shim/paths are removed (folds into
>    Phase 3 cleanup). See research.md D5.
> 2. **`@alkemio/excalidraw` not bumped, prop rename deferred (FR-007/D5).** The
>    `@32` companion `@alkemio/excalidraw` build is equally un-consumable, so the
>    dependency stayed at `0.18.0-864353b-alkemio-16` and the
>    `excalidrawAPI`→`onExcalidrawAPI` render-site rename was **deferred** — the
>    binding only needs the imperative API the existing `excalidrawAPI` callback
>    already delivers, so the rename is not required for US1 and lands with the
>    eventual consumable bump.
>
> **Open follow-ups after US1/US2:** (a) Phase 3 cleanup/cutover (T005/T006) —
> incl. removing the now-dead socket.io `Collab.ts`/`Portal.ts`/`useCollab.ts`
> (T005.2) once cutover lands; (b) the **OPEN-1 read-only `reason`** server-side
> field — the client is already wired for it (`readOnlyReasonToCode(msg.reason)`)
> and falls back to a generic reason while the server omits it; (c) the **live
> two-client e2e** in test-suites (T006.2) — unit suites use a mocked WS today.

### Rollout

- The client change ships **behind the epic big-bang cutover** (WS-E). Until the server cuts over, the unified provider is not the live path (feature-flag or branch-gated). No mixed old/new client shares a live document; the legacy services stay warm for the rollback window, so a revert of the client cutover restores the old providers.
- The memo and whiteboard halves can merge as **separate PRs** (memo first, since it is unblocked), both cross-referencing `workspace#003-unify-collab-yjs`, both flag-gated off until the coordinated flip.

## Constitution / conventions check

- Per-repo conventions stay in client-web's own CLAUDE.md (this is a client slice). No cross-repo code dependency introduced — only a consumed package + a frozen wire contract.
- DRY: one provider, not two; the wire framing/sync/awareness reuse `y-protocols`/`y-websocket` rather than a bespoke re-implementation (OPEN-2).
- No new framing scheme: types 2/3 reuse the same `[type][payload]` envelope as 0/1 (matches `protocol.go` D1).

## Risks

- **R1 — Binding not published** (blocking): whiteboard half cannot start. Mitigation: ship memo independently; track PR #31. **RESOLVED** — binding published `@32` (pkg.pr.new); whiteboard shipped on `cb1e70a`. Residual: the artifact is not self-contained (see R4'), and the registry release is still pending.
- **R2 — Control-message parity gap** (OPEN-1): a UX regression on read-only reason / inactivity if the server contract is not extended. Mitigation: small additive server change, else generic-reason fallback. **STILL OPEN** — the client wired the additive `reason` (`readOnlyReasonToCode`); server-side `reason` not yet shipped, so the generic-reason fallback is the live behaviour (capacity/multi-user/inactivity granularity lost).
- **R3 — `y-websocket` extension-point fit** (OPEN-2): if its `messageHandlers` cannot host types 2/3 cleanly, fall back to a custom provider (still byte-exact via `y-protocols`/`lib0`). **RESOLVED** — `y-websocket@3.0.0` adopted; its per-instance `messageHandlers` host types 2/3 with `disableBc: true` (research.md D2 / T000.1).
- **R4 — Prop-rename/build coupling** (OPEN-3): if the rename and binding ship in different `@alkemio/excalidraw` tags, the bump sequencing must serialize to avoid a red build. Mitigation: land rename+bump atomically (FR-007). **RESOLVED by deferral** — the `@alkemio/excalidraw` bump was not consumable, so the dep stayed pinned and the rename was deferred (not required for US1); no red build. The atomic bump+rename still applies when a consumable release lands (T003.1/T003.2).
- **R4' — Binding artifact not self-contained** (new, observed at build): the `@32` binding's `.d.ts` references unpublished internal Excalidraw packages. Mitigation (interim, as built): `pnpm.overrides` + `vendor/excalidraw-element-shim/` + tsconfig `paths`; removed once excalidraw-fork ships a self-contained publish (see Implementation note above).
- **R5 — Guest auth path**: `guestName` must survive the handshake re-expression. Mitigation: confirm WS-C handshake auth shape (OPEN-1/handshake).

## Phase outputs

- Phase 0 → [research.md](./research.md) — current-state findings + decisions.
- Phase 1 → [data-model.md](./data-model.md), [quickstart.md](./quickstart.md), this plan.
- Phase 2 → [tasks.md](./tasks.md) (T001–T006 fine-grained).
- Quality → [checklists/requirements.md](./checklists/requirements.md).
