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
2. **Binding publish (external, BLOCKING)** — `@alkemio/excalidraw-yjs-binding` ships from excalidraw-fork PR #31, alongside the `@alkemio/excalidraw` release carrying the `onExcalidrawAPI` prop (OPEN-3).
3. **Whiteboard (T003/T004)** — bump `@alkemio/excalidraw` + add `@alkemio/excalidraw-yjs-binding`; rename `excalidrawAPI`→`onExcalidrawAPI` at `ExcalidrawWrapper.tsx:202` (+ `CollaborativeExcalidrawWrapper.tsx:289`) **in the same change as the bump**; wire the binding + ephemerals to the unified provider.
4. **Cleanup (T005/T006)** — remove `@hocuspocus/provider`, `socket.io-client`, `Collab.ts`, `Portal.ts`, `stateless-messaging/`, dead socket constants/env; finalize error handling on the unified control messages.

### Rollout

- The client change ships **behind the epic big-bang cutover** (WS-E). Until the server cuts over, the unified provider is not the live path (feature-flag or branch-gated). No mixed old/new client shares a live document; the legacy services stay warm for the rollback window, so a revert of the client cutover restores the old providers.
- The memo and whiteboard halves can merge as **separate PRs** (memo first, since it is unblocked), both cross-referencing `workspace#003-unify-collab-yjs`, both flag-gated off until the coordinated flip.

## Constitution / conventions check

- Per-repo conventions stay in client-web's own CLAUDE.md (this is a client slice). No cross-repo code dependency introduced — only a consumed package + a frozen wire contract.
- DRY: one provider, not two; the wire framing/sync/awareness reuse `y-protocols`/`y-websocket` rather than a bespoke re-implementation (OPEN-2).
- No new framing scheme: types 2/3 reuse the same `[type][payload]` envelope as 0/1 (matches `protocol.go` D1).

## Risks

- **R1 — Binding not published** (blocking): whiteboard half cannot start. Mitigation: ship memo independently; track PR #31. (Blocking dependency, called out in spec + report.)
- **R2 — Control-message parity gap** (OPEN-1): a UX regression on read-only reason / inactivity if the server contract is not extended. Mitigation: small additive server change, else generic-reason fallback.
- **R3 — `y-websocket` extension-point fit** (OPEN-2): if its `messageHandlers` cannot host types 2/3 cleanly, fall back to a custom provider (still byte-exact via `y-protocols`/`lib0`).
- **R4 — Prop-rename/build coupling** (OPEN-3): if the rename and binding ship in different `@alkemio/excalidraw` tags, the bump sequencing must serialize to avoid a red build. Mitigation: land rename+bump atomically (FR-007).
- **R5 — Guest auth path**: `guestName` must survive the handshake re-expression. Mitigation: confirm WS-C handshake auth shape (OPEN-1/handshake).

## Phase outputs

- Phase 0 → [research.md](./research.md) — current-state findings + decisions.
- Phase 1 → [data-model.md](./data-model.md), [quickstart.md](./quickstart.md), this plan.
- Phase 2 → [tasks.md](./tasks.md) (T001–T006 fine-grained).
- Quality → [checklists/requirements.md](./checklists/requirements.md).
